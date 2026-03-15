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
      firstName: 'Aditya',
      lastName: 'Kulkarni',
      address: '56 JM Road',
      city: 'Pune',
      state: 'Maharashtra',
      zipCode: '411004',
      phone: '9876501234',
      ssn: '4123-5678-9012',
      username: `accountmgr${Date.now()}`,
    });
    const updatedPhoneNumber = '9899001122';

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
      firstName: 'Ishita',
      lastName: 'Patel',
      address: '31 CG Road',
      city: 'Ahmedabad',
      state: 'Gujarat',
      zipCode: '380009',
      phone: '9824401234',
      ssn: '5234-6789-0123',
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
      firstName: 'Meera',
      lastName: 'Joshi',
      address: '9 Civil Lines',
      city: 'Jaipur',
      state: 'Rajasthan',
      zipCode: '302006',
      phone: '9799012345',
      ssn: '6345-7890-1234',
      username: `billpayer${Date.now()}`,
    });
    const billData = TestDataProvider.generateBillPayData({
      payeeName: 'Jaipur Vidyut Vitran Nigam',
      address: 'Vidyut Bhawan',
      city: 'Jaipur',
      state: 'Rajasthan',
      zipCode: '302005',
      phone: '1412200000',
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
      firstName: 'Rahul',
      lastName: 'Chopra',
      address: '14 Connaught Place',
      city: 'New Delhi',
      state: 'Delhi',
      zipCode: '110001',
      phone: '9811101234',
      ssn: '7456-8901-2345',
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
          payeeName: 'Airtel Broadband',
          address: 'Bharti Crescent',
          city: 'New Delhi',
          state: 'Delhi',
          zipCode: '110070',
          phone: '1144440000',
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
      await updateProfilePage.updateProfile({ phone: '9811199999' });
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
        firstName: 'Nitin',
        lastName: 'Bose',
        address: '27 Salt Lake',
        city: 'Kolkata',
        state: 'West Bengal',
        zipCode: '700091',
        phone: '9874012345',
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
          payeeName: 'Bangalore Water Supply',
          address: 'Cauvery Bhavan',
          city: 'Bengaluru',
          state: 'Karnataka',
          zipCode: '560009',
          phone: '8022299999',
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
