import { BasePage } from './base/BasePage';
import { PageActions } from '@helper/actions/PageActions';
import { UrlConstants } from '@support/constants/urlConstants';
import { StepRunner } from '@helper/reporting/StepRunner';
import { Logger } from '@helper/logger/Logger';

export class LoginPage extends BasePage {
  protected pageUrl = UrlConstants.LOGIN_PAGE;
  protected pageTitle = /ParaBank | Customer Login/;
  protected pageReadySelector = '[name="username"]';

  constructor(pageActions: PageActions) {
    super(pageActions);
  }

  /**
   * Navigate to login page
   */
  public async navigateToLogin(): Promise<void> {
    await StepRunner.run('Login Page - navigation', async () => {
      await this.pageActions.gotoURL(UrlConstants.LOGIN_PAGE, 'Login page');
      await this.waitUtils.waitForPageLoad();
      await this.waitUtils.waitForPageReady(this.pageReadySelector);
    });
  }

  /**
   * Login with credentials
   */
  async login(username: string, password: string): Promise<void> {
    await StepRunner.run('Login - enter credentials and submit', async () => {
      await this.editBoxActions.fill('[name="username"]', username);
      await this.editBoxActions.fill('[name="password"]', password);

      await this.uiActions.click('[type="submit"]', 'Login button');

      await this.waitUtils.waitForNavigation(/overview|account|welcome/i);

      const currentUrl = this.page.url();
      Logger.info(`Post-login URL: ${currentUrl}`);

      // Check for account overview page indicators
      try {
        await this.expectUtils.expectElementToBeVisible('#accountTable', 'Account table', 'Account table not visible after login');
      } catch (e) {
        // Fallback: check for welcome message or other indicators
        try {
          await this.expectUtils.expectElementToBeVisible('#rightPanel h1', 'Welcome header', 'Welcome header not visible after login');
        } catch (e2) {
          Logger.info('Could not find standard post-login elements, checking URL pattern...');
          await this.expectUtils.expectPageToHaveURL(/overview|account|welcome/i, 'Post-login URL verification', 'Did not navigate to expected page after login');
        }
      }
    });
  }

  /**
   * Verify login error message
   */
  async verifyLoginError(expectedError: string): Promise<void> {
    await StepRunner.run('Login - verify error message', async () => {
      // Use waitUtils + expectUtils
      await this.waitUtils.waitForVisible('.error', 5000);
      await this.expectUtils.expectElementToHaveText('.error', 'Login error message', new RegExp(expectedError), 'Expected error message not found');
    });
  }

  /**
   * Login with credentials and verify success
   */
  async loginAndVerify(username: string, password: string): Promise<void> {
    await StepRunner.run('Login - complete login flow', async () => {
      await this.login(username, password);
      // Verification is already included in the login method
    });
  }

  /**
   * Attempt login with invalid credentials
   */
  async attemptLogin(username: string, password: string): Promise<void> {
    await StepRunner.run('Login - attempt login', async () => {
      await this.editBoxActions.fill('[name="username"]', username);
      await this.editBoxActions.fill('[name="password"]', password);

      await this.uiActions.click('[type="submit"]', 'Login button');
    });
  }

  /**
   * Verify login form is displayed
   */
  async verifyLoginFormVisible(): Promise<void> {
    await StepRunner.run('Login - verify form visible', async () => {
      await this.expectUtils.expectElementToBeVisible('[name="username"]', 'Username field', 'Username field not visible');
      await this.expectUtils.expectElementToBeVisible('[name="password"]', 'Password field', 'Password field not visible');
      await this.expectUtils.expectElementToBeVisible('[type="submit"]', 'Login button', 'Login button not visible');
    });
  }

  /**
   * Get current page title
   */
  async getCurrentTitle(): Promise<string> {
    return await this.page.title();
  }
}
