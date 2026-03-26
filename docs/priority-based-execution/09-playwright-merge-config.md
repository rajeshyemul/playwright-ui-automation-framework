# Playwright Merge Configuration

The merge config is the small Playwright configuration used only when the ordered runner merges blob reports.

File: [src/runner/playwright.merge.config.ts](/Users/rajesh.yemul/Practice%20Project/playwright-typescript-ui-framework/src/runner/playwright.merge.config.ts)

## Why It Exists

Ordered execution launches Playwright more than once.

Each launch writes a blob report. Those blobs must be merged into one final report so the user still gets a single coherent execution view.

The merge config tells Playwright how to perform that merge step.

## Typical Flow

```text
bucket run -> blob report
bucket run -> blob report
bucket run -> blob report
merge-reports -> final report
```

## What the Config Should Stay Focused On

- reading the shared report root
- locating the blob report folder
- merging the artifacts into a unified report

It should not contain any bucket-planning logic.

## Why This Is a Separate Module

The merge step is an operational concern, not a planning concern.

Keeping it separate makes the runner easier to understand:

- `OrderedExecution` plans
- `TestOrderManager` executes
- `playwright.merge.config.ts` merges
- `OrderedSummaryWriter` summarizes

That separation keeps the architecture clean and makes future changes easier to reason about.
