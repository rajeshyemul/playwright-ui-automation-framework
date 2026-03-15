# Framework Architecture Guide

## Audience

This document is written for engineers who already know the basics of UI automation and TypeScript, but who need to understand this repository deeply enough to extend it safely, review changes confidently, and debug failures without guessing.

The goal is not only to say "what is in the repo", but also:

- why each module exists
- how the runtime flow works end to end
- what design patterns the framework follows
- what breaks if a layer is removed or bypassed
- how to add new pages, helpers, and tests correctly

This is intentionally detailed.

---

## 1. What This Framework Is

This repository is a Playwright + TypeScript UI automation framework built around ParaBank-style web journeys.

At a high level it provides:

- Playwright test execution and browser lifecycle
- Type-safe fixtures for page objects
- Page Object Model structure for business flows
- Reusable helper layers for actions, assertions, waits, and reporting
- Centralized runtime configuration
- Allure, HTML, JSON, and JUnit reporting
- Logging and failure artifact capture
- CI and pre-commit quality gates

This is not just a folder of Playwright specs. It is a layered framework.

---

## 2. Architectural Goals

The framework is designed around these principles:

1. Keep test specs business-readable.
2. Prevent direct low-level Playwright code from spreading across tests.
3. Centralize repeated behavior such as waits, error handling, and reporting.
4. Make each test independent and safe for parallel execution.
5. Generate enough runtime evidence to debug failures without rerunning blindly.

If those principles are ignored, a UI framework usually degrades into:

- duplicated selectors
- inconsistent waits
- flaky tests
- unreadable specs
- poor failure diagnostics
- unsafe parallel execution

---

## 3. High-Level Layering

The framework follows a layered structure:

```text
Tests
  -> Fixtures
    -> Page Objects
      -> Helper Layers
        -> Playwright Page / Context
          -> Browser

Cross-cutting layers:
  - Config
  - Logging
  - Reporting
  - Test data
  - CI / Husky enforcement
```

### Practical meaning of each layer

- `tests/` describes business intent.
- `src/support/PageFixture.ts` provides test dependencies.
- `src/pages/` models pages and domain flows.
- `src/helper/` encapsulates low-level interactions and reusable behavior.
- `src/config/` controls lifecycle and environment behavior.
- `src/support/` stores constants, locators, enums, and test data.
- `src/utils/` contains reusable non-UI utilities.

---

## 4. End-to-End Runtime Flow

This is the most important section to understand.

### 4.1 What happens when you run `npm test`

1. `package.json` runs `npx playwright test`.
2. Playwright loads `playwright.config.ts`.
3. `playwright.config.ts` loads `.env`, resolves browser/environment/headless mode, creates a timestamped report directory, and configures reporters.
4. Playwright discovers test files under `tests/`.
5. Business test files import `test` from `@support/PageFixture`.
6. `PageFixture.ts` imports `@config/PageSetup` as a side effect.
7. Importing `PageSetup.ts` registers the global `beforeAll`, `beforeEach`, `afterEach`, and `afterAll` hooks.
8. `PageFixture.ts` extends the base Playwright test object and injects fixtures such as `pageActions`, `homePage`, `loginPage`, and `registrationPage`.
9. During test execution, each test gets its own Playwright `page` and `context`, plus a fresh `PageActions` instance and fresh page-object instances.
10. Test code calls high-level page methods such as `registrationPage.registerAndVerifySuccess()`.
11. Page methods call helper layers such as `EditBoxActions`, `WaitUtils`, and `ExpectUtils`.
12. Logging and step reporting happen while the test runs.
13. If a test fails, `PageSetup.afterEach` captures screenshot, HTML, URL, title, errors, and video.
14. Reporters write HTML, JUnit, JSON, and Allure outputs under the timestamped `reports/<timestamp>/` directory.

### 4.2 Why this flow matters

If this chain is preserved, the framework remains:

- readable
- debuggable
- reusable
- parallel-safe

If this chain is bypassed, common issues appear:

- tests become tightly coupled to raw selectors
- page objects become inconsistent
- hooks stop firing
- failure artifacts disappear
- reports lose useful metadata

---

## 5. Core Design Patterns Used

This framework is not built on a single pattern. It uses several patterns together.

### 5.1 Page Object Model

Primary location:

- `src/pages/`

What it does:

- models each page as a class
- keeps selectors and page behavior away from specs
- exposes business methods instead of raw UI steps

Example:

- `registrationPage.registerAndVerifySuccess(userData)`
- `loginPage.loginAndVerify(username, password)`

Why it matters:

- improves maintainability
- reduces selector duplication
- keeps tests readable

If not implemented:

- selectors would be duplicated across tests
- UI changes would require widespread spec edits
- tests would become procedural and harder to review

### 5.2 Fixture-Based Dependency Injection

Primary location:

- `src/support/PageFixture.ts`

What it does:

- injects `pageActions` and page objects into each test
- ensures every test gets clean instances

Why it matters:

- prevents shared state
- avoids manual object construction in every spec
- improves typing and reuse

If not implemented:

- tests would manually create page objects
- setup code would be duplicated
- parallel isolation would become harder to reason about

### 5.3 Layered Helper Abstraction

Primary location:

- `src/helper/actions/`
- `src/helper/asserts/`
- `src/helper/waits/`

What it does:

- breaks low-level concerns into small focused modules
- page objects orchestrate these helpers instead of containing raw Playwright code everywhere

Why it matters:

- improves reuse
- improves consistency
- reduces copy/paste interaction logic

If not implemented:

- each page object would reinvent fill, wait, assert, dropdown, checkbox, and retry logic

### 5.4 Factory Pattern

Primary location:

- `src/helper/actions/LocatorFactory.ts`

What it does:

- accepts either `PageActions` or `Page`
- produces locators using a single utility interface

Why it matters:

- reduces locator construction duplication
- supports consistent helper APIs

If not implemented:

- helper classes would each resolve locators differently
- page/action APIs would become inconsistent

### 5.5 Template Method / Base Class Pattern

Primary location:

- `src/pages/base/BasePage.ts`

What it does:

- defines shared page behavior
- requires each page to provide `pageUrl`, `pageTitle`, and `pageReadySelector`
- centralizes navigation, title validation, logout, and helper exposure

Why it matters:

- keeps page objects consistent
- reduces repeated setup logic

If not implemented:

- every page class would duplicate boilerplate for navigation and validation
- pages would drift into different styles

### 5.6 Utility Static Class Pattern

Primary location:

- `ConfigManager`
- `Logger`
- `GenerateReports`
- `TestDataProvider`

What it does:

- centralizes stateless framework services

Why it matters:

- avoids unnecessary object creation
- keeps access patterns simple

If not implemented:

- common configuration and utility behavior would scatter across the repo

---

## 6. Deep Dive: `PageSetup` and `PageFixture`

This is the core bootstrap pair of the framework.

## 6.1 `PageFixture.ts`

Purpose:

- extends Playwright's `test`
- injects page-object dependencies
- gives tests a clean, typed interface

Key idea:

```ts
import { test } from '@support/PageFixture';
```

That single import gives a test:

- Playwright's test runner behavior
- global lifecycle hooks from `PageSetup`
- typed fixtures like `homePage`, `loginPage`, `registrationPage`, and `accountOverviewPage`

### How it works

`PageFixture.ts` does two important things:

1. Imports `@config/PageSetup` for side-effect registration.
2. Calls `baseTest.extend<CustomFixtures>()` to register fixture factories.

### Why the `import '@config/PageSetup';` line is important

This line does not import a value that is directly referenced later. Its purpose is side effect:

- `PageSetup.ts` executes immediately when the module is loaded.
- During module execution, it registers Playwright hooks on the base `test`.

If this import did not exist:

- global hooks would not be registered
- no standard pre-test logging would happen
- failure attachments would not be captured automatically
- the framework would still run, but with weaker observability

## 6.2 `PageSetup.ts`

Purpose:

- global lifecycle control
- logging at suite and test level
- failure artifact capture

### Registered hooks

- `beforeAll`
  - logs suite start
  - logs environment information
- `beforeEach`
  - logs test start
  - sets timeout
  - records browser info
  - listens for browser console warnings/errors
- `afterEach`
  - logs result and duration
  - captures screenshot, HTML, URL, title, errors, and video on failure
- `afterAll`
  - logs suite completion

### Why `PageSetup` exists separately from `PageFixture`

This separation is deliberate.

- `PageFixture` focuses on dependency creation.
- `PageSetup` focuses on lifecycle behavior.

If both were mixed heavily into one file:

- responsibilities would blur
- the fixture file would become too large
- lifecycle debugging would be harder

## 6.3 Lifecycle sequence for one test

```text
Test file imports @support/PageFixture
  -> PageSetup hooks register
  -> Playwright starts test
  -> beforeEach runs
  -> page/context created by Playwright
  -> pageActions fixture created
  -> page object fixtures created
  -> test body executes
  -> afterEach runs
  -> failure artifacts attach if needed
  -> Playwright closes page/context
```

### Why this matters for parallel execution

Each test gets:

- its own `page`
- its own `context`
- its own `PageActions`
- its own page-object instances

That is the reason the framework can scale safely across workers.

If `PageActions` or page objects were global singletons:

- one test could overwrite another test's page
- page-closed errors would become common
- parallel execution would be unreliable

---

## 7. Main Functional Layers

## 7.1 Configuration Layer

### `playwright.config.ts`

Responsibilities:

- loads environment variables
- chooses browser/device
- configures retries/workers
- configures base URL and artifact behavior
- creates timestamped report root
- registers built-in and Allure reporters

Important behavior:

- `REPORT_ROOT` is generated once per run and exposed via environment variable
- all artifacts for a run stay grouped under one timestamp

If this file were too simple or missing:

- reports would mix between runs
- environment handling would be inconsistent
- CI and local execution would behave differently

### `src/config/ConfigManager.ts`

Responsibilities:

- interpret `ENVIRONMENT`
- resolve `BASE_URL`
- normalize trailing slashes
- choose browser
- determine headless mode

If missing:

- environment handling would be duplicated in several places
- configuration bugs would spread easily

---

## 7.2 Page Layer

### `src/pages/base/BasePage.ts`

This is the base contract for page objects.

It provides:

- helper initialization
- `navigate()`
- `verifyPageLoaded()`
- `reload()`
- `logout()`
- `getCurrentUrl()`
- `getCurrentTitle()`
- helper access through protected properties

Important design choice:

- page objects inherit common behavior
- helper classes are composed inside the base page

That means the framework uses both inheritance and composition.

### Concrete page objects

- `homePage.ts`
  - home landing page checks
- `loginPage.ts`
  - login flow and login error validation
- `registrationPage.ts`
  - registration form, success/failure detection, required-field validation
- `accountOverviewPage.ts`
  - account portfolio inspection and transaction history access
- `transferFundsPage.ts`
  - transfer flow and transfer result detection
- `billPayPage.ts`
  - bill payment flow and mismatch/error handling
- `updateProfilePage.ts`
  - update contact information and verify persistence

Why page objects matter here:

- tests stay focused on workflow intent
- page-specific selectors stay local to their domain
- helper methods stay reusable

---

## 7.3 Action Layer

### `PageActions`

This is the most important low-level wrapper around Playwright page/context.

It manages:

- page access
- context access
- navigation
- new page handling
- window switching
- iframe switching
- reload/back/forward
- session cleanup

This class exists to prevent raw page/context handling from spreading across the repo.

If tests manipulated Playwright pages directly everywhere:

- page ownership would become unclear
- multi-page handling would be inconsistent
- lifecycle bugs would increase

### `UIActions`

Purpose:

- simple interactions with built-in `test.step()` logging

Best used for:

- click
- fill
- reload
- select option
- press key

### `UIElementActions`

Purpose:

- more advanced element behaviors

Includes:

- click with retry
- drag and drop
- hover
- visibility checks
- scroll into view
- force click
- text extraction

### `EditBoxActions`

Purpose:

- focused wrapper for text/input behavior

Includes:

- fill
- type
- clear
- upload file
- fill and verify
- append text

### `CheckboxActions`

Purpose:

- explicit checkbox state handling

Includes:

- check
- uncheck
- toggle
- wait for checked state

### `DropDownActions`

Purpose:

- select/dropdown handling

Includes:

- select by value/label/index
- multi-select
- get selected text/value
- retrieve option lists

### `LocatorFactory`

Purpose:

- unify how locators are created across helpers

Special value:

- helper methods can accept either selector strings or existing locators

Without this action layer:

- page objects would become bloated
- low-level UI logic would be duplicated
- page objects would stop representing business behavior cleanly

---

## 7.4 Wait and Assertion Layers

### `WaitUtils`

Purpose:

- central waiting rules

Provides:

- wait for visible/hidden/attached
- wait for navigation/load/page-ready
- wait for count/value/text/function

Why it matters:

- wait behavior is a major source of UI test flakiness
- centralizing waits gives one place to tune or troubleshoot synchronization

If every page invented its own waits:

- timeouts would become inconsistent
- flaky tests would be harder to diagnose

### `ExpectUtils`

Purpose:

- higher-level Playwright expect wrappers
- error-message normalization
- soft-assert support
- step logging

It is especially useful because it combines:

- locator resolution
- configured expect instance
- meaningful description
- framework-level error logging

### `AssertUtils`

Purpose:

- generic assertions beyond locator/page-specific Playwright expectations

Examples:

- equality
- not null
- contains
- numeric comparisons
- empty checks

This gives the framework a reusable assertion library for business-level validation.

---

## 7.5 Reporting and Observability Layer

### `Logger`

Purpose:

- console + file logging through Winston

Key behavior:

- writes to console
- writes to run-specific log file under `REPORT_ROOT/logFiles`
- supports structured timestamps and levels

If missing:

- test diagnosis would rely only on Playwright output
- business-level logging would be inconsistent

### `StepRunner`

Purpose:

- standard step execution wrapper

Benefits:

- consistent step names
- duration logging
- retry wrapper
- grouping/nesting
- optional screenshots for steps

If teams use raw `test.step()` inconsistently instead:

- report quality drops
- error handling becomes uneven

### `AllureMeta`

Purpose:

- type describing Allure metadata payload

This is small but important because it gives a clear contract for metadata attachment.

### `AllureReporter`

Purpose:

- helper wrapper over Playwright test info and Allure annotations/attachments

Handles:

- metadata
- screenshots
- videos
- text/JSON/HTML/CSV attachments
- custom links/issues/TMS data

Important implementation note:

- metadata is attached through annotations because label APIs are limited in the current usage pattern

### `GenerateReports`

Purpose:

- open HTML report from latest run
- generate/open Allure report from latest run
- fix invalid `JAVA_HOME` when possible before invoking Allure

Without this utility:

- engineers would need to manually locate report folders
- report opening would be error-prone

### `CustomReporterConfig`

Purpose:

- custom Playwright reporter implementation for summary parsing and cleanup

Important note:

- this class exists, but it is not currently registered in `playwright.config.ts`

That makes it an extension point rather than an active runtime component today.

If you want to use it, you would add it to the reporter list.

---

## 7.6 Support and Test Data Layer

### Constants

- `urlConstants.ts`
  - page route definitions and default base URL
- `HomePageConstants.ts`
  - readable names/error messages specific to home page validation
- `SetupConstants.ts`
  - framework-level constants such as timeouts and reporter keywords
- `PathConstants.ts`
  - output/report folder names

Why constants matter:

- reduce string duplication
- make config changes safer
- keep business methods readable

### Locators

- `HomePageLocators.ts`
- `RegistrationPageLocators.ts`
- `BankingPageLocators.ts`

Why locator files matter:

- selector maintenance stays isolated
- page objects remain cleaner

If locators were embedded directly everywhere:

- selectors would be duplicated
- locator changes would become expensive

### Enums

- browser/environment/result enums support type-safe configuration
- Allure enums standardize metadata vocabulary

### TestDataProvider

Purpose:

- central source of user, transfer, and bill-pay test payloads
- dynamic username generation
- reusable scenario-specific data

Current note:

- the repo now uses Indian-style sample data for generated users and suite overrides

### `DataProvider.ts`

Purpose:

- minimal username generator utility

Current state:

- present as a lightweight extension/helper
- not the primary data mechanism anymore because `TestDataProvider` is more complete

---

## 8. Test Suite Strategy

The test suites are intentionally separated by confidence level and business scope.

### Smoke

File:

- `tests/smoke/smoke-tests.spec.ts`

Goal:

- fast confidence that core flows are alive

Characteristics:

- serial mode to reduce noise against the shared public app
- small set of meaningful checks

### Regression

File:

- `tests/regression/regression-tests.spec.ts`

Goal:

- broader functional coverage

Characteristics:

- validation-heavy
- covers login, registration, transfer, bill pay, and account history behavior

### End-to-End

File:

- `tests/e2e/e2e-tests.spec.ts`

Goal:

- realistic multi-step business journeys

Characteristics:

- registration + login
- account management
- funds transfer
- bill payment
- longer customer session flows

### Verification

File:

- `tests/verifications.test.ts`

Goal:

- validate framework mechanics rather than business functionality

These tests intentionally verify:

- fixture injection
- page isolation
- BasePage inheritance

### Enhanced Reporting Examples

File:

- `tests/enhanced-reporting.test.ts`

Goal:

- demonstrate Allure and step-reporting usage patterns

Important note:

- the intentional failure example is now opt-in via `RUN_FAILURE_DEMOS=true`

Without this separation of suite purpose:

- every test run would be a messy mix of smoke, experimentation, and infrastructure verification

---

## 9. Step-by-Step Example of One Real Flow

Use this mental model when reading the framework.

### Example: `TC-SMK-003` in smoke suite

1. The spec imports `test` from `@support/PageFixture`.
2. Fixtures expose `registrationPage`, `loginPage`, `homePage`, and `accountOverviewPage`.
3. The test attaches Allure metadata.
4. The test uses `test.step()` to group business stages.
5. `registrationPage.navigateToRegistration()` calls `PageActions.gotoURL()`, `WaitUtils.waitForPageLoad()`, and `WaitUtils.waitForPageReady()`.
6. `registrationPage.registerAndVerifySuccess(smokeUser)` calls:
   - `fillRegistrationForm()`
   - `submitRegistration()`
   - `verifySuccessMessage()`
7. Filling the form uses `EditBoxActions.fill()` against selectors from `RegistrationPageLocators`.
8. Submission uses `UIActions.click()`.
9. Success verification combines URL, heading text, panel message, and account-table visibility.
10. If a failure happens anywhere, `PageSetup.afterEach` captures artifacts automatically.
11. The test logs out and logs back in using the same fixture-driven flow.

Why this is a good example:

- shows fixture injection
- shows page-object orchestration
- shows helper reuse
- shows reporting integration

---

## 10. How To Add a New Page Correctly

### Step 1

Create or extend locators in `src/support/locators/`.

### Step 2

Create a page object under `src/pages/` that extends `BasePage`.

Required properties:

- `pageUrl`
- `pageTitle`
- `pageReadySelector`

### Step 3

Implement business methods using helpers, not raw Playwright everywhere.

Preferred style:

```ts
public async performAction(): Promise<void> {
  await StepRunner.run('Feature - perform action', async () => {
    await this.editBoxActions.fill('selector', 'value');
    await this.uiActions.click('button', 'Submit button');
    await this.expectUtils.expectElementToBeVisible(
      'result',
      'result message',
      'Result message was not visible'
    );
  });
}
```

### Step 4

If the page is widely used, expose it through `PageFixture.ts`.

### Step 5

Add tests in the right suite:

- smoke for minimum confidence
- regression for broader checks
- e2e for long user journeys

### What not to do

- do not place selectors directly in tests
- do not hardcode waits in specs
- do not bypass `PageFixture` for business tests
- do not scatter assertion styles across page objects

---

## 11. File-by-File Reference

This section covers the maintained files in the repository that define the framework behavior.

## 11.1 Root Files

| File                       | Purpose                                               | Why it exists                                                                        | If missing or bypassed                                        |
| -------------------------- | ----------------------------------------------------- | ------------------------------------------------------------------------------------ | ------------------------------------------------------------- |
| `package.json`             | Scripts, dependencies, lint-staged, publish allowlist | Defines how engineers run and validate the framework                                 | Standard commands and dependency contract disappear           |
| `package-lock.json`        | Dependency lockfile                                   | Reproducible installs                                                                | Different engineers/CI may resolve different package versions |
| `playwright.config.ts`     | Playwright runtime configuration                      | Central browser/retry/reporter/artifact config                                       | Runs become inconsistent and reports fragment                 |
| `tsconfig.json`            | TypeScript compiler config and path aliases           | Enables typed imports and alias-based structure                                      | Type safety and clean import paths degrade                    |
| `eslint.config.mjs`        | ESLint 9 flat config                                  | Enforces code quality consistently                                                   | Lint script fails or becomes inconsistent                     |
| `.env.example`             | Example runtime configuration                         | Safe template for local setup                                                        | New engineers lack a known-good starting point                |
| `.gitignore`               | Repo hygiene rules                                    | Prevents artifacts and local config from being committed                             | Reports, logs, and local config leak into source control      |
| `.prettierrc`              | Formatting rules                                      | Consistent code style                                                                | Formatting drifts across contributors                         |
| `.prettierignore`          | Excluded formatting targets                           | Prevents formatting of generated/noisy paths                                         | Formatting tools may rewrite files that should stay untouched |
| `.vscode/settings.json`    | Editor convenience                                    | Small workspace-level editing aid                                                    | Not critical; only minor editor consistency is lost           |
| `README.md`                | Public-facing quick-start                             | Entry point for new users                                                            | Onboarding becomes slower and tribal                          |
| `LICENSE`                  | MIT license                                           | Defines legal reuse terms                                                            | Redistribution/legal clarity becomes ambiguous                |
| `.husky/pre-commit`        | Pre-commit staged-file enforcement                    | Prevents low-quality staged changes                                                  | Quality checks only happen later, usually in CI               |
| `.github/workflows/ci.yml` | CI pipeline                                           | Gives remote validation for type-check, lint, framework checks, and package contents | Local-only quality gates are easy to skip                     |

## 11.2 Config Files

| File                          | Purpose                            | Why it exists                        | If missing or bypassed                            |
| ----------------------------- | ---------------------------------- | ------------------------------------ | ------------------------------------------------- |
| `src/config/ConfigManager.ts` | Environment and browser resolution | Keeps environment logic in one place | Config logic spreads and drifts                   |
| `src/config/PageSetup.ts`     | Global hooks and failure capture   | Standardizes lifecycle behavior      | Failures lose diagnostics and hooks become ad hoc |

## 11.3 Fixture and Support Files

| File                                               | Purpose                                           | Why it exists                                                                                  | If missing or bypassed                                       |
| -------------------------------------------------- | ------------------------------------------------- | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| `src/support/PageFixture.ts`                       | Typed fixtures for page objects and `PageActions` | Keeps tests clean and dependency-driven                                                        | Specs manually construct dependencies and duplicate setup    |
| `src/support/constants/urlConstants.ts`            | Route constants and default base URL              | Avoids hardcoding page routes in many files                                                    | Route changes require broad code edits                       |
| `src/support/constants/HomePageConstants.ts`       | Home page labels/messages                         | Keeps home page assertions readable                                                            | More string duplication in page methods                      |
| `src/support/constants/SetupConstants.ts`          | Framework-wide constants                          | Keeps timeouts and repeated keywords centralized                                               | Magic values spread across the codebase                      |
| `src/support/constants/PathConstants.ts`           | Artifact/report path names                        | Makes report structure predictable                                                             | Report path strings become inconsistent                      |
| `src/support/locators/HomePageLocators.ts`         | Home page selectors                               | Isolates home page selector maintenance                                                        | Home page selectors scatter into tests/pages                 |
| `src/support/locators/RegistrationPageLocators.ts` | Registration selectors and field-mapping helpers  | Supports registration flows and validation mapping                                             | Registration logic becomes brittle and duplicated            |
| `src/support/locators/BankingPageLocators.ts`      | Banking-area selectors                            | Central selector registry for account, transfer, bill pay, update profile, and extension pages | Banking page maintenance becomes expensive                   |
| `src/support/enums/allureReports/Epic.ts`          | Allure epic values                                | Standardized reporting vocabulary                                                              | Reporting metadata becomes inconsistent                      |
| `src/support/enums/allureReports/Feature.ts`       | Allure feature values                             | Same as above                                                                                  | Same risk                                                    |
| `src/support/enums/allureReports/Severity.ts`      | Allure severity values                            | Same as above                                                                                  | Same risk                                                    |
| `src/support/enums/allureReports/TestOwners.ts`    | Allure owner values                               | Same as above                                                                                  | Same risk                                                    |
| `src/support/enums/config/Browsers.ts`             | Supported browsers enum                           | Type-safe browser selection                                                                    | Stringly typed browser handling grows                        |
| `src/support/enums/config/ElementStates.ts`        | Supported element states enum                     | Shared vocabulary for state-based behavior                                                     | State names get duplicated                                   |
| `src/support/enums/config/Environments.ts`         | Supported environments enum                       | Type-safe environment handling                                                                 | Invalid environment strings become easier to introduce       |
| `src/support/enums/results/TestResultStatus.ts`    | Result status enum                                | Consistent reporter comparisons                                                                | Result logic uses raw strings everywhere                     |
| `src/support/testdata/TestDataProvider.ts`         | Main test-data factory                            | Reusable and dynamic test payloads                                                             | Test data gets hardcoded into every suite                    |
| `src/support/test-data/DataProvider.ts`            | Simple username generator helper                  | Small utility / extension point                                                                | Not critical, but some ad hoc username generation may return |

## 11.4 Helper Files

| File                                           | Purpose                                          | Why it exists                                       | If missing or bypassed                              |
| ---------------------------------------------- | ------------------------------------------------ | --------------------------------------------------- | --------------------------------------------------- |
| `src/helper/actions/PageActions.ts`            | Owns page/context-level behavior                 | Makes browser interaction safer and more consistent | Page lifecycle logic leaks into tests and pages     |
| `src/helper/actions/UIActions.ts`              | Simple stepped UI interactions                   | Provides readable, logged actions                   | Page methods become noisy and repetitive            |
| `src/helper/actions/UIElementActions.ts`       | Advanced element behavior                        | Central retry/hover/drag utilities                  | Advanced interactions get reinvented repeatedly     |
| `src/helper/actions/EditBoxActions.ts`         | Text/input behavior                              | Dedicated abstraction for form handling             | Form logic duplicates across pages                  |
| `src/helper/actions/CheckboxActions.ts`        | Checkbox state handling                          | Prevents ad hoc checkbox logic                      | Checkbox flows become inconsistent                  |
| `src/helper/actions/DropDownActions.ts`        | Select/dropdown operations                       | Centralizes select behavior                         | Dropdown logic duplicates across flows              |
| `src/helper/actions/LocatorFactory.ts`         | Locator creation utility                         | Standardizes selector-to-locator resolution         | Helper APIs become inconsistent                     |
| `src/helper/asserts/AssertUtils.ts`            | Generic assertion helpers                        | Reusable business-level assertions                  | Same custom assertions are reimplemented repeatedly |
| `src/helper/asserts/ExpectUtils.ts`            | Playwright expect wrappers                       | Better messages, soft options, and step reporting   | Raw expect usage becomes inconsistent               |
| `src/helper/waits/WaitUtils.ts`                | Central waiting utility                          | Major flakiness-control layer                       | Synchronization logic becomes chaotic               |
| `src/helper/logger/Logger.ts`                  | Console + file logging                           | Structured debugging support                        | Failure triage becomes slower                       |
| `src/helper/reporting/AllureMeta.ts`           | Allure metadata type contract                    | Type-safe reporting payloads                        | Metadata usage becomes ambiguous                    |
| `src/helper/reporting/AllureReporter.ts`       | Allure wrapper and attachment utility            | Standard metadata and attachment handling           | Reporting logic duplicates across tests             |
| `src/helper/reporting/StepRunner.ts`           | Step orchestration helper                        | Standard step execution and error logging           | Step style becomes inconsistent                     |
| `src/helper/reporting/GenerateReports.ts`      | Post-run report generation/opening               | Makes latest-run report handling easy               | Engineers manually hunt for report outputs          |
| `src/helper/reporting/CustomReporterConfig.ts` | Custom reporter implementation and cleanup logic | Extension point for richer reporter behavior        | Reporter customization requires reinvention later   |
| `src/helper/models/CommonTypes.ts`             | Shared report parsing type                       | Keeps parsed XML contract explicit                  | XML-parsing logic becomes loosely typed             |

## 11.5 Page Files

| File                               | Purpose                                     | Why it exists                                        | If missing or bypassed                                            |
| ---------------------------------- | ------------------------------------------- | ---------------------------------------------------- | ----------------------------------------------------------------- |
| `src/pages/base/BasePage.ts`       | Shared page contract and helper composition | Keeps page objects consistent                        | Every page class duplicates common behavior                       |
| `src/pages/homePage.ts`            | Home page behavior                          | Encapsulates landing page checks                     | Home page checks spread into tests                                |
| `src/pages/loginPage.ts`           | Login flow and error handling               | Keeps authentication flow readable                   | Login logic becomes duplicated and fragile                        |
| `src/pages/registrationPage.ts`    | Registration flow and validation            | Central place for onboarding behavior                | Registration logic becomes one of the noisiest parts of the suite |
| `src/pages/accountOverviewPage.ts` | Account and transaction inspection          | Supports post-login banking assertions               | Post-login checks remain raw and repetitive                       |
| `src/pages/transferFundsPage.ts`   | Transfer workflow                           | Encapsulates transfer behavior and outcome detection | Transfer flows become duplicated and harder to debug              |
| `src/pages/billPayPage.ts`         | Bill pay workflow                           | Same reason as above                                 | Same risk                                                         |
| `src/pages/updateProfilePage.ts`   | Contact-profile maintenance                 | Encapsulates update flow and persistence checks      | Profile update tests become procedural                            |

## 11.6 Utility Files

| File                        | Purpose                                 | Why it exists                                   | If missing or bypassed                     |
| --------------------------- | --------------------------------------- | ----------------------------------------------- | ------------------------------------------ |
| `src/utils/FileUtils.ts`    | File, Excel, and content helper methods | Reusable non-UI file handling                   | Report/file utilities get rewritten ad hoc |
| `src/utils/StringsUtils.ts` | Reusable string and crypto helpers      | Central place for formatting and text utilities | Utility logic duplicates across features   |

## 11.7 Test Files

| File                                                          | Purpose                      | Why it exists                                            | If missing or bypassed                         |
| ------------------------------------------------------------- | ---------------------------- | -------------------------------------------------------- | ---------------------------------------------- |
| `tests/smoke/smoke-tests.spec.ts`                             | Fast confidence suite        | Confirms critical journeys still work                    | Small regressions can escape until larger runs |
| `tests/regression/regression-tests.spec.ts`                   | Broader functional suite     | Covers more variation and validation cases               | Coverage depth drops                           |
| `tests/e2e/e2e-tests.spec.ts`                                 | Long business workflows      | Validates end-to-end integration                         | Only isolated page checks remain               |
| `tests/verifications.test.ts`                                 | Framework verification suite | Confirms fixtures, isolation, and inheritance            | Framework mechanics can break silently         |
| `tests/enhanced-reporting.test.ts`                            | Reporting examples           | Teaches engineers how to use metadata and step utilities | Reporting usage becomes inconsistent           |
| `tests/manual-test-cases/smoke/smoke-test-cases.md`           | Manual smoke reference       | Human-readable mapping for smoke coverage                | Business traceability is weaker                |
| `tests/manual-test-cases/regression/regression-test-cases.md` | Manual regression reference  | Same reason                                              | Same risk                                      |
| `tests/manual-test-cases/e2e/e2e-test-cases.md`               | Manual e2e reference         | Same reason                                              | Same risk                                      |

---

## 12. Important Current Extension Points and Caveats

These are useful for engineers to understand.

1. `CustomReporterConfig.ts` exists but is not currently wired into `playwright.config.ts`.
2. `FindTransactionsPageLocators` and `RequestLoanPageLocators` exist in locator definitions, but there are no page objects yet for those features.
3. `DataProvider.ts` is a minimal helper and is secondary to `TestDataProvider.ts`.
4. `tests/verifications.test.ts` intentionally uses lower-level APIs because it validates framework wiring, not business style.
5. The framework is designed for page-object usage in business tests, even though direct `pageActions` usage is still available.

---

## 13. What Would Happen If Key Pieces Were Missing

### Without `PageFixture`

- tests create page objects manually
- setup duplication increases
- dependency injection disappears

### Without `PageSetup`

- no standard hooks
- no automatic failure attachments
- weaker logging

### Without `BasePage`

- every page duplicates navigation and verification logic
- page style becomes inconsistent

### Without helper layers

- raw Playwright calls spread across pages and tests
- maintenance cost grows quickly

### Without test-data centralization

- static data gets copy/pasted everywhere
- changes to sample data become tedious

### Without reporting helpers

- Allure usage becomes inconsistent
- failures become much harder to investigate

### Without CI and Husky

- quality depends entirely on local discipline
- broken changes are more likely to be pushed

---

## 14. Recommended Contribution Rules for This Repo

If you want the framework to stay healthy, contributors should follow these rules:

1. Business tests should import `test` from `@support/PageFixture`.
2. Business tests should prefer page-object methods over raw page operations.
3. New selectors should go into locator files unless there is a strong reason not to.
4. Repeated waits should be moved into `WaitUtils`.
5. Repeated assertions should be moved into `ExpectUtils` or `AssertUtils`.
6. Repeated low-level interactions should be moved into helper action classes.
7. New reusable data should go into `TestDataProvider`.
8. Reporting metadata should be added through `AllureReporter`.
9. New page objects should extend `BasePage`.
10. Framework-level behavior should be centralized rather than duplicated.

---

## 15. Final Mental Model

If you remember only one thing about this repository, remember this:

```text
Specs describe business intent.
Fixtures provide dependencies.
Page objects describe domain behavior.
Helpers implement low-level mechanics.
Config controls runtime behavior.
Reporting and logging explain what happened.
```

That separation is the reason this repository behaves like a framework instead of just a test folder.

When extending the repo, always ask:

- does this belong in a test?
- does this belong in a page object?
- does this belong in a helper?
- does this belong in config/support?

If that question is asked consistently, the framework will remain scalable and understandable.
