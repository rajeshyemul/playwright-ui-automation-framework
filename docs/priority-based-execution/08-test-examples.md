# Test Tagging and Examples

This document explains how tests should be tagged for priority-based execution.

## General Rule

Tags are metadata only.

They should help the runner decide order, but they should not change the business logic of the test itself.

## Supported Test Tags

- `@runFirst`
- `@runLast`
- `@P1`
- `@P2`
- `@P3`
- `@P4`

## Example Syntax

```ts
test(
  'TC-E2E-001: Complete User Registration and First Login',
  { tag: ['@P1'] },
  async ({ pageActions }) => {
    // test body
  }
);
```

Multiple tags are allowed when they are meaningful:

```ts
test(
  'TC-SMK-001: User reaches the entry page',
  { tag: ['@runFirst', '@P1'] },
  async ({ homePage }) => {
    // test body
  }
);
```

## How the Runner Reads the Tags

The discovery parser stores:

- raw tags
- normalized tags
- resolved priority tag

That means a test tagged with `@p1` or `P1` can still be normalized into `@P1`.

## Recommended Classification Pattern

- Smoke / release gate tests: `@runFirst`
- Critical business flows: `@P1`
- Core flows: `@P2`
- Secondary flows: `@P3`
- Informational / low impact: `@P4`
- Framework verification and reporting tests: `@runLast`

## Example Suite Mapping

Current repository usage is roughly:

- smoke tests use `@runFirst`
- e2e tests use `@P1` and `@P2`
- regression tests use `@P2` and `@P3`
- verification and reporting tests use `@runLast` and `@P4`

## Test Support Suite

File: [tests/test-order-manager.test.ts](/Users/rajesh.yemul/Practice%20Project/playwright-typescript-ui-framework/tests/test-order-manager.test.ts)

This spec validates:

- invalid tag combinations
- bucket construction
- grouping behavior
- failure policy behavior

That test file is the best place to look when you want to understand or extend the planning rules.
