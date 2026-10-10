import fs from 'node:fs';
import path from 'node:path';

// Reference notes stay in docs/reference so the old MkDocs pages keep a single source.
const dir = path.join(process.cwd(), 'docs/reference');
export function referencePages() {
  return fs.readdirSync(dir).filter(f => f.endsWith('.md') && f !== 'index.md').map(file => {
    const raw = fs.readFileSync(path.join(dir, file), 'utf8');
    const text = raw.replace(/:[a-z_-]+:/g, '').replace(/\[\^\d+\]/g, '');
    const title = (text.match(/^#\s+(.+)$/m)?.[1] || file).replace(/\[([^\]]+)\]\[\d+\]/, '$1').trim();
    const body = text.replace(/^#\s+.+$/m, '').trim();
    // The calculator was an embedded third-party page; link to it instead of framing it.
    const external = raw.match(/<iframe src="([^"]+)"/)?.[1];
    return { slug: file.slice(0, -3), title, body: external ? '' : body, external, empty: !external && body.length < 20 };
  });
}
