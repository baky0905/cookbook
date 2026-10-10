import test from 'node:test';
import assert from 'node:assert/strict';
import { currentPlan, isFinishedPlan, today } from '../src/lib/weeks.mjs';
import { planSchema } from '../src/lib/schema.mjs';
const make = (id, start, extra = {}) => ({ id, title: id, start, meals: [], extras: [], ...extra });
const past = make('past', '2026-10-05');
const current = make('current', '2026-10-12');
const future = make('future', '2026-10-19');
const example = make('example', '2026-10-12', { example: true });

test('preparing next week does not replace this week', () => {
  assert.equal(currentPlan([future, past, current, example], '2026-10-14'), current);
  assert.equal(currentPlan([current, future], '2026-10-19'), future);
  assert.equal(currentPlan([past, future, example], '2026-10-14'), null);
  assert.equal(currentPlan([example], '2026-10-14'), example);
});
test('archival only includes finished real weeks, never current or future plans', () => {
  assert.equal(isFinishedPlan(past, '2026-10-18'), true);
  assert.equal(isFinishedPlan(current, '2026-10-18'), false);
  assert.equal(isFinishedPlan(future, '2026-10-18'), false);
  assert.equal(isFinishedPlan(current, '2026-10-19'), true);
  assert.equal(isFinishedPlan(example, '2026-11-01'), false);
});
test('week rollover uses Oslo time, including daylight saving and year boundaries', () => {
  assert.equal(today(new Date('2026-10-11T22:30:00Z')), '2026-10-12');
  assert.equal(today(new Date('2026-10-25T22:30:00Z')), '2026-10-25');
  assert.equal(today(new Date('2026-10-25T23:30:00Z')), '2026-10-26');
  const newYear = make('new-year', '2025-12-29');
  assert.equal(currentPlan([newYear], '2026-01-01'), newYear);
});
test('CMS plans reject impossible dates, dates outside the week and ambiguous quantities', () => {
  assert.ok(!planSchema.safeParse({ ...current, start: '2026-99-99' }).success);
  const meal = { date: '2026-10-12', title: 'Eating out' };
  assert.ok(planSchema.safeParse({ ...current, meals: [meal] }).success);
  assert.ok(!planSchema.safeParse({ ...current, meals: [{ ...meal, date: '2026-02-30' }] }).success);
  assert.ok(!planSchema.safeParse({ ...current, meals: [{ ...meal, date: '2026-10-19' }] }).success);
  assert.ok(!planSchema.safeParse({ ...current, start: '2026-10-13' }).success);
  assert.ok(!planSchema.safeParse({ ...current, meals: [{ ...meal, servings: 4, batches: 2 }] }).success);
  assert.ok(!planSchema.safeParse({ ...current, meals: [meal, meal] }).success);
  assert.ok(!planSchema.safeParse({ ...current, meals: [{ ...meal, title: ' ' }] }).success);
});
