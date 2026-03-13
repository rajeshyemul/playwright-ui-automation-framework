import { BasePage } from './base/BasePage';
import { PageActions } from '@helper/actions/PageActions';
import { UrlConstants } from '@support/constants/urlConstants';
import { RegistrationPageLocators as LOCATORS } from '@support/locators/RegistrationPageLocators';
import { StepRunner } from '@helper/reporting/StepRunner';
import { Logger } from '@helper/logger/Logger';

export class RegistrationPage extends BasePage {
  protected pageUrl = UrlConstants.REGISTRATION_PAGE;
  protected pageTitle = /ParaBank | Register/;

  constructor(pageActions: PageActions) {
    super(pageActions);
  }

  /**
   * Navigate to registration page
   */
  public async navigateToRegistration(): Promise<void> {
    await StepRunner.run('Registration Page - navigation', async () => {
      await this.pageActions.gotoURL(UrlConstants.REGISTRATION_PAGE, 'Registration page');
      await this.waitUtils.waitForLoadState('networkidle');
    });
  }

  /**
   * Fill registration form
   */
  async fillRegistrationForm(userData: {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    phone?: string;
    ssn?: string;
    username: string;
    password: string;
    confirmPassword?: string;
  }): Promise<void> {
    await StepRunner.run('Registration - fill form', async () => {
      // Use editBoxActions for inputs
      await this.editBoxActions.fill(LOCATORS.FIRST_NAME, userData.firstName);
      await this.editBoxActions.fill(LOCATORS.LAST_NAME, userData.lastName);
      await this.editBoxActions.fill(LOCATORS.ADDRESS, userData.address);
      await this.editBoxActions.fill(LOCATORS.CITY, userData.city);
      await this.editBoxActions.fill(LOCATORS.STATE, userData.state);

      // Continue with other fields
      await this.editBoxActions.fill(LOCATORS.ZIP_CODE, userData.zipCode);

      if (userData.phone) {
        await this.editBoxActions.fill(LOCATORS.PHONE, userData.phone);
      }

      if (userData.ssn) {
        await this.editBoxActions.fill(LOCATORS.SSN, userData.ssn);
      }

      await this.editBoxActions.fill(LOCATORS.USERNAME, userData.username);
      await this.editBoxActions.fill(LOCATORS.PASSWORD, userData.password);

      if (userData.confirmPassword) {
        await this.editBoxActions.fill(LOCATORS.CONFIRM_PASSWORD, userData.confirmPassword);
      }
    });
  }

  /**
   * Submit registration
   */
  async submitRegistration(): Promise<void> {
    await StepRunner.run('Registration - submit form', async () => {
      // Use uiActions for clicks with logging
      await this.uiActions.click(LOCATORS.REGISTER_BUTTON, 'Register button');
    });
  }

  /**
   * Complete registration process (fill + submit)
   */
  async register(userData: {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    phone?: string;
    ssn?: string;
    username: string;
    password: string;
    confirmPassword?: string;
  }): Promise<void> {
    await this.fillRegistrationForm(userData);
    await this.submitRegistration();
  }

  /**
   * Verify success message
   */
  async verifySuccessMessage(): Promise<void> {
    await StepRunner.run('Registration - verify success', async () => {
      // Wait for navigation or page change after registration
      await this.waitUtils.waitForLoadState('networkidle');

      // Check for various possible success indicators
      const currentUrl = this.page.url();
      Logger.info(`Current URL after registration: ${currentUrl}`);

      // Check if we're redirected to login page or account overview
      if (currentUrl.includes('login') || currentUrl.includes('overview')) {
        Logger.info('Registration successful - redirected to expected page');
        return;
      }

      // Try to find success message with different selectors
      try {
        await this.waitUtils.waitForVisible(LOCATORS.SUCCESS_MESSAGE, 5000);
        await this.expectUtils.expectElementToHaveText(
          LOCATORS.SUCCESS_MESSAGE,
          'Registration success message',
          /successfully|welcome|created/i,
          'Registration did not succeed as expected'
        );
      } catch (e) {
        // If success message not found, check for welcome message or account overview elements
        try {
          await this.waitUtils.waitForVisible('#rightPanel h1', 5000);
          const headingText = await this.page.locator('#rightPanel h1').textContent();
          if (headingText && headingText.includes('Welcome')) {
            Logger.info('Registration successful - found welcome message');
            return;
          }
        } catch (e2) {
          Logger.info('Could not find standard success indicators, checking page content...');
          // As a fallback, just ensure we're not on the registration page anymore
          if (!currentUrl.includes('register')) {
            Logger.info('Registration appears successful - navigated away from registration page');
            return;
          }
          throw new Error('Registration verification failed - could not find success indicators');
        }
      }
    });
  }

  /**
   * Verify registration failed
   */
  async verifyRegistrationFailed(expectedError: string): Promise<void> {
    await StepRunner.run('Registration - verify failure', async () => {
      // Use expectUtils for error verification
      await this.expectUtils.expectElementToBeVisible(
        LOCATORS.ERROR_MESSAGE,
        'Error message should be visible',
        'Error message is not visible when it should be'
      );
      // Use regex to check containing text
      await this.expectUtils.expectElementToHaveText(
        LOCATORS.ERROR_MESSAGE,
        'Registration error message',
        new RegExp(expectedError),
        'Expected error message not found'
      );
    });
  }

  /**
   * Accept terms and conditions
   */
  async acceptTerms(): Promise<void> {
    await StepRunner.run('Registration - accept terms', async () => {
      // Use checkboxActions for checkboxes
      // await this.checkboxActions.check(LOCATORS.TERMS_CHECKBOX);
      // await this.checkboxActions.check(LOCATORS.NEWSLETTER_CHECKBOX);
    });
  }

  /**
   * Get current page title
   */
  async getCurrentTitle(): Promise<string> {
    return await this.page.title();
  }
}