# Overview

The priority-based execution system is a thin orchestration layer on top of Playwright.

It does not replace Playwright. Instead, it coordinates multiple Playwright runs so that important flows execute first, low-priority flows execute later, and report output stays mergeable.

## Problem Statement

Without orchestration, Playwright runs tests in a flat model:

- every test is treated equally
- early failure in a critical business path can be discovered late
- lower-priority tests can consume time before blockers are found
- multi-worker execution can hide the business meaning of the run

The ordered runner solves that by introducing deterministic execution buckets.

## Strategy

The system uses tags as metadata:

- `@runFirst`
- `@runLast`
- `@P1`
- `@P2`
- `@P3`
- `@P4`
- `NoPriority`

These tags are not business logic inside tests. They are planning metadata that the runner reads before execution starts.

## Execution Flow

```text
test:ordered
  -> TestOrderManager loads env and creates a report root
  -> Playwright discovery pass reads the test catalog
  -> OrderedExecution validates tags and builds buckets
  -> Safe groups are created to reduce Playwright launches
  -> Each group runs in sequence
  -> Blob reports are merged
  -> Ordered summary HTML/JSON is written
```

## Default Priority Order

In priority mode the logical order is:

```text
@runFirst -> @P1 -> @P2 -> @P3 -> @P4 -> NoPriority -> @runLast
```

After the grouping optimization, the runner currently executes this as:

```text
@runFirst -> @P1 -> (@P2 + @P3 + @P4 + NoPriority) -> @runLast
```

This preserves stop semantics while reducing process launches.

## Failure Behavior

- `critical`: stop after a failing `@runFirst` or `@P1` bucket
- `continue`: keep going even if a critical bucket fails
- `immediate`: stop after any failed group

## Why Grouping Is Safe

The current grouping logic keeps these buckets isolated:

- `@runFirst`
- `@P1`
- `@runLast`

Only the noncritical middle buckets are merged.

That is the important design choice. It gives us performance gains without removing the release-gate behavior that makes the system valuable.
