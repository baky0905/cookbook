import YAML from 'yaml';
import { recipeCategories, shoppingCategories, units, taxonomy, readCatalog } from '../../lib/schema.mjs';
import { readRecipes } from '../../lib/content.mjs';
import { MEDIA_MAX_BYTES } from '../../lib/paths.mjs';

// Editor configuration, generated so its dropdowns always match taxonomy.yaml, ingredients.yaml and the recipes.
// New recipes or ingredients appear in dropdowns after the next deploy.
const opt = { required: false };
const str = (name: string, label: string, extra = {}) => ({ name, label, widget: 'string', ...extra });
const num = (name: string, label: string, extra = {}) => ({ name, label, widget: 'number', value_type: 'float', min: 0, ...opt, ...extra });
const bool = (name: string, label: string, def: boolean) => ({ name, label, widget: 'boolean', default: def, ...opt });
const sel = (name: string, label: string, options: unknown[], extra = {}) => ({ name, label, widget: 'select', options, ...extra });
const strings = (name: string, label: string, extra = {}) => ({ name, label, widget: 'list', field: { name: 'item', label, widget: 'string' }, ...opt, ...extra });
const idPattern = ['^[a-z0-9]+(-[a-z0-9]+)*$', 'Lowercase letters, digits and hyphens'];
const datePattern = ['^\\d{4}-\\d{2}-\\d{2}$', 'Use YYYY-MM-DD'];

export function GET() {
  const catalog = readCatalog();
  const ingredientOptions = catalog.map(c => ({ label: `${c.name} (${c.id})`, value: c.id }));
  const recipeOptions = readRecipes().filter(r => r.data.status !== 'draft').sort((a, b) => a.data.title.localeCompare(b.data.title)).map(r => ({ label: `${r.data.title} — ${r.data.yield.label}${r.data.yield.amount ? '' : ' (use batches)'}`, value: r.id }));
  const unitOptions = units.map(u => ({ label: u || '(none)', value: u }));
  const tags = taxonomy.tagGroups.flatMap((g: any) => g.tags.map((t: string) => ({ label: `${t} · ${g.name}`, value: t })));
  const photo = (name: string, label: string, extra = {}) => ({ name, label, widget: 'object', ...opt, ...extra, fields: [
    { name: 'src', label: 'Photo', widget: 'image' }, str('alt', 'Describe the photo'), str('caption', 'Caption (what to look for)', opt), str('credit', 'Credit', opt), str('source', 'Source URL', opt),
  ] });

  const config = {
    backend: { name: 'github', repo: 'baky0905/cookbook', branch: 'main' },
    site_url: 'https://baky0905.github.io/cookbook/',
    display_url: 'https://baky0905.github.io/cookbook/',
    media_folder: 'content/media',
    // Photos are converted to WebP and shrunk in the browser before they are committed.
    media_libraries: { default: { config: { max_file_size: 25 * 1024 * 1024, transformations: { raster_image: { format: 'webp', quality: 80, width: 1600, height: 1600 } } } } },
    collections: [
      {
        name: 'plans', label: 'Weekly plans', label_singular: 'Week', folder: 'content/plans', extension: 'yaml', format: 'yaml', create: true,
        identifier_field: 'id', slug: '{{slug}}', summary: '{{title}}', sortable_fields: ['start', 'title'],
        description: 'Pick meals for a week; the shopping list updates after saving (about 2 minutes). Last week is archived automatically.',
        fields: [
          str('id', 'Week ID', { pattern: idPattern, hint: 'e.g. 2026-w43' }), str('title', 'Title', { hint: 'e.g. Week 43' }),
          str('start', 'Starts on', { pattern: datePattern, hint: 'Monday, YYYY-MM-DD' }),
          { name: 'notes', label: 'Notes for the week', widget: 'text', ...opt },
          { name: 'meals', label: 'Meals', widget: 'list', ...opt, summary: '{{fields.date}} · {{fields.meal}} · {{fields.recipe}}{{fields.title}}', fields: [
            { name: 'date', label: 'Date', widget: 'datetime', format: 'YYYY-MM-DD', date_format: 'YYYY-MM-DD', time_format: false, picker_utc: true }, sel('meal', 'Meal', taxonomy.meals, { default: 'Dinner' }),
            sel('recipe', 'Recipe', recipeOptions, { ...opt, hint: 'Or leave empty and write a title below' }),
            str('title', 'Title (if not a recipe)', opt), num('servings', 'Portions', { hint: 'Optional. Only for recipes with an exact yield; otherwise use batches. Leave both empty for the original amount.' }),
            num('batches', 'Batches', { hint: 'Optional: 0.5, 1, 2… Leave portions empty when using batches.' }), str('leftoversFrom', 'Leftovers from (meal ID)', { ...opt, hint: 'e.g. 2026-10-12-dinner' }),
            str('note', 'Note', opt), str('id', 'Meal ID', { ...opt, hint: 'Leave empty; defaults to date-meal' }),
          ] },
          { name: 'extras', label: 'Extra shopping items', widget: 'list', ...opt, summary: '{{fields.quantity}} {{fields.unit}} {{fields.ingredient}}{{fields.name}}', fields: [
            sel('ingredient', 'Ingredient', ingredientOptions, opt), str('name', 'Or a free-text item', opt),
            num('quantity', 'Quantity'), sel('unit', 'Unit', unitOptions, opt), str('note', 'Note', opt),
          ] },
          bool('example', 'Example plan', false),
        ],
      },
      {
        name: 'recipes', label: 'Recipes', label_singular: 'Recipe', folder: 'content/recipes', extension: 'md', format: 'frontmatter', create: true,
        identifier_field: 'title', slug: '{{slug}}', summary: '{{title}} · {{category}}', sortable_fields: ['title', 'category', 'status'],
        description: 'Usually added with the AI import skill. Use the editor for notes, photos, status and small fixes.',
        fields: [
          str('title', 'Title', { hint: 'In English' }),
          { name: 'originalName', label: 'Original name', widget: 'object', ...opt, collapsed: true, fields: [str('name', 'Name in its own language'), str('lang', 'Language code', { hint: 'e.g. hr, fi, de' })] },
          str('description', 'Description', opt), sel('category', 'Category', recipeCategories),
          sel('tags', 'Tags', tags, { multiple: true, ...opt }),
          sel('status', 'Status', ['draft', 'needs-review', 'reviewed', 'cooked'], { default: 'draft', hint: 'Drafts are not published' }),
          photo('cover', 'Main photo'),
          { name: 'body', label: 'Personal notes', widget: 'markdown', ...opt },
          { name: 'yield', label: 'Yield', widget: 'object', fields: [str('label', 'Label', { hint: 'e.g. 4 portions' }), num('amount', 'Exact amount (for scaling by portions)'),
            str('unit', 'Unit', { ...opt, hint: 'portions, loaves…' }), bool('scalable', 'Scales without adjusting pans or times', false)] },
          { name: 'time', label: 'Time', widget: 'object', ...opt, collapsed: true, fields: [str('total', 'Total', opt), str('active', 'Active', opt), str('cook', 'Cook', opt), str('rest', 'Rest', opt)] },
          { name: 'nutrition', label: 'Calories', widget: 'object', ...opt, collapsed: true, fields: [num('kcalPerPortion', 'kcal per portion'), str('source', 'Source', opt)] },
          { name: 'groups', label: 'Ingredients', widget: 'list', summary: '{{fields.name}}', fields: [
            str('name', 'Group', { default: 'Ingredients' }),
            { name: 'items', label: 'Items', widget: 'list', summary: '{{fields.quantity}} {{fields.unit}} {{fields.name}}', fields: [
              str('id', 'ID', { pattern: idPattern }), sel('ingredient', 'Ingredient', ingredientOptions), str('name', 'Name as shown'),
              num('quantity', 'Quantity'), num('max', 'Up to (for ranges)'), sel('unit', 'Unit', unitOptions, opt),
              str('spoon', 'Spoon hint', { ...opt, hint: 'Only after a gram amount of at most 15 g, e.g. ½ teaspoon' }),
              str('prep', 'Prep (e.g. finely chopped)', opt), str('note', 'Note', opt), bool('optional', 'Optional', false), bool('scalable', 'Scales with portions', true),
            ] },
          ] },
          { name: 'steps', label: 'Method', widget: 'list', summary: '{{fields.title}}', fields: [
            str('id', 'ID', { pattern: idPattern }), str('title', 'Step title', opt), { name: 'text', label: 'Instructions', widget: 'text' },
            str('duration', 'Duration', opt), { name: 'images', label: 'Step photos', widget: 'list', ...opt, fields: photo('x', '').fields },
          ] },
          { name: 'sources', label: 'Sources', widget: 'list', ...opt, fields: [str('title', 'Title'), str('url', 'URL', opt), str('accessed', 'Accessed', opt), str('timestamp', 'Video timestamp', opt)] },
          strings('issues', 'Open questions'), strings('adaptations', 'Changes and conversions'),
          str('originalLanguage', 'Original language code', opt), strings('aliases', 'Old IDs (redirect here)'), str('legacyPath', 'Old MkDocs path', opt),
        ],
      },
      { name: 'pantry', label: 'Pantry', files: [{ name: 'pantry', label: 'Pantry snapshot', file: 'content/pantry.yaml', fields: [
        str('updated', 'Updated on', { ...opt, pattern: datePattern }),
        { name: 'items', label: 'Items', widget: 'list', ...opt, summary: '{{fields.quantity}} {{fields.unit}} {{fields.name}}', fields: [
          sel('ingredient', 'Ingredient', ingredientOptions), str('name', 'Name'), num('quantity', 'Quantity'), sel('unit', 'Unit', unitOptions, opt), bool('stocked', 'Usually stocked', false),
        ] },
      ] }] },
      { name: 'lists', label: 'Lists', files: [
        { name: 'ingredients', label: 'Ingredient catalogue', file: 'content/ingredients.yaml', fields: [
          { name: 'ingredients', label: 'Ingredients', widget: 'list', summary: '{{fields.name}} · {{fields.aisle}}', fields: [
            str('id', 'ID', { pattern: idPattern }), str('name', 'Shopping-list name'), sel('aisle', 'Aisle', shoppingCategories),
            num('kcal', 'kcal per 100 g'), num('density', 'Grams per ml'),
            { name: 'weights', label: 'Typical weights (g)', widget: 'object', ...opt, collapsed: true, fields: taxonomy.units.filter((u: any) => !['g', 'kg', 'ml', 'l'].includes(u.id)).map((u: any) => num(u.id, `per ${u.id}`)) },
            bool('staple', 'Usually in the cupboard', false), bool('shop', 'Appears on shopping lists', true),
            str('norway', 'Buying in Norway', { ...opt, hint: 'Norwegian name and what to pick; shown on recipes and shopping lists' }),
          ] },
        ] },
        { name: 'taxonomy', label: 'Categories, tags, aisles and units', file: 'content/taxonomy.yaml', fields: [
          { name: 'categories', label: 'Recipe categories', widget: 'list', fields: [str('name', 'Name'), str('description', 'Description', opt)] },
          strings('aisles', 'Shopping aisles (in shop order)', { required: true }),
          { name: 'units', label: 'Units', widget: 'list', fields: [str('id', 'Unit'), str('plural', 'Plural', opt)] },
          strings('meals', 'Meal slots', { required: true }),
          { name: 'tagGroups', label: 'Tag groups', widget: 'list', fields: [str('name', 'Group'), strings('tags', 'Tags', { required: true })] },
        ] },
        { name: 'cuts', label: 'Cutting sizes and guides', file: 'content/reference/cuts.yaml', fields: [
          str('title', 'Title'), { name: 'intro', label: 'Intro', widget: 'text', ...opt },
          { name: 'sources', label: 'Sources', widget: 'list', ...opt, fields: [str('title', 'Title'), str('url', 'URL', opt)] },
          { name: 'cuts', label: 'Cuts', widget: 'list', summary: '{{fields.name}}', fields: [
            str('id', 'ID'), str('name', 'Name'), str('aka', 'Also called', opt), str('size', 'Size'),
            sel('shape', 'Diagram', ['dice', 'stick', 'slice', 'oblique', 'ribbon']), num('mm', 'Size (mm)'), num('length', 'Length (mm)'),
            str('icon', 'Symbol (emoji)', opt),
            { name: 'photo', label: 'Photo', widget: 'object', ...opt, collapsed: true, fields: [
              { name: 'src', label: 'Photo', widget: 'image' }, str('credit', 'Credit', opt), str('license', 'Licence', opt), str('source', 'Source URL', opt),
            ] },
          ] },
          strings('basics', 'Knife basics'),
          { name: 'guides', label: 'How-to guides', widget: 'list', summary: '{{fields.group}}', fields: [str('group', 'Group'),
            { name: 'items', label: 'Guides', widget: 'list', summary: '{{fields.icon}} {{fields.name}}', fields: [str('icon', 'Symbol (emoji)', opt), str('name', 'Name'), str('search', 'Search words for the guide link'), strings('steps', 'Steps', { required: true })] }] },
        ] },
      ] },
    ],
  };
  return new Response(`# Generated at build time by src/pages/admin/config.yml.ts — edit that file, not this one.\n${YAML.stringify(config, { lineWidth: 0 })}`, { headers: { 'Content-Type': 'text/yaml; charset=utf-8' } });
}
