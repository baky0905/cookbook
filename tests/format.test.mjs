import test from 'node:test';
import assert from 'node:assert/strict';
import { categorySlug, timerSeconds, clock } from '../src/lib/format.mjs';

test('category slugs', () => {
  assert.equal(categorySlug('Soups & stews'), 'soups-and-stews');
  assert.equal(categorySlug('Breads & doughs'), 'breads-and-doughs');
  assert.equal(categorySlug('Mains'), 'mains');
});
test('step timers read the first duration, low end of a range', () => {
  const cases = { '5 min': 300, '10–12 min': 600, 'about 30 min': 1800, '1 h': 3600, '1 h 15 min': 4500, '30 sec': 30,
    '45 min, then 6–24 h cold': 2700, '20 min + 1 min': 1200, '8 min+': 480, '7–8 min per pizza': 420, '2 h chilling': 7200 };
  for (const [text, seconds] of Object.entries(cases)) assert.equal(timerSeconds(text), seconds, text);
});
test('no timer for long or unreadable durations', () => {
  for (const text of ['overnight', '6–24 h', '', 'until golden']) assert.equal(timerSeconds(text), null, text);
});
test('clock format', () => {
  assert.equal(clock(299.2), '5:00');
  assert.equal(clock(65), '1:05');
  assert.equal(clock(3725), '1:02:05');
});
