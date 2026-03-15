import { test as base, TestInfo } from '@playwright/test';
import { Logger } from '@helper/logger/Logger';
import { AllureReporter } from '@helper/reporting/AllureReporter';
import { SetupConstants } from '@support/constants/SetupConstants';
import * as fs from 'fs';

/**
 * 
 * * WHAT THIS FILE DOES NOW:
 * - beforeAll: One-time setup for all tests
 * - beforeEach: Per-test setup (if needed)
 * - afterEach: Per-test cleanup (if needed)
 * - afterAll: Final cleanup
 * 
 * NOTE: Page/Context lifecycle is handled by PageFixture.ts
 * PageSetup - Global test lifecycle with auto-capture on failure
 * 
 * ENHANCEMENTS:
 * ✅ Auto-screenshot on failure
 * ✅ Auto-video attachment on failure
 * ✅ Auto-HTML snapshot on failure
 * ✅ Auto-console logs on failure
 */

base.beforeAll(async () => {
  Logger.info('='.repeat(80));
  Logger.info('Test Suite Starting');
  Logger.info('='.repeat(80));
  
  AllureReporter.logEnvironmentInfo();
});

base.beforeEach(async ({ page, context }, testInfo: TestInfo) => {
  Logger.info('-'.repeat(80));
  Logger.info(`Test Starting: ${testInfo.title}`);
  Logger.info(`Worker: ${testInfo.parallelIndex + 1}`);
  Logger.info(`Project: ${testInfo.project.name}`);
  Logger.info('-'.repeat(80));
  
  // Set default timeout
  testInfo.setTimeout(SetupConstants.TEST_TIMEOUT);
  
  // Log browser info
  const browserName = context.browser()?.browserType().name();
  const viewport = page.viewportSize();
  Logger.info(`Browser: ${browserName}`);
  Logger.info(`Viewport: ${viewport?.width}x${viewport?.height}`);
  
  // Collect console logs for potential debugging
  page.on('console', msg => {
    const type = msg.type();
    if (type === 'error' || type === 'warning') {
      Logger.warn(`Browser ${type}: ${msg.text()}`);
    }
  });
});

base.afterEach(async ({ page }, testInfo: TestInfo) => {
  const testStatus = testInfo.status;
  const testDuration = testInfo.duration;
  
  Logger.info('-'.repeat(80));
  Logger.info(`Test Finished: ${testInfo.title}`);
  Logger.info(`Status: ${testStatus}`);
  Logger.info(`Duration: ${testDuration}ms`);
  
  // ========================================
  // AUTO-CAPTURE ON FAILURE
  // ========================================
  if (testStatus === 'failed' || testStatus === 'timedOut') {
    Logger.error(`Test failed: ${testInfo.title}`);
    
    try {
      // 1. Capture screenshot
      const screenshot = await page.screenshot({ 
        fullPage: true,
        timeout: 5000 
      });
      await AllureReporter.attachScreenshot(
        `failure-screenshot-${testInfo.title.replace(/\s+/g, '-')}`,
        screenshot
      );
      Logger.info('✅ Screenshot attached to Allure');
      
      // 2. Capture HTML snapshot
      const htmlContent = await page.content();
      await AllureReporter.attachHTML('page-source', htmlContent);
      Logger.info('✅ HTML snapshot attached to Allure');
      
      // 3. Capture current URL
      const currentUrl = page.url();
      await AllureReporter.attachText('current-url', currentUrl);
      Logger.info(`✅ Current URL attached: ${currentUrl}`);
      
      // 4. Capture page title
      const pageTitle = await page.title();
      await AllureReporter.attachText('page-title', pageTitle);
      
      // 5. Capture browser console logs (if any errors)
      const errors = testInfo.errors;
      if (errors.length > 0) {
        await AllureReporter.attachJSON('test-errors', errors);
      }
      
    } catch (captureError) {
      Logger.error(`Failed to capture failure artifacts: ${captureError}`);
    }
  }
  
  // ========================================
  // AUTO-ATTACH VIDEO (if available)
  // ========================================
  if (testStatus === 'failed' || testStatus === 'timedOut') {
    // Video path will be available after test completion
    // Playwright saves videos automatically if configured
    const videoPath = await page.video()?.path().catch(() => null);
    if (videoPath && fs.existsSync(videoPath)) {
      await AllureReporter.attachVideo('test-recording', videoPath);
      Logger.info('✅ Video attached to Allure');
    }
  }
  
  Logger.info('-'.repeat(80));
});

base.afterAll(async () => {
  Logger.info('='.repeat(80));
  Logger.info('Test Suite Completed');
  Logger.info('='.repeat(80));
});

export const test = base;
export { expect } from '@playwright/test';
