import { test, expect } from '@support/PageFixture';

/**
 * Verification Tests
 * 
 * RUN WITH: npx playwright test tests/phase1-verification.test.ts --workers=4
 * 
 * EXPECTED: All tests should pass, even in parallel
 */

test.describe('Phase 1: Parallel Execution Verification', () => {
  
  test('Test 1: Should have isolated pageActions', async ({ pageActions }) => {
    const page = pageActions.getPage();
    const url1 = 'https://example.com';
    
    await pageActions.gotoURL(url1, 'Test 1 Page');
    
    // Verify this test's page has the correct URL
    expect(page.url()).toBe(url1 + '/');
  });

  test('Test 2: Should have different pageActions instance', async ({ pageActions }) => {
    const page = pageActions.getPage();
    const url2 = 'https://playwright.dev';
    
    await pageActions.gotoURL(url2, 'Test 2 Page');
    
    // This should NOT have Test 1's URL
    expect(page.url()).not.toContain('example.com');
    expect(page.url()).toContain('playwright.dev');
  });

  test('Test 3: Concurrent test - Example.com', async ({ pageActions }) => {
    await pageActions.gotoURL('https://example.com', 'Test 3');
    const url = await pageActions.getCurrentUrl();
    expect(url).toContain('example.com');
  });

  test('Test 4: Concurrent test - Playwright', async ({ pageActions }) => {
    await pageActions.gotoURL('https://playwright.dev', 'Test 4');
    const url = await pageActions.getCurrentUrl();
    expect(url).toContain('playwright.dev');
  });

  test('Test 5: Concurrent test - GitHub', async ({ pageActions }) => {
    await pageActions.gotoURL('https://github.com', 'Test 5');
    const url = await pageActions.getCurrentUrl();
    expect(url).toContain('github.com');
  });
});

test.describe('Phase 1: Fixture Injection Verification', () => {
  
  test('Should inject pageActions fixture', async ({ pageActions }) => {
    expect(pageActions).toBeDefined();
    expect(pageActions.getPage()).toBeDefined();
    expect(pageActions.getContext()).toBeDefined();
  });

  test('Should inject homePage fixture', async ({ loginPage }) => {
    expect(loginPage).toBeDefined();
    // LoginPage should have BasePage methods
    expect(typeof loginPage.navigate).toBe('function');
  });

  test('Should inject multiple fixtures', async ({ pageActions, loginPage, registrationPage }) => {
    expect(pageActions).toBeDefined();
    expect(loginPage).toBeDefined();
    expect(registrationPage).toBeDefined();
  });
});

test.describe('Phase 1: BasePage Inheritance Verification', () => {
  
  test('HomePage should inherit BasePage methods', async ({ loginPage }) => {
    // Verify BasePage methods are available
    expect(typeof loginPage.navigate).toBe('function');
    expect(typeof loginPage.waitForPageLoad).toBe('function');
    expect(typeof loginPage.reload).toBe('function');
    expect(typeof loginPage.getCurrentUrl).toBe('function');
  });

  test('RegistrationPage should inherit BasePage methods', async ({ registrationPage }) => {
    expect(typeof registrationPage.navigate).toBe('function');
    expect(typeof registrationPage.waitForPageLoad).toBe('function');
  });
});