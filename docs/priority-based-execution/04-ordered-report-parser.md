# Discovery and Result Parsing

`OrderedReportParser` converts Playwright JSON output into the internal runner models.

File: [src/runner/OrderedReportParser.ts](/Users/rajesh.yemul/Practice%20Project/playwright-typescript-ui-framework/src/runner/OrderedReportParser.ts)

## Why This Module Exists

Playwright reports are useful, but the runner needs a stable internal model.

This module bridges that gap in two directions:

- discovery report -> discovered test catalog
- execution report -> executed test results

## Discovery Parsing

Discovery output is used to build the execution plan.

For each spec, the parser stores:

- `id`
- `title`
- `file`
- `line`
- `column`
- raw `tags`
- `normalizedTags`
- `priorityTag`

Example:

```ts
const normalizedTags = OrderedExecution.normalizeTags((spec.tags ?? []).map((tag) => `@${tag}`));

discoveredTests.push({
  id: spec.id,
  title: spec.title,
  file: spec.file,
  line: spec.line,
  column: spec.column,
  tags: spec.tags ?? [],
  normalizedTags,
  priorityTag: OrderedExecution.getPriorityTag(normalizedTags),
});
```

## Why `normalizedTags` Is Stored Here

This is the earliest point where raw tags become framework data.

By storing the normalized form once:

- the planner does less work
- the tests stay deterministic
- validation and grouping can reuse the same cached data

## Execution Parsing

Execution output is parsed after each bucket run.

The parser calculates:

- final test outcome
- final status
- total duration
- error messages

That data is then used for:

- bucket summaries
- slow-test lists
- failed-critical-test lists

## Example

If one test produced multiple results, the parser:

1. sums the durations
2. looks at the final result status
3. collects the error messages
4. stores one consolidated executed-test record

This is important because a single Playwright test can have retries and multiple result objects.

## What This Module Should Not Do

It should not decide ordering.

It should not decide stop policy.

It should only translate Playwright JSON into the runner’s data model.
