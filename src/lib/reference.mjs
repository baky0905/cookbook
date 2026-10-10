import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';

// Curated reference data lives in content/reference/*.yaml (editable in the CMS).
export const readReference = name => YAML.parse(fs.readFileSync(path.join(process.cwd(), 'content/reference', `${name}.yaml`), 'utf8'));
export const referencePagesList = [
  ['conversions', 'Conversions', 'Cups, spoons, ounces and °F to metric; what a cup of flour weighs'],
  ['cuts', 'Cutting sizes', 'Dice, julienne, batons and slices, drawn to scale'],
  ['temperatures', 'Meat temperatures', 'Safe minimums and doneness targets'],
  ['storage', 'Fridge and freezer', 'How long food keeps'],
  ['seasons', 'In season in Norway', 'Norwegian produce by month'],
  ['equivalents_and_substitutes', 'Substitutes', 'Herb, salt and other swaps'],
];

// Notes kept from the original MkDocs cookbook.
const dir = path.join(process.cwd(), 'docs/reference');
const replaced = { measuring: 'conversions', calculator: 'conversions', links: '', development: '' };
export function legacyReferencePages() {
  return fs.readdirSync(dir).filter(f => f.endsWith('.md') && f !== 'index.md').map(f => f.slice(0, -3))
    .filter(slug => !['seasons', 'temperatures'].includes(slug)).map(slug => {
      if (slug in replaced) return { slug, redirect: replaced[slug] };
      const raw = fs.readFileSync(path.join(dir, `${slug}.md`), 'utf8').replace(/:[a-z_-]+:/g, '').replace(/\[\^\d+\]/g, '');
      const title = (raw.match(/^#\s+(.+)$/m)?.[1] || slug).replace(/\[([^\]]+)\]\[\d+\]/, '$1').trim();
      return { slug, title, body: raw.replace(/^#\s+.+$/m, '').trim() };
    });
}
