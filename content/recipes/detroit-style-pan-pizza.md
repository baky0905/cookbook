---
title: Detroit-style pan pizza
description: Thick, airy pan pizza with crisp cheesy edges and stripes of cooked tomato sauce.
category: Breads & doughs
tags: [american, cheese, yeast-dough, overnight, oven-baked, vegetarian]
status: needs-review
yield: { label: 2 pizzas, amount: 2, unit: pizzas, scalable: false }
time: { rest: "2 h, plus 8–24 h in the fridge", cook: 13–19 min }
groups:
  - name: Dough
    items:
      - { id: water, ingredient: water, name: water, quantity: 250, unit: g, prep: Heated to 40 °C }
      - { id: yeast, ingredient: instant-yeast, name: instant yeast, quantity: 3, unit: g }
      - { id: salt, ingredient: salt, name: salt, quantity: 9, unit: g }
      - { id: flour, ingredient: bread-flour, name: bread flour, quantity: 365, unit: g }
      - { id: oil, ingredient: olive-oil, name: olive oil, note: "Plenty, for the pans and the sauce" }
  - name: Sauce
    items:
      - { id: tomatoes, ingredient: crushed-tomatoes, name: canned crushed tomatoes, quantity: 800, unit: g }
      - { id: paste, ingredient: tomato-paste, name: tomato paste, quantity: 50, unit: g }
      - { id: sauce-salt, ingredient: salt, name: salt, quantity: 7, unit: g }
      - { id: sugar, ingredient: sugar, name: sugar, quantity: 12, unit: g }
      - { id: oregano, ingredient: dried-oregano, name: dried oregano, quantity: 0.5, unit: g }
      - { id: basil, ingredient: dried-basil, name: dried basil, quantity: 0.5, unit: g }
      - { id: chilli, ingredient: chilli-flakes, name: chilli flakes, quantity: 1, unit: pinch }
      - { id: garlic, ingredient: garlic, name: garlic, quantity: 10, unit: g, prep: Minced, note: 2 cloves }
  - name: Topping
    items:
      - { id: cheese, ingredient: brick-cheese, name: Wisconsin brick cheese, quantity: 250, unit: g, prep: Shredded, note: Full-fat mozzarella also works }
steps:
  - { id: start-yeast, title: Start the yeast, duration: 10 min, text: "Heat the {{water}} to 40 °C, measured with a thermometer. Stir in the {{yeast}} and leave until bubbles appear (without sugar the foam is light). No foam means the yeast is dead: start again with fresh yeast." }
  - { id: mix, title: Mix the dough, text: "Add the salt and flour to the yeast water and mix with a spoon. When it forms a ball, wet your hand and knead for 1–2 minutes more (or use a stand mixer with a dough hook on medium-high for 7–8 minutes)." }
  - { id: ferment, title: Ferment, duration: "about 2 h, then 8–24 h cold", text: "Cover and ferment at room temperature for 30 minutes. Do 5–6 strength-building folds, then round the dough into a tight ball (video at 1:57). Cover and ferment, repeat the folds and rounding, then ferment 1 hour at room temperature. Finally refrigerate, covered, for 8–24 hours." }
  - { id: pan, title: Pan the dough, duration: 1 h, text: "Turn the dough onto a floured surface, flatten into a rough square and cut in half. Oil two Detroit-style pans (about 25 × 35 cm) very well. Dimple and stretch each half into a pan. Proof, covered, for 30 minutes in the oven at 32 °C (use the proof setting, or heat it on the lowest setting for 2 minutes and switch it off; check with the thermometer). Dimple again into the corners and proof 30 minutes more at room temperature." }
  - { id: sauce, title: Make the sauce, duration: about 12 min, text: "Blend the tomato paste, salt, sugar, oregano, basil and chilli flakes into the crushed tomatoes with a stick blender until smooth. Heat a large drizzle of olive oil in a non-stick pan over medium heat and fry the garlic until fragrant, 30–60 seconds. Add the tomato mixture and simmer about 10 minutes, until reduced by half." }
  - id: bake
    title: Top and bake
    duration: 13–19 min
    text: |-
      Preheat the oven with a pizza steel or stone to 260 °C. Top each pizza with about 125 g cheese, then add 4 generous dollops of sauce and spread them a little, leaving some of the top unsauced.
      Bake in the pans on the steel for 10–14 minutes, until the cheese is melted and browned at the edges. Lift the pizzas out and cool on a rack for 5 minutes. For extra crispness, bake them directly on the steel for 3–5 minutes more.
sources:
  - { title: Saved video, url: "https://www.youtube.com/watch?v=9v60RaIPcRA" }
issues:
  - The original article link was a placeholder; only the video link is saved.
adaptations:
  - "Yeast prestart at 40 °C instead of the source's 32 °C water, which suits fridge-cold dry yeast."
  - "Added a 10-minute yeast prestart in the recipe's own liquid, so you can see the yeast is alive before mixing."
  - "Pan size given in cm (the source names Lloyd Detroit-style pans)."
legacyPath: main_dishes/detroit_style_pan_pizza/
---
