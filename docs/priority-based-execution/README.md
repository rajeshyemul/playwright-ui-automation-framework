# Priority-Based Execution Overview

This folder documents the ordered execution system that powers `npm run test:ordered`.

The goal is simple: run the most important tests first, reduce wasted execution time, and keep report generation reliable even when Playwright is launched multiple times.

## Documentation Map

- [1. Overview and execution strategy](01-overview.md)
- [2. Test Order Manager](02-test-order-manager.md)
- [3. Ordered Execution Planner](03-ordered-execution.md)
- [4. Discovery and Result Parsing](04-ordered-report-parser.md)
- [5. Reporting and Summary Generation](05-reporting-and-summary.md)
- [6. Playwright Configuration](06-playwright-configuration.md)
- [7. ESLint Governance Rule](07-eslint-governance.md)
- [8. Test Tagging and Examples](08-test-examples.md)
- [9. Playwright Merge Configuration](09-playwright-merge-config.md)

## What This System Does

- discovers tests and reads their tags once
- validates invalid tag combinations before execution starts
- builds deterministic buckets from priority metadata
- groups safe buckets together to reduce Playwright launches
- merges blob reports back into a single run summary
- writes ordered execution summary artifacts for quick review

## Recommended Reading Order

1. Read [01-overview.md](01-overview.md) to understand the strategy.
2. Read [02-test-order-manager.md](02-test-order-manager.md) to understand the orchestrator.
3. Read [03-ordered-execution.md](03-ordered-execution.md) for the bucket rules.
4. Read [08-test-examples.md](08-test-examples.md) to see how tests are tagged in practice.

## Key Runtime Modes

- `basic`: run first, default tests, run last
- `priority`: run first, P1, P2, P3, P4, no-priority, run last
- `custom`: run first, then tags in the caller-provided order, then run last

## Why the Folder Exists

The system touches several modules, and each one has a different responsibility. Splitting the docs makes it much easier for a mid-level engineer to understand one moving part at a time without losing the big picture.
