import { Locator, Page, test } from '@playwright/test';
import { PageActions } from './PageActions';
import { Logger } from '@helper/logger/Logger';
import { LocatorFactory } from './LocatorFactory';

/**
 *  UIActions - Common UI interactions with Allure step integration
 * 
 * USAGE:
 * class HomePage extends BasePage {
 *   private uiActions: UIActions;
 * 
 *   constructor(pageActions: PageActions) {
 *     super(pageActions);
 *     this.uiActions = new UIActions(pageActions);
 *   }
 * 
 *   async clickButton() {
 *     await this.uiActions.click('.button');
 *   }
 * }
 * 
/**
 * 
 * USE THIS WHEN:
 * - You want automatic Allure step logging
 * - You need simple, straightforward interactions
 * 
 * USE UIElementActions WHEN:
 * - You need retry logic
 * - You need advanced interactions (drag/drop, hover)
 * - You need element state checking
 * 
 * BOTH ARE AVAILABLE IN BASEPAGE:
 * - this.uiActions.click()
 * - this.uiElementActions.clickElement()
 */
 
export class UIActions {
  private pageActions: PageActions;

  constructor(pageActions: PageActions) {
    this.pageActions = pageActions;
  }

  private get page(): Page {
    return this.pageActions.getPage();
  }

  /**
   * Navigate to URL with description
   */
  public async gotoURL(url: string, description: string): Promise<void> {
    await test.step(`=====> Navigate to ${description}`, async () => {
      await this.pageActions.gotoURL(url, description);
    });
  }

  /**
   * Click element with logging
   */
  public async click(selector: string, description?: string): Promise<void> {
    const msg = description || `Click element: ${selector}`;
    await test.step(msg, async () => {
      Logger.info(msg);
      await this.page.locator(selector).click();
    });
  }

  /**
   * Fill input field
   */
  public async fill(selector: string, value: string, description?: string): Promise<void> {
    const msg = description || `Fill ${selector} with: ${value}`;
    await test.step(msg, async () => {
      Logger.info(msg);
      await this.page.locator(selector).fill(value);
    });
  }

  /**
   * Wait for element to be visible
   */
  public async waitForElement(selector: string, timeout: number = 30000): Promise<void> {
    await test.step(`Wait for element: ${selector}`, async () => {
      Logger.info(`Waiting for element: ${selector}`);
      await this.page.locator(selector).waitFor({ state: 'visible', timeout });
    });
  }

  /**
   * Verify element is visible
   */
  public async verifyElementVisible(selector: string): Promise<boolean> {
    return await test.step(`Verify ${selector} is visible`, async () => {
      const isVisible = await this.page.locator(selector).isVisible();
      Logger.info(`Element ${selector} visibility: ${isVisible}`);
      return isVisible;
    });
  }

  /**
   * Get text content
   */
  public async getText(selector: string): Promise<string> {
    return await test.step(`Get text from ${selector}`, async () => {
      const text = await this.page.locator(selector).textContent();
      Logger.info(`Text from ${selector}: ${text}`);
      return text?.trim() || '';
    });
  }

  /**
   * Select dropdown option
   */
  public async selectOption(selector: string, value: string): Promise<void> {
    await test.step(`Select option ${value} in ${selector}`, async () => {
      Logger.info(`Selecting option: ${value}`);
      await this.page.locator(selector).selectOption(value);
    });
  }

  /**
   * Press keyboard key
   */
  public async pressKey(key: string): Promise<void> {
    await test.step(`Press key: ${key}`, async () => {
      await this.page.keyboard.press(key);
    });
  }

  /**
   * Reload page
   */
  public async reload(): Promise<void> {
    await test.step('Reload page', async () => {
      await this.pageActions.reloadPage();
    });
  }
}
