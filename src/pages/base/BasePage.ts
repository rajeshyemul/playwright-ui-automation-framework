import { Page, Locator } from '@playwright/test';
import { PageActions } from '@helper/actions/PageActions';
import { UIActions } from '@helper/actions/UIActions';
import { UIElementActions } from '@helper/actions/UIElementActions';
import { EditBoxActions } from '@helper/actions/EditBoxActions';
import { CheckboxActions } from '@helper/actions/CheckboxActions';
import { DropDownActions } from '@helper/actions/DropDownActions';
import { AssertUtils } from '@helper/asserts/AssertUtils';
import { ExpectUtils } from '@helper/asserts/ExpectUtils';
import { WaitUtils } from '@helper/waits/WaitUtils';
import { Logger } from '@helper/logger/Logger';

/**
 * BasePage - Lean base class that provides access to all helpers
 * 
 * DESIGN PRINCIPLES:
 * ✅ Initialize helpers once, use everywhere
 * ✅ Delegate to helpers, don't duplicate functionality
 * ✅ Keep BasePage focused on page lifecycle
 * ✅ Helper classes maintain single responsibility
 * 
 * AVAILABLE HELPERS:
 * 
 * ACTIONS:
 * - this.uiActions         → Common UI actions with step logging
 * - this.uiElementActions  → Advanced element interactions (retry, hover, drag)
 * - this.editBoxActions    → Input field operations (fill, type, clear)
 * - this.checkboxActions   → Checkbox operations (check, uncheck, toggle)
 * - this.dropdownActions   → Select/dropdown operations
 * 
 * ASSERTIONS:
 * - this.assertUtils       → Custom assertions
 * - this.expectUtils       → Playwright expect utilities
 * 
 * WAITS:
 * - this.waitUtils         → Wait operations
 * 
 * CORE:
 * - this.page              → Playwright Page instance
 * - this.pageActions       → Page/context management
 * 
 * USAGE EXAMPLE:
 * export class HomePage extends BasePage {
 *   async login(username: string, password: string) {
 *     await this.editBoxActions.fill('#username', username);
 *     await this.editBoxActions.fill('#password', password);
 *     await this.uiActions.click('#login-btn', 'Login button');
 *     await this.waitUtils.waitForNavigation('/dashboard');
 *     await this.expectUtils.toHaveURL(/dashboard/);
 *   }
 * }
 */
export abstract class BasePage {
  // ========================================
  // CORE PAGE ACCESS
  // ========================================
  protected page: Page;
  protected pageActions: PageActions;

  // ========================================
  // ACTION HELPERS
  // ========================================
  protected uiActions: UIActions;
  protected uiElementActions: UIElementActions;
  protected editBoxActions: EditBoxActions;
  protected checkboxActions: CheckboxActions;
  protected dropdownActions: DropDownActions;

  // ========================================
  // ASSERTION HELPERS
  // ========================================
  protected assertUtils: AssertUtils;
  protected expectUtils: ExpectUtils;

  // ========================================
  // WAIT HELPERS
  // ========================================
  protected waitUtils: WaitUtils;

  // ========================================
  // REQUIRED PROPERTIES
  // ========================================
  protected abstract pageUrl: string;
  protected abstract pageTitle: string | RegExp;

  /**
   * Constructor - Initialize all helpers
   */
  constructor(pageActions: PageActions) {
    this.pageActions = pageActions;
    this.page = pageActions.getPage();

    // Initialize action helpers
    this.uiActions = new UIActions(pageActions);
    this.uiElementActions = new UIElementActions(pageActions);
    this.editBoxActions = new EditBoxActions(pageActions);
    this.checkboxActions = new CheckboxActions(pageActions);
    this.dropdownActions = new DropDownActions(pageActions);

    // Initialize assertion helpers
    this.assertUtils = new AssertUtils();
    this.expectUtils = new ExpectUtils(pageActions);

    // Initialize wait helpers
    this.waitUtils = new WaitUtils(pageActions);

    Logger.debug(`${this.constructor.name} initialized`);
  }

  // ========================================
  // LIFECYCLE METHODS
  // ========================================

  /**
   * Navigate to this page's URL
   * 
   * Delegates to: pageActions.gotoURL()
   */
  async navigate(): Promise<void> {
    const pageName = this.constructor.name;
    Logger.info(`Navigating to ${pageName}`);
    await this.pageActions.gotoURL(this.pageUrl, pageName);
    await this.waitForPageLoad();
  }

  /**
   * Wait for page to fully load
   * 
   * Delegates to: waitUtils (if you have it there)
   * Otherwise keeps it simple here
   */
  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForLoadState('networkidle');
    Logger.debug(`${this.constructor.name} loaded`);
  }

  /**
   * Verify page loaded by title
   * 
   * Delegates to: expectUtils.toHaveTitle()
   */
  async verifyPageLoaded(): Promise<void> {
    await this.expectUtils.expectPageToHaveTitle(this.pageTitle, `${this.constructor.name} title verification`, "Page title does not match expected");
    Logger.info(`${this.constructor.name} title verified`);
  }

  /**
   * Reload page
   * 
   * Delegates to: pageActions.reloadPage()
   */
  async reload(): Promise<void> {
    Logger.info(`Reloading ${this.constructor.name}`);
    await this.pageActions.reloadPage();
    await this.waitForPageLoad();
  }

  /**
   * Get current URL
   */
  getCurrentUrl(): string {
    return this.page.url();
  }

  /**
   * Get current page title
   */
  async getCurrentTitle(): Promise<string> {
    return await this.page.title();
  }

  // ========================================
  // CONVENIENCE METHODS (OPTIONAL)
  // ========================================
  // Only add methods here that are used across 80% of pages
  // Everything else should use helpers directly
  
  /**
   * Get Playwright Locator
   * 
   * USE THIS: When you need to chain Playwright methods
   * Example: await this.getElement('.btn').hover().click()
   */
  protected getElement(selector: string): Locator {
    return this.page.locator(selector);
  }

  /**
   * Quick navigation shortcut
   * 
   * Delegates to: pageActions.waitForNavigation()
   */
  protected async waitForNavigation(urlPattern: string | RegExp): Promise<void> {
    await this.pageActions.waitForNavigation(urlPattern);
  }

  /**
   * Quick screenshot shortcut
   */
  async takeScreenshot(name?: string): Promise<Buffer> {
    const screenshotName = name || `${this.constructor.name}-${Date.now()}`;
    return await this.page.screenshot({
      path: `screenshots/${screenshotName}.png`,
      fullPage: true,
    });
  }
}