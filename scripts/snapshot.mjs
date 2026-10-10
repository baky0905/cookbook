// Freezes every finished week into content/history/<plan-id>.json (never overwrites).
// npm run history:snapshot            all weeks except the current one
// npm run history:snapshot -- <id>    one specific week, even if current
import fs from 'node:fs';
import { readRecipes, readPlans, readPantry, readCatalog, currentPlan } from '../src/lib/content.mjs';
import { snapshotPlan } from '../src/lib/history.mjs';

export function snapshotFinishedWeeks(only) {
  const plans = readPlans(), current = currentPlan(plans);
  const recipes = readRecipes(), pantry = readPantry(), catalog = readCatalog();
  fs.mkdirSync('content/history', { recursive: true });
  const written = [];
  for (const plan of plans) {
    if (plan.example || (only ? plan.id !== only : plan === current) || !plan.meals.length) continue;
    const file = `content/history/${plan.id}.json`;
    if (fs.existsSync(file)) continue;
    fs.writeFileSync(file, JSON.stringify(snapshotPlan(plan, recipes, pantry, catalog), null, 2) + '\n');
    written.push(file);
  }
  return written;
}
if (import.meta.url === `file://${process.argv[1]}`) {
  const written = snapshotFinishedWeeks(process.argv[2]);
  console.log(written.length ? `Saved ${written.join(', ')}` : 'No new weeks to save.');
}
