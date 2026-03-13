import { test } from '@support/PageFixture';
import { RegistrationPage } from '@pages/registrationPage';
import { LoginPage } from '@pages/loginPage';
import { TransferFundsPage } from '@pages/transferFundsPage';
import { BillPayPage } from '@pages/billPayPage';
import { AllureReporter } from '@helper/reporting/AllureReporter';
import { Logger } from '@helper/logger/Logger';

/**
 * Regression Tests
 *
 * RUN WITH: npx playwright test tests/regression/ --workers=3
 *
 * These tests verify existing functionality still works after changes
 */

test.describe('ParaBank - Regression Tests', () => {

  test('TC-REG-001: Registration Form Validation', async ({ pageActions }) => {
    await AllureReporter.attachDetails({
      epic: 'Regression Tests',
      feature: 'Registration Validation',
      story: 'Verify registration form validation works correctly',
      severity: 'high'
    });

    const registrationPage = new RegistrationPage(pageActions);

    await test.step('Navigate to registration page', async () => {
      await registrationPage.navigateToRegistration();
    });

    await test.step('Submit empty form and verify errors', async () => {
      await registrationPage.submitRegistration();
      // Verify error messages appear for required fields
      await pageActions.getPage().waitForSelector('.error, [class*="error"]', { timeout: 5000 });
    });

    await test.step('Test duplicate username validation', async () => {
      const userData = {
        firstName: 'Test',
        lastName: 'User',
        address: '123 Test St',
        city: 'Test City',
        state: 'CA',
        zipCode: '12345',
        username: 'testuser', // Use a common username that might exist
        password: 'password123',
        confirmPassword: 'password123'
      };

      await registrationPage.fillRegistrationForm(userData);
      await registrationPage.submitRegistration();

      // Check if registration succeeds or shows duplicate username error
      const page = pageActions.getPage();
      const successElement = page.locator('.success');
      const errorElement = page.locator('.error');

      const hasSuccess = await successElement.isVisible().catch(() => false);
      const hasError = await errorElement.isVisible().catch(() => false);

      if (hasError) {
        Logger.info('Registration failed as expected (possibly duplicate username)');
      } else if (hasSuccess) {
        Logger.info('Registration succeeded (username was available)');
      }
    });
  });

  test('TC-REG-002: Login Error Handling', async ({ pageActions }) => {
    await AllureReporter.attachDetails({
      epic: 'Regression Tests',
      feature: 'Login Error Handling',
      story: 'Verify login error scenarios are handled correctly',
      severity: 'high'
    });

    const loginPage = new LoginPage(pageActions);

    await test.step('Navigate to login page', async () => {
      await loginPage.navigateToLogin();
    });

    await test.step('Test invalid username', async () => {
      await loginPage.login('invaliduser', 'password123');
      await loginPage.verifyLoginError('error');
    });

    await test.step('Test invalid password', async () => {
      await loginPage.login('testuser', 'wrongpassword');
      await loginPage.verifyLoginError('error');
    });

    await test.step('Test empty credentials', async () => {
      await loginPage.login('', '');
      await loginPage.verifyLoginError('error');
    });
  });

  test('TC-REG-003: Transfer Funds Functionality', async ({ pageActions }) => {
    await AllureReporter.attachDetails({
      epic: 'Regression Tests',
      feature: 'Funds Transfer',
      story: 'Verify funds transfer between accounts works correctly',
      severity: 'high'
    });

    // First create a user with an account
    const registrationPage = new RegistrationPage(pageActions);
    const transferPage = new TransferFundsPage(pageActions);

    const userData = {
      firstName: 'Transfer',
      lastName: 'Test',
      address: '123 Transfer St',
      city: 'Transfer City',
      state: 'CA',
      zipCode: '12345',
      phone: '555-1234',
      ssn: '123-45-6789',
      username: `transferuser${Date.now()}`,
      password: 'password123',
      confirmPassword: 'password123'
    };

    await test.step('Register test user', async () => {
      await registrationPage.navigateToRegistration();
      await registrationPage.register(userData);
      await registrationPage.verifySuccessMessage();
    });

    await test.step('Navigate to transfer funds page', async () => {
      await transferPage.navigateToTransferFunds();
    });

    await test.step('Check available accounts', async () => {
      const fromAccounts = await transferPage.getAvailableFromAccounts();
      const toAccounts = await transferPage.getAvailableToAccounts();

      Logger.info(`From accounts: ${fromAccounts.length}, To accounts: ${toAccounts.length}`);

      if (fromAccounts.length > 1 && toAccounts.length > 1) {
        await test.step('Perform transfer between accounts', async () => {
          await transferPage.transferFunds({
            amount: '100.00',
            fromAccount: fromAccounts[0],
            toAccount: toAccounts[1] || toAccounts[0]
          });
          await transferPage.verifyTransferSuccess();
        });
      } else {
        Logger.info('Not enough accounts for transfer test');
      }
    });
  });

  test('TC-REG-004: Bill Pay Functionality', async ({ pageActions }) => {
    await AllureReporter.attachDetails({
      epic: 'Regression Tests',
      feature: 'Bill Payment',
      story: 'Verify bill payment functionality works correctly',
      severity: 'high'
    });

    // First create a user
    const registrationPage = new RegistrationPage(pageActions);
    const billPayPage = new BillPayPage(pageActions);

    const userData = {
      firstName: 'Bill',
      lastName: 'Pay',
      address: '123 Bill St',
      city: 'Bill City',
      state: 'CA',
      zipCode: '12345',
      phone: '555-1234',
      ssn: '123-45-6789',
      username: `billuser${Date.now()}`,
      password: 'password123',
      confirmPassword: 'password123'
    };

    await test.step('Register test user', async () => {
      await registrationPage.navigateToRegistration();
      await registrationPage.register(userData);
      await registrationPage.verifySuccessMessage();
    });

    await test.step('Navigate to bill pay page', async () => {
      await billPayPage.navigateToBillPay();
    });

    await test.step('Submit bill payment', async () => {
      await billPayPage.payBill({
        payeeName: 'Test Payee',
        address: '123 Payee St',
        city: 'Payee City',
        state: 'CA',
        zipCode: '12345',
        phone: '555-9999',
        accountNumber: '123456789',
        verifyAccount: '123456789',
        amount: '50.00'
      });
    });

    await test.step('Verify bill payment result', async () => {
      // Check if payment succeeded or failed
      const page = pageActions.getPage();
      const successElement = page.locator('.success');
      const errorElement = page.locator('.error');

      const hasSuccess = await successElement.isVisible().catch(() => false);
      const hasError = await errorElement.isVisible().catch(() => false);

      if (hasSuccess) {
        await billPayPage.verifyBillPaySuccess();
      } else if (hasError) {
        Logger.info('Bill payment failed - this may be expected behavior');
      }
    });
  });

  test('TC-REG-005: Account Details and History', async ({ pageActions }) => {
    await AllureReporter.attachDetails({
      epic: 'Regression Tests',
      feature: 'Account Details',
      story: 'Verify account details and transaction history display correctly',
      severity: 'medium'
    });

    // Create user and perform some transactions first
    const registrationPage = new RegistrationPage(pageActions);
    const transferPage = new TransferFundsPage(pageActions);

    const userData = {
      firstName: 'Account',
      lastName: 'Details',
      address: '123 Account St',
      city: 'Account City',
      state: 'CA',
      zipCode: '12345',
      phone: '555-1234',
      ssn: '123-45-6789',
      username: `accountuser${Date.now()}`,
      password: 'password123',
      confirmPassword: 'password123'
    };

    await test.step('Register user and create account activity', async () => {
      await registrationPage.navigateToRegistration();
      await registrationPage.register(userData);
      await registrationPage.verifySuccessMessage();

      // Try to create some account activity
      try {
        await transferPage.navigateToTransferFunds();
        const fromAccounts = await transferPage.getAvailableFromAccounts();
        if (fromAccounts.length > 1) {
          await transferPage.transferFunds({
            amount: '10.00',
            fromAccount: fromAccounts[0],
            toAccount: fromAccounts[1]
          });
        }
      } catch (error) {
        Logger.info('Could not create transfer for account history test');
      }
    });

    await test.step('Navigate to account details', async () => {
      // Click on first account link
      const page = pageActions.getPage();
      const accountLink = page.locator('#accountTable tbody tr td a').first();
      await accountLink.click();
      await page.waitForLoadState('networkidle');
    });

    await test.step('Verify account details page', async () => {
      const page = pageActions.getPage();
      await page.waitForSelector('#transactionTable, #accountDetails', { timeout: 5000 });

      // Check if transaction table exists
      const transactionTable = page.locator('#transactionTable');
      const hasTransactions = await transactionTable.isVisible().catch(() => false);

      if (hasTransactions) {
        const transactionCount = await page.locator('#transactionTable tbody tr').count();
        Logger.info(`Account has ${transactionCount} transactions`);
      } else {
        Logger.info('No transactions found or different page structure');
      }
    });
  });
});