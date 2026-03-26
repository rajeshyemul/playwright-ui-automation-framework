# ESLint Governance Rule

The custom ESLint rule protects the tag contract used by the ordered runner.

Folder:

- [src/helper/customESLintRules](/Users/rajesh.yemul/Practice%20Project/playwright-typescript-ui-framework/src/helper/customESLintRules)

## Why This Rule Exists

The runner depends on clean tag metadata.

Without a lint rule, it would be easy for someone to accidentally write:

- multiple priority tags on one test
- `@runFirst` and `@runLast` together

The rule catches those mistakes before they reach runtime.

## Rule Behavior

Current behavior:

- allow `NoPriority`
- reject more than one priority tag
- reject `@runFirst` with `@runLast`

Example invalid tag list:

```ts
{
  tag: ['@runLast', '@P1', '@P2'];
}
```

That should fail because it contains more than one priority tag.

## Folder Structure

- `index.mjs`: plugin entry point
- `validatePlaywrightPriorityTags.mjs`: rule implementation

This structure makes it easy to add more governance rules later.

## Why It Is in `src/helper`

These rules are part of framework support, not test logic.

Keeping them under `src/helper` keeps the codebase organized and makes the rules easy to discover alongside other reusable helpers.
