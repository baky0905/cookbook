// Fails the build on invalid content, so a broken recipe or plan never deploys.
import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';
import { parseRecipe } from '../src/lib/content.mjs';
import { planSchema, pantrySchema } from '../src/lib/schema.mjs';
import { shoppingList } from '../src/lib/quantities.mjs';

const errors = [], warnings = [];
const fail = (file, message) => errors.push(`${file}: ${message}`);
const zodMessage = e => e.issues ? e.issues.map(i => `${i.path.join('.') || '(root)'} ${i.message}`).join('; ') : e.message;
const load = (file, parse) => { try { return parse(fs.readFileSync(file, 'utf8')); } catch (e) { fail(file, zodMessage(e)); } };

const recipes = [];
for (const file of fs.readdirSync('content/recipes').filter(f => f.endsWith('.md')).sort()) {
  const where = `content/recipes/${file}`, id = file.slice(0, -3);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) fail(where, 'file name must be a lowercase-hyphenated recipe ID');
  const recipe = load(where, parseRecipe);
  if (!recipe) continue;
  recipes.push({ id, ...recipe });
  const media = [recipe.data.cover, ...recipe.data.steps.flatMap(s => s.images)].filter(Boolean);
  for (const image of media) {
    if (!fs.existsSync(path.join('content/media', image.src))) fail(where, `missing media content/media/${image.src}`);
    if (!/\.(png|jpe?g|webp|avif)$/i.test(image.src)) fail(where, `unsupported image type ${image.src}`);
  }
  if (recipe.data.legacyPath && !fs.existsSync(`public/archive/${recipe.data.legacyPath.replace(/\/$/, '')}.md`))
    fail(where, `archived original missing for ${recipe.data.legacyPath}`);
}

const legacy = new Map();
for (const r of recipes) if (r.data.legacyPath) {
  if (legacy.has(r.data.legacyPath)) fail(`content/recipes/${r.id}.md`, `legacyPath also used by ${legacy.get(r.data.legacyPath)}`);
  legacy.set(r.data.legacyPath, r.id);
}
const urls = new Map();
for (const r of recipes) for (const s of r.data.sources) if (s.url) urls.set(s.url, [...(urls.get(s.url) || []), r.id]);
for (const [link, ids] of urls) if (ids.length > 1) warnings.push(`Same source link in ${ids.join(', ')}: ${link}`);

const pantry = load('content/pantry.yaml', t => pantrySchema.parse(YAML.parse(t)));
const planIds = new Set();
for (const file of fs.readdirSync('content/plans').filter(f => f.endsWith('.yaml')).sort()) {
  const where = `content/plans/${file}`;
  const plan = load(where, t => planSchema.parse(YAML.parse(t)));
  if (!plan) continue;
  if (planIds.has(plan.id)) fail(where, `duplicate plan ID ${plan.id}`);
  planIds.add(plan.id);
  const mealIds = plan.meals.map(m => m.id);
  if (new Set(mealIds).size !== mealIds.length) fail(where, 'duplicate meal ID');
  for (const meal of plan.meals) {
    if (Number.isNaN(Date.parse(meal.date))) fail(where, `${meal.id}: invalid date ${meal.date}`);
    if (!meal.recipe && !meal.title && !meal.leftoversFrom) fail(where, `${meal.id}: needs a recipe, title or leftoversFrom`);
  }
  if (pantry) try { shoppingList(plan, recipes, pantry); } catch (e) { fail(where, e.message); }
}

const drafts = recipes.filter(r => r.data.status === 'draft').map(r => r.id);
if (drafts.length) warnings.push(`Drafts not published: ${drafts.join(', ')}`);
for (const w of warnings) console.warn(`warning: ${w}`);
if (errors.length) {
  for (const e of errors) console.error(`error: ${e}`);
  console.error(`\n${errors.length} problem(s); fix them before publishing.`);
  process.exit(1);
}
console.log(`Content valid: ${recipes.length} recipes (${recipes.length - drafts.length} published), ${planIds.size} plan(s).`);
