import { readHistory } from '../lib/content.mjs';
// One row per planned meal across all saved weeks; opens directly in a spreadsheet.
const cell = (v: unknown) => { const s = v == null ? '' : String(v); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
export function GET() {
  const head = ['week', 'date', 'meal', 'recipe_id', 'title', 'category', 'tags', 'servings', 'factor', 'kcal_per_portion', 'leftovers', 'note'];
  const rows = readHistory().flatMap(w => w.meals.map((m: any) => [w.plan.id, m.date, m.meal, m.recipe?.id, m.recipe?.title || m.title, m.recipe?.category,
    m.recipe?.tags?.join(' '), m.servings, m.factor, m.recipe?.kcalPerPortion, m.leftoversFrom ? 'yes' : '', m.note]));
  return new Response([head, ...rows].map(r => r.map(cell).join(',')).join('\n') + '\n', { headers: { 'Content-Type': 'text/csv; charset=utf-8' } });
}
