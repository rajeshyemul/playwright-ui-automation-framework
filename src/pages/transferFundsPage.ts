import { BasePage } from './base/BasePage';
import { PageActions } from '@helper/actions/PageActions';
import { UrlConstants } from '@support/constants/urlConstants';
import { TransferFundsPageLocators as LOCATORS } from '@support/locators/BankingPageLocators';
import { StepRunner } from '@helper/reporting/StepRunner';
import { Logger } from '@helper/logger/Logger';
import { TransferData } from '@support/testdata/TestDataProvider';

export type TransferOutcome = 'success' | 'error' | 'unknown';

export class TransferFundsPage extends BasePage {
  protected pageUrl = UrlConstants.TRANSFER_FUNDS_PAGE;
  protected pageTitle = /ParaBank | Transfer Funds/;

  constructor(pageActions: PageActions) {
    super(pageActions);
  }

  /**
   * Navigate to transfer funds page
   */
  public async navigateToTransferFunds(): Promise<void> {
    await StepRunner.run('Transfer Funds - navigation', async () => {
      await this.pageActions.gotoURL(UrlConstants.TRANSFER_FUNDS_PAGE, 'Transfer Funds page');
      await this.waitUtils.waitForLoadState('networkidle');
    });
  }

  /**
   * Fill transfer form
   */
  async fillTransferForm(transferData: TransferData): Promise<void> {
    await StepRunner.run('Transfer Funds - fill form', async () => {
      await this.editBoxActions.fill(LOCATORS.AMOUNT_FIELD, transferData.amount);

      if (transferData.fromAccount) {
        await this.dropdownActions.selectByValue(LOCATORS.FROM_ACCOUNT_SELECT, transferData.fromAccount);
      }

      if (transferData.toAccount) {
        await this.dropdownActions.selectByValue(LOCATORS.TO_ACCOUNT_SELECT, transferData.toAccount);
      }
    });
  }

  /**
   * Submit transfer
   */
  async submitTransfer(): Promise<void> {
    await StepRunner.run('Transfer Funds - submit transfer', async () => {
      await this.uiActions.click(LOCATORS.TRANSFER_BUTTON, 'Transfer button');
    });
  }

  /**
   * Complete transfer process
   */
  async transferFunds(transferData: TransferData): Promise<void> {
    await this.fillTransferForm(transferData);
    await this.submitTransfer();
  }

  async transferFundsAndVerifySuccess(transferData: TransferData): Promise<void> {
    await StepRunner.run('Transfer Funds - complete successful transfer flow', async () => {
      await this.transferFunds(transferData);
      await this.verifyTransferSuccess();
    });
  }

  /**
   * Verify transfer success
   */
  async verifyTransferSuccess(): Promise<void> {
    await StepRunner.run('Transfer Funds - verify success', async () => {
      await this.waitUtils.waitForVisible(LOCATORS.SUCCESS_MESSAGE);
      await this.expectUtils.expectElementToHaveText(
        LOCATORS.SUCCESS_MESSAGE,
        'Transfer success message',
        /successfully/i,
        'Transfer did not succeed as expected'
      );
    });
  }

  /**
   * Verify transfer failed
   */
  async verifyTransferFailed(expectedError: string): Promise<void> {
    await StepRunner.run('Transfer Funds - verify failure', async () => {
      await this.expectUtils.expectElementToHaveText(
        LOCATORS.ERROR_MESSAGE,
        'Transfer error message',
        new RegExp(expectedError),
        'Expected transfer error message not found'
      );
    });
  }

  /**
   * Get available from accounts
   */
  async getAvailableFromAccounts(): Promise<string[]> {
    return await StepRunner.run('Transfer Funds - get from accounts', async () => {
      const options = await this.page.locator(`${LOCATORS.FROM_ACCOUNT_SELECT} option`).allTextContents();
      return options;
    });
  }

  /**
   * Get available to accounts
   */
  async getAvailableToAccounts(): Promise<string[]> {
    return await StepRunner.run('Transfer Funds - get to accounts', async () => {
      const options = await this.page.locator(`${LOCATORS.TO_ACCOUNT_SELECT} option`).allTextContents();
      return options;
    });
  }

  async getAvailableAccountPairs(): Promise<{ fromAccounts: string[]; toAccounts: string[] }> {
    return StepRunner.run('Transfer Funds - get all available transfer accounts', async () => {
      const fromAccounts = await this.getAvailableFromAccounts();
      const toAccounts = await this.getAvailableToAccounts();

      Logger.info(`From accounts available: ${fromAccounts.join(', ')}`);
      Logger.info(`To accounts available: ${toAccounts.join(', ')}`);

      return { fromAccounts, toAccounts };
    });
  }

  async getTransferOutcome(): Promise<TransferOutcome> {
    return StepRunner.run('Transfer Funds - capture transfer outcome', async () => {
      await this.waitUtils.waitForLoadState('networkidle');

      const successVisible = await this.page.locator(LOCATORS.SUCCESS_MESSAGE).isVisible().catch(() => false);
      if (successVisible) {
        Logger.info('Transfer outcome detected as success');
        return 'success';
      }

      const errorVisible = await this.page.locator(LOCATORS.ERROR_MESSAGE).isVisible().catch(() => false);
      if (errorVisible) {
        Logger.info('Transfer outcome detected as error');
        return 'error';
      }

      Logger.warn('Transfer outcome could not be determined');
      return 'unknown';
    });
  }
}
