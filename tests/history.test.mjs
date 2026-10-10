import test from 'node:test';
import assert from 'node:assert/strict';
import { recipeSchema, planSchema, pantrySchema } from '../src/lib/schema.mjs';
import { snapshotPlan } from '../src/lib/history.mjs';
import { prepHtml } from '../src/lib/render.mjs';

test('a week snapshot freezes meals, amounts and the shopping list', () => {
  const soup = { id: 'soup', data: recipeSchema.parse({ title: 'Soup', category: 'Soups & stews', status: 'reviewed',
    yield: { label: '4 portions', amount: 4, unit: 'portions', scalable: true }, steps: [{ id: 's', text: 'Cook.' }],
    groups: [{ name: 'I', items: [{ id: 'leek', ingredient: 'leek', name: 'leeks', quantity: 2, unit: 'piece' }] }] }) };
  const plan = planSchema.parse({ id: '2026-w42', title: 'Week 42', start: '2026-10-12', notes: 'Busy week',
    meals: [{ date: '2026-10-12', recipe: 'soup', servings: 6 }, { date: '2026-10-13', leftoversFrom: '2026-10-12-dinner' }] });
  const catalog = [{ id: 'leek', name: 'leeks', aisle: 'Produce', kcal: 61, weights: { piece: 100 }, staple: false, shop: true }];
  const snap = snapshotPlan(plan, [soup], pantrySchema.parse({ updated: null, items: [] }), catalog, '2026-10-19T00:00:00Z');
  assert.equal(snap.plan.notes, 'Busy week');
  assert.equal(snap.meals[0].factor, 1.5);
  assert.equal(snap.meals[0].recipe.title, 'Soup');
  assert.equal(snap.meals[1].leftoversFrom, '2026-10-12-dinner');
  assert.equal(snap.shopping[0].quantity, 3);
  assert.match(snap.meals[0].recipe.version, /^[0-9a-f]{10}$/);
});
test('prep wording links to the cutting-size reference', () => {
  assert.equal(prepHtml('Small diced', '/cookbook/'), '<a class="prep-link" href="/cookbook/reference/cuts/#small-dice">Small diced</a>');
  assert.match(prepHtml('Peeled, cut into obliques', '/c/'), /#oblique/);
  assert.equal(prepHtml('At room temperature', '/c/'), 'At room temperature');
});
