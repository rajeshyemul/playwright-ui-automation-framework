import { test, expect } from '@playwright/test';
import { OrderedExecution } from '../src/runner/OrderedExecution';
import { DiscoveredTestCase } from '../src/helper/models/runner/runnerTypes';
import { RunnerConstants } from '../src/support/constants/RunnerConstants';

function createTestCase(
  id: string,
  title: string,
  tags: string[],
  file = 'tests/example.spec.ts',
  line = 10
): DiscoveredTestCase {
  const normalizedTags = OrderedExecution.normalizeTags(tags);

  return {
    id,
    title,
    file,
    line,
    column: 1,
    tags,
    normalizedTags,
    priorityTag: OrderedExecution.getPriorityTag(normalizedTags),
  };
}

test('validates conflicting ordering metadata', { tag: ['@runLast', '@P1'] }, async () => {
  const errors = OrderedExecution.validateDiscoveredTests([
    createTestCase('1', 'conflicting priority', ['@P1', '@P2']),
    createTestCase('2', 'conflicting boundary', [RunnerConstants.RUN_FIRST_TAG, RunnerConstants.RUN_LAST_TAG], 'tests/example.spec.ts', 11),
  ]);

  expect(errors).toHaveLength(2);
});

test('builds basic mode buckets with boundary precedence', { tag: ['@runLast', '@P4'] }, async () => {
  const tests = [
    createTestCase('1', 'run first', ['@runFirst', '@P1'], 'tests/a.spec.ts', 10),
    createTestCase('2', 'default', [], 'tests/a.spec.ts', 20),
    createTestCase('3', 'run last', ['@runLast', '@P4'], 'tests/a.spec.ts', 30),
  ];

  const buckets = OrderedExecution.buildBuckets(tests, {
    mode: 'basic',
    scopeTags: [],
    orderedTags: [],
  });

  expect(buckets.map((bucket) => bucket.key)).toEqual(['run-first', 'default', 'run-last']);
  expect(buckets[0].tests.map((item) => item.id)).toEqual(['1']);
  expect(buckets[1].tests.map((item) => item.id)).toEqual(['2']);
  expect(buckets[2].tests.map((item) => item.id)).toEqual(['3']);
});

test('builds priority mode buckets and preserves no-priority tests', { tag: ['@runLast', '@P4'] }, async () => {
  const tests = [
    createTestCase('1', 'first', ['@runFirst', '@P1'], 'tests/a.spec.ts', 10),
    createTestCase('2', 'priority 1', ['@P1'], 'tests/a.spec.ts', 20),
    createTestCase('3', 'priority 2', ['@P2'], 'tests/a.spec.ts', 30),
    createTestCase('4', 'no priority', [], 'tests/a.spec.ts', 40),
    createTestCase('5', 'last', ['@runLast', '@P4'], 'tests/a.spec.ts', 50),
  ];

  const buckets = OrderedExecution.buildBuckets(tests, {
    mode: 'priority',
    scopeTags: [],
    orderedTags: [],
  });

  expect(buckets.map((bucket) => bucket.key)).toEqual([
    'run-first',
    'p1',
    'p2',
    'p3',
    'p4',
    'no-priority',
    'run-last',
  ]);
  expect(buckets[1].tests.map((item) => item.id)).toEqual(['2']);
  expect(buckets[5].tests.map((item) => item.id)).toEqual(['4']);
});

test('groups non-critical buckets while preserving boundary isolation', { tag: ['@runLast', '@P4'] }, async () => {
  const tests = [
    createTestCase('1', 'run first', ['@runFirst', '@P1'], 'tests/a.spec.ts', 10),
    createTestCase('2', 'priority 1', ['@P1'], 'tests/a.spec.ts', 20),
    createTestCase('3', 'priority 2', ['@P2'], 'tests/a.spec.ts', 30),
    createTestCase('4', 'priority 3', ['@P3'], 'tests/a.spec.ts', 40),
    createTestCase('5', 'priority 4', ['@P4'], 'tests/a.spec.ts', 50),
    createTestCase('6', 'no priority', [], 'tests/a.spec.ts', 60),
    createTestCase('7', 'run last', ['@runLast', '@P4'], 'tests/a.spec.ts', 70),
  ];

  const buckets = OrderedExecution.buildBuckets(tests, {
    mode: 'priority',
    scopeTags: [],
    orderedTags: [],
  });

  const groups = OrderedExecution.groupBuckets(buckets);

  expect(groups.map((group) => group.map((bucket) => bucket.key))).toEqual([
    ['run-first'],
    ['p1'],
    ['p2', 'p3', 'p4', 'no-priority'],
    ['run-last'],
  ]);
  expect(OrderedExecution.mergeGroupTests(groups[2]).map((testCase) => testCase.id)).toEqual([
    '3',
    '4',
    '5',
    '6',
  ]);
});

test('builds custom mode with explicit no-priority inclusion', { tag: ['@runLast', '@P4'] }, async () => {
  const tests = [
    createTestCase('1', 'priority 1', ['@P1'], 'tests/a.spec.ts', 10),
    createTestCase('2', 'priority 3', ['@P3'], 'tests/a.spec.ts', 20),
    createTestCase('3', 'unclassified', [], 'tests/a.spec.ts', 30),
  ];

  const buckets = OrderedExecution.buildBuckets(tests, {
    mode: 'custom',
    scopeTags: [],
    orderedTags: ['@P3', RunnerConstants.NO_PRIORITY_TOKEN, '@P1'],
  });

  expect(buckets.map((bucket) => bucket.key)).toEqual([
    'run-first',
    'p3',
    'no-priority',
    'p1',
    'run-last',
  ]);
  expect(buckets[1].tests.map((item) => item.id)).toEqual(['2']);
  expect(buckets[2].tests.map((item) => item.id)).toEqual(['3']);
  expect(buckets[3].tests.map((item) => item.id)).toEqual(['1']);
});

test('applies scope tags before bucket assignment', { tag: ['@runLast', '@P4'] }, async () => {
  const tests = [
    createTestCase('1', 'smoke priority', ['@P1', '@smoke'], 'tests/a.spec.ts', 10),
    createTestCase('2', 'payments priority', ['@P1', '@payments'], 'tests/a.spec.ts', 20),
    createTestCase('3', 'payments no priority', ['@payments'], 'tests/a.spec.ts', 30),
  ];

  const buckets = OrderedExecution.buildBuckets(tests, {
    mode: 'priority',
    scopeTags: ['@payments'],
    orderedTags: [],
  });

  expect(buckets[1].tests.map((item) => item.id)).toEqual(['2']);
  expect(buckets[5].tests.map((item) => item.id)).toEqual(['3']);
});

test('applies critical stop rules by mode and failure policy', { tag: ['@runLast', '@P4'] }, async () => {
  const priorityBuckets = OrderedExecution.buildBuckets(
    [createTestCase('1', 'priority 1', ['@P1'], 'tests/a.spec.ts', 10)],
    {
      mode: 'priority',
      scopeTags: [],
      orderedTags: [],
    }
  );

  const p1Bucket = priorityBuckets[1];
  expect(OrderedExecution.shouldAbortAfterBucket(p1Bucket, 'failed', 'priority', 'critical')).toBeTruthy();
  expect(OrderedExecution.shouldAbortAfterBucket(p1Bucket, 'failed', 'priority', 'continue')).toBeFalsy();
  expect(OrderedExecution.shouldAbortAfterBucket(p1Bucket, 'failed', 'priority', 'immediate')).toBeTruthy();

  const basicBuckets = OrderedExecution.buildBuckets(
    [createTestCase('2', 'default', [], 'tests/a.spec.ts', 20)],
    {
      mode: 'basic',
      scopeTags: [],
      orderedTags: [],
    }
  );

  expect(OrderedExecution.shouldAbortAfterBucket(basicBuckets[1], 'failed', 'basic', 'critical')).toBeFalsy();
});
