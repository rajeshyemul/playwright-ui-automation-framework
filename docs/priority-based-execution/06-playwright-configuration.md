# Playwright Configuration

`playwright.config.ts` decides how Playwright behaves in normal runs, discovery runs, and ordered runs.

File: [playwright.config.ts](/Users/rajesh.yemul/Practice%20Project/playwright-typescript-ui-framework/playwright.config.ts)

## Why This File Matters

The ordered runner depends on configuration-level switches to know what kind of Playwright process is being launched.

It uses these environment flags:

- `ORDERED_DISCOVERY`
- `ORDERED_RUN`
- `REPORT_ROOT`
- `ORDERED_BUCKET_NAME`
- `ORDERED_BUCKET_JSON_OUTPUT_FILE`
- `ORDERED_BLOB_OUTPUT_DIR`
- `ORDERED_BLOB_FILE_NAME`

## Three Configuration Modes

### Normal run

Used by `npm test`.

Behavior:

- standard reporter stack
- timestamped report root
- fully parallel Playwright execution

### Discovery run

Used by the ordered runner before execution starts.

Behavior:

- JSON reporter only
- no browser execution intended
- writes the discovered catalog to a known file

### Ordered bucket run

Used by each execution group launched by `TestOrderManager`.

Behavior:

- list reporter
- blob reporter
- JSON reporter
- Allure reporter
- all outputs share the same parent `REPORT_ROOT`

## Why `REPORT_ROOT` Is Shared

All groups must write into one parent run folder so the final merged report can represent the whole ordered execution.

If each bucket used its own root, the merge step would be much harder and the final report would no longer look like one run.

## Example

When the ordered runner starts, it sets:

```ts
process.env.REPORT_ROOT = reportRoot;
process.env.ORDERED_RUN = 'true';
process.env.ORDERED_BUCKET_NAME = 'p2+p3+p4+no-priority';
```

Then `playwright.config.ts` switches to the ordered-run reporters automatically.

## Practical Result

The config file is what makes the orchestration layer possible without changing the tests themselves.
