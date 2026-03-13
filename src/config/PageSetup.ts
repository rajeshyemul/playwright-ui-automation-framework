import { test as base, Page, BrowserContext, TestInfo } from '@playwright/test';
import { Logger } from '@helper/logger/Logger';

/**
 * PageSetup - Global test lifecycle management
 * 
 * CHANGES FROM OLD VERSION:
 * - Removed setPageFixture (no longer needed)
 * - Removed static PageActions calls
 * - Simplified - fixtures handle everything now
 * 
 * WHAT THIS FILE DOES NOW:
 * - beforeAll: One-time setup for all tests
 * - beforeEach: Per-test setup (if needed)
 * - afterEach: Per-test cleanup (if needed)
 * - afterAll: Final cleanup
 * 
 * NOTE: Page/Context lifecycle is handled by PageFixture.ts
 */

base.beforeAll(async () => {
  Logger.info('='.repeat(80));
  Logger.info('Test Suite Starting');
  Logger.info('='.repeat(80));
  
  // Any global setup here
  // Examples:
  // - Start mock server
  // - Seed test database
  // - Initialize test data
  // - Set up global configurations
});

base.beforeEach(async ({ page, context }, testInfo: TestInfo) => {
  Logger.info('-'.repeat(80));
  Logger.info(`Test Starting: ${testInfo.title}`);
  Logger.info(`Worker: ${testInfo.parallelIndex + 1}`);
  Logger.info('-'.repeat(80));
  
  // Optional: Set default timeout
  testInfo.setTimeout(60000); // 60 seconds per test
  
  // Optional: Log test metadata
  Logger.info(`Browser: ${context.browser()?.browserType().name()}`);
  Logger.info(`Viewport: ${page.viewportSize()?.width}x${page.viewportSize()?.height}`);
  
  // NOTE: We don't need to call PageActions.setPage() anymore!
  // PageFixture handles this automatically
});

base.afterEach(async ({ page }, testInfo: TestInfo) => {
  const testStatus = testInfo.status;
  const testDuration = testInfo.duration;
  
  Logger.info('-'.repeat(80));
  Logger.info(`Test Finished: ${testInfo.title}`);
  Logger.info(`Status: ${testStatus}`);
  Logger.info(`Duration: ${testDuration}ms`);
  Logger.info('-'.repeat(80));
  
  // Take screenshot on failure
  if (testStatus === 'failed') {
    const screenshotPath = `screenshots/failure-${testInfo.title.replace(/\s+/g, '-')}-${Date.now()}.png`;
    await page.screenshot({ 
      path: screenshotPath, 
      fullPage: true 
    });
    Logger.error(`Screenshot saved: ${screenshotPath}`);
  }
  
  // NOTE: Context/Page cleanup is automatic - don't need to close manually
});

base.afterAll(async () => {
  Logger.info('='.repeat(80));
  Logger.info('Test Suite Completed');
  Logger.info('='.repeat(80));
  
  // Any global cleanup here
  // Examples:
  // - Stop mock server
  // - Clean up test database
  // - Generate reports
});

/**
 * Export the base test for use in other setup files if needed
 * 
 * NOTE: Most tests should import from PageFixture.ts, not here
 */
export const test = base;
export { expect } from '@playwright/test';