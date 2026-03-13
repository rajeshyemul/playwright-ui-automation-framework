import { BasePage } from './base/BasePage';
import { PageActions } from '@helper/actions/PageActions';
import { UrlConstants } from '@support/constants/urlConstants';
import { BillPayPageLocators as LOCATORS } from '@support/locators/BankingPageLocators';
import { StepRunner } from '@helper/reporting/StepRunner';

export class BillPayPage extends BasePage {
  protected pageUrl = UrlConstants.BILL_PAY_PAGE;
  protected pageTitle = /ParaBank | Bill Pay/;

  constructor(pageActions: PageActions) {
    super(pageActions);
  }

  /**
   * Navigate to bill pay page
   */
  public async navigateToBillPay(): Promise<void> {
    await StepRunner.run('Bill Pay - navigation', async () => {
      await this.pageActions.gotoURL(UrlConstants.BILL_PAY_PAGE, 'Bill Pay page');
      await this.waitUtils.waitForLoadState('networkidle');
    });
  }

  /**
   * Fill bill payment form
   */
  async fillBillPayForm(billData: {
    payeeName: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    phone?: string;
    accountNumber: string;
    verifyAccount: string;
    amount: string;
  }): Promise<void> {
    await StepRunner.run('Bill Pay - fill form', async () => {
      await this.editBoxActions.fill(LOCATORS.PAYEE_NAME, billData.payeeName);
      await this.editBoxActions.fill(LOCATORS.ADDRESS, billData.address);
      await this.editBoxActions.fill(LOCATORS.CITY, billData.city);
      await this.dropdownActions.selectByLabel(LOCATORS.STATE, billData.state);
      await this.editBoxActions.fill(LOCATORS.ZIP_CODE, billData.zipCode);

      if (billData.phone) {
        await this.editBoxActions.fill(LOCATORS.PHONE, billData.phone);
      }

      await this.editBoxActions.fill(LOCATORS.ACCOUNT_NUMBER, billData.accountNumber);
      await this.editBoxActions.fill(LOCATORS.VERIFY_ACCOUNT, billData.verifyAccount);
      await this.editBoxActions.fill(LOCATORS.AMOUNT, billData.amount);
    });
  }

  /**
   * Submit bill payment
   */
  async submitBillPayment(): Promise<void> {
    await StepRunner.run('Bill Pay - submit payment', async () => {
      await this.uiActions.click(LOCATORS.SEND_PAYMENT_BUTTON, 'Send Payment button');
    });
  }

  /**
   * Complete bill payment process
   */
  async payBill(billData: {
    payeeName: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    phone?: string;
    accountNumber: string;
    verifyAccount: string;
    amount: string;
  }): Promise<void> {
    await this.fillBillPayForm(billData);
    await this.submitBillPayment();
  }

  /**
   * Verify bill payment success
   */
  async verifyBillPaySuccess(): Promise<void> {
    await StepRunner.run('Bill Pay - verify success', async () => {
      await this.waitUtils.waitForVisible(LOCATORS.SUCCESS_MESSAGE);
      await this.expectUtils.expectElementToHaveText(
        LOCATORS.SUCCESS_MESSAGE,
        'Bill payment success message',
        /successfully|sent/i,
        'Bill payment did not succeed as expected'
      );
    });
  }

  /**
   * Verify bill payment failed
   */
  async verifyBillPayFailed(expectedError: string): Promise<void> {
    await StepRunner.run('Bill Pay - verify failure', async () => {
      await this.expectUtils.expectElementToHaveText(
        '.error',
        'Bill payment error message',
        new RegExp(expectedError),
        'Expected bill payment error message not found'
      );
    });
  }

  /**
   * Verify account number mismatch error
   */
  async verifyAccountMismatchError(): Promise<void> {
    await StepRunner.run('Bill Pay - verify account mismatch', async () => {
      await this.expectUtils.expectElementToHaveText(
        '.error',
        'Account verification error',
        /account.*number.*match/i,
        'Account number mismatch error not displayed'
      );
    });
  }
}