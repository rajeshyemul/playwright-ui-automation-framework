import { BasePage } from './base/BasePage';
import { PageActions } from '@helper/actions/PageActions';
import { UrlConstants } from '@support/constants/urlConstants';
import { RegistrationPageLocators as LOCATORS } from '@support/locators/RegistrationPageLocators';

export class RegistrationPage extends BasePage {
  protected pageUrl = UrlConstants.REGISTRATION_PAGE;
  protected pageTitle = /ParaBank | Register/;

  constructor(pageActions: PageActions) {
    super(pageActions); // All helpers initialized!
  }

  /**
   * Fill registration form
   * 
   * DEMONSTRATES: Clean helper usage
   */
  async fillRegistrationForm(userData: {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    username: string;
    password: string;
  }): Promise<void> {
    // ✅ Use editBoxActions for inputs
    await this.editBoxActions.fill(LOCATORS.FIRST_NAME, userData.firstName);
    await this.editBoxActions.fill(LOCATORS.LAST_NAME, userData.lastName);
    await this.editBoxActions.fill(LOCATORS.ADDRESS, userData.address);
    await this.editBoxActions.fill(LOCATORS.CITY, userData.city);
    
    // ✅ Use dropdownActions for selects
    await this.dropdownActions.selectByLabel(LOCATORS.STATE, userData.state);
    
    // ✅ Continue with other fields
    await this.editBoxActions.fill(LOCATORS.ZIP_CODE, userData.zipCode);
    await this.editBoxActions.fill(LOCATORS.USERNAME, userData.username);
    await this.editBoxActions.fill(LOCATORS.PASSWORD, userData.password);
  }

  /**
   * Submit registration
   */
  async submitRegistration(): Promise<void> {
    // ✅ Use uiActions for clicks with logging
    await this.uiActions.click(LOCATORS.REGISTER_BUTTON, 'Register button');
  }

  /**
   * Verify success message
   * 
   * DEMONSTRATES: Using waitUtils and expectUtils
   */
  async verifySuccessMessage(): Promise<void> {
    // ✅ Use waitUtils for waiting
    await this.waitUtils.waitForVisible(LOCATORS.SUCCESS_MESSAGE);
    
    // ✅ Use expectUtils for assertions
    await this.expectUtils.expectElementToHaveText(LOCATORS.SUCCESS_MESSAGE, 'successfully', 'Registration success message verification', 'Registration did not succeed as expected');
  }

  /**
   * Verify registration failed
   * 
   * DEMONSTRATES: Using assertUtils
   */
  async verifyRegistrationFailed(expectedError: string): Promise<void> {
    // ✅ Use assertUtils for custom assertions
    await this.expectUtils.expectElementNotToBeVisible(LOCATORS.ERROR_MESSAGE, 'Error message should not be visible', 'Error message is visible when it should not be');
    await this.assertUtils.assertContains(
      LOCATORS.ERROR_MESSAGE,
      expectedError,
      'Registration error message verification'
    );
  }

  /**
   * Accept terms and conditions
   * 
   * DEMONSTRATES: Using checkboxActions
   */
  async acceptTerms(): Promise<void> {
    // ✅ Use checkboxActions for checkboxes
    // await this.checkboxActions.check(LOCATORS.TERMS_CHECKBOX);
    // await this.checkboxActions.check(LOCATORS.NEWSLETTER_CHECKBOX);
  }
}