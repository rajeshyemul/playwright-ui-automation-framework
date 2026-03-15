import { BasePage } from './base/BasePage';
import { PageActions } from '@helper/actions/PageActions';
import { UrlConstants } from '@support/constants/urlConstants';
import { AccountOverviewPageLocators as LOCATORS } from '@support/locators/BankingPageLocators';
import { StepRunner } from '@helper/reporting/StepRunner';
import { Logger } from '@helper/logger/Logger';

export interface AccountSummary {
  accountNumber: string;
  balance: string;
}

export class AccountOverviewPage extends BasePage {
  protected pageUrl = UrlConstants.ACCOUNTS_PAGE;
  protected pageTitle = /ParaBank | Accounts Overview/;
  protected pageReadySelector = LOCATORS.ACCOUNT_TABLE;

  constructor(pageActions: PageActions) {
    super(pageActions);
  }

  /**
   * Navigate to account overview page
   */
  public async navigateToAccountOverview(): Promise<void> {
    await StepRunner.run('Account Overview - navigation', async () => {
      await this.pageActions.gotoURL(UrlConstants.ACCOUNTS_PAGE, 'Account Overview page');
      await this.waitUtils.waitForPageLoad();
      await this.waitUtils.waitForPageReady(this.pageReadySelector);
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
      Logger.info(`Opening account details for row ${index}`);
      await this.page.locator(LOCATORS.ACCOUNT_LINK).nth(index).click();
      await this.waitForAccountDetailsPageLoaded();
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

  async getAccountSummary(index: number = 0): Promise<AccountSummary> {
    return StepRunner.run('Account Overview - get account summary', async () => {
      const accountNumber = (await this.getAccountNumber(index)).trim();
      const balance = (await this.getAccountBalance(index)).trim();

      Logger.info(`Account summary [${index}] -> ${accountNumber}: ${balance}`);
      return { accountNumber, balance };
    });
  }

  async logAccountSummaries(): Promise<AccountSummary[]> {
    return StepRunner.run('Account Overview - log all account summaries', async () => {
      const accountCount = await this.getAccountCount();
      const summaries: AccountSummary[] = [];

      for (let index = 0; index < accountCount; index++) {
        summaries.push(await this.getAccountSummary(index));
      }

      return summaries;
    });
  }

  async verifyAccountsAvailable(minimumCount: number = 1): Promise<void> {
    await StepRunner.run('Account Overview - verify accounts are available', async () => {
      const accountCount = await this.getAccountCount();
      await this.assertUtils.assertGreaterThan(
        accountCount,
        minimumCount - 1,
        `At least ${minimumCount} account(s) should be available`
      );
    });
  }

  async waitForAccountDetailsPageLoaded(): Promise<void> {
    await StepRunner.run('Account Overview - verify account details page loaded', async () => {
      await this.waitUtils.waitForPageLoad();
      const accountDetailsVisible = await this.page.locator(LOCATORS.ACCOUNT_DETAILS).isVisible().catch(() => false);
      const transactionTableVisible = await this.page.locator(LOCATORS.TRANSACTION_TABLE).isVisible().catch(() => false);

      await this.assertUtils.assertTrue(
        accountDetailsVisible || transactionTableVisible,
        'Account details or transaction table should be visible'
      );
    });
  }

  async getTransactionCount(): Promise<number> {
    return StepRunner.run('Account Overview - get transaction count', async () => {
      const transactionTableVisible = await this.page.locator(LOCATORS.TRANSACTION_TABLE).isVisible().catch(() => false);
      if (!transactionTableVisible) {
        Logger.info('Transaction table is not visible on the account details page');
        return 0;
      }

      return this.page.locator(LOCATORS.TRANSACTION_ROWS).count();
    });
  }

  async logRecentTransactions(limit: number = 3): Promise<string[]> {
    return StepRunner.run('Account Overview - log recent transactions', async () => {
      const transactionCount = await this.getTransactionCount();
      const rowsToRead = Math.min(limit, transactionCount);
      const transactions: string[] = [];

      for (let index = 0; index < rowsToRead; index++) {
        const text = (await this.page.locator(LOCATORS.TRANSACTION_ROWS).nth(index).textContent())?.trim() || '';
        transactions.push(text);
        Logger.info(`Transaction [${index}]: ${text}`);
      }

      return transactions;
    });
  }

  async hasTransactionMatching(pattern: RegExp): Promise<boolean> {
    return StepRunner.run('Account Overview - check transaction history for a match', async () => {
      const transactionCount = await this.getTransactionCount();

      for (let index = 0; index < transactionCount; index++) {
        const text = (await this.page.locator(LOCATORS.TRANSACTION_ROWS).nth(index).textContent())?.trim() || '';
        if (pattern.test(text)) {
          Logger.info(`Transaction matched ${pattern}: ${text}`);
          return true;
        }
      }

      Logger.info(`No transaction matched ${pattern}`);
      return false;
    });
  }
}
