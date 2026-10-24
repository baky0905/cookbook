import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';
import { z } from 'zod';
import { spoonHint, SPOON_HINT_MAX_G } from './units.mjs';

// Controlled lists live in content/taxonomy.yaml so they can grow without code changes.
const read = file => YAML.parse(fs.readFileSync(path.join(process.cwd(), 'content', file), 'utf8'));
export const taxonomy = read('taxonomy.yaml');
export const recipeCategories = taxonomy.categories.map(c => c.name);
export const shoppingCategories = taxonomy.aisles;
export const units = [...taxonomy.units.map(u => u.id), ''];
export const plurals = Object.fromEntries(taxonomy.units.filter(u => u.plural).map(u => [u.id, u.plural]));
export const tagGroups = taxonomy.tagGroups;
export const allowedTags = new Set(tagGroups.flatMap(g => g.tags));

export const id = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'use lowercase letters, digits and hyphens');
const positive = z.number().positive();
// Editors save empty fields as '' or null; treat both as "not set".
const blank = v => (v === '' || v === null ? undefined : v);
const opt = schema => z.preprocess(blank, schema.optional());

export const ingredientCatalogSchema = z.object({
  ingredients: z.array(z.object({
    id, name: z.string().min(1), aisle: z.enum(shoppingCategories),
    kcal: opt(z.number().nonnegative()), density: opt(positive),
    weights: opt(z.record(z.string(), positive)), staple: z.boolean().default(false), shop: z.boolean().default(true),
  })),
});
export const readCatalog = () => ingredientCatalogSchema.parse(read('ingredients.yaml')).ingredients;

export const photoSchema = z.object({
  src: z.string().min(1), alt: z.string().min(1), caption: opt(z.string()),
  credit: opt(z.string()), source: opt(z.string().url()),
}).strict();
export const ingredientSchema = z.object({
  id, ingredient: id, name: z.string().min(1),
  quantity: z.preprocess(blank, positive.nullable().default(null)), max: opt(positive),
  // prep: what to do before cooking ("finely chopped"); note: anything else. The ingredient list doubles as the prep list.
  unit: z.preprocess(v => v ?? '', z.enum(units)), prep: opt(z.string()), note: opt(z.string()),
  optional: z.boolean().default(false), scalable: z.boolean().default(true),
  // A spoon hint for a small gram amount, e.g. "½ teaspoon" after 1 g.
  spoon: opt(z.string().regex(spoonHint, 'Spoon hint must look like "½ teaspoon" or "1½–2 teaspoons"')),
}).strict().refine(v => v.max === undefined || (v.quantity !== null && v.max >= v.quantity), 'Invalid quantity range')
  .refine(v => !v.spoon || (v.unit === 'g' && v.quantity !== null && (v.max ?? v.quantity) <= SPOON_HINT_MAX_G), `A spoon hint needs a gram amount of at most ${SPOON_HINT_MAX_G} g`);

export const recipeSchema = z.object({
  title: z.string().min(1), description: z.preprocess(v => v ?? '', z.string()), category: z.enum(recipeCategories),
  tags: z.array(z.string()).default([]), language: z.literal('en').default('en'), originalLanguage: opt(z.string()),
  // The dish's name in its own language (Palačinke, hr), shown under the English title.
  originalName: opt(z.object({ name: z.string().min(1), lang: z.string().min(2) }).strict()),
  aliases: z.array(id).default([]),
  status: z.enum(['draft', 'needs-review', 'reviewed', 'cooked']).default('draft'),
  // amount: what the original recipe makes, for scaling by portions. scalable: false warns that pan size or times may need adjusting.
  yield: z.object({ label: z.string().min(1), amount: opt(positive), unit: z.preprocess(v => v || 'portions', z.string()), scalable: z.boolean().default(false) }).strict(),
  time: z.object({ total: opt(z.string()), active: opt(z.string()), cook: opt(z.string()), rest: opt(z.string()) }).strict().default({}),
  nutrition: opt(z.object({ kcalPerPortion: opt(positive), source: opt(z.string()) })),
  groups: z.array(z.object({ name: z.string(), items: z.array(ingredientSchema).min(1) }).strict()).min(1),
  steps: z.array(z.object({ id, title: z.preprocess(v => v ?? '', z.string()), text: z.string().min(1), duration: opt(z.string()), images: z.preprocess(v => v ?? [], z.array(photoSchema)) }).strict()).min(1),
  cover: opt(photoSchema),
  sources: z.array(z.object({ title: z.string(), url: opt(z.string().url()), accessed: opt(z.string()), timestamp: opt(z.string()) }).strict()).default([]),
  issues: z.array(z.string()).default([]), adaptations: z.array(z.string()).default([]),
  legacyPath: opt(z.string().regex(/^[a-z_]+\/[a-z_]+\/$/)),
}).strict().superRefine((r, ctx) => {
  const items = r.groups.flatMap(g => g.items);
  for (const [kind, values] of [['ingredient', items.map(x => x.id)], ['step', r.steps.map(x => x.id)]]) {
    if (new Set(values).size !== values.length) ctx.addIssue({ code: 'custom', message: `Duplicate ${kind} ID` });
  }
  for (const step of r.steps) for (const match of step.text.matchAll(/\{\{([a-z0-9-]+)\}\}/g)) {
    if (!items.some(i => i.id === match[1])) ctx.addIssue({ code: 'custom', message: `Unknown ingredient reference ${match[1]}` });
  }
});

const date = z.iso.date();
export const extraSchema = z.object({
  ingredient: opt(id), name: opt(z.string()), quantity: opt(positive), max: opt(positive),
  unit: z.preprocess(v => v ?? '', z.enum(units)), note: opt(z.string()),
}).strict().refine(e => e.ingredient || e.name, 'An extra item needs an ingredient or a name');
export const planSchema = z.object({
  id, title: z.string(), example: z.boolean().default(false), start: opt(date), notes: opt(z.string()),
  // A meal's id defaults to "<date>-<meal>", so planning on a phone needs no extra typing.
  meals: z.preprocess(v => (v ?? []).map(m => m && typeof m === 'object' && !m.id && m.date ? { ...m, id: `${m.date}-${String(m.meal || 'dinner').toLowerCase()}` } : m), z.array(z.object({
    id, date, meal: z.preprocess(v => v || 'Dinner', z.string()), recipe: opt(id), title: opt(z.string()),
    servings: opt(positive), batches: opt(positive), leftoversFrom: opt(id), note: opt(z.string()),
  }).strict())),
  extras: z.preprocess(v => v ?? [], z.array(extraSchema)),
}).superRefine((plan, ctx) => {
  if (plan.start && !date.safeParse(plan.start).success) return;
  const issue = (path, message) => ctx.addIssue({ code: 'custom', path, message });
  if (plan.start && new Date(plan.start + 'T12:00:00Z').getUTCDay() !== 1)
    issue(['start'], 'A week must start on Monday');
  const end = plan.start ? new Date(Date.parse(plan.start + 'T12:00:00Z') + 6 * 864e5).toISOString().slice(0, 10) : null;
  const seen = new Set();
  for (const [index, meal] of plan.meals.entries()) {
    if (seen.has(meal.id)) issue(['meals', index, 'id'], 'Duplicate meal: use another meal slot or a unique ID');
    seen.add(meal.id);
    if (plan.start && (meal.date < plan.start || meal.date > end))
      issue(['meals', index, 'date'], 'Choose a date within this week');
    if (!meal.recipe && !meal.title?.trim() && !meal.leftoversFrom)
      issue(['meals', index], 'Choose a recipe or enter a meal title');
    if (meal.servings && meal.batches) issue(['meals', index], 'Use portions or batches, not both');
  }
});
export const pantrySchema = z.object({
  updated: z.preprocess(blank, z.string().nullable().default(null)),
  items: z.preprocess(v => v ?? [], z.array(z.object({ ingredient: id, name: z.string(), quantity: opt(positive), unit: opt(z.string()), stocked: z.boolean().default(false) }))),
});
