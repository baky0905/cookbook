// Shared by the build and the browser so scaled amounts read the same everywhere.
export const number = n => Number(n.toFixed(2)).toLocaleString('en-GB', { maximumFractionDigits: 2 });
export function formatAmount({ qty, max, unit = '', scalable = 'true' }, factor = 1) {
  const f = String(scalable) === 'false' ? 1 : factor;
  const range = max == null || max === '' ? '' : `–${number(Number(max) * f)}`;
  return `${number(Number(qty) * f)}${range}${unit && unit !== 'piece' ? ' ' + unit : ''}`;
}
