// src/helper/reporting/GenerateReports.ts

import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { Logger } from '../logger/Logger';

export class GenerateReports {
  private static readonly REPORT_ROOT = path.resolve(process.cwd(), 'reports');

  /**
   * Finds the most recent timestamped run folder under /reports.
   */
  public static getLatestRunFolder(): string {
    const root = this.REPORT_ROOT;
    const folders = fs
      .readdirSync(root)
      .filter((name) => /^\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}$/.test(name))
      .map((name) => path.join(root, name))
      .filter((dir) => fs.existsSync(path.join(dir, 'allure-results')));

    if (!folders.length) {
      const message = `
No test run folders found in ${root}.
Please run tests first: npm test
  `.trim();
      Logger.error(message);
      throw new Error(message);
    }

    folders.sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs);
    return folders[0];
  }

  private static parseTimestamp(folder: string): Date {
    const [date, time] = folder.split('_');
    const iso = `${date}T${time.replace(/-/g, ':')}`;
    const parsed = new Date(iso);

    if (isNaN(parsed.getTime())) {
      throw new Error(`Invalid run folder format: ${folder}`);
    }

    return parsed;
  }

  /**
   * Opens the Playwright HTML report for the latest run.
   */
  public static openHtmlReport(): void {
    const runPath = this.getLatestRunFolder();
    const htmlPath = path.join(runPath, 'html');

    if (!fs.existsSync(htmlPath)) {
      throw new Error(`HTML report not found at ${htmlPath}`);
    }

    const command = `npx playwright show-report "${htmlPath}"`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        Logger.error(`Failed to open HTML report: ${error.message}`);
        return;
      }
      if (stderr) {
        Logger.error(stderr);
        return;
      }
      Logger.info(stdout);
    });
  }

  /**
   * Generates Allure report for the latest run.
   * If open=true, it will also open the report.
   */
  public static generateAllureReport(open = false): void {
    const runPath = this.getLatestRunFolder();
    const resultsPath = path.join(runPath, 'allure-results');
    const reportPath = path.join(runPath, 'allure-report');
    const title = process.env.REPORT_TITLE || 'Automation Report';

    if (!fs.existsSync(resultsPath)) {
      throw new Error(`Allure results not found at ${resultsPath}`);
    }

    let command = `allure generate "${resultsPath}" --name "${title}" -o "${reportPath}" --clean`;

    if (open) {
      command += ` && allure open "${reportPath}"`;
    }

    exec(command, (error, stdout, stderr) => {
      if (error) {
        Logger.error(`Allure generation failed: ${error.message}`);
        return;
      }
      if (stderr) {
        Logger.error(stderr);
        return;
      }
      Logger.info(stdout);
    });
  }
}

// CLI entry point
if (require.main === module) {
  const mode = process.argv[2];

  if (mode === 'html') {
    GenerateReports.openHtmlReport();
  } else if (mode === 'allure') {
    const open = process.argv.includes('--open');
    GenerateReports.generateAllureReport(open);
  } else {
    Logger.info(`
Usage:
  npx ts-node src/helper/reporting/GenerateReports.ts html
  npx ts-node src/helper/reporting/GenerateReports.ts allure [--open]
`);
  }
}
