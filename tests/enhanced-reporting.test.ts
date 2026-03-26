import { test, expect } from '@support/PageFixture';
import { AllureReporter } from '@helper/reporting/AllureReporter';
import { StepRunner } from '@helper/reporting/StepRunner';
import { Epic } from '@support/enums/allureReports/Epic';
import { Feature } from '@support/enums/allureReports/Feature';
import { Severity } from '@support/enums/allureReports/Severity';
import { TestOwners } from '@support/enums/allureReports/TestOwners';

const runFailureDemo = process.env.RUN_FAILURE_DEMOS === 'true';

test.describe('Enhanced Reporting Examples', () => {
  
  test('Example 1: Basic reporting with steps', { tag: ['@runLast', '@P4'] }, async ({ homePage }) => {
    // Attach metadata
    await AllureReporter.attachDetails(
      {
      epic: Epic.HOME_PAGE,
      feature: Feature.PAGE_LOAD,
      severity: Severity.CRITICAL,
      owner: TestOwners.USER_01,
      description: 'Verify that the home page loads correctly with all elements visible',
      tags: ['smoke', 'home'],
      issues: [{ id: '123', url: 'https://jiratool.com/issue/123' }, { id: '456', url: 'https://jiratool.com/issue/456' }],
      tmsIds: [{ id: 'TC-001', url: 'https://testmanagementtool.com/case/TC-001' }],
      component: 'HomePage',
    }
    );

    // Use steps for clear reporting
    await AllureReporter.step('Navigate to home page', async () => {
      await homePage.navigateToHome();
    });

    await AllureReporter.step('Verify logo is visible', async () => {
      await homePage.verifyLogoVisible();
    });

    await AllureReporter.step('Verify page title', async () => {
      await homePage.verifyTitle(/ParaBank/);
    });
  });

  test('Example 2: Using StepRunner', { tag: ['@runLast', '@P4'] }, async ({ homePage }) => {
    await AllureReporter.attachDetails({
      epic: Epic.UI_TESTING,
      feature: Feature.NAVIGATION,
      story: 'Demonstrate StepRunner usage',
      severity: Severity.MODERATE
    });

    // Using StepRunner
    await StepRunner.run('Navigate to home page', async () => {
      await homePage.navigateToHome();
    });

    await StepRunner.run('Verify logo is visible', async () => {
      await homePage.verifyLogoVisible();
    });
  });

  test('Example 3: Step groups and nested steps', { tag: ['@runLast', '@P4'] }, async ({ homePage }) => {
    await AllureReporter.attachDetails({
      epic: Epic.UI_TESTING,
      feature: Feature.HOME_PAGE,
      story: 'Demonstrate nested steps',
      severity: Severity.MODERATE
    });

    await StepRunner.group('Home Page Verification', async () => {
      await StepRunner.run('Navigate', async () => {
        await homePage.navigateToHome();
      });

      await StepRunner.run('Verify elements', async () => {
        await homePage.verifyLogoVisible();
      });
    });
  });

  test('Example 4: Custom attachments', { tag: ['@runLast', '@P4'] }, async ({ homePage, pageActions }) => {
    await AllureReporter.attachDetails({
      epic: Epic.UI_TESTING,
      feature: Feature.HOME_PAGE,
      story: 'Demonstrate custom attachments',
      severity: Severity.MODERATE,
      links: [{ id: 'Documentation', url: 'https://playwright.dev' }],
      issues: [{ id: 'JIRA-123', url: 'https://jiratool.com/issue/JIRA-123' }],
      tmsIds: [{ id: 'TC-001', url: 'https://testmanagementtool.com/case/TC-001' }],
    });

    await homePage.navigateToHome();

    // Attach custom data
    await AllureReporter.attachText('Test Data', 'Custom text content');
    
    await AllureReporter.attachJSON('Page Info', {
      url: await pageActions.getCurrentUrl(),
      title: await homePage.getCurrentTitle(),
      timestamp: new Date().toISOString(),
    });
  });

  test('Example 5: Sequential steps', { tag: ['@runLast', '@P4'] }, async ({ homePage }) => {
    await AllureReporter.attachDetails({
      epic: Epic.UI_TESTING,
      feature: Feature.HOME_PAGE,
      story: 'Demonstrate sequential step execution',
      severity: Severity.MODERATE
    });

    await StepRunner.runSequence([
      {
        name: 'Step 1: Navigate to home',
        action: async () => await homePage.navigateToHome(),
      },
      {
        name: 'Step 2: Verify logo',
        action: async () => await homePage.verifyLogoVisible(),
      },
      {
        name: 'Step 3: Verify title',
        action: async () => await homePage.verifyTitle(/ParaBank/),
      },
    ]);
  });

  test.skip(
    !runFailureDemo,
    'Set RUN_FAILURE_DEMOS=true to execute the intentional failure example.'
  );

  test('Example 6: Intentional failure to show auto-capture', { tag: ['@runLast', '@P4'] }, async ({ homePage }) => {
    await AllureReporter.attachDetails({
      epic: Epic.UI_TESTING,
      feature: Feature.HOME_PAGE,
      story: 'This test fails intentionally to demonstrate auto-screenshot',
      severity: Severity.MINOR
    });

    await homePage.navigateToHome();
    
    // This will fail and trigger auto-screenshot
    expect(homePage.getCurrentUrl()).toContain('this-will-fail');
  });
});
