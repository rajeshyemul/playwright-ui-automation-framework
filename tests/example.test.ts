/*


import { test, expect } from '../src/support/PageFixture';
import { AllureReporter } from '../src/helper/reporting/AllureReporter';
import { Epic } from '../src/support/enums/allureReports/Epic';
import { Feature } from '../src/support/enums/allureReports/Feature';
import { Severity } from '../src/support/enums/allureReports/Severity';
import { TestOwners } from '../src/support/enums/allureReports/TestOwners';

/**
 * CHANGES FROM OLD VERSION:
 * 1. Import test from PageFixture (not @playwright/test)
 * 2. Use fixtures in test signature
 * 3. No manual PageActions creation
 * 4. No manual page object creation
 */

/*
test.describe('Home Page Tests', () => {
  test('should load home page correctly', async ({ loginPage }) => {
    // Attach Allure metadata
    await AllureReporter.attachDetails({
      epic: Epic.HOME_PAGE,
      feature: Feature.PAGE_LOAD,
      severity: Severity.CRITICAL,
      owner: TestOwners.USER_01,
      description: 'Verify that the home page loads correctly with all elements visible',
      tags: ['smoke', 'home'],
      issues: ['123', '456'],
      tmsIds: ['TC-001', 'TC-002'],
      component: 'HomePage',
    });

    // Test steps - using fixture-provided homePage
    await loginPage.navigateToHome();
    await loginPage.verifyLogoVisible();
    await loginPage.verifyTitle(/ParaBank/);
  });

  test('should navigate between pages', async ({ loginPage, pageActions }) => {
    await AllureReporter.attachDetails({
      epic: Epic.HOME_PAGE,
      feature: Feature.NAVIGATION,
      severity: Severity.CRITICAL,
      owner: TestOwners.USER_01,
      description: 'Verify that the home page navigation works correctly',
      tags: ['smoke', 'home'],
      issues: ['123', '456'],
      tmsIds: ['TC-001', 'TC-002'],
      component: 'HomePage',
    });

    // Both fixtures available in same test
    await homePage.navigateToHome();
    await homePage.clickMenuItem('About');

    // Can also use pageActions directly if needed
    await pageActions.waitForNavigation(/about/);

    const currentUrl = await pageActions.getCurrentUrl();
    expect(currentUrl).toContain('about');
  });

  test('should handle search functionality', async ({ homePage }) => {
    await AllureReporter.attachDetails({
      epic: Epic.HOME_PAGE,
      feature: Feature.SEARCH,
      severity: Severity.CRITICAL,
      owner: TestOwners.USER_01,
      description: 'Verify that the home page search functionality works correctly',
      tags: ['smoke', 'home'],
      issues: ['123', '456'],
      tmsIds: ['TC-001', 'TC-002'],
      component: 'HomePage',
    });

    await homePage.navigateToHome();
    await homePage.searchFor('checking account');

    // Assertions using Playwright expect
    await expect(homePage['page']).toHaveURL(/search/);
  });
});

test.describe('Registration Tests', () => {
  test('should register new user', async ({ registrationPage }) => {
    await AllureReporter.attachDetails({
      epic: Epic.REGISTRATION,
      feature: Feature.PAGE_LOAD,
      severity: Severity.CRITICAL,
      owner: TestOwners.USER_02,
      description: 'Verify that a new user can register successfully',
      tags: ['smoke', 'registration'],
      issues: ['789'],
      tmsIds: ['TC-003'],
      component: 'RegistrationPage',
    });

    await registrationPage.navigate();

    await registrationPage.fillRegistrationForm({
      firstName: 'Jane',
      lastName: 'Doe',
      address: '706 Main St',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '411046',
      username: 'jane_doe',
      password: 'Pass123!',
    });

    await registrationPage.submitRegistration();
    await registrationPage.verifySuccessMessage();
  });
});

test.describe('Multi-Page Tests', () => {
  test('should work across multiple pages', async ({ homePage, registrationPage, pageActions }) => {
    // All fixtures available in one test
    await homePage.navigateToHome();
    await homePage.verifyLogoVisible();

    await registrationPage.navigate();
    await registrationPage.fillRegistrationForm({
      firstName: 'Jane',
      lastName: 'Smith',
      address: '123 Main St',
      city: 'Anytown',
      state: 'CA',
      zipCode: '12345',
      username: 'jane_smith',
      password: 'Pass123!',
    });

    // Access pageActions for advanced operations
    await pageActions.reloadPage();
  });
});

*/