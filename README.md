# SimpleDeploy Recipes

Community-contributed deploy recipes for [SimpleDeploy](https://github.com/vazra/simpledeploy).

A recipe is a paste-ready Docker Compose stack with `simpledeploy.*` labels for endpoints, healthchecks, and resource limits. Once merged here, every SimpleDeploy server can browse and deploy your recipe from its deploy wizard within minutes, no SimpleDeploy upgrade required.

## For users

Open the deploy wizard in your SimpleDeploy server. Click **Browse community recipes**. Pick a recipe, click **Use Recipe**, edit env vars, deploy.

The catalog is also browseable as JSON at <https://vazra.github.io/simpledeploy-recipes/index.json>.

Recipes are reviewed for schema validity and image resolvability, but **not audited for security**. Read the compose and README before deploying. Treat third-party recipes the same as third-party code.

## For contributors

```bash
# Fork & clone
gh repo fork vazra/simpledeploy-recipes --clone
cd simpledeploy-recipes
npm install

# Add a recipe
mkdir -p recipes/my-app
$EDITOR recipes/my-app/recipe.yml
$EDITOR recipes/my-app/compose.yml
$EDITOR recipes/my-app/README.md

# Validate locally
node scripts/validate.mjs recipes/my-app

# Open a PR
git checkout -b add-my-app
git add recipes/my-app
git commit -m "feat: add my-app recipe"
gh pr create
```

CI runs schema validation, compose parse, and `docker manifest inspect` on every image before a maintainer reviews. Once merged, the publish workflow rebuilds the index and deploys to GitHub Pages. The mirror workflow pushes every referenced image to `ghcr.io/vazra/simpledeploy-mirror/...` so users behind Docker Hub rate limits can still pull.

See [CONTRIBUTING.md](./CONTRIBUTING.md) for the full guide.

## Repository layout

```
recipes/<slug>/
  recipe.yml       metadata (id, name, category, description, ...)
  compose.yml      paste-ready Docker Compose with simpledeploy labels
  README.md        what it does, env vars, post-deploy notes
  screenshot.png   optional preview image

schema/
  recipe.schema.json
  index.schema.json

scripts/
  validate.mjs            validate one or all recipes
  build-index.mjs         build dist/index.json + dist/recipes/<slug>/...
  list-mirror-images.mjs  enumerate images for the mirror workflow

.github/workflows/
  validate.yml         PR validation (schema + compose + manifest)
  publish.yml          publish dist/ to GitHub Pages on main
  mirror-images.yml    mirror referenced images to GHCR
```

## Categories

`web`, `dev-tools`, `databases`, `storage`, `productivity`, `observability`, `auth`, `mail`, `ci`.

## License

MIT for the catalog. Each app you reference keeps its own license; cite it in the recipe's README.

## Links

- SimpleDeploy: <https://github.com/vazra/simpledeploy>
- User docs: <https://vazra.github.io/simpledeploy/guides/community-recipes/>
- Contributor docs: <https://vazra.github.io/simpledeploy/contributing/community-recipes/>
- Live catalog: <https://vazra.github.io/simpledeploy-recipes/index.json>
