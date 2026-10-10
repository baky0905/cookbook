import test from 'node:test';
import assert from 'node:assert/strict';
import { imperial } from '../src/lib/units.mjs';

test('imperial and spoon measures are rejected', () => {
  for (const text of ['2 tbsp', '1 teaspoon', '1 1/2c stock', '3-4c of soup', '8 cups', '275F', '450 °F', '1 lb', '1 ounce', '5.5 quarts', '0.6 inch', '26cm/10″ pot', 'a few spoons of the slurry'])
    assert.match(text, imperial, text);
});
test('metric text and utensils pass', () => {
  for (const text of ['230 °C', '26 cm', '15 ml oil', '500 g', 'stir with a wooden spoon', 'cheddar', 'Bake 20 min', 'fold, then spoon the filling'])
    assert.doesNotMatch(text, imperial, text);
});
