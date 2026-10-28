---
title: Cioppino
description: San Francisco seafood stew of shrimp, mussels, cod and squid in a tomato and shrimp-shell broth.
category: Soups & stews
tags: [american, italian, seafood, fish, one-pot]
aliases: [ciopinno]
status: needs-review
yield: { label: about 6 portions, amount: 6, unit: portions, scalable: false }
cover: { src: cioppino/cover.webp, alt: "A bowl of seafood stew with mussels, squid and shrimp in tomato broth", caption: "An example of the dish, not from this recipe", credit: "Benoît Prieur · CC0 · Wikimedia Commons", source: "https://commons.wikimedia.org/wiki/File:Cioppino_from_Della_Terra_(Los_Angeles),_July_2022_(2).jpg" }
groups:
  - name: Broth
    items:
      - { id: shrimp, ingredient: shrimp, name: shell-on raw wild shrimp, quantity: 500, unit: g, prep: Peel; keep the shells for the broth }
      - { id: stock, ingredient: chicken-stock, name: chicken stock, quantity: 900, max: 1000, unit: ml }
      - { id: clam-juice, ingredient: clam-juice, name: clam juice, quantity: 240, unit: ml }
  - name: Stew
    items:
      - { id: onion, ingredient: onion, name: white onion, quantity: 125, unit: g, prep: Small diced }
      - { id: fennel, ingredient: fennel, name: bulb fennel, quantity: 75, unit: g, prep: Small diced }
      - { id: garlic, ingredient: garlic, name: garlic, quantity: 4, max: 5, unit: clove, prep: Minced }
      - { id: oil, ingredient: olive-oil, name: olive oil, note: "A generous amount, plus extra to serve" }
      - { id: salt, ingredient: salt, name: salt, note: To taste }
      - { id: chile, ingredient: chilli-flakes, name: chilli flakes, quantity: 1, unit: pinch }
      - { id: wine, ingredient: white-wine, name: dry white wine, quantity: 200, unit: g }
      - { id: tomatoes, ingredient: whole-peeled-tomatoes, name: canned whole peeled tomatoes, quantity: 800, unit: g, prep: Puréed }
      - { id: mussels, ingredient: mussels, name: mussels, quantity: 500, unit: g, prep: Rinsed and debearded; discard any broken or open ones }
      - { id: cod, ingredient: cod, name: fresh Atlantic cod, quantity: 500, unit: g, prep: "In 2.5 cm chunks, salted before cooking" }
      - { id: squid, ingredient: squid, name: squid tubes and tentacles, quantity: 225, unit: g, prep: Sliced }
      - { id: sugar, ingredient: sugar, name: sugar, quantity: 1, unit: pinch, note: Only if needed }
  - name: To serve
    items:
      - { id: pepper, ingredient: black-pepper, name: black pepper }
      - { id: parsley, ingredient: parsley, name: fresh parsley, prep: Chopped }
      - { id: bread, ingredient: crusty-bread, name: crusty bread, note: "Plenty, for dipping" }
steps:
  - { id: broth, title: Make the shrimp broth, duration: 15 min, text: "Put the shrimp shells, stock and clam juice in a medium pot. Bring to a simmer and keep simmering over medium-low heat." }
  - { id: sweat, title: Sweat the vegetables, duration: 4–5 min, text: "Heat a large heavy pot over medium heat. Add a very generous amount of olive oil (it should almost coat the bottom), then the onion, fennel, garlic and a large pinch of salt. Stir and sweat." }
  - id: base
    title: Build the base
    text: |-
      Add a pinch of chilli flakes and let them infuse the oil for about a minute, then add the wine. Simmer for 2–3 minutes until the wine has mostly evaporated.
      Strain in all the shrimp broth (discard the shells); you should be adding about 1.2 l. Top up with stock or water if needed. Stir in the puréed tomatoes, bring to a boil over medium-high heat and simmer for about 15 minutes, until reduced by 15–20%.
      Taste and season with salt, and a pinch of sugar if needed to balance the acidity.
  - { id: poach, title: Poach the seafood, duration: 3–4 min, text: "Reduce the heat to low. Add the cod, shrimp and squid, gently spreading them out so they are submerged, then nestle in the mussels. Bring to a simmer, cover and poach." }
  - id: finish
    title: Finish and serve
    text: |-
      Stir very gently. Keep cooking until the mussels have opened and the fish is opaque. Discard any mussels that stay closed.
      Ladle into bowls and garnish with black pepper, olive oil and parsley. Serve with crusty bread.
sources:
  - { title: Saved video, url: "https://www.youtube.com/watch?v=73dE97btUQo" }
issues:
  - Total time is not recorded.
adaptations:
  - "Yield estimated from the amounts; the source doesn't state it."
  - "Shrimp-shell quantity given as 500 g (the source measures the shells by weight of whole shrimp)."
legacyPath: main_dishes/ciopinno/
---
