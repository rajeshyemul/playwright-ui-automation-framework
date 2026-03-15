import { BasePage } from './base/BasePage';
import { PageActions } from '@helper/actions/PageActions';
import { UrlConstants } from '@support/constants/urlConstants';
import { RegistrationPageLocators as LOCATORS } from '@support/locators/RegistrationPageLocators';
import { StepRunner } from '@helper/reporting/StepRunner';
import { Logger } from '@helper/logger/Logger';
import { UserData } from '@support/testdata/TestDataProvider';

export type RegistrationOutcome = 'success' | 'error' | 'unknown';

export class RegistrationPage extends BasePage {
  protected pageUrl = UrlConstants.REGISTRATION_PAGE;
  protected pageTitle = /ParaBank | Register/;
  protected pageReadySelector = LOCATORS.REGISTER_BUTTON;

  constructor(pageActions: PageActions) {
    super(pageActions);
  }

  /**
   * Navigate to registration page
   */
  public async navigateToRegistration(): Promise<void> {
    await StepRunner.run('Registration Page - navigation', async () => {
      await this.pageActions.gotoURL(UrlConstants.REGISTRATION_PAGE, 'Registration page');
      await this.waitUtils.waitForPageLoad();
      await this.waitUtils.waitForPageReady(this.pageReadySelector);
    });
  }

  /**
   * Fill registration form
   */
  async fillRegistrationForm(userData: UserData): Promise<void> {
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
  async register(userData: UserData): Promise<void> {
    await this.fillRegistrationForm(userData);
    await this.submitRegistration();
  }

  async registerAndVerifySuccess(userData: UserData): Promise<void> {
    await StepRunner.run('Registration - complete successful registration flow', async () => {
      await this.register(userData);
      await this.verifySuccessMessage();
    });
  }

  private async getRightPanelHeading(): Promise<string> {
    const heading = await this.page.locator('#rightPanel h1').textContent().catch(() => null);
    return heading?.trim() || '';
  }

  private async getRightPanelMessage(): Promise<string> {
    const message = await this.page.locator(LOCATORS.SUCCESS_PARAGRAPH).first().textContent().catch(() => null);
    return message?.trim() || '';
  }

  /**
   * Verify success message
   */
  async verifySuccessMessage(): Promise<void> {
    await StepRunner.run('Registration - verify success', async () => {
      await this.waitUtils.waitForPageLoad();

      const currentUrl = this.page.url();
      const headingText = await this.getRightPanelHeading();
      const panelMessage = await this.getRightPanelMessage();
      const accountTableVisible = await this.page.locator('#accountTable').isVisible().catch(() => false);

      Logger.info(`Current URL after registration: ${currentUrl}`);
      Logger.info(`Right panel heading after registration: ${headingText}`);
      Logger.info(`Right panel message after registration: ${panelMessage}`);

      const hasWelcomeHeading = /welcome/i.test(headingText);
      const hasSuccessMessage = /account was created successfully|welcome/i.test(panelMessage);

      if (currentUrl.includes('overview') || hasWelcomeHeading || hasSuccessMessage || accountTableVisible) {
        Logger.info('Registration successful - redirected to expected page');
        return;
      }

      const errorText = (await this.page.locator(LOCATORS.ERROR_MESSAGE).textContent().catch(() => null))?.trim() || '';
      Logger.warn(`Registration did not reach a confirmed success state. Error text: ${errorText || 'N/A'}`);
      throw new Error('Registration verification failed - could not find a valid success state');
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

  async verifyRequiredFieldErrors(fields: string[]): Promise<void> {
    await StepRunner.run('Registration - verify required field validation errors', async () => {
      for (const field of fields) {
        const selector = LOCATORS.getErrorLocatorByField(field);
        await this.expectUtils.expectElementToBeVisible(
          selector,
          `${field} validation error`,
          `${field} validation error should be visible`
        );
      }
    });
  }

  async getRegistrationOutcome(): Promise<RegistrationOutcome> {
    return StepRunner.run('Registration - capture submission outcome', async () => {
      await this.waitUtils.waitForPageLoad();

      const currentUrl = this.page.url();
      const headingText = await this.getRightPanelHeading();
      const panelMessage = await this.getRightPanelMessage();
      const successVisible = await this.page.locator(LOCATORS.SUCCESS_MESSAGE).isVisible().catch(() => false);
      const usernameErrorVisible = await this.page.locator(LOCATORS.ERROR_USERNAME).isVisible().catch(() => false);
      const genericErrorVisible = await this.page.locator(LOCATORS.ERROR_MESSAGE).isVisible().catch(() => false);
      const accountTableVisible = await this.page.locator('#accountTable').isVisible().catch(() => false);

      if (
        successVisible ||
        accountTableVisible ||
        currentUrl.includes('overview') ||
        /welcome/i.test(headingText) ||
        /account was created successfully|welcome/i.test(panelMessage)
      ) {
        Logger.info('Registration outcome detected as success');
        return 'success';
      }

      if (genericErrorVisible || usernameErrorVisible) {
        Logger.info('Registration outcome detected as error');
        return 'error';
      }

      Logger.warn('Registration outcome could not be determined');
      return 'unknown';
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
