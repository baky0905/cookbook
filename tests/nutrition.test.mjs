import test from 'node:test';
import assert from 'node:assert/strict';
import { recipeSchema } from '../src/lib/schema.mjs';
import { estimateCalories } from '../src/lib/nutrition.mjs';

const catalog = [
  { id: 'plain-flour', aisle: 'Dry goods', kcal: 364, density: 0.53 },
  { id: 'butter', aisle: 'Dairy & eggs', kcal: 717, density: 0.91 },
  { id: 'egg', aisle: 'Dairy & eggs', kcal: 143, weights: { piece: 50 } },
  { id: 'salt', aisle: 'Herbs & spices' }, { id: 'water', aisle: 'Other', kcal: 0, shop: false },
  { id: 'olive-oil', aisle: 'Oils & condiments', kcal: 884, density: 0.91 },
];
const make = (items, y = { label: '4 portions', amount: 4, unit: 'portions' }) => recipeSchema.parse({
  title: 'T', category: 'Mains', yield: y, steps: [{ id: 's', text: 'x' }],
  groups: [{ name: 'I', items: items.map((it, i) => ({ id: 'i' + i, name: it.ingredient, ...it })) }],
});

test('calories from grams, pieces and ml; spices and water ignored', () => {
  const r = make([{ ingredient: 'plain-flour', quantity: 100, unit: 'g' }, { ingredient: 'egg', quantity: 2, unit: 'piece' },
    { ingredient: 'butter', quantity: 100, unit: 'ml' }, { ingredient: 'salt', quantity: 5, unit: 'g' }, { ingredient: 'water', quantity: 200, unit: 'ml' }]);
  const e = estimateCalories(r, catalog);
  // 364 + 2×50×1.43 + 100×0.91×7.17 = 364 + 143 + 652.47
  assert.equal(e.kcal, 1159);
  assert.equal(e.perPortion, 290);
  assert.equal(e.reliable, true);
});
test('missing amounts are reported and block an unreliable estimate', () => {
  const r = make([{ ingredient: 'plain-flour', quantity: 100, unit: 'g' }, { ingredient: 'olive-oil' }]);
  const e = estimateCalories(r, catalog);
  assert.deepEqual(e.uncounted, ['olive-oil']);
  assert.equal(e.reliable, false);
});
test('no per-portion figure when the yield is not in portions', () => {
  const r = make([{ ingredient: 'plain-flour', quantity: 500, unit: 'g' }], { label: '1 loaf', amount: 1, unit: 'loaves' });
  assert.equal(estimateCalories(r, catalog).perPortion, null);
});
