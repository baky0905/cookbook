// Creates a draft recipe skeleton: npm run recipe:new -- my-recipe-id "Recipe title"
import fs from 'node:fs';
const [id, ...titleWords] = process.argv.slice(2);
if (!id || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) throw new Error('Usage: npm run recipe:new -- <lowercase-hyphenated-id> "Title"');
const file = `content/recipes/${id}.md`;
if (fs.existsSync(file)) throw new Error(`${file} already exists`);
const title = titleWords.join(' ') || id.replace(/-/g, ' ').replace(/^./, c => c.toUpperCase());
fs.writeFileSync(file, `---
title: ${JSON.stringify(title)}
description: ""
category: Mains  # one of the categories in content/taxonomy.yaml
tags: []  # from content/taxonomy.yaml
language: en
status: draft
yield:
  label: 4 portions
  amount: 4
  unit: portions
  scalable: false  # true if it scales without changing pans or times
time: {}
# nutrition: { kcalPerPortion: 520, source: HelloFresh }  # optional; otherwise estimated
groups:
  - name: Ingredients
    items:
      # ingredient: an ID from content/ingredients.yaml; prep: what to do before cooking
      - { id: onion, ingredient: onion, name: onion, quantity: 1, unit: piece, prep: finely chopped }
steps:
  - id: prepare
    title: ""
    text: Replace with the first instruction. Reference an ingredient as {{onion}}.
sources: []
issues: []
adaptations: []
---

Personal notes go here.
`);
console.log(`Created ${file} (draft; not published until status changes).`);
