import { BasePage } from './base/BasePage';
import { PageActions } from '@helper/actions/PageActions';
import { UrlConstants } from '@support/constants/urlConstants';

export class LoginPage extends BasePage {
  protected pageUrl = UrlConstants.LOGIN_PAGE;
  protected pageTitle = /ParaBank | Customer Login/;

  constructor(pageActions: PageActions) {
    super(pageActions);
  }

  /**
   * Login
   * 
   * DEMONSTRATES: Combining multiple helpers
   */
  async login(username: string, password: string): Promise<void> {
    // ✅ Use editBoxActions for typing
    await this.editBoxActions.type('[name="username"]', username, 100);
    await this.editBoxActions.type('[name="password"]', password, 100);
    
    // ✅ Use uiActions for click with logging
    await this.uiActions.click('[type="submit"]', 'Login button');
    
    // ✅ Use waitUtils for navigation
    await this.waitUtils.waitForNavigation(/overview\.htm/);
    
    // ✅ Use expectUtils for verification
    await this.expectUtils.expectPageToHaveURL(/overview\.htm/, 'Post-login URL verification', 'Did not navigate to overview page after login');
  }

  /**
   * Verify login error
   * 
   * DEMONSTRATES: Using both assertUtils and expectUtils
   */
  async verifyLoginError(expectedError: string): Promise<void> {
    // Option 1: Use waitUtils + assertUtils
    await this.waitUtils.waitForVisible('.error', 5000);
    await this.assertUtils.assertContains('.error', expectedError, 'Login error message verification');
    
    // Option 2: Use expectUtils (alternative)
    // await this.expectUtils.toBeVisible('.error');
    // await this.expectUtils.toContainText('.error', expectedError);
  }

  /**
   * Enable remember me
   */
  async enableRememberMe(): Promise<void> {
    // ✅ Use checkboxActions
    await this.checkboxActions.check('#rememberMe');
    
    // ✅ Verify it's checked
    const isChecked = await this.checkboxActions.isChecked('#rememberMe');
    this.assertUtils.assertTrue(isChecked, 'Remember Me should be checked');
  }
}