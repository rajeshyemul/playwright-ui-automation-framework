import { test as baseTest } from '@playwright/test';
import { PageActions } from '../helper/actions/PageActions';
import { Logger } from '../helper/logger/Logger';
import { LoginPage } from '@pages/loginPage';
import { RegistrationPage } from '@pages/registrationPage';
import { HomePage } from '@pages/homePage';

/**
 * Custom Fixtures for Dependency Injection
 *
 * WHY FIXTURES?
 * - Automatic setup/teardown per test
 * - Dependency injection pattern
 * - Type-safe test parameters
 * - Reusable across all tests
 *
 * AVAILABLE FIXTURES:
 * - pageActions: Core page/context management
 * - loginPage: LoginPage instance (auto-initialized)
 * - registrationPage: RegistrationPage instance (auto-initialized)
 *
 * USAGE IN TESTS:
 * test('my test', async ({ pageActions, loginPage }) => {
 *   await loginPage.navigate();
 *   // pageActions and loginPage are automatically provided
 * });
 */

type CustomFixtures = {
  pageActions: PageActions;
  loginPage: LoginPage;
  registrationPage: RegistrationPage;
  homePage: HomePage;
};

export const test = baseTest.extend<CustomFixtures>({
  /**
   * pageActions Fixture
   *
   * LIFECYCLE:
   * 1. Test starts
   * 2. Playwright creates new page & context
   * 3. PageActions instance created with page & context
   * 4. Test runs with pageActions
   * 5. Test ends
   * 6. Playwright automatically closes page & context
   *
   * BENEFITS:
   * - Fresh instance per test
   * - Automatic cleanup
   * - No manual page/context management
   */
  pageActions: async ({ page, context }, use) => {
    Logger.info('Creating PageActions instance for test');

    // Create instance-based PageActions
    const pageActions = new PageActions(page, context);

    // Provide to test
    await use(pageActions);

    // Cleanup (Playwright handles page/context closure)
    Logger.info('PageActions fixture cleanup complete');
  },

  /**
   * homePage Fixture
   *
   * DEPENDS ON: pageActions
   *
   * BENEFITS:
   * - HomePage auto-initialized with pageActions
   * - No need to create HomePage in every test
   * - Type-safe access to page methods
   *
   * USAGE:
   * test('test', async ({ homePage }) => {
   *   await homePage.navigate();
   *   await homePage.verifyLogoVisible();
   * });
   */

  homePage: async ({ pageActions }, use) => {
    Logger.info('Creating HomePage instance');

    const homePage = new HomePage(pageActions);

    await use(homePage);

    Logger.info('HomePage fixture cleanup complete');
  },

  /**
   * loginPage Fixture
   * Depends on pageActions and provides a ready-to-use LoginPage instance to tests.
   * Benefits:
   * - Automatic initialization with pageActions
   * - No need to create LoginPage in every test
   * - Type-safe access to login page methods
   * Usage in tests:
   * test('test', async ({ loginPage }) => {
   *   await loginPage.navigate();
   *   await loginPage.login('user', 'pass');
   * });
   */
  loginPage: async ({ pageActions }, use) => {
    Logger.info('Creating LoginPage instance');

    const loginPage = new LoginPage(pageActions);

    await use(loginPage);

    Logger.info('LoginPage fixture cleanup complete');
  },

  /**
   * registrationPage Fixture
   *
   * DEPENDS ON: pageActions
   *
   * BENEFITS:
   * - RegistrationPage auto-initialized
   * - Consistent initialization across tests
   */
  registrationPage: async ({ pageActions }, use) => {
    Logger.info('Creating RegistrationPage instance');

    const registrationPage = new RegistrationPage(pageActions);

    await use(registrationPage);

    Logger.info('RegistrationPage fixture cleanup complete');
  },
});

// Re-export expect for convenience
export { expect } from '@playwright/test';
