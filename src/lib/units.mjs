// Everything a reader sees must be metric: no cups, spoons, ounces, pounds, quarts, inches or °F.
// A spoon as a utensil is fine; a spoon as a measure is not.
export const imperial = new RegExp([
  String.raw`\b(cups?|tbsps?|tbs|tsps?|tablespoons?|teaspoons?|spoonfuls?|oz|ounces?|lbs?|pounds?|quarts?|qt|pints?|gallons?|inch(es)?|fahrenheit)\b`,
  String.raw`\b(\d+|a|an|one|two|three|few)\s+(heaped\s+|level\s+|small\s+)?spoons?\s+of\b`,
  String.raw`\d\s*c\b`,
  String.raw`\d\s*°?\s*F\b`,
  String.raw`\d\s*″`,
].join('|'), 'i');
