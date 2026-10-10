import test from 'node:test';
import assert from 'node:assert/strict';
import { recipeSchema, planSchema, pantrySchema } from '../src/lib/schema.mjs';
import { shoppingList } from '../src/lib/quantities.mjs';

const item = (id, ingredient, quantity, unit, extra = {}) => ({ id, ingredient, name: ingredient, quantity, unit, ...extra });
const recipe = (id, data) => ({ id, data: recipeSchema.parse({ category: 'Mains', status: 'reviewed', steps: [{ id: 'cook', text: 'Cook.' }], ...data }) });
const soup = recipe('soup', {
  title: 'Soup', yield: { label: '4 portions', amount: 4, scalable: true },
  groups: [{ name: 'Ingredients', items: [
    item('onion', 'onions', 2, 'piece', { category: 'Produce' }),
    item('salmon', 'salmon', 450, 'g', { category: 'Meat & fish' }),
    item('stock', 'fish-stock', 1.2, 'l'),
    item('dill', 'fresh-dill', null, ''),
    item('salt', 'salt', null, ''),
    item('cube', 'stock-cube', 1, 'piece', { scalable: false }),
  ] }],
});
const bake = recipe('bake', {
  title: 'Bake', yield: { label: 'One tray', scalable: false },
  groups: [{ name: 'Ingredients', items: [
    item('onion', 'onions', 500, 'g', { category: 'Produce' }),
    item('flour', 'plain-flour', 0.5, 'kg', { category: 'Dry goods' }),
    item('salmon', 'salmon', 200, 'g', { category: 'Meat & fish' }),
    item('dill', 'fresh-dill', 10, 'g'),
  ] }],
});
const draft = recipe('draft', { ...bake.data, title: 'Draft', status: 'draft' });
const plan = meals => planSchema.parse({ id: 'week', title: 'Week', meals });
const pantry = items => pantrySchema.parse({ updated: '2026-10-10', items });
const week = plan([
  { id: 'mon', date: '2026-10-12', recipe: 'soup', servings: 6 },
  { id: 'tue', date: '2026-10-13', leftoversFrom: 'mon' },
  { id: 'wed', date: '2026-10-14', recipe: 'bake', batches: 2 },
  { id: 'fri', date: '2026-10-16', title: 'Takeaway' },
]);
const row = (rows, ingredient, unit) => rows.find(r => r.ingredient === ingredient && (unit === undefined || r.unit === unit));

test('hand-calculated week: scaling, batches, compatible units combined', () => {
  const { rows } = shoppingList(week, [soup, bake], pantry([]));
  // Soup ×1.5 (6 of 4 servings), bake ×2 batches, leftovers and free-text meals add nothing.
  assert.equal(row(rows, 'salmon').quantity, 450 * 1.5 + 200 * 2); // 1075 g
  assert.equal(row(rows, 'fish-stock').quantity, 1800);            // 1.2 l → ml
  assert.equal(row(rows, 'fish-stock').unit, 'ml');
  assert.equal(row(rows, 'plain-flour').quantity, 1000);           // 0.5 kg × 2
  assert.equal(row(rows, 'stock-cube').quantity, 1);               // non-scaling
});
test('incompatible units stay on separate lines', () => {
  const { rows } = shoppingList(week, [soup, bake], pantry([]));
  assert.equal(row(rows, 'onions', 'piece').quantity, 3);
  assert.equal(row(rows, 'onions', 'g').quantity, 1000);
});
test('unknown amounts are listed to check, never as zero, even beside a known amount', () => {
  const { rows } = shoppingList(week, [soup, bake], pantry([]));
  const dill = rows.filter(r => r.ingredient === 'fresh-dill');
  assert.equal(dill.length, 2);
  assert.equal(dill.find(r => r.quantity === null).needed, null);
  assert.equal(dill.find(r => r.quantity !== null).quantity, 20);
});
test('pantry deducts only compatible recorded quantities', () => {
  const stock = pantry([
    { ingredient: 'plain-flour', name: 'Flour', quantity: 0.6, unit: 'kg' },
    { ingredient: 'salmon', name: 'Salmon', quantity: 1, unit: 'piece' },
    { ingredient: 'fish-stock', name: 'Stock', quantity: 2, unit: 'l' },
    { ingredient: 'salt', name: 'Salt', stocked: true },
  ]);
  const { rows } = shoppingList(week, [soup, bake], stock);
  assert.equal(row(rows, 'plain-flour').have, 600);
  assert.equal(row(rows, 'plain-flour').needed, 400);
  assert.equal(row(rows, 'salmon').needed, 1075);          // pieces cannot offset grams
  assert.equal(row(rows, 'fish-stock').needed, 0);         // fully covered
  assert.equal(row(rows, 'salt').usuallyStocked, true);    // a prompt, not a deduction
  assert.equal(row(rows, 'salt').needed, null);
});
test('ranges keep their upper bound through deduction', () => {
  const ranged = recipe('ranged', { title: 'Ranged', yield: { label: 'x', scalable: false },
    groups: [{ name: 'I', items: [item('beef', 'beef', 1.5, 'kg', { max: 2 })] }] });
  const { rows } = shoppingList(plan([{ id: 'a', date: '2026-10-12', recipe: 'ranged' }]), [ranged],
    pantry([{ ingredient: 'beef', name: 'Beef', quantity: 1, unit: 'kg' }]));
  assert.equal(rows[0].needed, 500);
  assert.equal(rows[0].neededMax, 1000);
});
test('recipe notes produce a warning', () => {
  const noted = recipe('noted', { ...bake.data, issues: ['Check the dill.'] });
  const { warnings } = shoppingList(plan([{ id: 'a', date: '2026-10-12', recipe: 'noted' }]), [noted], pantry([]));
  assert.deepEqual(warnings, ['Bake: check recipe notes before shopping.']);
});
test('invalid plans are rejected', () => {
  const p = pantry([]);
  assert.throws(() => shoppingList(plan([{ id: 'a', date: '2026-10-12', recipe: 'missing' }]), [soup], p), /Unknown recipe/);
  assert.throws(() => shoppingList(plan([{ id: 'a', date: '2026-10-12', recipe: 'draft' }]), [draft], p), /Draft recipe/);
  assert.throws(() => shoppingList(plan([{ id: 'a', date: '2026-10-12', recipe: 'bake', servings: 3 }]), [bake], p), /Exact scaling unavailable/);
  assert.throws(() => shoppingList(plan([{ id: 'a', date: '2026-10-12', leftoversFrom: 'b' }, { id: 'b', date: '2026-10-13', recipe: 'soup' }]), [soup], p), /Invalid leftovers/);
});
test('items marked shopping: false are left off and aisles follow shop order', () => {
  const r = recipe('r', { title: 'R', yield: { label: 'x', scalable: false }, groups: [{ name: 'I', items: [
    item('water', 'water', 500, 'ml', { shopping: false }),
    item('salt', 'salt', 5, 'g', { category: 'Herbs & spices' }),
    item('leek', 'leek', 1, 'piece', { category: 'Produce' }),
    item('milk', 'milk', 100, 'ml', { category: 'Dairy & eggs' }),
  ] }] });
  const { rows } = shoppingList(plan([{ id: 'a', date: '2026-10-12', recipe: 'r' }]), [r], pantry([]));
  assert.deepEqual(rows.map(x => x.ingredient), ['leek', 'milk', 'salt']);
});
