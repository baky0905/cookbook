// Shrinks recipe photos to web-friendly WebP and updates recipe references.
// npm run media:optimize            (all photos in content/media)
// npm run media:optimize -- <files> (specific files, e.g. new phone photos)
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { MEDIA_MAX_BYTES } from '../src/lib/paths.mjs';

const EDGE = 1600, QUALITY = 80;
const args = process.argv.slice(2);
const files = args.length ? args : fs.readdirSync('content/media', { recursive: true }).map(f => path.join('content/media', f));
const renames = [];
for (const file of files.filter(f => fs.statSync(f).isFile() && !path.basename(f).startsWith('.'))) {
  if (!/\.(jpe?g|png|webp|avif|heic|heif|tiff?)$/i.test(file)) { console.warn(`skip ${file}: not a photo`); continue; }
  const before = fs.statSync(file).size;
  let image;
  try { image = sharp(file, { failOn: 'none' }).rotate(); await image.metadata(); }
  catch { console.error(`cannot read ${file}; export it as JPEG first (iPhone: Settings → Camera → Formats → Most Compatible)`); process.exitCode = 1; continue; }
  const { width, height } = await sharp(file).rotate().metadata();
  const isWebp = /\.webp$/i.test(file);
  if (isWebp && before <= MEDIA_MAX_BYTES && Math.max(width, height) <= EDGE) continue;
  const target = file.replace(/\.[^.]+$/, '.webp');
  // EXIF orientation is applied and metadata (including GPS location) is dropped.
  const out = await image.resize({ width: EDGE, height: EDGE, fit: 'inside', withoutEnlargement: true }).webp({ quality: QUALITY }).toBuffer();
  fs.writeFileSync(target, out);
  if (target !== file) { fs.unlinkSync(file); renames.push([file, target]); }
  console.log(`${file} → ${target}: ${Math.round(before / 1024)} KB → ${Math.round(out.length / 1024)} KB`);
}
// Point recipes at the new files.
const rel = f => path.relative('content/media', f).split(path.sep).join('/');
for (const recipe of fs.readdirSync('content/recipes').filter(f => f.endsWith('.md')).map(f => path.join('content/recipes', f))) {
  let text = fs.readFileSync(recipe, 'utf8'), changed = false;
  for (const [from, to] of renames) if (text.includes(rel(from))) { text = text.replaceAll(rel(from), rel(to)); changed = true; }
  if (changed) { fs.writeFileSync(recipe, text); console.log(`updated ${recipe}`); }
}
if (!renames.length) console.log('All photos are already optimised.');
