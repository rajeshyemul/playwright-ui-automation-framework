import { BasePage } from './base/BasePage';
import { PageActions } from '@helper/actions/PageActions';
import { UrlConstants } from '@support/constants/urlConstants';
import { UpdateProfilePageLocators as LOCATORS } from '@support/locators/BankingPageLocators';
import { StepRunner } from '@helper/reporting/StepRunner';

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  phone?: string;
}

export class UpdateProfilePage extends BasePage {
  protected pageUrl = UrlConstants.UPDATE_CONTACT_INFO_PAGE;
  protected pageTitle = /ParaBank | Update Profile/;

  constructor(pageActions: PageActions) {
    super(pageActions);
  }

  public async navigateToUpdateProfile(): Promise<void> {
    await StepRunner.run('Update Profile - navigation', async () => {
      await this.pageActions.gotoURL(UrlConstants.UPDATE_CONTACT_INFO_PAGE, 'Update Profile page');
      await this.waitUtils.waitForLoadState('networkidle');
    });
  }

  public async updateProfile(details: UpdateProfileData): Promise<void> {
    await StepRunner.run('Update Profile - update contact details', async () => {
      if (details.firstName !== undefined) {
        await this.editBoxActions.fill(LOCATORS.FIRST_NAME, details.firstName);
      }

      if (details.lastName !== undefined) {
        await this.editBoxActions.fill(LOCATORS.LAST_NAME, details.lastName);
      }

      if (details.address !== undefined) {
        await this.editBoxActions.fill(LOCATORS.ADDRESS, details.address);
      }

      if (details.city !== undefined) {
        await this.editBoxActions.fill(LOCATORS.CITY, details.city);
      }

      if (details.state !== undefined) {
        await this.editBoxActions.fill(LOCATORS.STATE, details.state);
      }

      if (details.zipCode !== undefined) {
        await this.editBoxActions.fill(LOCATORS.ZIP_CODE, details.zipCode);
      }

      if (details.phone !== undefined) {
        await this.editBoxActions.fill(LOCATORS.PHONE, details.phone);
      }

      await this.uiActions.click(LOCATORS.UPDATE_BUTTON, 'Update Profile button');
    });
  }

  public async verifyProfileUpdated(): Promise<void> {
    await StepRunner.run('Update Profile - verify profile update success', async () => {
      await this.waitUtils.waitForVisible(LOCATORS.SUCCESS_MESSAGE);
      await this.expectUtils.expectElementToHaveText(
        LOCATORS.SUCCESS_MESSAGE,
        'Profile update success message',
        /updated/i,
        'Profile update success message was not displayed'
      );
    });
  }

  public async getPhoneNumber(): Promise<string> {
    return StepRunner.run('Update Profile - get phone number', async () => {
      return this.editBoxActions.getValue(LOCATORS.PHONE);
    });
  }

  public async verifyPhoneNumber(expectedPhoneNumber: string): Promise<void> {
    await StepRunner.run('Update Profile - verify phone number value', async () => {
      const actualPhoneNumber = await this.getPhoneNumber();
      await this.assertUtils.assertEquals(
        actualPhoneNumber,
        expectedPhoneNumber,
        'Updated phone number should persist'
      );
    });
  }
}
