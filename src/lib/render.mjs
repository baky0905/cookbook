import { marked } from 'marked';
import { amount } from './quantities.mjs';
import { plurals } from './schema.mjs';

export const escape = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

// Step text is Markdown; {{ingredient-id}} becomes a quantity that follows serving changes.
export function stepHtml(text, items) {
  const refs = [];
  const marked_ = text.replace(/\{\{([a-z0-9-]+)\}\}/g, (_, id) => `REF${refs.push(id) - 1}REF`);
  return marked.parse(marked_, { breaks: true }).replace(/REF(\d+)REF/g, (_, n) => {
    const item = items.find(i => i.id === refs[n]);
    return `<span class="ref"${quantityAttrs(item)}><b class="qty">${escape(amount(item))}</b> ${escape(item.name)}</span>`;
  });
}
export function quantityAttrs(item) {
  if (item.quantity == null) return '';
  return ` data-qty="${item.quantity}"${item.max ? ` data-max="${item.max}"` : ''} data-unit="${escape(item.unit)}"${plurals[item.unit] ? ` data-plural="${plurals[item.unit]}"` : ''} data-scalable="${item.scalable !== false}"`;
}
export const markdown = text => marked.parse(text || '');

// Prep wording links to the matching cut on the reference page ("small diced" → Small dice).
const cutLinks = [
  [/\b(minced|pressed)\b/i, 'mince'], [/\bbrunoise\b/i, 'brunoise'], [/\b(small|finely) diced?\b/i, 'small-dice'],
  [/\b(chunky diced?|large dice|chunks)\b/i, 'large-dice'], [/\b(medium diced?|diced)\b/i, 'medium-dice'], [/\b(julienne|matchsticks?)\b/i, 'julienne'],
  [/\bbatons?\b/i, 'batonnet'], [/\bobliques?\b/i, 'oblique'], [/\b(thinly )?sliced\b/i, 'slice'], [/\bchiffonade\b/i, 'chiffonade'],
];
export function prepHtml(text, base) {
  const safe = escape(text);
  for (const [pattern, anchor] of cutLinks) if (pattern.test(safe)) return safe.replace(pattern, m => `<a class="prep-link" href="${base}reference/cuts/#${anchor}">${m}</a>`);
  return safe;
}
