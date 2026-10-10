// Starts next week's plan and saves the previous weeks to history.
// npm run week:new                       next Monday after the latest plan (or this coming Monday)
// npm run week:new -- 2026-10-19         a specific start date
import fs from 'node:fs';
import { readPlans, planStart } from '../src/lib/content.mjs';
import { snapshotFinishedWeeks } from './snapshot.mjs';

const day = d => d.toISOString().slice(0, 10);
const nextMonday = from => { const d = new Date(from + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + ((8 - d.getUTCDay()) % 7 || 7)); return d; };
const latest = readPlans().filter(p => !p.example).map(planStart).sort().at(-1);
const start = process.argv[2] ? new Date(process.argv[2] + 'T12:00:00Z') : nextMonday(latest || day(new Date()));
if (Number.isNaN(start.getTime())) throw new Error('Usage: npm run week:new -- [YYYY-MM-DD]');
// ISO week number, so IDs sort and read naturally (2026-w43).
const thursday = new Date(start); thursday.setUTCDate(start.getUTCDate() + 3 - ((start.getUTCDay() + 6) % 7));
const week = Math.ceil(((thursday - Date.UTC(thursday.getUTCFullYear(), 0, 1)) / 864e5 + 1) / 7);
const id = `${thursday.getUTCFullYear()}-w${String(week).padStart(2, '0')}`;
const file = `content/plans/${id}.yaml`;
if (fs.existsSync(file)) throw new Error(`${file} already exists`);
fs.writeFileSync(file, `id: ${id}
title: Week ${week}
start: '${day(start)}'
notes: ''
# Add meals: { id: mon, date: '${day(start)}', meal: Dinner, recipe: lohikeitto, servings: 4 }
meals: []
# Extra shopping items: { ingredient: milk, quantity: 1, unit: l } or { name: dish soap }
extras: []
`);
console.log(`Created ${file}`);
const saved = snapshotFinishedWeeks();
if (saved.length) console.log(`Saved to history: ${saved.join(', ')}`);
