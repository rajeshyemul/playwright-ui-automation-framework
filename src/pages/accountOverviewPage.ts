import { BasePage } from './base/BasePage';
import { PageActions } from '@helper/actions/PageActions';
import { UrlConstants } from '@support/constants/urlConstants';
import { AccountOverviewPageLocators as LOCATORS } from '@support/locators/BankingPageLocators';
import { StepRunner } from '@helper/reporting/StepRunner';

export class AccountOverviewPage extends BasePage {
  protected pageUrl = UrlConstants.ACCOUNTS_PAGE;
  protected pageTitle = /ParaBank | Accounts Overview/;

  constructor(pageActions: PageActions) {
    super(pageActions);
  }

  /**
   * Navigate to account overview page
   */
  public async navigateToAccountOverview(): Promise<void> {
    await StepRunner.run('Account Overview - navigation', async () => {
      await this.pageActions.gotoURL(UrlConstants.ACCOUNTS_PAGE, 'Account Overview page');
      await this.waitUtils.waitForLoadState('networkidle');
    });
  }

  /**
   * Verify account overview page loaded
   */
  async verifyAccountOverviewPageLoaded(): Promise<void> {
    await StepRunner.run('Account Overview - verify page loaded', async () => {
      await this.expectUtils.expectPageToHaveURL(/overview\.htm/, 'Account Overview page URL', 'Not on account overview page');
      await this.expectUtils.expectElementToBeVisible(LOCATORS.WELCOME_MESSAGE, 'Welcome message', 'Welcome message not visible');
    });
  }

  /**
   * Get account count
   */
  async getAccountCount(): Promise<number> {
    return await StepRunner.run('Account Overview - get account count', async () => {
      const accounts = await this.page.locator(LOCATORS.ACCOUNT_LINK).count();
      return accounts;
    });
  }

  /**
   * Get account balance by index
   */
  async getAccountBalance(index: number = 0): Promise<string> {
    return await StepRunner.run('Account Overview - get account balance', async () => {
      const balanceLocator = this.page.locator(LOCATORS.ACCOUNT_BALANCE).nth(index);
      return await balanceLocator.textContent() || '';
    });
  }

  /**
   * Get account number by index
   */
  async getAccountNumber(index: number = 0): Promise<string> {
    return await StepRunner.run('Account Overview - get account number', async () => {
      const accountLocator = this.page.locator(LOCATORS.ACCOUNT_LINK).nth(index);
      return await accountLocator.textContent() || '';
    });
  }

  /**
   * Click on account link to view details
   */
  async clickAccountLink(index: number = 0): Promise<void> {
    await StepRunner.run('Account Overview - click account link', async () => {
      const selector = `${LOCATORS.ACCOUNT_LINK}:nth-of-type(${index + 1})`;
      await this.uiActions.click(selector, 'Account link');
    });
  }

  /**
   * Verify welcome message contains user name
   */
  async verifyWelcomeMessage(expectedText: string): Promise<void> {
    await StepRunner.run('Account Overview - verify welcome message', async () => {
      await this.expectUtils.expectElementToHaveText(
        LOCATORS.WELCOME_MESSAGE,
        'Welcome message',
        new RegExp(expectedText),
        'Welcome message verification failed'
      );
    });
  }
}