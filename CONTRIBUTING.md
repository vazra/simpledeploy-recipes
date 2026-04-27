# Contributing a recipe

1. Fork this repo.
2. Add `recipes/<slug>/` with:
   - `recipe.yml` (see `schema/recipe.schema.json`)
   - `compose.yml` (full Docker Compose, must parse and reference resolvable images)
   - `README.md` (what it does, env vars, post-install notes)
   - `screenshot.png` (optional, max 1MB)
3. Run `node scripts/validate.mjs recipes/<slug>` locally.
4. Open a PR. CI validates schema, parses compose, and runs `docker manifest inspect` for every image.

## Recipe metadata fields

See `schema/recipe.schema.json`. Key fields:
- `schema_version`: integer, currently `1`
- `id`: stable slug, lowercase, kebab-case
- `name`: human title
- `icon`: emoji
- `category`: one of `web`, `dev-tools`, `databases`, `storage`, `productivity`, `observability`, `auth`, `mail`, `ci`
- `description`: one-line summary
- `tags`: array of strings
- `author`: GitHub handle

## Review process

PRs are reviewed by maintainers (see `CODEOWNERS`). All recipes must pass CI validation: schema, compose parse, image manifest inspect.
