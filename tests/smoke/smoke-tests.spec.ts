import { test } from '@support/PageFixture';
import { AllureReporter } from '@helper/reporting/AllureReporter';
import { Logger } from '@helper/logger/Logger';
import { TestDataProvider } from '@support/testdata/TestDataProvider';

/**
 * Smoke Tests
 *
 * RUN WITH: npm run test:smoke
 *
 * DESIGN:
 * - Smoke is intentionally small and business-readable.
 * - Public checks stay independent.
 * - The authenticated journey is covered once, end-to-end.
 * - The suite runs serially to reduce noise against the shared public ParaBank instance.
 */

test.describe.configure({ mode: 'serial' });

test.describe('ParaBank - Smoke Tests', () => {
  const smokeUser = TestDataProvider.generateUserData({
    firstName: 'Kavya',
    lastName: 'Menon',
    address: '18 Park Street',
    city: 'Kolkata',
    state: 'West Bengal',
    zipCode: '700016',
    phone: '9830012345',
  });

  test('TC-SMK-001: Visitor can access the banking entry page', async ({ homePage }) => {
    await AllureReporter.attachDetails({
      epic: 'Smoke Tests',
      feature: 'Application Accessibility',
      story: 'Verify the public banking entry page loads correctly',
      severity: 'critical',
    });

    await test.step('Open the application landing page', async () => {
      await homePage.navigateToHome();
    });

    await test.step('Verify the home page is ready for interaction', async () => {
      await homePage.verifyPageLoaded();
      await homePage.verifyLogoVisible();
      await homePage.verifyLoginFormVisible();
    });
  });

  test('TC-SMK-002: Registration form blocks an empty signup attempt', async ({ registrationPage }) => {
    await AllureReporter.attachDetails({
      epic: 'Smoke Tests',
      feature: 'Registration Validation',
      story: 'Verify customer registration requires mandatory details',
      severity: 'critical',
    });

    await test.step('Open the registration form', async () => {
      await registrationPage.navigateToRegistration();
    });

    await test.step('Submit the form without entering any customer details', async () => {
      await registrationPage.submitRegistration();
    });

    await test.step('Verify the required field validations are displayed', async () => {
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
  });

  test('TC-SMK-003: New customer can register, log out, and sign back in', async ({
    registrationPage,
    loginPage,
    homePage,
    accountOverviewPage,
  }) => {
    await AllureReporter.attachDetails({
      epic: 'Smoke Tests',
      feature: 'Authenticated Customer Journey',
      story: 'Verify a customer can onboard and return to account access',
      severity: 'critical',
    });

    await test.step('Register a brand-new customer and reach account overview', async () => {
      await registrationPage.navigateToRegistration();
      await registrationPage.registerAndVerifySuccess(smokeUser);
      await accountOverviewPage.verifyAccountOverviewPageLoaded();
      await accountOverviewPage.verifyAccountsAvailable();
      const summaries = await accountOverviewPage.logAccountSummaries();
      Logger.info(`Smoke journey account overview returned ${summaries.length} account summary rows`);
    });

    await test.step('Log out from the authenticated session', async () => {
      await registrationPage.logout();
      await homePage.verifyPageLoaded();
      await homePage.verifyLoginFormVisible();
    });

    await test.step('Sign back in with the same customer credentials', async () => {
      await loginPage.loginAndVerify(smokeUser.username, smokeUser.password);
      await accountOverviewPage.verifyAccountOverviewPageLoaded();
      await accountOverviewPage.verifyAccountsAvailable();
    });
  });
});
