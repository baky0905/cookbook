import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';
import { recipeSchema, planSchema, pantrySchema } from './schema.mjs';
export { readCatalog } from './schema.mjs';

export const root = process.cwd();
export function parseRecipe(text) {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)([\s\S]*)$/);
  if(!match) throw new Error('Recipe needs YAML frontmatter');
  return { data: recipeSchema.parse(YAML.parse(match[1])), body: match[2].trim() };
}
export function readRecipes() {
  return fs.readdirSync(path.join(root,'content/recipes')).filter(f=>f.endsWith('.md')).map(file=>({id:file.slice(0,-3),...parseRecipe(fs.readFileSync(path.join(root,'content/recipes',file),'utf8'))}));
}
export function readPlans() {
  return fs.readdirSync(path.join(root,'content/plans')).filter(f=>f.endsWith('.yaml')).map(file=>({ ...planSchema.parse(YAML.parse(fs.readFileSync(path.join(root,'content/plans',file),'utf8'))), editorSlug: file.slice(0, -5) }));
}
export function readPantry() { return pantrySchema.parse(YAML.parse(fs.readFileSync(path.join(root,'content/pantry.yaml'),'utf8'))); }
export const isPublished = recipe => recipe.data.status !== 'draft';
export const publishedRecipes = () => readRecipes().filter(isPublished).sort((a,b)=>a.data.title.localeCompare(b.data.title));
export { planStart, currentPlan } from './weeks.mjs';
// Frozen weeks from content/history, newest first.
export function readHistory() {
  const dir = path.join(root,'content/history');
  if(!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter(f=>f.endsWith('.json')).map(f=>JSON.parse(fs.readFileSync(path.join(dir,f),'utf8')))
    .sort((a,b)=>(b.plan.start||'').localeCompare(a.plan.start||''));
}
