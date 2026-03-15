import { test } from '@support/PageFixture';
import { HomePage } from '@pages/homePage';
import { RegistrationPage } from '@pages/registrationPage';
import { LoginPage } from '@pages/loginPage';
import { AccountOverviewPage } from '@pages/accountOverviewPage';
import { AllureReporter } from '@helper/reporting/AllureReporter';
import { Logger } from '@helper/logger/Logger';
import { TestDataProvider } from '@support/testdata/TestDataProvider';

/**
 * Smoke Tests
 *
 * RUN WITH: npx playwright test tests/smoke/ --workers=3
 *
 * These tests verify the minimum viable banking flows.
 * A smoke failure should mean the application is not healthy enough for deeper suites.
 */

test.describe('ParaBank - Smoke Tests', () => {
  test('TC-SMK-001: Application Accessibility', async ({ pageActions }) => {
    await AllureReporter.attachDetails({
      epic: 'Smoke Tests',
      feature: 'Application Accessibility',
      story: 'Verify application loads correctly',
      severity: 'critical',
    });

    const homePage = new HomePage(pageActions);

    await test.step('Open the application landing page', async () => {
      await homePage.navigateToHome();
    });

    await test.step('Verify the home page is ready for interaction', async () => {
      await homePage.verifyPageLoaded();
      await homePage.verifyLogoVisible();
      await homePage.verifyLoginFormVisible();
    });
  });

  test('TC-SMK-002: User Registration', async ({ pageActions }) => {
    await AllureReporter.attachDetails({
      epic: 'Smoke Tests',
      feature: 'User Registration',
      story: 'Complete user registration process',
      severity: 'critical',
    });

    const registrationPage = new RegistrationPage(pageActions);
    const userData = TestDataProvider.getSmokeTestUser();

    await test.step('Register a new smoke user', async () => {
      await registrationPage.navigateToRegistration();
      await registrationPage.registerAndVerifySuccess(userData);
    });
  });

  test('TC-SMK-003: User Login', async ({ pageActions }) => {
    await AllureReporter.attachDetails({
      epic: 'Smoke Tests',
      feature: 'User Login',
      story: 'Verify user can login successfully',
      severity: 'critical',
    });

    const registrationPage = new RegistrationPage(pageActions);
    const loginPage = new LoginPage(pageActions);
    const accountOverviewPage = new AccountOverviewPage(pageActions);
    const userData = TestDataProvider.generateUserData({
      firstName: 'Smoke',
      lastName: 'Login',
      address: '123 Smoke Login St',
      city: 'Smoke City',
    });

    await test.step('Provision a valid smoke user', async () => {
      await registrationPage.navigateToRegistration();
      await registrationPage.registerAndVerifySuccess(userData);
      await registrationPage.logout();
    });

    await test.step('Log in with the registered user', async () => {
      await loginPage.navigateToLogin();
      await loginPage.loginAndVerify(userData.username, userData.password);
    });

    await test.step('Verify the user lands on account overview', async () => {
      await accountOverviewPage.verifyAccountOverviewPageLoaded();
      await accountOverviewPage.verifyAccountsAvailable();
    });
  });

  test('TC-SMK-004: Account Overview', async ({ pageActions }) => {
    await AllureReporter.attachDetails({
      epic: 'Smoke Tests',
      feature: 'Account Overview',
      story: 'Verify account information displays correctly',
      severity: 'critical',
    });

    const registrationPage = new RegistrationPage(pageActions);
    const accountOverviewPage = new AccountOverviewPage(pageActions);
    const userData = TestDataProvider.generateUserData({
      firstName: 'Smoke',
      lastName: 'Overview',
      address: '123 Smoke Overview St',
      city: 'Smoke City',
    });

    await test.step('Create an authenticated smoke user', async () => {
      await registrationPage.navigateToRegistration();
      await registrationPage.registerAndVerifySuccess(userData);
    });

    await test.step('Verify account overview data is available', async () => {
      await accountOverviewPage.verifyAccountOverviewPageLoaded();
      await accountOverviewPage.verifyAccountsAvailable();
      const summaries = await accountOverviewPage.logAccountSummaries();
      Logger.info(`Smoke account overview returned ${summaries.length} account summary rows`);
    });
  });

  test('TC-SMK-005: Logout Functionality', async ({ pageActions }) => {
    await AllureReporter.attachDetails({
      epic: 'Smoke Tests',
      feature: 'Logout Functionality',
      story: 'Verify user can logout successfully',
      severity: 'critical',
    });

    const registrationPage = new RegistrationPage(pageActions);
    const homePage = new HomePage(pageActions);
    const userData = TestDataProvider.generateUserData({
      firstName: 'Smoke',
      lastName: 'Logout',
      address: '123 Smoke Logout St',
      city: 'Smoke City',
    });

    await test.step('Register and land in an authenticated session', async () => {
      await registrationPage.navigateToRegistration();
      await registrationPage.registerAndVerifySuccess(userData);
    });

    await test.step('Log out of the application', async () => {
      await registrationPage.logout();
    });

    await test.step('Verify the user is returned to the home page', async () => {
      await homePage.verifyPageLoaded();
      await homePage.verifyLoginFormVisible();
    });
  });
});
