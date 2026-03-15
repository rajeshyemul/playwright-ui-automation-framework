import { BasePage } from './base/BasePage';
import { HomePageLocators } from '../support/locators/HomePageLocators';
import { HomePageConstants } from '../support/constants/HomePageConstants';
import { StepRunner } from '../helper/reporting/StepRunner';
import { UrlConstants } from '@support/constants/urlConstants';

export class HomePage extends BasePage {
  protected pageUrl = UrlConstants.HOME_PAGE;
  protected pageTitle = HomePageConstants.HomePageTitleDescription;
  protected pageReadySelector = HomePageLocators.USERNAME_FIELD;

  /**
   * Navigate to the application home page.
   */
  public async navigateToHome(): Promise<void> {
    await StepRunner.run('Home Page - initial load validation', async () => {
      await this.pageActions
        .gotoURL(UrlConstants.HOME_PAGE, HomePageConstants.HomePageTitleDescription);
      await this.waitUtils.waitForPageLoad();
      await this.waitUtils.waitForPageReady(this.pageReadySelector);
    });
  }

  /**
   * Verify the ParaBank logo is visible on the home page.
   */
  public async verifyLogoVisible(): Promise<void> {
    await StepRunner.run('Home Page - verify logo visibility', async () => {
      await this.expectUtils.expectElementToBeVisible(
        HomePageLocators.PARABANK_LOGO,
        HomePageConstants.ParaBankLogo,
        HomePageConstants.LogoVisibilityErrorMessage
      );
    });
  }

  /**
   * Verify login form is visible on home page
   */
  public async verifyLoginFormVisible(): Promise<void> {
    await StepRunner.run('Home Page - verify login form', async () => {
      await this.expectUtils.expectElementToBeVisible(
        HomePageLocators.USERNAME_FIELD,
        'Username field',
        'Username field not visible on home page'
      );
      await this.expectUtils.expectElementToBeVisible(
        HomePageLocators.PASSWORD_FIELD,
        'Password field',
        'Password field not visible on home page'
      );
    });
  }

  /**
   * Verify the home page title matches the expected pattern.
   */
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
