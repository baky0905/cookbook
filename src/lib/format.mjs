// Shared by the build and the browser so scaled amounts read the same everywhere.
export const number = n => Number(n.toFixed(2)).toLocaleString('en-GB', { maximumFractionDigits: 2 });
export function formatAmount({ qty, max, unit = '', scalable = 'true', plural = '' }, factor = 1) {
  const f = String(scalable) === 'false' ? 1 : factor;
  const low = Number(qty) * f, high = max == null || max === '' ? null : Number(max) * f;
  const label = unit === 'piece' || !unit ? '' : ' ' + ((high ?? low) > 1 && plural ? plural : unit);
  return `${number(low)}${high == null ? '' : `–${number(high)}`}${label}`;
}
