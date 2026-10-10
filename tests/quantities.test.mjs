import test from 'node:test';
import assert from 'node:assert/strict';
import { amount, normalise } from '../src/lib/quantities.mjs';
import { formatAmount } from '../src/lib/format.mjs';

test('amounts show units, but not for counts', () => {
  assert.equal(amount({ quantity: 450, unit: 'g' }), '450 g');
  assert.equal(amount({ quantity: 2, unit: 'piece' }), '2');
  assert.equal(amount({ quantity: null, unit: '' }), '');
});
test('ranges and fractions scale together', () => {
  assert.equal(amount({ quantity: 1.5, max: 2, unit: 'kg' }, 1.5), '2.25–3 kg');
  assert.equal(amount({ quantity: 1, unit: 'tbsp' }, 1 / 3), '0.33 tbsp');
});
test('non-scaling items keep their amount', () => {
  assert.equal(amount({ quantity: 1, unit: 'package', scalable: false }, 3), '1 package');
});
test('browser formatting matches build formatting', () => {
  assert.equal(formatAmount({ qty: '450', unit: 'g', scalable: 'true' }, 6 / 4), amount({ quantity: 450, unit: 'g' }, 1.5));
  assert.equal(formatAmount({ qty: '1', unit: 'package', scalable: 'false' }, 2), '1 package');
});
test('only metric pairs are normalised', () => {
  assert.deepEqual(normalise(1.5, 'kg'), { quantity: 1500, unit: 'g' });
  assert.deepEqual(normalise(1.2, 'l'), { quantity: 1200, unit: 'ml' });
  assert.deepEqual(normalise(2, 'tbsp'), { quantity: 2, unit: 'tbsp' });
});
test('count units are pluralised', () => {
  assert.equal(amount({ quantity: 2, unit: 'package' }), '2 packages');
  assert.equal(amount({ quantity: 1, unit: 'clove' }), '1 clove');
  assert.equal(amount({ quantity: 3, max: 4, unit: 'sprig' }), '3–4 sprigs');
  assert.equal(amount({ quantity: 1, unit: 'pinch' }, 2), '2 pinches');
});
