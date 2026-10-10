import test from 'node:test';
import assert from 'node:assert/strict';
import { recipeSchema, planSchema } from '../src/lib/schema.mjs';
import { parseRecipe } from '../src/lib/content.mjs';

const base = () => ({
  title: 'Test', category: 'Mains', status: 'reviewed',
  yield: { label: '4 portions', amount: 4, scalable: true },
  groups: [{ name: 'Ingredients', items: [{ id: 'flour', ingredient: 'plain-flour', name: 'flour', quantity: 200, unit: 'g' }] }],
  steps: [{ id: 'mix', text: 'Mix {{flour}}.' }],
});
const issues = value => recipeSchema.safeParse(value).error?.issues.map(i => i.message) ?? [];

test('a complete recipe is valid and fills defaults', () => {
  const r = recipeSchema.parse(base());
  assert.equal(r.groups[0].items[0].scalable, true);
  assert.deepEqual(r.steps[0].images, []);
});
test('a yield without an exact amount is valid (it scales by batch instead of portions)', () => {
  const r = base(); delete r.yield.amount;
  assert.deepEqual(issues(r), []);
});
test('blank optional fields from the editor are treated as unset', () => {
  const r = base(); r.groups[0].items[0].max = null; r.groups[0].items[0].note = ''; r.cover = null; r.yield.amount = '';
  const parsed = recipeSchema.parse(r);
  assert.equal(parsed.groups[0].items[0].max, undefined);
  assert.equal(parsed.cover, undefined);
});
test('ingredient and step IDs must be unique', () => {
  const r = base(); r.steps.push({ id: 'mix', text: 'Again.' });
  assert.ok(issues(r).includes('Duplicate step ID'));
});
test('step references must point at an ingredient', () => {
  const r = base(); r.steps[0].text = 'Add {{sugar}}.';
  assert.ok(issues(r).includes('Unknown ingredient reference sugar'));
});
test('ranges must not be inverted', () => {
  const r = base(); r.groups[0].items[0].max = 100;
  assert.ok(issues(r).includes('Invalid quantity range'));
});
test('unknown quantities stay null instead of becoming zero', () => {
  const r = base(); delete r.groups[0].items[0].quantity;
  assert.equal(recipeSchema.parse(r).groups[0].items[0].quantity, null);
});
test('cups are not an accepted unit', () => {
  const r = base(); r.groups[0].items[0].unit = 'cup';
  assert.equal(recipeSchema.safeParse(r).success, false);
});
test('plan dates use ISO format', () => {
  assert.equal(planSchema.safeParse({ id: 'w', title: 'W', meals: [{ id: 'a', date: '12/10/2026', recipe: 'x' }] }).success, false);
});
test('recipe files need frontmatter', () => {
  assert.throws(() => parseRecipe('# Just markdown'), /frontmatter/);
});
test('category must come from the fixed list', () => {
  const r = base(); r.category = 'Main dishes';
  assert.equal(recipeSchema.safeParse(r).success, false);
});
test('recipes are written in English', () => {
  const r = base(); r.language = 'hr';
  assert.equal(recipeSchema.safeParse(r).success, false);
  assert.equal(recipeSchema.safeParse({ ...base(), originalLanguage: 'hr' }).success, true);
});
test('spoon units are no longer accepted', () => {
  for (const unit of ['tsp', 'tbsp']) {
    const r = base(); r.groups[0].items[0].unit = unit;
    assert.equal(recipeSchema.safeParse(r).success, false, unit);
  }
});
test('an unknown key fails, catching text split by an unquoted comma', () => {
  const r = base(); r.steps[0] = { id: 'mix', text: 'Serve with bread', 'as they would in Finland.': null };
  assert.equal(recipeSchema.safeParse(r).success, false);
});
