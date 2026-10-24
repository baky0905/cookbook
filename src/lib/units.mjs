// Everything a reader sees must be metric: no cups, spoons, ounces, pounds, quarts, inches or °F.
// A spoon as a utensil is fine; a spoon as a measure is not.
export const imperial = new RegExp([
  String.raw`\b(cups?|tbsps?|tbs|tsps?|tablespoons?|teaspoons?|spoonfuls?|oz|ounces?|lbs?|pounds?|quarts?|qt|pints?|gallons?|inch(es)?|fahrenheit)\b`,
  String.raw`\b(\d+|a|an|one|two|three|few)\s+(heaped\s+|level\s+|small\s+)?spoons?\s+of\b`,
  String.raw`\d\s*c\b`,
  String.raw`\d\s*°?\s*F\b`,
  String.raw`\d\s*″`,
].join('|'), 'i');

// The one exception: a spoon hint after a small gram amount ("1 g (½ teaspoon)"), stored in an ingredient's
// `spoon` field. Grams stay the real amount; the hint is for weights too small for a kitchen scale.
export const SPOON_HINT_MAX_G = 15;
const n = String.raw`(?:\d+|\d*[¼½¾⅓⅔⅛])`;
export const spoonHint = new RegExp(String.raw`^${n}(?:–${n})? (?:teaspoons?|tablespoons?)$`);
// Removes valid `spoon:` hints from a raw YAML line so the imperial check can run on the rest.
export const withoutSpoonHints = line => line.replace(/\bspoon:\s*"?([^",}]+?)"?\s*(?=[,}]|$)/g, (all, hint) => spoonHint.test(hint.trim()) ? '' : all);
