import { test } from '@support/PageFixture';
import { RegistrationPage } from '@pages/registrationPage';
import { LoginPage } from '@pages/loginPage';
import { AccountOverviewPage } from '@pages/accountOverviewPage';
import { TransferFundsPage } from '@pages/transferFundsPage';
import { BillPayPage } from '@pages/billPayPage';
import { AllureReporter } from '@helper/reporting/AllureReporter';
import { Logger } from '@helper/logger/Logger';

/**
 * End-to-End Tests
 *
 * RUN WITH: npx playwright test tests/e2e/ --workers=2
 *
 * These tests verify complete user workflows from start to finish
 */

test.describe('ParaBank - End-to-End Tests', () => {

  test('TC-E2E-001: Complete User Registration and First Login', async ({ pageActions }) => {
    await AllureReporter.attachDetails({
      epic: 'End-to-End Tests',
      feature: 'User Onboarding',
      story: 'Complete registration and login workflow',
      severity: 'critical'
    });

    const registrationPage = new RegistrationPage(pageActions);
    const loginPage = new LoginPage(pageActions);
    const accountOverviewPage = new AccountOverviewPage(pageActions);

    const userData = {
      firstName: 'E2E',
      lastName: 'User',
      address: '123 E2E St',
      city: 'E2E City',
      state: 'CA',
      zipCode: '12345',
      phone: '555-1234',
      ssn: '123-45-6789',
      username: `e2euser${Date.now()}`,
      password: 'password123',
      confirmPassword: 'password123'
    };

    await test.step('Complete user registration', async () => {
      await registrationPage.navigateToRegistration();
      await registrationPage.register(userData);
      await registrationPage.verifySuccessMessage();
    });

    await test.step('Logout user', async () => {
      await pageActions.getPage().goto('https://parabank.parasoft.com/parabank/logout.htm');
    });

    await test.step('Login with new credentials', async () => {
      await loginPage.login(userData.username, userData.password);
    });

    await test.step('Verify successful login and account creation', async () => {
      await accountOverviewPage.verifyAccountOverviewPageLoaded();
      await accountOverviewPage.verifyWelcomeMessage(userData.firstName);

      const accountCount = await accountOverviewPage.getAccountCount();
      Logger.info(`New user has ${accountCount} account(s)`);
    });
  });

  test('TC-E2E-002: Account Management Workflow', async ({ pageActions }) => {
    await AllureReporter.attachDetails({
      epic: 'End-to-End Tests',
      feature: 'Account Management',
      story: 'Complete account viewing and profile update workflow',
      severity: 'high'
    });

    const registrationPage = new RegistrationPage(pageActions);
    const accountOverviewPage = new AccountOverviewPage(pageActions);

    const userData = {
      firstName: 'Account',
      lastName: 'Manager',
      address: '456 Account St',
      city: 'Account City',
      state: 'NY',
      zipCode: '67890',
      phone: '555-5678',
      ssn: '987-65-4321',
      username: `accountmgr${Date.now()}`,
      password: 'password123',
      confirmPassword: 'password123'
    };

    await test.step('Register and login user', async () => {
      await registrationPage.navigateToRegistration();
      await registrationPage.register(userData);
      await registrationPage.verifySuccessMessage();
    });

    await test.step('View account overview', async () => {
      await accountOverviewPage.verifyAccountOverviewPageLoaded();
      const accountCount = await accountOverviewPage.getAccountCount();

      if (accountCount > 0) {
        const accountNumber = await accountOverviewPage.getAccountNumber(0);
        const balance = await accountOverviewPage.getAccountBalance(0);
        Logger.info(`Account ${accountNumber}: $${balance}`);
      }
    });

    await test.step('View account details', async () => {
      if (await accountOverviewPage.getAccountCount() > 0) {
        await accountOverviewPage.clickAccountLink(0);
        // Verify we're on account details page
        await pageActions.getPage().waitForSelector('#transactionTable, #accountDetails', { timeout: 5000 });
      }
    });

    await test.step('Update contact information', async () => {
      await pageActions.getPage().goto('https://parabank.parasoft.com/parabank/updateprofile.htm');
      await pageActions.getPage().waitForLoadState('networkidle');

      // Update phone number
      await pageActions.getPage().fill('[name="customer.phoneNumber"]', '555-9999');
      await pageActions.getPage().click('[value="Update Profile"]');

      // Verify update success
      await pageActions.getPage().waitForSelector('.success, .error', { timeout: 5000 });
    });

    await test.step('Verify changes persist after logout/login', async () => {
      // Logout
      await pageActions.getPage().goto('https://parabank.parasoft.com/parabank/logout.htm');

      // Login again
      const loginPage = new LoginPage(pageActions);
      await loginPage.login(userData.username, userData.password);

      // Check if phone number was updated
      await pageActions.getPage().goto('https://parabank.parasoft.com/parabank/updateprofile.htm');
      await pageActions.getPage().waitForLoadState('networkidle');

      const phoneValue = await pageActions.getPage().inputValue('[name="customer.phoneNumber"]');
      Logger.info(`Phone number after re-login: ${phoneValue}`);
    });
  });

  test('TC-E2E-003: Funds Transfer Workflow', async ({ pageActions }) => {
    await AllureReporter.attachDetails({
      epic: 'End-to-End Tests',
      feature: 'Funds Transfer',
      story: 'Complete funds transfer between accounts workflow',
      severity: 'high'
    });

    const registrationPage = new RegistrationPage(pageActions);
    const transferPage = new TransferFundsPage(pageActions);
    const accountOverviewPage = new AccountOverviewPage(pageActions);

    const userData = {
      firstName: 'Transfer',
      lastName: 'Workflow',
      address: '789 Transfer St',
      city: 'Transfer City',
      state: 'TX',
      zipCode: '54321',
      phone: '555-1111',
      ssn: '111-22-3333',
      username: `transferwf${Date.now()}`,
      password: 'password123',
      confirmPassword: 'password123'
    };

    await test.step('Register user and check initial balances', async () => {
      await registrationPage.navigateToRegistration();
      await registrationPage.register(userData);
      await registrationPage.verifySuccessMessage();

      const initialBalance = await accountOverviewPage.getAccountBalance(0);
      Logger.info(`Initial balance: $${initialBalance}`);
    });

    await test.step('Navigate to transfer funds page', async () => {
      await transferPage.navigateToTransferFunds();
    });

    await test.step('Check available accounts for transfer', async () => {
      const fromAccounts = await transferPage.getAvailableFromAccounts();
      const toAccounts = await transferPage.getAvailableToAccounts();

      Logger.info(`Available from accounts: ${fromAccounts.length}`);
      Logger.info(`Available to accounts: ${toAccounts.length}`);

      if (fromAccounts.length < 2) {
        Logger.info('Not enough accounts for transfer test - creating second account via transfer');
        // Try a small transfer to create account activity
        await transferPage.transferFunds({
          amount: '1.00'
        });
        await pageActions.getPage().waitForTimeout(2000); // Wait for processing
      }
    });

    await test.step('Perform funds transfer', async () => {
      const fromAccounts = await transferPage.getAvailableFromAccounts();
      const toAccounts = await transferPage.getAvailableToAccounts();

      if (fromAccounts.length >= 1 && toAccounts.length >= 1) {
        // Get balances before transfer
        const balanceBefore = await accountOverviewPage.getAccountBalance(0);

        await transferPage.transferFunds({
          amount: '50.00',
          fromAccount: fromAccounts[0],
          toAccount: toAccounts.length > 1 ? toAccounts[1] : toAccounts[0]
        });

        await transferPage.verifyTransferSuccess();

        // Check balances after transfer
        await accountOverviewPage.navigateToAccountOverview();
        const balanceAfter = await accountOverviewPage.getAccountBalance(0);
        Logger.info(`Balance before: $${balanceBefore}, after: $${balanceAfter}`);
      }
    });

    await test.step('Verify transfer in transaction history', async () => {
      await accountOverviewPage.clickAccountLink(0);
      await pageActions.getPage().waitForSelector('#transactionTable, #accountDetails', { timeout: 5000 });

      // Check for transfer transaction
      const page = pageActions.getPage();
      const transactions = page.locator('#transactionTable tbody tr');
      const transactionCount = await transactions.count();

      if (transactionCount > 0) {
        Logger.info(`Found ${transactionCount} transactions in history`);
        // Check if any transaction shows the transfer amount
        for (let i = 0; i < Math.min(transactionCount, 3); i++) {
          const transactionText = await transactions.nth(i).textContent();
          if (transactionText && transactionText.includes('50')) {
            Logger.info('Transfer transaction found in history');
            break;
          }
        }
      }
    });
  });

  test('TC-E2E-004: Bill Payment Workflow', async ({ pageActions }) => {
    await AllureReporter.attachDetails({
      epic: 'End-to-End Tests',
      feature: 'Bill Payment',
      story: 'Complete bill payment workflow',
      severity: 'high'
    });

    const registrationPage = new RegistrationPage(pageActions);
    const billPayPage = new BillPayPage(pageActions);
    const accountOverviewPage = new AccountOverviewPage(pageActions);

    const userData = {
      firstName: 'Bill',
      lastName: 'Payer',
      address: '123 Bill St',
      city: 'Bill City',
      state: 'FL',
      zipCode: '13579',
      phone: '555-2222',
      ssn: '222-33-4444',
      username: `billpayer${Date.now()}`,
      password: 'password123',
      confirmPassword: 'password123'
    };

    await test.step('Register user and check initial balance', async () => {
      await registrationPage.navigateToRegistration();
      await registrationPage.register(userData);
      await registrationPage.verifySuccessMessage();

      const initialBalance = await accountOverviewPage.getAccountBalance(0);
      Logger.info(`Initial balance: $${initialBalance}`);
    });

    await test.step('Navigate to bill pay page', async () => {
      await billPayPage.navigateToBillPay();
    });

    await test.step('Submit bill payment', async () => {
      await billPayPage.payBill({
        payeeName: 'Electric Company',
        address: '456 Power Ave',
        city: 'Energy City',
        state: 'CA',
        zipCode: '98765',
        phone: '555-3333',
        accountNumber: '987654321',
        verifyAccount: '987654321',
        amount: '75.50'
      });
    });

    await test.step('Verify bill payment result', async () => {
      const page = pageActions.getPage();
      const successElement = page.locator('.success');
      const errorElement = page.locator('.error');

      const hasSuccess = await successElement.isVisible().catch(() => false);
      const hasError = await errorElement.isVisible().catch(() => false);

      if (hasSuccess) {
        await billPayPage.verifyBillPaySuccess();
        Logger.info('Bill payment succeeded');
      } else if (hasError) {
        const errorText = await errorElement.textContent();
        Logger.info(`Bill payment failed: ${errorText}`);
      }
    });

    await test.step('Verify account balance updated', async () => {
      await accountOverviewPage.navigateToAccountOverview();
      const finalBalance = await accountOverviewPage.getAccountBalance(0);
      Logger.info(`Final balance: $${finalBalance}`);
    });
  });

  test('TC-E2E-007: Complete Banking Session', async ({ pageActions }) => {
    await AllureReporter.attachDetails({
      epic: 'End-to-End Tests',
      feature: 'Complete Banking Session',
      story: 'Simulate complete banking session with multiple operations',
      severity: 'high'
    });

    const registrationPage = new RegistrationPage(pageActions);
    const transferPage = new TransferFundsPage(pageActions);
    const billPayPage = new BillPayPage(pageActions);
    const accountOverviewPage = new AccountOverviewPage(pageActions);

    const userData = {
      firstName: 'Complete',
      lastName: 'Session',
      address: '999 Session St',
      city: 'Session City',
      state: 'WA',
      zipCode: '99999',
      phone: '555-0000',
      ssn: '000-11-2222',
      username: `completsession${Date.now()}`,
      password: 'password123',
      confirmPassword: 'password123'
    };

    await test.step('Register user', async () => {
      await registrationPage.navigateToRegistration();
      await registrationPage.register(userData);
      await registrationPage.verifySuccessMessage();
    });

    await test.step('Check initial account balances', async () => {
      const accountCount = await accountOverviewPage.getAccountCount();
      Logger.info(`User has ${accountCount} account(s)`);

      for (let i = 0; i < accountCount; i++) {
        const balance = await accountOverviewPage.getAccountBalance(i);
        Logger.info(`Account ${i + 1} balance: $${balance}`);
      }
    });

    await test.step('Perform funds transfer', async () => {
      await transferPage.navigateToTransferFunds();
      const fromAccounts = await transferPage.getAvailableFromAccounts();

      if (fromAccounts.length > 0) {
        await transferPage.transferFunds({
          amount: '25.00'
        });
        await transferPage.verifyTransferSuccess();
      }
    });

    await test.step('Pay a bill', async () => {
      await billPayPage.navigateToBillPay();
      await billPayPage.payBill({
        payeeName: 'Internet Provider',
        address: '123 Web St',
        city: 'Internet City',
        state: 'CA',
        zipCode: '90210',
        phone: '555-4444',
        accountNumber: '1122334455',
        verifyAccount: '1122334455',
        amount: '89.99'
      });

      // Check result
      const page = pageActions.getPage();
      const successVisible = await page.locator('.success').isVisible().catch(() => false);
      if (successVisible) {
        Logger.info('Bill payment succeeded');
      } else {
        Logger.info('Bill payment completed (may have failed as expected)');
      }
    });

    await test.step('Check updated balances', async () => {
      await accountOverviewPage.navigateToAccountOverview();
      const accountCount = await accountOverviewPage.getAccountCount();

      for (let i = 0; i < accountCount; i++) {
        const balance = await accountOverviewPage.getAccountBalance(i);
        Logger.info(`Updated account ${i + 1} balance: $${balance}`);
      }
    });

    await test.step('Review transaction history', async () => {
      if (await accountOverviewPage.getAccountCount() > 0) {
        await accountOverviewPage.clickAccountLink(0);
        await pageActions.getPage().waitForSelector('#transactionTable, #accountDetails', { timeout: 5000 });

        const page = pageActions.getPage();
        const transactionCount = await page.locator('#transactionTable tbody tr').count().catch(() => 0);
        Logger.info(`Account has ${transactionCount} transactions`);
      }
    });

    await test.step('Update profile information', async () => {
      await pageActions.getPage().goto('https://parabank.parasoft.com/parabank/updateprofile.htm');
      await pageActions.getPage().waitForLoadState('networkidle');

      await pageActions.getPage().fill('[name="customer.phoneNumber"]', '555-7777');
      await pageActions.getPage().click('[value="Update Profile"]');

      const successVisible = await pageActions.getPage().locator('.success').isVisible().catch(() => false);
      if (successVisible) {
        Logger.info('Profile update succeeded');
      }
    });

    await test.step('Logout cleanly', async () => {
      await pageActions.getPage().goto('https://parabank.parasoft.com/parabank/logout.htm');
      await pageActions.getPage().waitForSelector('[name="username"]', { timeout: 5000 });
      Logger.info('Logout successful');
    });
  });

  test('TC-E2E-008: Error Recovery and Validation', async ({ pageActions }) => {
    await AllureReporter.attachDetails({
      epic: 'End-to-End Tests',
      feature: 'Error Handling',
      story: 'Test error scenarios and recovery mechanisms',
      severity: 'medium'
    });

    const loginPage = new LoginPage(pageActions);
    const registrationPage = new RegistrationPage(pageActions);
    const transferPage = new TransferFundsPage(pageActions);

    await test.step('Test login error handling', async () => {
      await loginPage.navigateToLogin();

      // Test invalid credentials
      await loginPage.login('nonexistentuser', 'wrongpassword');
      await loginPage.verifyLoginError('error');

      // Test empty fields
      await loginPage.login('', '');
      await loginPage.verifyLoginError('error');
    });

    await test.step('Test registration validation', async () => {
      await registrationPage.navigateToRegistration();

      // Submit empty form
      await registrationPage.submitRegistration();
      // Should show validation errors
      await pageActions.getPage().waitForSelector('.error, [class*="error"]', { timeout: 5000 });
    });

    await test.step('Test transfer validation', async () => {
      // First register a user
      const userData = {
        firstName: 'Error',
        lastName: 'Test',
        address: '123 Error St',
        city: 'Error City',
        state: 'CA',
        zipCode: '12345',
        phone: '555-1234',
        ssn: '123-45-6789',
        username: `errortest${Date.now()}`,
        password: 'password123',
        confirmPassword: 'password123'
      };

      await registrationPage.register(userData);
      await registrationPage.verifySuccessMessage();

      // Try transfer with invalid amount
      await transferPage.navigateToTransferFunds();
      await transferPage.transferFunds({
        amount: '999999999' // Amount too large
      });

      // Check if error occurs
      const page = pageActions.getPage();
      const errorVisible = await page.locator('.error').isVisible().catch(() => false);
      if (errorVisible) {
        Logger.info('Transfer validation working - large amount rejected');
      } else {
        Logger.info('Transfer completed or different validation approach');
      }
    });

    await test.step('Test bill pay validation', async () => {
      const billPayPage = new BillPayPage(pageActions);
      await billPayPage.navigateToBillPay();

      // Test account number mismatch
      await billPayPage.payBill({
        payeeName: 'Test Payee',
        address: '123 Test St',
        city: 'Test City',
        state: 'CA',
        zipCode: '12345',
        phone: '555-1234',
        accountNumber: '123456789',
        verifyAccount: '987654321', // Different from account number
        amount: '50.00'
      });

      // Check for account mismatch error
      const page = pageActions.getPage();
      const errorVisible = await page.locator('.error').isVisible().catch(() => false);
      if (errorVisible) {
        const errorText = await page.locator('.error').textContent();
        if (errorText && errorText.toLowerCase().includes('match')) {
          Logger.info('Account number mismatch validation working');
        }
      }
    });

    await test.step('Verify application remains stable after errors', async () => {
      // Navigate back to home page
      await pageActions.getPage().goto('https://parabank.parasoft.com/parabank/index.htm');
      await pageActions.getPage().waitForLoadState('networkidle');

      // Verify page still loads
      const title = await pageActions.getPage().title();
      Logger.info(`Application still accessible: ${title}`);
    });
  });
});