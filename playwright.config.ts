import { defineConfig, devices } from '@playwright/test';
import { ConfigManager } from './src/config/ConfigManager';
import os from 'os';
import { SetupConstants } from './src/support/constants/SetupConstants';
import { PathConstants } from './src/support/constants/PathConstants';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const timestamp = new Date().toISOString().replace(/[:.]/g, '-').replace('T', '_').slice(0, 19);

const REPORT_ROOT = path.join(process.cwd(), 'reports', timestamp);

// Make it visible everywhere
process.env.REPORT_ROOT = REPORT_ROOT;

export default defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  outputDir: path.join(REPORT_ROOT, PathConstants.FOLDER_ARTIFACTS),
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    [
      'html',
      {
        open: SetupConstants.NEVER,
        title: SetupConstants.HTML_REPORT_TITLE,
        outputFolder: path.join(REPORT_ROOT, PathConstants.HTML_REPORTS_PATH),
        noSnippets: true,
      },
    ],
    ['junit', { outputFile: path.join(REPORT_ROOT, PathConstants.JUNIT_REPORTS_PATH) }],
    ['json', { outputFile: path.join(REPORT_ROOT, PathConstants.JSON_REPORTS_PATH) }],
    [
      'allure-playwright',
      {
        detail: true,
        resultsDir: path.join(REPORT_ROOT, PathConstants.ALLURE_REPORTS_PATH),
        suiteTitle: true,
        environmentInfo: {
          Framework: SetupConstants.FRAMEWORK_TITLE,
          Environment: process.env.ENVIRONMENT || SetupConstants.LOCAL,
          Browser: process.env.BROWSER || SetupConstants.CHROMIUM,
          OS_Platform: os.platform(),
          OS_Release: os.release(),
          Node_Version: process.version,
          Report_Generation_Time: new Date().toLocaleString(),
        },
      },
    ],
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('')`. */
    baseURL: ConfigManager.setBaseUIUrl(),
    headless: ConfigManager.isHeadless(),
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    screenshot: SetupConstants.ONLY_ON_FAILURE,
    video: SetupConstants.RETAIN_ON_FAILURE,
    trace: SetupConstants.RETAIN_ON_FAILURE,
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'Framework-E2E-Tests',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
