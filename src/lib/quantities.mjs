import { formatAmount, number } from './format.mjs';
import { shoppingCategories, plurals } from './schema.mjs';
export { number };

export function amount(item, factor = 1) {
  if (item.quantity == null) return '';
  return formatAmount({ qty: item.quantity, max: item.max, unit: item.unit, scalable: item.scalable !== false, plural: plurals[item.unit] }, factor);
}
const round = n => Math.round(n * 1e6) / 1e6;
export function normalise(quantity, unit) {
  if (unit === 'kg') return { quantity: round(quantity * 1000), unit: 'g' };
  if (unit === 'l') return { quantity: round(quantity * 1000), unit: 'ml' };
  return { quantity, unit };
}
// How much of the original recipe a planned meal needs.
export function mealFactor(meal, recipe) {
  if (meal.servings) {
    if (!recipe.yield.amount) throw new Error(`${recipe.title} has no exact yield; plan it with batches instead of servings`);
    return meal.servings / recipe.yield.amount;
  }
  return meal.batches || 1;
}

export function shoppingList(plan, recipes, pantry, catalog) {
  const rows = new Map(), warnings = [];
  const byId = new Map(recipes.map(r => [r.id, r.data]));
  const info = new Map(catalog.map(c => [c.id, c]));
  const add = (item, factor, source) => {
    const known = info.get(item.ingredient);
    if (known?.shop === false) return;
    const scale = item.scalable === false ? 1 : factor;
    const q = item.quantity == null ? null : normalise(item.quantity * scale, item.unit);
    const max = item.max == null ? null : normalise(item.max * scale, item.unit).quantity;
    // Unknown amounts must stay visible even if another recipe quantifies the same ingredient.
    const unit = q?.unit || item.unit;
    const key = [item.ingredient || item.name, unit, q ? 'known' : 'unknown', item.optional ? 'optional' : 'required'].join('|');
    const row = rows.get(key) || { key, ingredient: item.ingredient, name: known?.name || item.name, quantity: q ? 0 : null, max: q ? 0 : null, unit,
      category: known?.aisle || 'Other', optional: !!item.optional, staple: !!known?.staple, norway: known?.norway, recipes: [], notes: [] };
    if (q) { row.quantity = round(row.quantity + q.quantity); row.max = round(row.max + (max ?? q.quantity)); }
    if (!row.recipes.includes(source)) row.recipes.push(source);
    if (item.note && !row.notes.includes(item.note)) row.notes.push(item.note);
    rows.set(key, row);
  };
  for (const meal of plan.meals) {
    if (meal.leftoversFrom) {
      const source = plan.meals.find(m => m.id === meal.leftoversFrom);
      if (!source || source.leftoversFrom || !source.recipe || source.date > meal.date) throw new Error(`Invalid leftovers reference: ${meal.id}`);
      continue;
    }
    if (!meal.recipe) continue;
    const recipe = byId.get(meal.recipe);
    if (!recipe) throw new Error(`Unknown recipe: ${meal.recipe}`);
    if (recipe.status === 'draft') throw new Error(`Draft recipe in plan: ${meal.recipe}`);
    const factor = mealFactor(meal, recipe);
    if (recipe.issues.length) warnings.push(`${recipe.title}: check recipe notes before shopping.`);
    if (factor !== 1 && !recipe.yield.scalable) warnings.push(`${recipe.title}: scaled ×${number(factor)}; check pan size and baking time.`);
    for (const item of recipe.groups.flatMap(g => g.items)) add(item, factor, recipe.title);
  }
  for (const extra of plan.extras || []) add({ ...extra, name: extra.name || info.get(extra.ingredient)?.name, quantity: extra.quantity ?? null }, 1, 'Extra this week');

  const stock = new Map();
  for (const item of pantry.items) if (item.quantity != null) {
    const q = normalise(item.quantity, item.unit || ''); const key = item.ingredient + '|' + q.unit;
    stock.set(key, (stock.get(key) || 0) + q.quantity);
  }
  const output = [...rows.values()].sort((a, b) => Number(a.optional) - Number(b.optional));
  for (const row of output) {
    const key = row.ingredient + '|' + row.unit;
    const available = stock.get(key) || 0;
    row.have = row.quantity === null ? 0 : Math.min(available, row.max);
    stock.set(key, available - row.have);
    row.needed = row.quantity === null ? null : Math.max(0, row.quantity - row.have);
    row.neededMax = row.max === null ? null : Math.max(0, row.max - row.have);
    row.usuallyStocked = row.staple || pantry.items.some(i => i.ingredient === row.ingredient && i.stocked);
  }
  // Aisle order follows taxonomy.yaml, so the printed list matches a walk through the shop.
  const aisle = c => shoppingCategories.indexOf(c);
  return { rows: output.sort((a, b) => aisle(a.category) - aisle(b.category) || a.name.localeCompare(b.name)), warnings: [...new Set(warnings)] };
}
