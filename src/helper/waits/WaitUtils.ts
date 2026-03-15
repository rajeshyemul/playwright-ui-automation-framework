import { expect, Page } from '@playwright/test';
import { PageActions } from '@helper/actions/PageActions';
import { Logger } from '@helper/logger/Logger';

/**
 * WaitUtils - Centralized wait operations
 *
 * PURPOSE: All waiting logic in one place
 *
 * BENEFITS:
 * - Consistent timeouts
 * - Automatic logging
 * - Easy to extend with custom waits
 */
export class WaitUtils {
  private pageActions: PageActions;

  constructor(pageActions: PageActions) {
    this.pageActions = pageActions;
  }

  private get page(): Page {
    return this.pageActions.getPage();
  }

  /**
   * Wait for element to be visible
   */
  async waitForVisible(selector: string, timeout: number = 30000): Promise<void> {
    Logger.info(`Waiting for ${selector} to be visible`);
    await this.page.locator(selector).waitFor({ state: 'visible', timeout });
  }

  /**
   * Wait for element to be hidden
   */
  async waitForHidden(selector: string, timeout: number = 30000): Promise<void> {
    Logger.info(`Waiting for ${selector} to be hidden`);
    await this.page.locator(selector).waitFor({ state: 'hidden', timeout });
  }

  /**
   * Wait for element to be attached
   */
  async waitForAttached(selector: string, timeout: number = 30000): Promise<void> {
    Logger.info(`Waiting for ${selector} to be attached`);
    await this.page.locator(selector).waitFor({ state: 'attached', timeout });
  }

  /**
   * Wait for navigation
   */
  async waitForNavigation(urlPattern: string | RegExp, timeout: number = 30000): Promise<void> {
    Logger.info(`Waiting for navigation to: ${urlPattern}`);
    await this.page.waitForURL(urlPattern, { timeout });
  }

  /**
   * Wait for load state
   */
  async waitForLoadState(
    state: 'load' | 'domcontentloaded' | 'networkidle' = 'load',
    timeout: number = 30000
  ): Promise<void> {
    Logger.info(`Waiting for load state: ${state}`);
    await this.page.waitForLoadState(state, { timeout });
  }

  /**
   * Wait for a page to finish its initial HTML load.
   */
  async waitForPageLoad(timeout: number = 30000): Promise<void> {
    Logger.info('Waiting for page load: domcontentloaded');
    await this.page.waitForLoadState('domcontentloaded', { timeout });
  }

  /**
   * Wait for a page-specific ready selector to become visible.
   */
  async waitForPageReady(selector: string, timeout: number = 30000): Promise<void> {
    Logger.info(`Waiting for page ready selector: ${selector}`);
    await this.page.locator(selector).waitFor({ state: 'visible', timeout });
  }

  /**
   * Wait for specific timeout (use sparingly!)
   */
  async waitForTimeout(milliseconds: number): Promise<void> {
    Logger.warn(`Hard wait for ${milliseconds}ms - consider using explicit waits instead`);
    await this.page.waitForTimeout(milliseconds);
  }

  /**
   * Wait for element count
   */
  async waitForElementCount(
    selector: string,
    count: number,
    timeout: number = 30000
  ): Promise<void> {
    Logger.info(`Waiting for ${count} elements matching ${selector}`);

    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
      const actualCount = await this.page.locator(selector).count();
      if (actualCount === count) {
        Logger.info(`Found ${count} elements`);
        return;
      }
      await this.page.waitForTimeout(100);
    }

    throw new Error(`Timeout: Expected ${count} elements, still waiting after ${timeout}ms`);
  }

  /**
   * Wait for function to return true
   */
  async waitForFunction(
    fn: () => boolean | Promise<boolean>,
    options?: { timeout?: number; polling?: number }
  ): Promise<void> {
    const timeout = options?.timeout || 30000;
    const polling = options?.polling || 100;

    Logger.info(`Waiting for custom function`);

    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
      if (await fn()) {
        Logger.info(`Function returned true`);
        return;
      }
      await this.page.waitForTimeout(polling);
    }

    throw new Error(`Timeout: Function did not return true within ${timeout}ms`);
  }

  /**
   * Wait for text to appear
   */
  async waitForText(text: string | RegExp, timeout: number = 30000): Promise<void> {
    Logger.info(`Waiting for text: ${text}`);
    await this.page.getByText(text).waitFor({ state: 'visible', timeout });
  }

  /**
   * Wait for URL to contain
   */
  async waitForUrlContains(urlPart: string, timeout: number = 30000): Promise<void> {
    Logger.info(`Waiting for URL to contain: ${urlPart}`);

    try {
      const urlRegex = new RegExp(urlPart.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
      await this.page.waitForURL(urlRegex, { timeout });
      Logger.info(`URL contains: ${urlPart}`);
    } catch (error) {
      throw new Error(`Timeout: URL did not contain "${urlPart}" within ${timeout}ms`);
    }
  }
  /**
   * Wait for element to be enabled
   */
  async waitForEnabled(selector: string, timeout: number = 30000): Promise<void> {
    Logger.info(`Waiting for ${selector} to be enabled`);
    await expect(this.page.locator(selector)).toBeEnabled({ timeout });
  }

  /**
   * Wait for element to be disabled
   */
  async waitForDisabled(selector: string, timeout: number = 30000): Promise<void> {
    Logger.info(`Waiting for ${selector} to be disabled`);
    await expect(this.page.locator(selector)).toBeDisabled({ timeout });
  }

  /**
   * Wait for input to have specific value
   */
  async waitForValue(
    selector: string,
    value: string | RegExp,
    timeout: number = 30000
  ): Promise<void> {
    Logger.info(`Waiting for ${selector} to have value: ${value}`);
    await expect(this.page.locator(selector)).toHaveValue(value, { timeout });
  }
}
