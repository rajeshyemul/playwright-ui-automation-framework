# Playwright + TypeScript Scalable Automation Framework

This repository is not “a set of tests”.

It is a **test architecture**.

A framework designed to answer one question:

> What does it take to make automation _operable at scale_?

Most Playwright projects start as scripts and slowly grow into frameworks.  
This one starts as a framework.

It treats:

- Tests as **behavior**
- Framework as **infrastructure**
- Reporting as **a product**
- Failures as **diagnostics**
- Execution as **a system**

---

## 🧠 Design Philosophy

This framework is built on a few simple principles:

- Tests describe _what_ should happen
- The framework owns _how_ things happen
- Tools are _implementation details_
- Every concern has a boundary
- Every execution produces a diagnostic bundle
- Observability is not optional

Nothing leaks into tests:

- No raw `page`
- No raw `expect`
- No raw `locator`
- No timing hacks
- No reporter APIs

Everything flows through architectural layers.

---

## 🏗️ Architecture Overview

tests/
└─ \*.test.ts → Behavior only

src/
├─ config/
│ └─ PageSetup.ts → Lifecycle & fixtures
│
├─ helper/
│ ├─ actions/ → PageActions, UIElementActions, EditBoxActions…
│ ├─ asserts/ → ExpectUtils, AssertUtils
│ ├─ waits/ → WaitUtils
│ ├─ reporting/ → StepRunner, AllureReporter, GenerateReports
│ └─ logger/ → Winston-based Logger
│
├─ pages/ → Domain-level Page Objects
├─ support/
│ ├─ constants/
│ ├─ enums/
│ └─ fixtures/

Each layer has one job:

| Layer           | Responsibility                |
| --------------- | ----------------------------- |
| PageSetup       | Lifecycle & context ownership |
| PageActions     | Browser & navigation gateway  |
| LocatorFactory  | Selector abstraction          |
| Action classes  | Interactions                  |
| ExpectUtils     | Assertions                    |
| WaitUtils       | Waiting semantics             |
| StepRunner      | Structured execution steps    |
| Logger          | Domain-aware logging          |
| AllureReporter  | Business metadata & semantics |
| GenerateReports | Report lifecycle & discovery  |

Tests never touch tools directly.

---

## 📊 Reporting Model

Every execution creates a **timestamped diagnostic bundle**:
reports/
└─ 2026-01-22_18-41-09/
├─ html/
├─ logs/
├─ artifacts/
├─ allure-results/
└─ allure-report/

Each run is:

- Self-contained
- Portable
- Archivable
- CI-friendly

The framework defines:

- Where reports live
- What “latest run” means
- How humans open them

### Commands

```bash
# Run tests
npm run test

# Open latest Playwright HTML report
npm run report:html

# Generate Allure report for latest run
npm run report:allure

# Generate and open Allure report
npm run report:allure:open

Nobody needs to remember paths.
Nobody needs to know timestamps.
The framework owns the workflow.

🧪 Writing Tests

A test expresses behavior and intent only:

test('home page loads correctly', async () => {
  await AllureReporter.attachDetails(
    Epic.ASSET_MANAGEMENT,
    Feature.UPDATE_EQUIPMENT_INVENTORY,
    'CIRC-8942 – Update equipment',
    Severity.NORMAL
  );

  await homePage.navigateToHome();
  await homePage.verifyLogoVisible();
  await homePage.verifyTitle(/ParaBank/);
});

No locators.
No raw page.
No reporter APIs.
No plumbing.

Just behavior.

🚀 What This Framework Enables

Deterministic execution
Domain-level readability
Observability-first automation
Clean CI integration
Scalable team onboarding
Centralized change control
Cross-run intelligence
Business-facing reports
It is designed for:
Enterprise systems
Large teams
Long-lived products
Regulated environments
High change velocity


🧭 Roadmap

This framework is complete as a foundation.
Future enhancements may include:
Slack / Teams notifications
Test management system sync
Advanced test data orchestration
Feature-flag aware testing
AI-assisted test creation
Playwright MCP server integration
Copilot-style test authoring
Cross-run trend analytics

This is not a “Playwright project”.
It is a system for building and operating quality.

```
