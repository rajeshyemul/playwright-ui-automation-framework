# Playwright + TypeScript Automation Framework

![Playwright](https://img.shields.io/badge/Playwright-v1.57-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![License](https://img.shields.io/badge/license-MIT-green)

This repository is a structured Playwright + TypeScript UI automation framework for ParaBank-style web journeys.

It is built around:

- Playwright test execution
- Page Object Model design
- fixture-based dependency injection
- reusable helper layers for actions, assertions, waits, logging, and reporting
- Allure, HTML, JSON, and JUnit reporting
- CI and pre-commit quality gates

## Read This First

For a complete explanation of how the framework works internally, read:

- [Framework Architecture Guide](../playwright-typescript-ui-framework/docs/framework-architecture.md)

Use this `README.md` for setup, daily usage, and repository navigation.

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Java runtime for Allure report generation

### Installation

```bash
git clone https://github.com/rajeshyemul/playwright-ui-automation-framework
cd playwright-ui-automation-framework
npm install
cp .env.example .env
npx playwright install
```

### Recommended First Run

Run the framework verification subset first. It is the safest way to confirm the local setup before running broader business suites.

```bash
npm run test:framework
```

### Run the Main Suites

```bash
# Smallest business confidence suite
npm run test:smoke

# Broader functional suite
npm run test:regression

# End-to-end user journeys
npm run test:integration

# Full suite
npm test
```

### View Reports

```bash
npm run report:html
npm run report:allure
```

The Allure CLI is installed as a project dependency, so no separate global Allure installation is required.

## Daily Commands

```bash
# Run the full suite
npm test

# Run only smoke tests
npm run test:smoke

# Run only regression tests
npm run test:regression

# Run only e2e tests
npm run test:integration

# Run framework verification tests
npm run test:framework

# Run in headed mode
npm run test:headed

# Run in debug mode
npm run test:debug

# Type-check the repository
npm run type-check

# Lint the repository
npm run lint

# Run the standard quality gate
npm run validate

# Format the repository
npm run format

# Open the latest Playwright HTML report
npm run report:html

# Generate and open the latest Allure report
npm run report:allure
```

## Framework Usage Model

The intended usage pattern is:

- tests orchestrate business workflows
- fixtures provide typed dependencies
- page objects implement page-specific behavior
- helper classes implement reusable low-level mechanics
- reporting and logging run automatically through framework hooks

For business suites, prefer:

- importing `test` from `@support/PageFixture`
- page-object methods over raw `page` usage
- helper utilities over duplicated wait/assert logic

Framework verification tests may intentionally use lower-level APIs when validating fixture wiring or isolation behavior.

## Runtime Flow

At a high level:

1. `playwright.config.ts` loads environment and reporting configuration.
2. Tests import `test` from `@support/PageFixture`.
3. `PageFixture.ts` imports `@config/PageSetup` and extends Playwright fixtures.
4. `PageSetup.ts` registers lifecycle hooks for logging and failure artifact capture.
5. Tests receive page objects such as `homePage`, `loginPage`, and `registrationPage`.
6. Page objects use helper layers for actions, waits, assertions, and reporting.
7. Reports are written to timestamped folders under `reports/`.

The detailed flow is documented in the architecture guide.

## Repository Structure

```text
playwright-ui-automation-framework/
├── .github/
│   └── workflows/
│       └── ci.yml                    # CI quality gates
├── .husky/
│   └── pre-commit                    # Pre-commit enforcement
├── docs/
│   └── framework-architecture.md     # Full framework handbook
├── src/
│   ├── config/                       # Runtime config and lifecycle hooks
│   ├── helper/                       # Actions, waits, asserts, logging, reporting
│   ├── pages/                        # Page objects and domain workflows
│   ├── support/                      # Fixtures, locators, constants, enums, test data
│   └── utils/                        # Reusable non-UI utilities
├── tests/
│   ├── smoke/                        # Minimum confidence suite
│   ├── regression/                   # Broader functional coverage
│   ├── e2e/                          # End-to-end user journeys
│   ├── manual-test-cases/            # Manual test references
│   ├── enhanced-reporting.test.ts    # Reporting usage examples
│   └── verifications.test.ts         # Framework verification suite
├── .env.example                      # Sample local runtime configuration
├── eslint.config.mjs                 # ESLint flat config
├── package.json                      # Scripts, dependencies, lint-staged
├── playwright.config.ts              # Playwright runtime configuration
├── README.md                         # Setup and usage guide
└── tsconfig.json                     # TypeScript config and path aliases
```

## Reporting

Each run writes artifacts under a timestamped folder in `reports/`.

Typical outputs include:

- Playwright HTML report
- JUnit report
- JSON report
- Allure results
- screenshots, videos, traces, and failure attachments
- run-specific framework log files

## Environment Configuration

Common runtime controls live in a local `.env` file based on `.env.example`.

Important values:

- `BROWSER=chromium|firefox|webkit`
- `ENVIRONMENT=DEV|QA|STAGE|PROD`
- `HEADLESS=true|false`
- `RETRIES=0|1|2`
- `WORKERS=2`
- `BASE_URL=https://...`
- `CI=true|false`
- `CI_WORKERS=1`
- `LOG_LEVEL=info|debug|warn|error`

If `BASE_URL` is not set, the framework falls back to the configured environment-specific URL and then to the default ParaBank URL.

Sample `.env.example`:

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

## Quality Gates

The repository now includes both local and remote enforcement.

### Local

- Husky pre-commit hook runs `lint-staged`
- staged code files run through ESLint fix
- staged docs/config files run through Prettier

### CI

GitHub Actions runs:

- dependency installation
- Playwright browser installation
- type-check
- lint
- framework verification tests
- `npm pack --dry-run`

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

## Current Conventions

- Prefer importing `test` from `@support/PageFixture`
- Prefer page-object methods over raw `page` usage in business suites
- Keep selectors in locator files where practical
- Keep reusable waits in `WaitUtils`
- Use logger/reporting helpers instead of ad hoc console output
- Keep business flow in tests and low-level mechanics in helper layers

## Next Reference

If you are trying to understand:

- how `PageSetup` works
- how `PageFixture` injects dependencies
- why the framework uses these helper layers
- what each file does
- what happens if a layer is bypassed

read:

- [Framework Architecture Guide](../playwright-typescript-ui-framework/docs/framework-architecture.md)
