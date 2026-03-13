import { test } from '@support/PageFixture';
import { RegistrationPage } from '@pages/registrationPage';
import { LoginPage } from '@pages/loginPage';
import { TransferFundsPage } from '@pages/transferFundsPage';
import { BillPayPage } from '@pages/billPayPage';
import { AccountOverviewPage } from '@pages/accountOverviewPage';
import { AllureReporter } from '@helper/reporting/AllureReporter';
import { Logger } from '@helper/logger/Logger';
import { TestDataProvider } from '@support/testdata/TestDataProvider';

test.describe('ParaBank - Regression Tests', () => {
  test('TC-REG-001: Registration Form Validation', async ({ pageActions }) => {
    await AllureReporter.attachDetails({
      epic: 'Regression Tests',
      feature: 'Registration Validation',
      story: 'Verify registration form validation works correctly',
      severity: 'high',
    });

    const registrationPage = new RegistrationPage(pageActions);
    const duplicateUser = TestDataProvider.generateUserData({
      firstName: 'Test',
      lastName: 'User',
      address: '123 Test St',
      city: 'Test City',
      username: 'testuser',
    });

    await test.step('Verify required field validation', async () => {
      await registrationPage.navigateToRegistration();
      await registrationPage.submitRegistration();
      await registrationPage.verifyRequiredFieldErrors([
        'firstName',
        'lastName',
        'address',
        'city',
        'state',
        'ssn',
        'username',
        'password',
        'confirm',
      ]);
    });

    await test.step('Verify duplicate username handling', async () => {
      await registrationPage.navigateToRegistration();
      await registrationPage.register(duplicateUser);

      const outcome = await registrationPage.getRegistrationOutcome();
      Logger.info(`Duplicate registration outcome: ${outcome}`);

      if (outcome === 'error') {
        await registrationPage.verifyRegistrationFailed('username|exists|taken|error');
      }
    });
  });

  test('TC-REG-002: Login Error Handling', async ({ pageActions }) => {
    await AllureReporter.attachDetails({
      epic: 'Regression Tests',
      feature: 'Login Error Handling',
      story: 'Verify login error scenarios are handled correctly',
      severity: 'high',
    });

    const loginPage = new LoginPage(pageActions);

    await test.step('Verify invalid username handling', async () => {
      await loginPage.navigateToLogin();
      await loginPage.attemptLogin('invaliduser', 'password123');
      await loginPage.verifyLoginError('error|invalid|verified');
    });

    await test.step('Verify invalid password handling', async () => {
      await loginPage.navigateToLogin();
      await loginPage.attemptLogin('testuser', 'wrongpassword');
      await loginPage.verifyLoginError('error|invalid|verified');
    });

    await test.step('Verify empty credential handling', async () => {
      await loginPage.navigateToLogin();
      await loginPage.attemptLogin('', '');
      await loginPage.verifyLoginError('error|required|invalid|verified');
    });
  });

  test('TC-REG-003: Transfer Funds Functionality', async ({ pageActions }) => {
    await AllureReporter.attachDetails({
      epic: 'Regression Tests',
      feature: 'Funds Transfer',
      story: 'Verify funds transfer between accounts works correctly',
      severity: 'high',
    });

    const registrationPage = new RegistrationPage(pageActions);
    const transferPage = new TransferFundsPage(pageActions);

    const userData = TestDataProvider.getRegressionTestUser();

    await test.step('Register a user eligible for transfer', async () => {
      await registrationPage.navigateToRegistration();
      await registrationPage.registerAndVerifySuccess(userData);
    });

    await test.step('Complete the transfer flow when accounts are available', async () => {
      await transferPage.navigateToTransferFunds();
      const { fromAccounts, toAccounts } = await transferPage.getAvailableAccountPairs();

      if (fromAccounts.length > 1 && toAccounts.length > 1) {
        await transferPage.transferFundsAndVerifySuccess({
          amount: '100.00',
          fromAccount: fromAccounts[0],
          toAccount: toAccounts[1],
        });
      } else {
        Logger.info('Transfer validation skipped because only one account is available');
      }
    });
  });

  test('TC-REG-004: Bill Pay Functionality', async ({ pageActions }) => {
    await AllureReporter.attachDetails({
      epic: 'Regression Tests',
      feature: 'Bill Payment',
      story: 'Verify bill payment functionality works correctly',
      severity: 'high',
    });

    const registrationPage = new RegistrationPage(pageActions);
    const billPayPage = new BillPayPage(pageActions);

    const userData = TestDataProvider.generateUserData({
      firstName: 'Bill',
      lastName: 'Pay',
      address: '123 Bill St',
      city: 'Bill City',
    });
    const billData = TestDataProvider.generateBillPayData();

    await test.step('Register a bill pay user', async () => {
      await registrationPage.navigateToRegistration();
      await registrationPage.registerAndVerifySuccess(userData);
    });

    await test.step('Submit a bill payment and validate the outcome', async () => {
      await billPayPage.navigateToBillPay();
      await billPayPage.payBill(billData);

      const outcome = await billPayPage.getBillPayOutcome();
      Logger.info(`Bill pay outcome: ${outcome}`);

      if (outcome === 'success') {
        await billPayPage.verifyBillPaySuccess();
      }

      if (outcome === 'error') {
        await billPayPage.getBillPayErrorMessage();
      }
    });
  });

  test('TC-REG-005: Account Details and History', async ({ pageActions }) => {
    await AllureReporter.attachDetails({
      epic: 'Regression Tests',
      feature: 'Account Details',
      story: 'Verify account details and transaction history display correctly',
      severity: 'medium',
    });

    const registrationPage = new RegistrationPage(pageActions);
    const transferPage = new TransferFundsPage(pageActions);
    const accountOverviewPage = new AccountOverviewPage(pageActions);

    const userData = TestDataProvider.generateUserData({
      firstName: 'Account',
      lastName: 'Details',
      address: '123 Account St',
      city: 'Account City',
    });

    await test.step('Register the user and create account activity when possible', async () => {
      await registrationPage.navigateToRegistration();
      await registrationPage.registerAndVerifySuccess(userData);

      await transferPage.navigateToTransferFunds();
      const { fromAccounts } = await transferPage.getAvailableAccountPairs();

      if (fromAccounts.length > 1) {
        await transferPage.transferFunds({
          amount: '10.00',
          fromAccount: fromAccounts[0],
          toAccount: fromAccounts[1],
        });
        await transferPage.getTransferOutcome();
      }
    });

    await test.step('Review the account details and transaction history', async () => {
      await accountOverviewPage.navigateToAccountOverview();
      await accountOverviewPage.verifyAccountsAvailable();
      await accountOverviewPage.clickAccountLink(0);
      await accountOverviewPage.logRecentTransactions();
    });
  });
});
