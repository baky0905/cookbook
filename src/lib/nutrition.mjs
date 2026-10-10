import { normalise } from './quantities.mjs';

// Rough calories from the ingredient catalogue. Spices, pinches and unbought items are ignored;
// anything else without a usable amount or calorie value is listed as not counted.
export function estimateCalories(recipe, catalog, factor = 1) {
  const info = new Map(catalog.map(c => [c.id, c]));
  let kcal = 0; const counted = [], uncounted = [];
  for (const item of recipe.groups.flatMap(g => g.items)) {
    const c = info.get(item.ingredient);
    if (!c || c.shop === false || c.aisle === 'Herbs & spices' || item.unit === 'pinch' || item.optional) continue;
    const grams = item.quantity == null || c.kcal == null ? null : toGrams(item, c);
    if (grams == null) { uncounted.push(item.name); continue; }
    const mid = item.max ? (item.quantity + item.max) / 2 : item.quantity;
    kcal += (grams * (mid / item.quantity) * (item.scalable === false ? 1 : factor) * c.kcal) / 100;
    counted.push(item.name);
  }
  const total = counted.length + uncounted.length;
  // Only claim an estimate when it covers most of the recipe.
  const reliable = total > 0 && counted.length / total >= 0.8;
  const portions = recipe.yield.amount ? recipe.yield.amount * factor : null;
  return { kcal: Math.round(kcal), perPortion: portions && /portion|serving/.test(recipe.yield.unit) ? Math.round(kcal / portions) : null, counted, uncounted, reliable };
}
function toGrams(item, c) {
  const { quantity, unit } = normalise(item.quantity, item.unit);
  if (unit === 'g') return quantity;
  if (unit === 'ml') return c.density ? quantity * c.density : null;
  const each = c.weights?.[unit || 'piece'];
  return each ? quantity * each : null;
}
