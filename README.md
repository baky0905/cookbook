# Cookbook

Personal recipes, weekly plans and shopping lists, published as a static site on GitHub Pages.

- `content/recipes/*.md` — one recipe per file (YAML frontmatter + notes)
- `content/media/<recipe-id>/` — cover and step photos
- `content/plans/*.yaml` — weekly meal plans; `content/pantry.yaml` — pantry snapshot
- `docs/` — the original MkDocs cookbook, kept unchanged as the migration source; `public/archive/` serves those originals
- `.agents/skills/recipe-import/` — the import skill for Codex and Claude (`.claude/skills/` links to it)

## Local preview

```sh
npm ci
npm run dev        # http://127.0.0.1:4321/cookbook/
npm test           # quantity, scaling, shopping and schema checks
npm run build      # validates content, then builds dist/
npm run preview    # serves the built site
```

Node 22.12 or newer is required.

## Adding or changing content

- **Recipe:** ask the assistant: "Add this recipe: [link]. Here are my notes." It creates a draft. Or run `npm run recipe:new -- my-recipe "My recipe"`. Drafts are never published. Change `status` to `needs-review`, `reviewed` or `cooked` when ready.
- **Plan:** add `content/plans/2026-w42.yaml`:
  ```yaml
  id: 2026-w42
  title: Week 42
  meals:
    - { id: mon, date: '2026-10-12', recipe: lohikeitto, batches: 1 }
    - { id: tue, date: '2026-10-13', leftoversFrom: mon }
    - { id: fri, date: '2026-10-16', title: Pizza night }
  ```
  The newest non-example plan becomes "This week" and drives the shopping list. Use `servings:` only for recipes with an exact, scalable yield; otherwise use `batches:`.
- **Pantry:** edit `content/pantry.yaml` and set `updated:` to today's date.

## Publishing

Every push to `main` runs `.github/workflows/deploy.yml`: `npm ci`, `npm test`, then `npm run build`, which validates content first. If any step fails, nothing is deployed and the previous site stays live. Pull requests run the same checks without deploying.

**One-time switch (before the first push of this version):** the old site is published from the `gh-pages` branch by a workflow that has now been removed. In the repository settings, go to *Settings → Pages → Build and deployment* and set *Source* to **GitHub Actions**. The site URL remains `https://baky0905.github.io/cookbook/`. Old recipe URLs such as `/main_dishes/lohikeitto/` redirect to `/recipes/lohikeitto/`. The repository is public, so everything under `content/` is published. Keep private notes out of it.

## Rollback

- **Bad content or code:** `git revert <commit>` and push. The workflow redeploys the previous state.
- **Back to the old MkDocs site:** the last MkDocs build is still on the `gh-pages` branch (commit `499227c`). Set *Settings → Pages → Source* to **Deploy from a branch** → `gh-pages` / root. It is served again immediately, without a rebuild.
