# Ordered Execution Planner

`OrderedExecution` is the planning engine.

It contains the pure logic for tags, buckets, scope filtering, and stop rules.

File: [src/runner/OrderedExecution.ts](/Users/rajesh.yemul/Practice%20Project/playwright-typescript-ui-framework/src/runner/OrderedExecution.ts)

## What This Module Owns

- tag normalization
- order mode resolution
- failure policy resolution
- validation of discovered tests
- scope matching
- bucket construction
- bucket grouping
- abort decisions

## Cached Tag Model

Discovery now stores:

- `tags`
- `normalizedTags`
- `priorityTag`

That means downstream logic no longer needs to normalize raw tags repeatedly.

Example:

```ts
const normalizedTags = OrderedExecution.normalizeTags(['@runFirst', '@P1']);
const priorityTag = OrderedExecution.getPriorityTag(normalizedTags);
```

## Bucket Construction

The planner creates buckets in a deterministic order.

### Basic mode

```text
@runFirst -> Default -> @runLast
```

### Priority mode

```text
@runFirst -> @P1 -> @P2 -> @P3 -> @P4 -> NoPriority -> @runLast
```

### Custom mode

The caller supplies the bucket order:

```text
ORDERED_TAGS=P1,P3,NoPriority
```

## Scope Filtering

`SCOPE_TAGS` is an additional OR filter.

Example:

```text
SCOPE_TAGS=@payments,@smoke
```

That means a test is eligible if it matches one of the scope tags and then matches the bucket logic as well.

## Grouping Logic

The current grouping strategy is intentionally conservative.

It produces groups like:

```text
['run-first']
['p1']
['p2', 'p3', 'p4', 'no-priority']
['run-last']
```

Why not merge `run-first` and `p1`?

Because `run-first` is a release gate. If it fails, we want the option to stop before the P1 bucket starts.

## Stop Logic

`shouldAbortAfterBucket(...)` makes the stop decision based on:

- bucket status
- order mode
- failure policy

This keeps the rule simple and testable.

## Validation Rules

The planner rejects invalid metadata such as:

- multiple priority tags on one test
- `@runFirst` with `@runLast`

That validation happens before the run starts, which prevents ambiguous behavior later.

## Example

If a test has:

```ts
{
  tag: ['@P2', '@smoke'];
}
```

then:

- `normalizedTags` becomes `['@P2', '@smoke']`
- `priorityTag` becomes `@P2`
- it belongs to the `p2` bucket in priority mode

This module is a good candidate for unit tests because it is pure and has no Playwright side effects.
