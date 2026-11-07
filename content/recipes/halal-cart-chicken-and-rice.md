---
title: Halal Cart Chicken and Rice
description: NYC street-cart style plates. Spiced yoghurt-marinated chicken thighs seared and roasted, buttery turmeric rice, garlicky white sauce and a two-sauce red sauce.
category: Mains
tags: [american, middle-eastern, chicken, rice, pan-fried, oven-baked]
language: en
status: cooked
yield:
  label: 4 portions
  amount: 4
  unit: portions
  scalable: false
cover: { src: halal-cart-chicken-and-rice/cover.webp, alt: "Plate of diced seared chicken and yellow rice with white sauce, next to lettuce and cherry tomatoes", caption: "A finished plate with white sauce over everything." }
time: { total: about 1 h, active: 15 min, cook: 45 min, rest: "30–60 min marinating (optional)" }
groups:
  - name: Chicken
    items:
      - { id: yoghurt, ingredient: plain-yoghurt, name: plain yoghurt, quantity: 25, unit: g, note: "Not Greek yoghurt" }
      - { id: lemon, ingredient: lemon-juice, name: fresh lemon juice, quantity: 15, unit: ml }
      - { id: olive-oil, ingredient: olive-oil, name: olive oil, quantity: 15, unit: ml }
      - { id: salt, ingredient: salt, name: salt, quantity: 10, unit: g, note: Kosher salt in the source }
      - { id: cumin, ingredient: ground-cumin, name: ground cumin, quantity: 5, unit: g, spoon: 2 teaspoons }
      - { id: coriander, ingredient: ground-coriander, name: ground coriander, quantity: 3, unit: g, spoon: 1½ teaspoons }
      - { id: pepper, ingredient: black-pepper, name: ground black pepper, quantity: 3, unit: g, spoon: 1¼ teaspoons }
      - { id: oregano, ingredient: dried-oregano, name: dried oregano, quantity: 2, unit: g, spoon: 2 teaspoons }
      - { id: onion-powder, ingredient: onion-powder, name: onion powder, quantity: 3, unit: g, spoon: 1¼ teaspoons }
      - { id: garlic-powder, ingredient: garlic-powder, name: garlic powder, quantity: 3, unit: g, spoon: 1 teaspoon }
      - { id: chicken, ingredient: chicken-thigh, name: boneless skinless chicken thighs, quantity: 600, unit: g }
      - { id: water, ingredient: water, name: water, quantity: 30, unit: ml, note: For the pan jus }
  - name: Yellow rice
    items:
      - { id: oil, ingredient: neutral-oil, name: neutral oil, quantity: 45, max: 60, unit: ml }
      - { id: rice, ingredient: long-grain-rice, name: basmati rice, quantity: 200, unit: g, prep: "Rinsed until the water runs clear, then drained well" }
      - { id: butter, ingredient: unsalted-butter, name: unsalted butter, quantity: 15, unit: g }
      - { id: turmeric, ingredient: turmeric, name: ground turmeric, quantity: 2, unit: g, spoon: ⅔ teaspoon }
      - { id: stock, ingredient: chicken-stock, name: chicken stock, quantity: 400, unit: ml }
      - { id: bouillon, ingredient: chicken-bouillon-paste, name: chicken bouillon paste, quantity: 25, unit: g, note: "Better Than Bouillon in the source. With a fond concentrate or cube instead, start with less and taste the liquid: it should be well seasoned" }
      - { id: rice-garlic-powder, ingredient: garlic-powder, name: garlic powder, quantity: 5, unit: g }
      - { id: rice-onion-powder, ingredient: onion-powder, name: onion powder, quantity: 5, unit: g }
  - name: White sauce
    items:
      - { id: mayonnaise, ingredient: mayonnaise, name: mayonnaise, quantity: 125, unit: g }
      - { id: sauce-yoghurt, ingredient: plain-yoghurt, name: plain yoghurt, quantity: 125, unit: g, note: "Not Greek yoghurt" }
      - { id: sauce-lemon, ingredient: lemon-juice, name: lemon juice, quantity: 10, unit: ml }
      - { id: sauce-salt, ingredient: salt, name: salt, quantity: 3, unit: g }
      - { id: sauce-garlic, ingredient: garlic, name: garlic, quantity: 1, unit: clove, prep: minced }
  - name: Red sauce
    items:
      - { id: sriracha, ingredient: sriracha, name: Sriracha, quantity: 120, unit: g }
      - { id: hot-sauce, ingredient: louisiana-hot-sauce, name: Louisiana-style hot sauce, quantity: 60, unit: g }
  - name: To serve
    items:
      - { id: lettuce, ingredient: iceberg-lettuce, name: head lettuce, quantity: null, prep: medium diced, note: "Iceberg, romaine or little gem. The source gives no amount" }
      - { id: tomatoes, ingredient: tomato, name: tomatoes, quantity: null, prep: small diced, note: The source gives no amount }
steps:
  - { id: marinate, title: Marinate the chicken, duration: 30–60 min, text: "Whisk the {{yoghurt}}, {{lemon}}, {{olive-oil}}, {{salt}}, {{cumin}}, {{coriander}}, {{pepper}}, {{oregano}}, {{onion-powder}} and {{garlic-powder}} into a smooth paste. Toss the {{chicken}} in it until fully coated and refrigerate for 30–60 minutes. Short on time: just let it sit while the rice cooks." }
  - { id: preheat, title: Preheat the oven, text: "Heat the oven to 220 °C." }
  - { id: toast-rice, title: Toast the rice, duration: 4–5 min, text: "Heat the {{oil}} in a 3 l saucepan over medium-high heat until shimmering. Add the {{rice}} and toast, stirring constantly, until nearly all the grains are opaque and a few are starting to colour." }
  - { id: season-rice, title: "Add butter, turmeric and stock", text: "Stir in the {{butter}} and {{turmeric}} until the butter has melted and the rice is yellow. Add the {{stock}}, {{bouillon}}, {{rice-garlic-powder}} and {{rice-onion-powder}} and stir until the paste dissolves." }
  - { id: cook-rice, title: Cook the rice, duration: 15 min, text: "Bring to a gentle boil, give it one last stir, then cover and turn the heat to low (2–3 out of 10). Cook for 15 minutes." }
  - { id: steam-rice, title: Steam the rice, duration: 15 min, text: "Take the pan off the heat and leave it covered for 15 minutes more. Keep the lid on the whole time, then fluff with a fork and keep covered until serving." }
  - { id: sear, title: Sear the chicken, duration: 4–5 min, text: "While the rice cooks, heat a 30 cm ovenproof stainless steel sauté pan over medium-high heat. Lay the thighs in smooth side down, press them flat with a weight or spatula, and sear undisturbed until deep golden brown. For a double batch, sear in two batches or two pans so they brown instead of steaming." }
  - { id: roast, title: Flip and roast, duration: 7–9 min, text: "Flip the thighs and sear for 1–2 minutes until the second side starts to colour, then move the pan to the oven. Roast until the thickest thigh reads 80–85 °C, or even a little higher. Thighs stay juicy well past 75 °C." }
  - { id: white-sauce, title: Make the white sauce, text: "While the chicken roasts, whisk the {{mayonnaise}}, {{sauce-yoghurt}}, {{sauce-salt}}, {{sauce-garlic}} and {{sauce-lemon}} until smooth and pourable. Taste and add a little more lemon or salt if needed." }
  - { id: red-sauce, title: Mix the red sauce, text: "Stir the {{sriracha}} and {{hot-sauce}} together. Have the {{lettuce}} and {{tomatoes}} ready." }
  - { id: rest, title: Rest the chicken and make the jus, duration: about 10 min, text: "Rest the thighs on a plate. Meanwhile, add the {{water}} to the hot pan (careful, the handle is hot) and scrape up the browned bits into a little jus." }
  - { id: dice, title: Dice the chicken, text: "Turn the rested thighs through the pan jus, then dice into 2 cm chunks. Pour any juices from the resting plate over the chicken if you like." }
  - { id: assemble, title: Assemble, text: "Spoon rice into bowls and top with the chicken, lettuce and tomatoes, then drizzle with white sauce and red sauce.", images: [{ src: halal-cart-chicken-and-rice/assemble.webp, alt: "Bowls of lettuce and halved cherry tomatoes, diced chicken and white sauce on a table beside a pot of yellow rice", caption: "Everything ready to serve: fluffy yellow rice, browned diced chicken, pourable white sauce and the salad." }] }
sources:
  - { title: Brian Lagerstrom, url: "https://brianlagerstrom.com/recipes/halal-cart-chicken-and-rice/" }
  - { title: Video, url: "https://www.youtube.com/watch?v=VsyM8UbF4D0" }
issues:
  - "Rice oil: the ingredient list says 45 ml, the video description's method 60 ml and the blog 45–60 ml, so it's listed as 45–60 ml."
  - "Chicken temperature: the blog gives 79–85 °C and the video description 85 °C; written here as 80–85 °C."
  - "Better Than Bouillon is hard to find in Norway; the swap (fond concentrate or cube) is saltier per gram, so adjust by taste."
adaptations:
  - "Converted from US units to metric (oven 220 °C, 30 cm pan, 3 l saucepan, 2 cm chunks, 30 ml water, 45–60 ml oil). The source's gram amounts are kept; thin liquids (lemon juice, olive oil, stock) are in ml at the same figure."
  - "Spoon hints are from the video description."
  - "Rinsing the rice moved to the ingredient prep; the method starts at cooking."
  - "Added a note on searing a double batch in two goes, for planning 8 portions."
---

The rice was a little too salty, possibly because I added an extra gelatinous stock cube to 250 ml of prepared stock. Next time, try either prepared stock on its own or one gelatinous cube per 500 ml of water. Other than that, it was really good.

For simplicity, I cooked the rice in a rice cooker instead of a saucepan, which made it quite simple.
