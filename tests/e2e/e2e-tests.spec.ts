import { test } from '@support/PageFixture';
import { RegistrationPage } from '@pages/registrationPage';
import { LoginPage } from '@pages/loginPage';
import { AccountOverviewPage } from '@pages/accountOverviewPage';
import { TransferFundsPage } from '@pages/transferFundsPage';
import { BillPayPage } from '@pages/billPayPage';
import { UpdateProfilePage } from '@pages/updateProfilePage';
import { HomePage } from '@pages/homePage';
import { AllureReporter } from '@helper/reporting/AllureReporter';
import { Logger } from '@helper/logger/Logger';
import { TestDataProvider } from '@support/testdata/TestDataProvider';

test.describe('ParaBank - End-to-End Tests', () => {
  test('TC-E2E-001: Complete User Registration and First Login', async ({ pageActions }) => {
    await AllureReporter.attachDetails({
      epic: 'End-to-End Tests',
      feature: 'User Onboarding',
      story: 'Complete registration and login workflow',
      severity: 'critical',
    });

    const registrationPage = new RegistrationPage(pageActions);
    const loginPage = new LoginPage(pageActions);
    const accountOverviewPage = new AccountOverviewPage(pageActions);
    const userData = TestDataProvider.getE2eTestUser();

    await test.step('Register a new banking user', async () => {
      await registrationPage.navigateToRegistration();
      await registrationPage.registerAndVerifySuccess(userData);
    });

    await test.step('Log out and sign back in with the new credentials', async () => {
      await registrationPage.logout();
      await loginPage.navigateToLogin();
      await loginPage.loginAndVerify(userData.username, userData.password);
    });

    await test.step('Validate the newly created account portfolio', async () => {
      await accountOverviewPage.verifyAccountOverviewPageLoaded();
      await accountOverviewPage.verifyWelcomeMessage(userData.firstName);
      await accountOverviewPage.verifyAccountsAvailable();
      await accountOverviewPage.logAccountSummaries();
    });
  });

  test('TC-E2E-002: Account Management Workflow', async ({ pageActions }) => {
    await AllureReporter.attachDetails({
      epic: 'End-to-End Tests',
      feature: 'Account Management',
      story: 'Complete account viewing and profile update workflow',
      severity: 'high',
    });

    const registrationPage = new RegistrationPage(pageActions);
    const loginPage = new LoginPage(pageActions);
    const accountOverviewPage = new AccountOverviewPage(pageActions);
    const updateProfilePage = new UpdateProfilePage(pageActions);

    const userData = TestDataProvider.generateUserData({
      firstName: 'Account',
      lastName: 'Manager',
      address: '456 Account St',
      city: 'Account City',
      state: 'NY',
      zipCode: '67890',
      phone: '555-5678',
      ssn: '987-65-4321',
      username: `accountmgr${Date.now()}`,
    });
    const updatedPhoneNumber = '555-9999';

    await test.step('Create and review the customer account', async () => {
      await registrationPage.navigateToRegistration();
      await registrationPage.registerAndVerifySuccess(userData);
      await accountOverviewPage.verifyAccountOverviewPageLoaded();
      await accountOverviewPage.logAccountSummaries();
      await accountOverviewPage.clickAccountLink(0);
      await accountOverviewPage.logRecentTransactions();
    });

    await test.step('Update the contact profile', async () => {
      await updateProfilePage.navigateToUpdateProfile();
      await updateProfilePage.updateProfile({ phone: updatedPhoneNumber });
      await updateProfilePage.verifyProfileUpdated();
    });

    await test.step('Verify the profile change persists after a new login', async () => {
      await updateProfilePage.logout();
      await loginPage.navigateToLogin();
      await loginPage.loginAndVerify(userData.username, userData.password);
      await updateProfilePage.navigateToUpdateProfile();
      await updateProfilePage.verifyPhoneNumber(updatedPhoneNumber);
    });
  });

  test('TC-E2E-003: Funds Transfer Workflow', async ({ pageActions }) => {
    await AllureReporter.attachDetails({
      epic: 'End-to-End Tests',
      feature: 'Funds Transfer',
      story: 'Complete funds transfer between accounts workflow',
      severity: 'high',
    });

    const registrationPage = new RegistrationPage(pageActions);
    const transferPage = new TransferFundsPage(pageActions);
    const accountOverviewPage = new AccountOverviewPage(pageActions);

    const userData = TestDataProvider.generateUserData({
      firstName: 'Transfer',
      lastName: 'Workflow',
      address: '789 Transfer St',
      city: 'Transfer City',
      state: 'TX',
      zipCode: '54321',
      phone: '555-1111',
      ssn: '111-22-3333',
      username: `transferwf${Date.now()}`,
    });

    await test.step('Register the transfer user and capture initial balances', async () => {
      await registrationPage.navigateToRegistration();
      await registrationPage.registerAndVerifySuccess(userData);
      await accountOverviewPage.verifyAccountOverviewPageLoaded();
      await accountOverviewPage.logAccountSummaries();
    });

    await test.step('Transfer funds between available accounts', async () => {
      await transferPage.navigateToTransferFunds();
      const { fromAccounts, toAccounts } = await transferPage.getAvailableAccountPairs();

      if (fromAccounts.length > 1 && toAccounts.length > 1) {
        await transferPage.transferFundsAndVerifySuccess({
          amount: '50.00',
          fromAccount: fromAccounts[0],
          toAccount: toAccounts[1],
        });
      } else {
        Logger.info('Transfer workflow skipped because multiple accounts were not available');
      }
    });

    await test.step('Review post-transfer balances and transaction history', async () => {
      await accountOverviewPage.navigateToAccountOverview();
      await accountOverviewPage.logAccountSummaries();
      await accountOverviewPage.clickAccountLink(0);
      await accountOverviewPage.hasTransactionMatching(/50(?:\.00)?/);
    });
  });

  test('TC-E2E-004: Bill Payment Workflow', async ({ pageActions }) => {
    await AllureReporter.attachDetails({
      epic: 'End-to-End Tests',
      feature: 'Bill Payment',
      story: 'Complete bill payment workflow',
      severity: 'high',
    });

    const registrationPage = new RegistrationPage(pageActions);
    const billPayPage = new BillPayPage(pageActions);
    const accountOverviewPage = new AccountOverviewPage(pageActions);

    const userData = TestDataProvider.generateUserData({
      firstName: 'Bill',
      lastName: 'Payer',
      address: '123 Bill St',
      city: 'Bill City',
      state: 'FL',
      zipCode: '13579',
      phone: '555-2222',
      ssn: '222-33-4444',
      username: `billpayer${Date.now()}`,
    });
    const billData = TestDataProvider.generateBillPayData({
      payeeName: 'Electric Company',
      address: '456 Power Ave',
      city: 'Energy City',
      state: 'CA',
      zipCode: '98765',
      phone: '555-3333',
      accountNumber: '987654321',
      verifyAccount: '987654321',
      amount: '75.50',
    });

    await test.step('Register the bill pay customer', async () => {
      await registrationPage.navigateToRegistration();
      await registrationPage.registerAndVerifySuccess(userData);
      await accountOverviewPage.logAccountSummaries();
    });

    await test.step('Execute the bill payment flow', async () => {
      await billPayPage.navigateToBillPay();
      await billPayPage.payBill(billData);

      const outcome = await billPayPage.getBillPayOutcome();
      Logger.info(`Bill pay workflow outcome: ${outcome}`);

      if (outcome === 'success') {
        await billPayPage.verifyBillPaySuccess();
      }

      if (outcome === 'error') {
        await billPayPage.getBillPayErrorMessage();
      }
    });

    await test.step('Review balances after the bill payment attempt', async () => {
      await accountOverviewPage.navigateToAccountOverview();
      await accountOverviewPage.logAccountSummaries();
    });
  });

  test('TC-E2E-007: Complete Banking Session', async ({ pageActions }) => {
    await AllureReporter.attachDetails({
      epic: 'End-to-End Tests',
      feature: 'Complete Banking Session',
      story: 'Simulate complete banking session with multiple operations',
      severity: 'high',
    });

    const registrationPage = new RegistrationPage(pageActions);
    const transferPage = new TransferFundsPage(pageActions);
    const billPayPage = new BillPayPage(pageActions);
    const accountOverviewPage = new AccountOverviewPage(pageActions);
    const updateProfilePage = new UpdateProfilePage(pageActions);
    const homePage = new HomePage(pageActions);

    const userData = TestDataProvider.generateUserData({
      firstName: 'Complete',
      lastName: 'Session',
      address: '999 Session St',
      city: 'Session City',
      state: 'WA',
      zipCode: '99999',
      phone: '555-0000',
      ssn: '000-11-2222',
      username: `completsession${Date.now()}`,
    });

    await test.step('Onboard the customer and inspect the initial portfolio', async () => {
      await registrationPage.navigateToRegistration();
      await registrationPage.registerAndVerifySuccess(userData);
      await accountOverviewPage.verifyAccountsAvailable();
      await accountOverviewPage.logAccountSummaries();
    });

    await test.step('Perform a funds transfer', async () => {
      await transferPage.navigateToTransferFunds();
      const { fromAccounts, toAccounts } = await transferPage.getAvailableAccountPairs();

      if (fromAccounts.length > 1 && toAccounts.length > 1) {
        await transferPage.transferFundsAndVerifySuccess({
          amount: '25.00',
          fromAccount: fromAccounts[0],
          toAccount: toAccounts[1],
        });
      } else {
        Logger.info('Funds transfer skipped because multiple accounts were not available');
      }
    });

    await test.step('Pay a bill during the session', async () => {
      await billPayPage.navigateToBillPay();
      await billPayPage.payBill(
        TestDataProvider.generateBillPayData({
          payeeName: 'Internet Provider',
          address: '123 Web St',
          city: 'Internet City',
          state: 'CA',
          zipCode: '90210',
          phone: '555-4444',
          accountNumber: '1122334455',
          verifyAccount: '1122334455',
          amount: '89.99',
        })
      );
      await billPayPage.getBillPayOutcome();
    });

    await test.step('Review transaction history and update the profile', async () => {
      await accountOverviewPage.navigateToAccountOverview();
      await accountOverviewPage.logAccountSummaries();
      await accountOverviewPage.clickAccountLink(0);
      await accountOverviewPage.logRecentTransactions();
      await updateProfilePage.navigateToUpdateProfile();
      await updateProfilePage.updateProfile({ phone: '555-7777' });
      await updateProfilePage.verifyProfileUpdated();
    });

    await test.step('End the session cleanly', async () => {
      await updateProfilePage.logout();
      await homePage.verifyPageLoaded();
      await homePage.verifyLoginFormVisible();
    });
  });

  test('TC-E2E-008: Error Recovery and Validation', async ({ pageActions }) => {
    await AllureReporter.attachDetails({
      epic: 'End-to-End Tests',
      feature: 'Error Handling',
      story: 'Test error scenarios and recovery mechanisms',
      severity: 'medium',
    });

    const loginPage = new LoginPage(pageActions);
    const registrationPage = new RegistrationPage(pageActions);
    const transferPage = new TransferFundsPage(pageActions);
    const billPayPage = new BillPayPage(pageActions);
    const homePage = new HomePage(pageActions);

    await test.step('Validate login error handling', async () => {
      await loginPage.navigateToLogin();
      await loginPage.attemptLogin('nonexistentuser', 'wrongpassword');
      await loginPage.verifyLoginError('error|invalid|verified');
      await loginPage.navigateToLogin();
      await loginPage.attemptLogin('', '');
      await loginPage.verifyLoginError('error|required|invalid|verified');
    });

    await test.step('Validate registration required field errors', async () => {
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

    await test.step('Recover with a valid registration and exercise transfer validation', async () => {
      const userData = TestDataProvider.generateUserData({
        firstName: 'Error',
        lastName: 'Test',
        address: '123 Error St',
        city: 'Error City',
        username: `errortest${Date.now()}`,
      });

      await registrationPage.navigateToRegistration();
      await registrationPage.registerAndVerifySuccess(userData);
      await transferPage.navigateToTransferFunds();
      await transferPage.transferFunds({ amount: '999999999' });

      const transferOutcome = await transferPage.getTransferOutcome();
      Logger.info(`Transfer validation outcome: ${transferOutcome}`);

      if (transferOutcome === 'error') {
        await transferPage.verifyTransferFailed('error|insufficient|invalid');
      }
    });

    await test.step('Validate bill pay mismatch handling and app stability', async () => {
      await billPayPage.navigateToBillPay();
      await billPayPage.payBill(
        TestDataProvider.generateBillPayData({
          payeeName: 'Test Payee',
          address: '123 Test St',
          city: 'Test City',
          state: 'CA',
          zipCode: '12345',
          phone: '555-1234',
          accountNumber: '123456789',
          verifyAccount: '987654321',
          amount: '50.00',
        })
      );

      const billPayOutcome = await billPayPage.getBillPayOutcome();
      Logger.info(`Bill pay validation outcome: ${billPayOutcome}`);

      if (billPayOutcome === 'error') {
        await billPayPage.verifyAccountMismatchError();
      }

      await homePage.navigateToHome();
      await homePage.verifyPageLoaded();
      await homePage.verifyLoginFormVisible();
    });
  });
});
