---
title: Chicken Paprikash
description: Međimurje-style bone-in chicken braised on onions with sweet paprika and sour cream, served with wide egg noodles.
category: Mains
tags: [croatian, chicken, pasta, one-pot]
status: draft
yield: { label: 4 portions, amount: 4, unit: portions, scalable: false }
time: { total: about 50 min, cook: about 45 min }
groups:
  - name: Paprikash
    items:
      - { id: onion, ingredient: onion, name: large onion, quantity: 1, unit: piece, prep: Chopped }
      - { id: lard, ingredient: lard, name: lard, quantity: 15, unit: ml, note: Or butter }
      - { id: chicken, ingredient: chicken-pieces, name: bone-in chicken pieces, quantity: 800, unit: g, note: "Leg, thigh, wing and breast; free-range if you can" }
      - { id: salt, ingredient: salt, name: salt, note: To taste }
      - { id: pepper, ingredient: black-pepper, name: black pepper, note: To taste }
      - { id: water, ingredient: water, name: water, note: "A splash, plus more as needed; chicken stock also works" }
      - { id: flour, ingredient: plain-flour, name: plain flour, quantity: 15, unit: ml }
      - { id: paprika, ingredient: sweet-paprika, name: sweet paprika, quantity: 5, unit: ml }
      - { id: sour-cream, ingredient: sour-cream, name: sour cream, quantity: 30, unit: ml }
      - { id: bay, ingredient: bay-leaf, name: bay leaves, quantity: 2, max: 3, unit: piece, scalable: false }
  - name: To serve
    items:
      - { id: pasta, ingredient: fresh-egg-pasta, name: fresh egg pasta, quantity: 600, unit: g, note: "The book uses its homemade egg pasta (široki rezanci)" }
steps:
  - { id: onion, title: Soften the onion, text: "In a heavy-based pan, cook the {{onion}} in the {{lard}} until translucent." }
  - { id: braise, title: Braise the chicken, duration: about 30 min, text: "Lay the {{chicken}} skin-side down on top of the onion so every piece rests on it. Season with {{salt}} and {{pepper}}, add a splash of {{water}} and simmer over medium-low heat. Check often and add a little more liquid only if it runs dry. Turn the pieces halfway so both sides brown." }
  - { id: check, title: Check doneness, text: "Pierce near the thigh bone (or the largest piece). The juices should run clear." }
  - { id: thicken, title: Thicken with paprika, text: "Push the chicken to one side. Stir the {{flour}} into the cleared space until golden, add the {{paprika}} and a little water, stir smooth, then mix everything together." }
  - { id: finish, title: Finish with sour cream, text: "Add the {{bay}}, a pinch of pepper and the {{sour-cream}}, and bring to a gentle simmer." }
  - { id: serve, title: Serve with pasta, text: "Boil the {{pasta}} and toss it with the paprikash." }
sources:
  - { title: "Croatian Classics, pp. 84–87 — Chicken Paprikash (picekovo tenfanje); supplied book photographs" }
issues:
  - "The homemade egg pasta recipe makes about 485 g of dough, less than the 600 g of pasta listed here."
adaptations:
  - "Converted to metric: spoons to ml (15 ml and 5 ml per spoon); kept the book's gram weights."
  - "Used lard as the first fat listed; butter also works."
  - "Rewrote the method concisely in my own words."
---

Known in Croatian as **picekovo tenfanje**, from Međimurje. It's the closest relative of Hungarian chicken paprikash.

For the pasta, make [Homemade Egg Pasta](../homemade-egg-pasta/) (široki rezanci) from the same book.

Go easy with the liquid: the chicken releases its own juices, so add water only to stop it sticking. When it's done, the sauce should come halfway up the meat. With the pasta mixed in, it should be thick enough to eat with a fork.
