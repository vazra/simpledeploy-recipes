# Contributing a recipe

A recipe is a folder under `recipes/<slug>/` with four files: `recipe.yml`, `compose.yml`, `README.md`, and an optional `screenshot.png`. CI validates everything; a maintainer merges; the publish workflow makes it live within minutes.

## Quick start

```bash
gh repo fork vazra/simpledeploy-recipes --clone
cd simpledeploy-recipes
npm install

mkdir -p recipes/my-app
$EDITOR recipes/my-app/recipe.yml
$EDITOR recipes/my-app/compose.yml
$EDITOR recipes/my-app/README.md

node scripts/validate.mjs recipes/my-app

git checkout -b add-my-app
git add recipes/my-app
git commit -m "feat: add my-app recipe"
gh pr create --title "Add my-app recipe" --body "..."
```

## `recipe.yml`

```yaml
schema_version: 1
id: my-app                   # required, kebab-case, must match folder name
name: My App                 # required, human-readable title (≤80 chars)
icon: "🚀"                   # optional emoji
category: web                # required (see Categories)
description: One-line summary shown on the card.
tags: [analytics, dashboard] # optional, max 10
author: yourgithubhandle     # optional but encouraged
homepage: https://example.com
min_simpledeploy_version: 0.5.0  # optional
```

The `id` must match the folder name (`recipes/my-app/recipe.yml` requires `id: my-app`). Once published, never rename a slug; servers may reference deployed apps by it.

### Categories

`web`, `dev-tools`, `databases`, `storage`, `productivity`, `observability`, `auth`, `mail`, `ci`.

Pick the user's primary mental model: "what would I search for?" Plausible is `observability`, not `web`.

## `compose.yml`

Must:

- Parse as valid Docker Compose with a non-empty `services:` map.
- Reference images that resolve via `docker manifest inspect`. Pin to a specific tag (no `latest`).
- Be paste-ready: a user clicks **Use Recipe**, edits a domain or two, clicks Deploy.

Should:

- **Define `simpledeploy.*` labels** for at least one HTTP endpoint:

  ```yaml
  labels:
    simpledeploy.endpoints.0.domain: "${DOMAIN:-example.com}"
    simpledeploy.endpoints.0.port: "8080"
    simpledeploy.endpoints.0.tls: "auto"
  ```

- **Use `${VAR:-default}` env interpolation** for anything the user must change. Use placeholder defaults; never bake real secrets.
- **Set resource limits** under `deploy.resources.limits` (cpus, memory). Pick caps a low-end VPS can handle.
- **Define healthchecks** for every long-running service.
- **Use named volumes** for persistence; document them in the README.
- **Set `restart: unless-stopped`** unless there's a reason not to.

Must not:

- Bake real secrets into the file.
- Require host-level mounts (`/var/run/docker.sock`, `/etc`, `/sys`) without a clear documented reason.
- Run privileged containers without justification.
- Require `network_mode: host` (incompatible with SimpleDeploy's reverse proxy).

## `README.md`

```markdown
# My App

One paragraph: what it is, who it's for, when to use it.

## Variables

- `DOMAIN`: public domain pointing at this server.
- `ADMIN_EMAIL`: receives bootstrap admin invitation.
- `SECRET_KEY`: 32+ random characters; generate with `openssl rand -hex 32`.

## Post-deploy

1. Visit `https://<DOMAIN>`.
2. Sign in with the admin email; check inbox for the invite.
3. Configure ...

## Backups

Persistent data lives in the `data` named volume. Recommended: a SimpleDeploy "volume" backup config, daily.

## Resources

Runs comfortably with 1 vCPU / 1GB RAM. For >100 active users, raise memory to 2GB.

## Links

- Project: https://...
- Docs: https://...
- License: AGPL-3.0
```

Keep it short. The detail screen renders the README inline.

## `screenshot.png` (optional)

- 1280x720 or larger, max ~1MB.
- Show the running app's main UI, not setup wizard.
- PNG or compressed JPEG.

## Validate locally

```bash
node scripts/validate.mjs recipes/my-app   # one
node scripts/validate.mjs                  # all
node scripts/build-index.mjs               # full index build
```

Validation checks:

- All four required files present.
- `recipe.yml` matches the JSON schema (`schema/recipe.schema.json`).
- `recipe.id` equals the folder name.
- `compose.yml` parses and has a `services:` map.

CI additionally runs `docker manifest inspect` for every image; you can do the same locally.

## Image hosting and the GHCR mirror

When your recipe merges, a workflow mirrors every image into `ghcr.io/vazra/simpledeploy-mirror/<image>` so SimpleDeploy users behind Docker Hub rate limits can still pull. You don't need to do anything; the mirror is automatic.

If your recipe references a private image, mirroring will fail. Either move the image to a public registry or open an issue to discuss.

## Versioning

Recipes evolve in place: bump image tags in `compose.yml`, edit the README for any new env vars, open a PR. Users always pull the latest version. If you ship a breaking change (new required env var, etc.), call it out clearly in the README.

## Quality bar

A great recipe:

- Solves a complete user need ("Run Plausible Analytics", not "Run Postgres").
- Has sensible defaults: a user with a domain and 30 seconds gets a working app.
- Documents trade-offs: memory needs, persistence, backup story, what to harden for production.
- Stays simple: a recipe with 12 services and 200 lines is hard to review and rarely deploys cleanly.

## Review process

PRs are reviewed by maintainers (see `CODEOWNERS`). Every recipe must pass:

- Schema validation (`recipe.yml`).
- Compose parse (`compose.yml`).
- Image manifest inspect (every referenced image resolvable).

Reviewers also check: appropriate category, clear README, no security red flags, sensible defaults.

## License

The recipes repo is MIT. By submitting a recipe, you agree to license your contribution under MIT. The apps you reference keep their own licenses; cite them in the README.

## Where to ask questions

- Issue on this repo for catalog-specific questions.
- Issue on [vazra/simpledeploy](https://github.com/vazra/simpledeploy/issues) for SimpleDeploy itself.
