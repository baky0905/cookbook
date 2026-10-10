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
category: Main dishes
tags: []
language: en
status: draft
yield:
  label: 4 portions
  amount: 4
  unit: portions
  scalable: false
time: {}
groups:
  - name: Ingredients
    items:
      - id: example
        ingredient: example
        name: Replace me
        quantity: null
        unit: ""
        category: Other
steps:
  - id: prepare
    title: ""
    text: Replace with the first instruction. Reference an ingredient as {{example}}.
sources: []
issues: []
adaptations: []
---

Personal notes go here.
`);
console.log(`Created ${file} (draft; not published until status changes).`);
