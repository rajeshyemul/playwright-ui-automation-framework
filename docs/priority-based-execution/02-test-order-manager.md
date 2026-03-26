# Test Order Manager

`TestOrderManager` is the runtime orchestrator.

It is responsible for turning a plan into actual Playwright process launches, tracking status, and producing the final execution summary.

File: [src/runner/TestOrderManager.ts](/Users/rajesh.yemul/Practice%20Project/playwright-typescript-ui-framework/src/runner/TestOrderManager.ts)

## Responsibilities

- load environment variables
- create a shared report root for the ordered run
- run a discovery pass to collect the test catalog
- validate the discovered tags
- ask `OrderedExecution` for the bucket plan
- group buckets into fewer Playwright launches
- execute each group sequentially
- merge blob reports
- write the final ordered summary

## Execution Stages

### 1. Environment setup

The runner loads `.env` and resolves:

- `ORDER_MODE`
- `ORDERED_TAGS`
- `SCOPE_TAGS`
- `FAILURE_POLICY`
- `ORDER_DRY_RUN`

It also creates one report root for the whole ordered run so every bucket writes into the same parent folder.

### 2. Discovery pass

Before executing tests, the runner calls Playwright with `--list`.

That pass does not run the tests. It only reads the catalog and produces a JSON file that contains:

- test id
- title
- file
- line
- column
- raw tags
- normalized tags
- priority tag

### 3. Validation

The runner checks for invalid metadata before it starts execution.

Examples:

- more than one priority tag on the same test
- `@runFirst` and `@runLast` on the same test

### 4. Planning

The runner asks `OrderedExecution.buildBuckets(...)` for the logical plan.

Then it asks `OrderedExecution.groupBuckets(...)` for the execution groups.

This separation is useful:

- planning is pure and testable
- execution stays in the runner

Grouping is controlled by `ENABLE_BUCKET_GROUPING`:

- `true` enables the safe grouping pass
- `false` keeps one Playwright launch per bucket
- the grouping algorithm remains safe for `basic`, `priority`, and `custom` modes because it never merges boundary buckets with non-boundary buckets

### 5. Execution

Each group becomes one Playwright launch.

The runner builds a pseudo bucket for the group:

```ts
{
  key: 'p2+p3+p4+no-priority',
  label: '@P2, @P3, @P4, NoPriority',
  kind: 'priority',
  critical: false,
  tests: [...]
}
```

That pseudo bucket is only a runtime container. It is not a new test concept.

### 6. Stop decisions

After each group finishes, the runner checks whether it should abort later execution.

This is where failure policy matters.

### 7. Merge and summary

When execution is done, the runner merges blob reports and writes:

- final Playwright report artifacts
- ordered summary JSON
- ordered summary HTML

## Example Run

If the repository contains:

- smoke tests tagged `@runFirst`
- critical e2e tests tagged `@P1`
- regression tests tagged `@P2`, `@P3`, or `@P4`
- framework checks tagged `@runLast`

then a priority run will execute in this sequence:

1. `@runFirst`
2. `@P1`
3. merged middle group
4. `@runLast`

## Why This Module Matters

This is the only module that actually launches Playwright.

Everything else prepares data for it.
