import { BasePage } from './base/BasePage';
import { HomePageLocators } from '../support/locators/HomePageLocators';
import { HomePageConstants } from '../support/constants/HomePageConstants';
import { SetupConstants } from '../support/constants/SetupConstants';
import { StepRunner } from '../helper/reporting/StepRunner';

export class HomePage extends BasePage {
  protected pageUrl = '/';
  protected pageTitle = HomePageConstants.HomePageTitleDescription;

  public async navigateToHome(): Promise<void> {
    await StepRunner.run('Home Page - initial load validation', async () => {
      await this.pageActions
        .gotoURL('/', HomePageConstants.HomePageTitleDescription);
      await this.waitUtils.waitForLoadState(SetupConstants.LOAD_STATE_NETWORKIDLE);
    });
  }

  public async verifyLogoVisible(): Promise<void> {
    await StepRunner.run('Home Page - verify logo visibility', async () => {
      await this.expectUtils.expectElementToBeVisible(
        HomePageLocators.PARABANK_LOGO,
        HomePageConstants.ParaBankLogo,
        HomePageConstants.LogoVisibilityErrorMessage
      );
    });
  }

  public async verifyTitle(expected: RegExp): Promise<void> {
    await StepRunner.run('Home Page - verify page title', async () => {
      await this.expectUtils.expectPageToHaveTitle(
        expected,
        HomePageConstants.HomePageTitleDescription,
        HomePageConstants.HomePageTitleErrorMessage
      );
    });
  }
}