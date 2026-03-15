# Playwright + TypeScript Automation Framework

![Playwright](https://img.shields.io/badge/Playwright-v1.45-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![License](https://img.shields.io/badge/license-MIT-green)

This repository is a structured Playwright framework for UI automation around ParaBank-style flows.

It separates:
- business flows in `tests/`
- reusable interaction and assertion logic in `src/helper/`
- domain behavior in `src/pages/`
- runtime configuration and reporting in `src/config/` and `src/helper/reporting/`

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
git clone https://github.com/rajeshyemul/playwright-ui-automation-framework
cd playwright-ui-automation-framework
npm install
npx playwright install
```

### Run Your First Test

```bash
npm test
```

### View Reports

```bash
npm run report:html
npm run report:allure
```

## Design Goals

- Keep test specs focused on business intent
- Centralize selectors, waits, and assertions in page objects and helpers
- Provide repeatable reporting and artifact capture
- Keep framework concerns separate from test scenarios

## Current Architecture

```text
tests/
  smoke/
  regression/
  e2e/
  verifications.test.ts

src/
  config/
    ConfigManager.ts
    PageSetup.ts
  helper/
    actions/
    asserts/
    logger/
    reporting/
    waits/
  pages/
  support/
```

## Project Structure

```text
playwright-ui-automation-framework/
├── tests/                 # Business suites and framework verification tests
│   ├── smoke/             # Minimum viable health checks
│   ├── regression/        # Broader functional coverage
│   ├── e2e/               # End-to-end business workflows
│   └── verifications.test.ts
├── src/
│   ├── config/            # Runtime config and lifecycle hooks
│   ├── helper/            # Actions, waits, asserts, logging, reporting
│   ├── pages/             # Page objects and domain workflows
│   └── support/           # Constants, locators, fixtures, enums, test data
├── reports/               # Timestamped execution outputs
├── playwright.config.ts   # Playwright runtime configuration
├── package.json           # Scripts and dependencies
└── .env                   # Local runtime configuration
```

### Runtime Flow

- `playwright.config.ts` builds the Playwright runtime configuration
- `@support/PageFixture` provides the test fixtures
- `@config/PageSetup` is imported by `PageFixture` and registers lifecycle hooks
- page objects use action/wait/assert helpers instead of embedding low-level logic in specs

## Practical Boundaries

For the main business suites (`smoke`, `regression`, `e2e`), the intended pattern is:
- tests orchestrate business flow
- page objects perform UI actions
- page objects perform validations using helper utilities
- waits live in `WaitUtils`

There are still a few framework-verification tests, such as [verifications.test.ts](/Users/rajesh.yemul/Desktop/playwright-typescript-ui-framework/tests/verifications.test.ts), that intentionally use lower-level APIs to validate fixture wiring and isolation. Those are framework checks, not examples of preferred business-test style.

## Reporting

Each run writes artifacts under a timestamped folder in `reports/`.

Typical outputs include:
- Playwright HTML report
- JUnit report
- JSON report
- Allure results
- screenshots, videos, traces, and failure attachments

## Commands

```bash
# Run all tests
npm run test

# Run smoke suite
npm run test:smoke

# Run regression suite
npm run test:regression

# Run end-to-end suite
npm run test:integration

# Run tests headed
npm run test:headed

# Run tests in debug mode
npm run test:debug

# Generate/open latest Playwright HTML report
npm run report:html

# Generate and open latest Allure report
npm run report:allure
```

## Example Test

```typescript
import { test } from '@support/PageFixture';
import { AllureReporter } from '@helper/reporting/AllureReporter';

test('should verify home page', async ({ homePage }) => {
  await AllureReporter.attachDetails({
    epic: 'Smoke Tests',
    feature: 'Home Page',
    story: 'Verify the home page is available',
    severity: 'critical',
  });

  await homePage.navigateToHome();
  await homePage.verifyPageLoaded();
  await homePage.verifyLogoVisible();
  await homePage.verifyLoginFormVisible();
});
```

## Environment Configuration

Common runtime controls live in `.env`.

Examples:
- `BROWSER=chromium|firefox|webkit`
- `ENVIRONMENT=DEV|QA|STAGE|PROD`
- `HEADLESS=true|false`
- `RETRIES=0|1|2`
- `WORKERS=2`
- `BASE_URL=https://...`

If `BASE_URL` is not set, the framework will fall back to an environment-specific URL if configured, and then to the default ParaBank URL.

Sample `.env`:

```bash
BROWSER=chromium
ENVIRONMENT=QA
LOG_LEVEL=info
RETRIES=1
WORKERS=
BASE_URL=
# DEV_BASE_URL=
# QA_BASE_URL=
# STAGE_BASE_URL=
# PROD_BASE_URL=

CI=false
CI_WORKERS=1
HEADLESS=false
PROJECT=
VIDEO_CI=true
```

## Current Conventions

- Prefer importing `test` from `@support/PageFixture`
- Prefer page-object methods over raw `page` usage in business suites
- Keep selectors in locator files where practical
- Keep reusable waits in `WaitUtils`
- Use logger/reporting helpers instead of ad hoc console output

## Current Limitations

- The project still contains some framework-verification and exploratory files that are not part of the preferred business-test style
- `CustomReporterConfig.ts` exists in the repo but is not part of the active Playwright reporter configuration
- The framework is currently tuned around the ParaBank app structure and selectors

## Next Areas to Improve

- consolidate remaining duplicate/stale sample files
- tighten fixture coverage for more page objects
- continue reducing direct low-level usage outside framework-verification tests
- improve authenticated page validation and data setup strategy
