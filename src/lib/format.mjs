// Shared by the build and the browser so scaled amounts read the same everywhere.
export const number = n => Number(n.toFixed(2)).toLocaleString('en-GB', { maximumFractionDigits: 2 });
export function formatAmount({ qty, max, unit = '', scalable = 'true', plural = '' }, factor = 1) {
  const f = String(scalable) === 'false' ? 1 : factor;
  const low = Number(qty) * f, high = max == null || max === '' ? null : Number(max) * f;
  const label = unit === 'piece' || !unit ? '' : ' ' + ((high ?? low) > 1 && plural ? plural : unit);
  return `${number(low)}${high == null ? '' : `–${number(high)}`}${label}`;
}

// "Soups & stews" → "soups-and-stews"; selects the category's accent colours in the stylesheet.
export const categorySlug = category => category.toLowerCase().replace(/&/g, 'and').replace(/[^a-z]+/g, '-').replace(/^-|-$/g, '');

// Seconds for a step timer from a duration like "5 min", "10–12 min" or "1 h 15 min".
// Ranges start at the low end so you check early. Long or open-ended waits get no timer.
const UNIT_SECONDS = { h: 3600, min: 60, s: 1 };
export function timerSeconds(duration = '') {
  const m = duration.match(/(\d+(?:[.,]\d+)?)(?:\s*[–-]\s*\d+(?:[.,]\d+)?)?\s*(h|hours?|min|minutes?|sec|seconds?|s)\b(?:\s*(\d+)\s*min\b)?/i);
  if (!m) return null;
  const unit = m[2].toLowerCase().startsWith('h') ? 'h' : m[2].toLowerCase().startsWith('m') ? 'min' : 's';
  const seconds = Math.round(Number(m[1].replace(',', '.')) * UNIT_SECONDS[unit] + (unit === 'h' && m[3] ? Number(m[3]) * 60 : 0));
  return seconds > 0 && seconds <= 4 * 3600 ? seconds : null;
}
export const clock = seconds => {
  const s = Math.max(0, Math.ceil(seconds)), h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), r = String(s % 60).padStart(2, '0');
  return h ? `${h}:${String(m).padStart(2, '0')}:${r}` : `${m}:${r}`;
};
