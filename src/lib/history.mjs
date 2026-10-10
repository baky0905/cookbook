import crypto from 'node:crypto';
import { shoppingList, mealFactor } from './quantities.mjs';
import { estimateCalories } from './nutrition.mjs';

// A frozen record of one week: what was planned, how much, and what was bought.
// Later recipe edits don't change it, so it can be analysed over time.
export function snapshotPlan(plan, recipes, pantry, catalog, takenAt = new Date().toISOString()) {
  const byId = new Map(recipes.map(r => [r.id, r]));
  const meals = [...plan.meals].sort((a, b) => a.date.localeCompare(b.date)).map(meal => {
    const recipe = meal.recipe && !meal.leftoversFrom ? byId.get(meal.recipe) : null;
    const factor = recipe ? mealFactor(meal, recipe.data) : null;
    const kcal = recipe ? (recipe.data.nutrition?.kcalPerPortion ?? estimateCalories(recipe.data, catalog).perPortion) : null;
    return {
      date: meal.date, meal: meal.meal, title: meal.title || recipe?.data.title || null, note: meal.note || null,
      leftoversFrom: meal.leftoversFrom || null, servings: meal.servings || null, batches: meal.batches || null, factor,
      recipe: recipe ? {
        id: recipe.id, title: recipe.data.title, category: recipe.data.category, tags: recipe.data.tags, status: recipe.data.status,
        yield: recipe.data.yield.label, kcalPerPortion: kcal,
        version: crypto.createHash('sha256').update(JSON.stringify([recipe.data.groups, recipe.data.steps])).digest('hex').slice(0, 10),
      } : null,
    };
  });
  const list = shoppingList(plan, recipes, pantry, catalog);
  return {
    plan: { id: plan.id, title: plan.title, start: plan.start || meals[0]?.date || null, notes: plan.notes || null },
    takenAt, meals, extras: plan.extras || [], warnings: list.warnings,
    shopping: list.rows.map(({ key, ...row }) => row),
  };
}
