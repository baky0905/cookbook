import { marked } from 'marked';
import { amount } from './quantities.mjs';

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
  return ` data-qty="${item.quantity}"${item.max ? ` data-max="${item.max}"` : ''} data-unit="${escape(item.unit)}" data-scalable="${item.scalable !== false}"`;
}
export const markdown = text => marked.parse(text || '');
