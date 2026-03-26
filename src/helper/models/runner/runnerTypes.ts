import { RunnerConstants } from '../../../support/constants/RunnerConstants';

export type OrderMode = 'basic' | 'priority' | 'custom';
export type FailurePolicy = 'critical' | 'continue' | 'immediate';
export type BucketKind = 'boundary' | 'priority' | 'none';
export type PriorityTag = (typeof RunnerConstants.PRIORITY_TAGS)[number];

export interface DiscoveredTestCase {
  id: string;
  title: string;
  file: string;
  line: number;
  column: number;
  tags: string[];
  normalizedTags: string[];
  priorityTag: PriorityTag | null;
}

export interface BucketPlan {
  key: string;
  label: string;
  kind: BucketKind;
  critical: boolean;
  tests: DiscoveredTestCase[];
}

export interface BucketExecutionRecord {
  key: string;
  label: string;
  kind: BucketKind;
  critical: boolean;
  matchedCount: number;
  executed: boolean;
  skipped: boolean;
  skippedReason?: string;
  durationMs: number;
  status: 'passed' | 'failed' | 'skipped' | 'interrupted' | 'not-run';
  stats: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
    flaky: number;
  };
  failedTests: ExecutedTestResult[];
  slowTests: ExecutedTestResult[];
}

export interface ExecutedTestResult {
  id: string;
  title: string;
  file: string;
  line: number;
  tags: string[];
  outcome: string;
  finalStatus: string;
  durationMs: number;
  errorMessages: string[];
}

export interface OrderedRunSummary {
  mode: OrderMode;
  failurePolicy: FailurePolicy;
  dryRun: boolean;
  reportRoot: string;
  scopeTags: string[];
  orderedTags: string[];
  totals: {
    discovered: number;
    selected: number;
    executed: number;
    passed: number;
    failed: number;
    skipped: number;
    flaky: number;
  };
  buckets: BucketExecutionRecord[];
  stopReason?: string;
  failedCriticalTests: ExecutedTestResult[];
  topSlowTests: ExecutedTestResult[];
  generatedAt: string;
}

export interface BuildBucketOptions {
  mode: OrderMode;
  scopeTags: string[];
  orderedTags: string[];
}
