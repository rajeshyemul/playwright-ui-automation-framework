# Reporting and Summary Generation

The ordered runner produces both merged Playwright reports and a custom summary artifact.

## Reporting Layers

### 1. Per-group Playwright artifacts

Each execution group writes its own:

- JSON report
- blob report
- Allure results

### 2. Merged Playwright report

After all groups finish, the runner merges blob reports into the final run report.

### 3. Ordered summary

The framework writes:

- `ordered-summary.json`
- `ordered-summary.html`

These are the main execution summary files for ordered runs.

## Ordered Summary Responsibilities

File: [src/runner/OrderedSummary.ts](/Users/rajesh.yemul/Practice%20Project/playwright-typescript-ui-framework/src/runner/OrderedSummary.ts)

This module formats the summary data into a readable HTML page.

It highlights:

- total discovered tests
- selected tests
- executed tests
- failures and skipped groups
- failed critical tests
- top slow tests
- stop reason, if any

## Example Summary Data

The summary object contains:

```ts
{
  mode: 'priority',
  failurePolicy: 'critical',
  dryRun: false,
  totals: {
    discovered: 24,
    selected: 24,
    executed: 18,
    passed: 17,
    failed: 1,
    skipped: 6,
    flaky: 0
  }
}
```

## Why We Keep an HTML Summary

Playwright’s native reports are useful, but the ordered run needs a quick business-level view too.

The HTML summary is meant to answer:

- what ran first
- what failed early
- whether the run stopped
- which tests were slow

## Report Merge Flow

The runner uses blob reports because multiple Playwright runs need a common merge format.

The flow is:

```text
group run -> blob output
group run -> blob output
group run -> blob output
merge blobs -> final Playwright report
write ordered summary -> HTML + JSON
```

## Example Interpretation

If `@runFirst` fails and the failure policy is `critical`, the summary should show:

- stop reason
- failed critical test list
- later groups marked as not run

That makes the summary useful for release decisions, not just for debugging.
