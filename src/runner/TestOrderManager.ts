import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import dotenv from 'dotenv';
import {
  BucketExecutionRecord,
  BucketPlan,
  DiscoveredTestCase,
  OrderedRunSummary,
} from '../helper/models/runner/runnerTypes';
import { RunnerConstants } from '../support/constants/RunnerConstants';
import { OrderedReportParser } from './OrderedReportParser';
import { OrderedSummaryWriter } from './OrderedSummary';
import { PathConstants } from '../support/constants/PathConstants';
import { OrderedExecution } from './OrderedExecution';

export class TestOrderManager {
  private static loadEnvironment(): void {
    dotenv.config();
  }

  private static timestamp(): string {
    return new Date().toISOString().replace(/[:.]/g, '-').replace('T', '_').slice(0, 19);
  }

  private static log(message: string): void {
    process.stdout.write(`[TestOrderManager] ${message}\n`);
  }

  private static ensureDir(dirPath: string): void {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  private static readJsonFile<T>(filePath: string): T {
    return JSON.parse(fs.readFileSync(filePath, 'utf8')) as T;
  }

  private static getPlaywrightCliPath(): string {
    const cliPath = path.join(process.cwd(), 'node_modules', 'playwright', 'cli.js');
    if (!fs.existsSync(cliPath)) {
      throw new Error(
        `Playwright CLI not found at ${cliPath}. Run npm install before using the ordered runner.`
      );
    }

    return cliPath;
  }

  private static getPlaywrightConfigPath(): string {
    return path.join(process.cwd(), 'playwright.config.ts');
  }

  private static getMergeConfigPath(): string {
    return path.join(process.cwd(), 'src', 'runner', 'playwright.merge.config.ts');
  }

  private static createReportRoot(): string {
    return process.env.REPORT_ROOT || path.join(process.cwd(), 'reports', this.timestamp());
  }

  private static async spawnPlaywrightProcess(
    args: string[],
    env: NodeJS.ProcessEnv
  ): Promise<number> {
    return await new Promise((resolve, reject) => {
      const child = spawn(process.execPath, args, {
        cwd: process.cwd(),
        env,
        stdio: 'inherit',
      });

      child.on('error', reject);
      child.on('close', (code) => resolve(code ?? 1));
    });
  }

  private static getBucketLocationArgs(bucket: BucketPlan): string[] {
    return bucket.tests.map((test) => `${path.normalize(test.file)}:${test.line}`);
  }

  private static async discoverTests(
    reportRoot: string,
    forwardedArgs: string[]
  ): Promise<DiscoveredTestCase[]> {
    const discoveryOutputPath = path.join(
      reportRoot,
      PathConstants.ORDERED_RESULTS_PATH,
      'discovery.json'
    );
    const env = {
      ...process.env,
      REPORT_ROOT: reportRoot,
      ORDERED_DISCOVERY: 'true',
      ORDERED_DISCOVERY_OUTPUT_FILE: discoveryOutputPath,
    };

    this.ensureDir(path.dirname(discoveryOutputPath));

    const exitCode = await this.spawnPlaywrightProcess(
      [
        this.getPlaywrightCliPath(),
        'test',
        '--list',
        '-c',
        this.getPlaywrightConfigPath(),
        ...forwardedArgs,
      ],
      env
    );

    if (exitCode !== 0) {
      throw new Error(`Playwright discovery failed with exit code ${exitCode}.`);
    }

    if (!fs.existsSync(discoveryOutputPath)) {
      throw new Error(`Discovery output was not created at ${discoveryOutputPath}.`);
    }

    return OrderedReportParser.parseDiscoveryReport(this.readJsonFile<any>(discoveryOutputPath));
  }

  private static summarizeBucketTests(
    bucketTests: ReturnType<typeof OrderedReportParser.parseExecutedTests>['tests']
  ): BucketExecutionRecord['stats'] {
    const summary = {
      total: bucketTests.length,
      passed: 0,
      failed: 0,
      skipped: 0,
      flaky: 0,
    };

    for (const test of bucketTests) {
      if (test.outcome === 'flaky') {
        summary.flaky++;
        summary.passed++;
        continue;
      }

      if (test.outcome === 'skipped') {
        summary.skipped++;
        continue;
      }

      if (
        test.outcome === 'unexpected' ||
        test.finalStatus === 'failed' ||
        test.finalStatus === 'timedOut'
      ) {
        summary.failed++;
        continue;
      }

      if (test.finalStatus === 'interrupted') {
        summary.failed++;
        continue;
      }

      summary.passed++;
    }

    return summary;
  }

  /**
   * Builds a single executable bucket record from a grouped set of adjacent buckets.
   * @param group - A grouped set of adjacent bucket plans.
   * @returns A merged bucket plan that can be executed as one Playwright run.
   */
  private static buildGroupBucket(group: BucketPlan[]): BucketPlan {
    const tests = OrderedExecution.mergeGroupTests(group);

    return {
      key: group.map((bucket) => bucket.key).join('+'),
      label: group.map((bucket) => bucket.label).join(', '),
      kind: group[0]?.kind ?? 'none',
      critical: group.some((bucket) => bucket.critical),
      tests,
    };
  }

  /**
   * Creates a skipped record for a grouped or single bucket when nothing matched.
   * @param bucket - The bucket plan to represent in the summary.
   * @param reason - The reason the bucket was skipped.
   * @returns A bucket execution record marked as skipped.
   */
  private static createSkippedRecord(
    bucket: BucketPlan,
    reason: string,
    status: BucketExecutionRecord['status'] = 'skipped'
  ): BucketExecutionRecord {
    return {
      key: bucket.key,
      label: bucket.label,
      kind: bucket.kind,
      critical: bucket.critical,
      matchedCount: 0,
      executed: false,
      skipped: true,
      skippedReason: reason,
      durationMs: 0,
      status,
      stats: { total: 0, passed: 0, failed: 0, skipped: 0, flaky: 0 },
      failedTests: [],
      slowTests: [],
    };
  }

  private static async executeBucket(
    bucket: BucketPlan,
    reportRoot: string,
    forwardedArgs: string[]
  ): Promise<BucketExecutionRecord> {
    if (!bucket.tests.length) {
      return {
        key: bucket.key,
        label: bucket.label,
        kind: bucket.kind,
        critical: bucket.critical,
        matchedCount: 0,
        executed: false,
        skipped: true,
        skippedReason: 'No tests matched this bucket.',
        durationMs: 0,
        status: 'skipped',
        stats: { total: 0, passed: 0, failed: 0, skipped: 0, flaky: 0 },
        failedTests: [],
        slowTests: [],
      };
    }

    const resultsDir = path.join(reportRoot, PathConstants.ORDERED_RESULTS_PATH);
    const bucketJsonPath = path.join(resultsDir, `${bucket.key}.json`);

    this.ensureDir(resultsDir);

    const env = {
      ...process.env,
      REPORT_ROOT: reportRoot,
      ORDERED_RUN: 'true',
      ORDERED_BUCKET_NAME: bucket.key,
      ORDERED_BUCKET_JSON_OUTPUT_FILE: bucketJsonPath,
      ORDERED_BLOB_OUTPUT_DIR: path.join(reportRoot, PathConstants.BLOB_REPORTS_PATH),
      ORDERED_BLOB_FILE_NAME: `${bucket.key}.zip`,
    };

    const startedAt = Date.now();
    const exitCode = await this.spawnPlaywrightProcess(
      [
        this.getPlaywrightCliPath(),
        'test',
        '-c',
        this.getPlaywrightConfigPath(),
        ...this.getBucketLocationArgs(bucket),
        ...forwardedArgs,
      ],
      env
    );
    const durationMs = Date.now() - startedAt;

    const parsedResults = fs.existsSync(bucketJsonPath)
      ? OrderedReportParser.parseExecutedTests(this.readJsonFile<any>(bucketJsonPath))
      : { tests: [], durationMs };
    const stats = this.summarizeBucketTests(parsedResults.tests);
    const failedTests = parsedResults.tests.filter(
      (test) =>
        test.outcome === 'unexpected' ||
        test.finalStatus === 'failed' ||
        test.finalStatus === 'timedOut'
    );
    const slowTests = [...parsedResults.tests]
      .sort((left, right) => right.durationMs - left.durationMs)
      .slice(0, 5);

    let status: BucketExecutionRecord['status'] = 'passed';
    if (exitCode !== 0 && !failedTests.length && !parsedResults.tests.length) {
      status = 'interrupted';
    } else if (failedTests.length || exitCode !== 0) {
      status = 'failed';
    }

    return {
      key: bucket.key,
      label: bucket.label,
      kind: bucket.kind,
      critical: bucket.critical,
      matchedCount: bucket.tests.length,
      executed: true,
      skipped: false,
      durationMs: parsedResults.durationMs || durationMs,
      status,
      stats,
      failedTests,
      slowTests,
    };
  }

  private static async mergeBlobReports(reportRoot: string): Promise<number> {
    const blobDir = path.join(reportRoot, PathConstants.BLOB_REPORTS_PATH);

    if (!fs.existsSync(blobDir)) {
      return 0;
    }

    return await this.spawnPlaywrightProcess(
      [this.getPlaywrightCliPath(), 'merge-reports', '-c', this.getMergeConfigPath(), blobDir],
      {
        ...process.env,
        REPORT_ROOT: reportRoot,
      }
    );
  }

  private static buildSummary(
    reportRoot: string,
    mode: ReturnType<typeof OrderedExecution.resolveOrderMode>,
    failurePolicy: ReturnType<typeof OrderedExecution.resolveFailurePolicy>,
    dryRun: boolean,
    discoveredTests: DiscoveredTestCase[],
    buckets: BucketPlan[],
    executedBuckets: BucketExecutionRecord[],
    scopeTags: string[],
    orderedTags: string[],
    stopReason?: string
  ): OrderedRunSummary {
    const executedTests = executedBuckets.reduce((sum, bucket) => sum + bucket.stats.total, 0);
    const failedCriticalTests = executedBuckets
      .filter((bucket) => bucket.critical)
      .flatMap((bucket) => bucket.failedTests);
    const topSlowTests = executedBuckets
      .flatMap((bucket) => bucket.slowTests)
      .sort((left, right) => right.durationMs - left.durationMs)
      .slice(0, 10);

    return {
      mode,
      failurePolicy,
      dryRun,
      reportRoot,
      scopeTags,
      orderedTags,
      totals: {
        discovered: discoveredTests.length,
        selected: buckets.reduce((sum, bucket) => sum + bucket.tests.length, 0),
        executed: executedTests,
        passed: executedBuckets.reduce((sum, bucket) => sum + bucket.stats.passed, 0),
        failed: executedBuckets.reduce((sum, bucket) => sum + bucket.stats.failed, 0),
        skipped: executedBuckets.reduce((sum, bucket) => sum + bucket.stats.skipped, 0),
        flaky: executedBuckets.reduce((sum, bucket) => sum + bucket.stats.flaky, 0),
      },
      buckets: executedBuckets,
      stopReason,
      failedCriticalTests,
      topSlowTests,
      generatedAt: new Date().toISOString(),
    };
  }

  private static createStopReason(
    bucket: BucketPlan,
    failurePolicy: ReturnType<typeof OrderedExecution.resolveFailurePolicy>
  ): string {
    if (failurePolicy === 'immediate') {
      return `Execution aborted after failure in ${bucket.label}.`;
    }

    return `Execution aborted after critical failure in ${bucket.label}.`;
  }

  public static async run(): Promise<void> {
    this.loadEnvironment();

    const forwardedArgs = process.argv.slice(2);
    const mode = OrderedExecution.resolveOrderMode(process.env.ORDER_MODE);
    const failurePolicy = OrderedExecution.resolveFailurePolicy(process.env.FAILURE_POLICY);
    const dryRun = process.env.ORDER_DRY_RUN === 'true';
    const orderedTags = OrderedExecution.parseOrderedTags(process.env.ORDERED_TAGS);
    const scopeTags = OrderedExecution.parseScopeTags(process.env.SCOPE_TAGS);
    const reportRoot = this.createReportRoot();

    process.env.REPORT_ROOT = reportRoot;
    this.ensureDir(reportRoot);

    this.log(`Report root: ${reportRoot}`);
    this.log(`Mode: ${mode}`);
    this.log(`Failure Policy: ${failurePolicy}`);

    if (mode === 'custom' && !orderedTags.length) {
      throw new Error(
        'ORDER_MODE=custom requires ORDERED_TAGS to be set, for example ORDERED_TAGS=P1,P3.'
      );
    }

    const invalidOrderedTags = orderedTags.filter(
      (tag) =>
        tag !== RunnerConstants.NO_PRIORITY_TOKEN &&
        !RunnerConstants.PRIORITY_TAGS.includes(
          tag as (typeof RunnerConstants.PRIORITY_TAGS)[number]
        )
    );
    if (invalidOrderedTags.length) {
      throw new Error(
        `Unsupported ORDERED_TAGS value(s): ${invalidOrderedTags.join(', ')}. Use P1, P2, P3, P4, or NoPriority.`
      );
    }

    const discoveredTests = await this.discoverTests(reportRoot, forwardedArgs);
    const validationErrors = OrderedExecution.validateDiscoveredTests(discoveredTests);
    if (validationErrors.length) {
      validationErrors.forEach((error) => this.log(`Validation error: ${error}`));
      throw new Error(
        `Ordered execution validation failed with ${validationErrors.length} error(s).`
      );
    }

    const buckets = OrderedExecution.buildBuckets(discoveredTests, {
      mode,
      scopeTags,
      orderedTags,
    });

    const bucketRecords: BucketExecutionRecord[] = [];
    let stopReason: string | undefined;
    let encounteredFailure = false;
    const executionGroups = OrderedExecution.groupBuckets(buckets);

    if (!dryRun) {
      for (const group of executionGroups) {
        const executionBucket = this.buildGroupBucket(group);

        if (stopReason) {
          bucketRecords.push(this.createSkippedRecord(executionBucket, stopReason, 'not-run'));
          continue;
        }

        if (!executionBucket.tests.length) {
          bucketRecords.push(
            this.createSkippedRecord(executionBucket, 'No tests matched this bucket group.')
          );
          continue;
        }

        this.log(
          `Executing bucket group ${executionBucket.label} with ${executionBucket.tests.length} test(s)`
        );
        const bucketRecord = await this.executeBucket(executionBucket, reportRoot, forwardedArgs);
        bucketRecords.push(bucketRecord);

        if (bucketRecord.status === 'failed' || bucketRecord.status === 'interrupted') {
          encounteredFailure = true;
        }

        if (
          OrderedExecution.shouldAbortAfterBucket(
            executionBucket,
            bucketRecord.status,
            mode,
            failurePolicy
          )
        ) {
          stopReason = this.createStopReason(executionBucket, failurePolicy);
        }
      }
    } else {
      for (const group of executionGroups) {
        const executionBucket = this.buildGroupBucket(group);
        bucketRecords.push(this.createSkippedRecord(executionBucket, 'Dry run only.', 'not-run'));
      }
    }

    let mergeExitCode = 0;
    if (!dryRun) {
      mergeExitCode = await this.mergeBlobReports(reportRoot);
      if (mergeExitCode !== 0) {
        encounteredFailure = true;
        stopReason = stopReason
          ? `${stopReason} Blob report merge also failed.`
          : 'Blob report merge failed.';
      }
    }

    const summary = this.buildSummary(
      reportRoot,
      mode,
      failurePolicy,
      dryRun,
      discoveredTests,
      buckets,
      bucketRecords,
      scopeTags,
      orderedTags,
      stopReason
    );
    OrderedSummaryWriter.writeOrderedSummary(reportRoot, summary);

    if (encounteredFailure) {
      process.exitCode = 1;
    }
  }
}

TestOrderManager.run().catch((error: Error) => {
  process.stderr.write(`[TestOrderManager] ${error.message}\n`);
  process.exitCode = 1;
});
