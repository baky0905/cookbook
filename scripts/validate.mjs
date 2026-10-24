// Fails the build on invalid content, so a broken recipe or plan never deploys.
import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';
import sharp from 'sharp';
import { parseRecipe } from '../src/lib/content.mjs';
import { planSchema, pantrySchema, allowedTags, readCatalog } from '../src/lib/schema.mjs';
import { shoppingList } from '../src/lib/quantities.mjs';
import { imperial, withoutSpoonHints } from '../src/lib/units.mjs';
import { mediaPath, MEDIA_MAX_BYTES, MEDIA_MAX_EDGE } from '../src/lib/paths.mjs';

const errors = [], warnings = [];
const fail = (file, message) => errors.push(`${file}: ${message}`);
const zodMessage = e => e.issues ? e.issues.map(i => `${i.path.join('.') || '(root)'} ${i.message}${i.code === 'unrecognized_keys' ? ' (text with a comma inside { } must be in "quotes")' : ''}`).join('; ') : e.message;
const load = (file, parse) => { try { return parse(fs.readFileSync(file, 'utf8')); } catch (e) { fail(file, zodMessage(e)); } };

const catalog = load('content/ingredients.yaml', () => readCatalog()) || [];
const known = new Set();
for (const c of catalog) { if (known.has(c.id)) fail('content/ingredients.yaml', `duplicate ingredient ${c.id}`); known.add(c.id); }
const used = new Set();
const checkIngredient = (where, ingredient, what = 'ingredient') => {
  used.add(ingredient);
  if (!known.has(ingredient)) fail(where, `${what} "${ingredient}" is not in content/ingredients.yaml; add it there first`);
};

const recipes = [], referencedMedia = new Set();
for (const file of fs.readdirSync('content/recipes').filter(f => f.endsWith('.md')).sort()) {
  const where = `content/recipes/${file}`, id = file.slice(0, -3);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) fail(where, 'file name must be a lowercase-hyphenated recipe ID');
  const recipe = load(where, parseRecipe);
  if (!recipe) continue;
  recipes.push({ id, ...recipe });
  fs.readFileSync(where, 'utf8').split('\n').forEach((line, n) => {
    const hit = withoutSpoonHints(line).match(imperial);
    if (hit && !/^\s*(url|source):/.test(line)) fail(`${where}:${n + 1}`, `non-metric measure "${hit[0].trim()}"; use g, ml, °C or cm`);
  });
  for (const tag of recipe.data.tags) if (!allowedTags.has(tag)) fail(where, `unknown tag "${tag}"; add it to content/taxonomy.yaml first`);
  for (const item of recipe.data.groups.flatMap(g => g.items)) checkIngredient(where, item.ingredient);
  for (const image of [recipe.data.cover, ...recipe.data.steps.flatMap(s => s.images)].filter(Boolean)) {
    const file = mediaPath(image.src);
    referencedMedia.add(file);
    if (!fs.existsSync(path.join('content/media', file))) fail(where, `missing photo content/media/${file}`);
  }
  if (recipe.data.legacyPath && !fs.existsSync(`public/archive/${recipe.data.legacyPath.replace(/\/$/, '')}.md`))
    fail(where, `archived original missing for ${recipe.data.legacyPath}`);
}

// Photos used by reference pages (e.g. cutting sizes) count as used too.
for (const file of fs.readdirSync('content/reference').filter(f => f.endsWith('.yaml')))
  for (const [, src] of fs.readFileSync(path.join('content/reference', file), 'utf8').matchAll(/src:\s*"?([^",}\s]+)/g)) {
    referencedMedia.add(mediaPath(src));
    if (!fs.existsSync(path.join('content/media', mediaPath(src)))) fail(`content/reference/${file}`, `missing photo content/media/${mediaPath(src)}`);
  }
// Photos: small, web-friendly files only, so the repository and the site stay light.
const mediaFiles = fs.existsSync('content/media') ? fs.readdirSync('content/media', { recursive: true }).filter(f => fs.statSync(path.join('content/media', f)).isFile()) : [];
for (const file of mediaFiles) {
  const where = `content/media/${file}`;
  if (path.basename(file).startsWith('.')) continue;
  if (!/\.(webp|jpe?g|png|avif)$/i.test(file)) { fail(where, 'unsupported file type; use WebP, JPEG or PNG'); continue; }
  const bytes = fs.statSync(where).size;
  const { width = 0, height = 0 } = await sharp(where).metadata();
  if (bytes > MEDIA_MAX_BYTES || Math.max(width, height) > MEDIA_MAX_EDGE)
    fail(where, `${Math.round(bytes / 1024)} KB, ${width}×${height}; run "npm run media:optimize" (limit ${MEDIA_MAX_BYTES / 1024} KB, ${MEDIA_MAX_EDGE} px)`);
  if (!referencedMedia.has(file)) warnings.push(`Photo not used by any recipe: ${where}`);
}

const legacy = new Map();
for (const r of recipes) if (r.data.legacyPath) {
  if (legacy.has(r.data.legacyPath)) fail(`content/recipes/${r.id}.md`, `legacyPath also used by ${legacy.get(r.data.legacyPath)}`);
  legacy.set(r.data.legacyPath, r.id);
}
const ids = new Set(recipes.map(r => r.id)), aliases = new Map();
for (const r of recipes) for (const alias of r.data.aliases) {
  if (ids.has(alias) || aliases.has(alias)) fail(`content/recipes/${r.id}.md`, `alias "${alias}" is already a recipe ID or alias`);
  aliases.set(alias, r.id);
}
const urls = new Map();
for (const r of recipes) for (const s of r.data.sources) if (s.url) urls.set(s.url, [...(urls.get(s.url) || []), r.id]);
for (const [link, list] of urls) if (list.length > 1) warnings.push(`Same source link in ${list.join(', ')}: ${link}`);

const pantry = load('content/pantry.yaml', t => pantrySchema.parse(YAML.parse(t)));
for (const item of pantry?.items || []) checkIngredient('content/pantry.yaml', item.ingredient);
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
  for (const extra of plan.extras) if (extra.ingredient) checkIngredient(where, extra.ingredient, 'extra item');
  if (pantry) try { shoppingList(plan, recipes, pantry, catalog); } catch (e) { fail(where, e.message); }
}

for (const file of fs.existsSync('content/history') ? fs.readdirSync('content/history').filter(f => f.endsWith('.json')) : []) {
  const snap = load(`content/history/${file}`, JSON.parse);
  if (snap && (!snap.plan?.id || !Array.isArray(snap.meals) || !Array.isArray(snap.shopping))) fail(`content/history/${file}`, 'not a valid week snapshot');
}

const unused = catalog.filter(c => !used.has(c.id)).map(c => c.id);
if (unused.length) console.log(`note: ${unused.length} catalogue ingredients are not used by any recipe (kept for future imports).`);
const drafts = recipes.filter(r => r.data.status === 'draft').map(r => r.id);
if (drafts.length) warnings.push(`Drafts not published: ${drafts.join(', ')}`);
for (const w of warnings) console.warn(`warning: ${w}`);
if (errors.length) {
  for (const e of errors) console.error(`error: ${e}`);
  console.error(`\n${errors.length} problem(s); fix them before publishing.`);
  process.exit(1);
}
console.log(`Content valid: ${recipes.length} recipes (${recipes.length - drafts.length} published), ${catalog.length} ingredients, ${planIds.size} plan(s), ${mediaFiles.length} photo(s).`);
