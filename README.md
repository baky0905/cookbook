# Cookbook

Personal recipes, weekly plans and shopping lists, published as a static site on GitHub Pages: https://baky0905.github.io/cookbook/

## How it's used

| Task | Where | How |
|---|---|---|
| Add a recipe | PC, with the AI assistant | "Add this recipe: [link / photos / notes]". It uses the `recipe-import` skill and creates a draft. |
| Plan the week, extra shopping items | Phone or tablet, family editor | Cookbook → Family editor → choose a prepared week |
| Add photos, notes, change status | Phone or PC, editor | `/cookbook/admin/` → Recipes |
| Cook, shop | Phone | The site: recipe pages, Shopping, Reference |

Every saved change goes to GitHub, which checks the content and republishes the site in about two minutes.

## Content

- `content/recipes/*.md`: one recipe per file (YAML frontmatter + personal notes). Drafts are not published.
- `content/plans/*.yaml`: weekly plans with meals, notes and extra shopping items. “This week” follows the current calendar week in Europe/Oslo, even without a new deploy. Both Week and Shopping have a week selector and shareable `?week=<id>` links.
- `content/history/*.json`: frozen past weeks (meals, amounts, calories, shopping list), saved after the week ends, on a subsequent deploy or the Monday scheduled run. Preparing future plans never archives them early. Download them all from `/history.json` or `/history-meals.csv`.
- `content/ingredients.yaml`: every ingredient once, with shopping name, aisle, staple flag, calorie data and a `norway` buying tip (Norwegian name, what to pick, swaps). Recipe-specific choices go in the recipe item's `note`.
- `content/taxonomy.yaml`: categories, tags, aisles, units and meal slots. Validation rejects anything not listed.
- `content/pantry.yaml`: pantry snapshot, subtracted from shopping lists.
- `content/reference/*.yaml`: reference pages (conversions, cutting, temperatures, storage, seasons), with sources.
- `content/media/`: photos (WebP, small). `docs/` holds the original MkDocs cookbook as the migration source; `public/archive/` serves those originals.
- `.agents/skills/recipe-import/`: the import skill for Codex and Claude (`.claude/skills/` links to it).

## House rules (enforced by `npm run validate`)

- English and metric only: g, kg, ml, l, °C, cm. No cups, spoons, ounces, pounds or °F, even in notes.
- Every ingredient comes from `content/ingredients.yaml`; categories and tags come from `content/taxonomy.yaml`.
- Ingredients double as the prep list: `prep` says how to cut or prepare ("small diced"), grouped by component, in the order used.
- Photos at most 600 KB and 2400 px. `npm run media:optimize` converts them; the editor converts uploads automatically.

## Editor (Sveltia CMS)

Free and open source, running in the browser from `/cookbook/admin/`; it commits straight to this repository.

1. Create a fine-grained GitHub token: GitHub → Settings → Developer settings → Fine-grained tokens → only the `cookbook` repository → Repository permissions: **Contents: Read and write**.
2. Open https://baky0905.github.io/cookbook/admin/ → **Sign In Using Access Token** → paste it. Once per device.
3. On a PC you can instead choose **Work with Local Repository** (Chrome or Edge) to edit the local files without GitHub.

Dropdowns (recipes, ingredients, tags) come from the content and update after the next deploy. If a save breaks a rule, the Actions run fails, nothing is published, and the error says what to fix.


## Family planning

- `/cookbook/edit/` explains the workflow and opens `/cookbook/family/`, a smaller Sveltia editor showing only prepared weeks, meals and shopping extras.
- Prepare a Monday with `npm run week:new -- 2026-10-19`, then commit and push. Family members choose the week, add dated meals and save. Leaving portions and batches blank uses the recipe’s original amount; use batches for recipes without an exact yield.
- Extras accept plain text (e.g. bin bags) with optional amounts. Selecting a catalogue ingredient combines compatible quantities with recipe shopping items.
- `/cookbook/admin/` remains the full owner editor. The family view hides technical metadata and disables creating/deleting weeks; it is **not an access-control boundary**. Editors have repository write access.
- Invite each editor’s GitHub account as a collaborator. On their device, use the token sign-in option and its token creation link. Fine-grained tokens have limitations for outside collaborators/personal repositories; do not share the owner’s token. See [Sveltia GitHub sign-in](https://sveltiacms.app/en/docs/backends/github#authentication).
- Saves trigger the normal build, typically taking about two minutes. Avoid editing the same week simultaneously. If publishing fails, inspect GitHub Actions; the previous site stays available.
- Shopping ticks remain per-device. Plans and shopping extras are public repository/site content.
- Monday archival is scheduled in GitHub Actions. GitHub may delay scheduled runs or disable them on inactive repositories; manual publishing also archives finished weeks. Browser week selection does not depend on this schedule.

## Commands

```sh
npm ci
npm run dev                      # http://127.0.0.1:4321/cookbook/ (editor: /cookbook/admin/)
npm test                         # scaling, shopping, calories, history and schema checks
npm run build                    # validate, then build dist/
npm run recipe:fetch -- <url>    # recipe data from a site or YouTube, for the import skill
npm run recipe:new -- <id> "Title"
npm run week:new [-- 2026-10-19] # start next week's plan; archives only finished weeks
npm run history:snapshot         # archive finished weeks (CI does this on every push)
npm run media:optimize           # shrink photos to WebP
```

Node 22.12 or newer. Optional: `brew install yt-dlp` lets `recipe:fetch` read YouTube captions.

## Publishing and rollback

Every push to `main` runs `.github/workflows/deploy.yml`: install, test, archive finished weeks (committed back), validate, build, deploy. Any failure stops the deploy and the previous site stays live. Pull requests run the checks without deploying.

- **One-time setting:** GitHub → Settings → Pages → Source → **GitHub Actions**.
- **Undo a change:** `git revert <commit>` and push.
- **Back to the old MkDocs site:** Settings → Pages → Deploy from a branch → `gh-pages` (last MkDocs build, `499227c`).
- The repository is public, so everything under `content/` is published. Keep private notes out of it.
