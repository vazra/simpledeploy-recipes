# Onetime Secret

Self-hosted service for sharing passwords, API keys, and other sensitive strings via links that self-destruct after a single view. Useful for teams that don't want secrets sitting in chat history or email.

## Variables

- `DOMAIN`: public domain pointing at this server (e.g. `secret.example.com`).
- `ADMIN_EMAIL`: the "colonel" account, gets admin rights on first login.
- `SECRET_KEY`: 32+ random chars used to encrypt secrets at rest. Generate with `openssl rand -hex 32`. **Never change this after first deploy** or existing secrets become unreadable.
- `REDIS_PASSWORD`: password for the bundled Redis. Pick anything; users never see it.

## Post-deploy

1. Visit `https://<DOMAIN>`.
2. Sign up with `ADMIN_EMAIL` to claim the admin account.
3. Create a secret to verify end-to-end.

## Backups

Persistent data lives in the `redis-data` named volume. Configure a SimpleDeploy "volume" backup, daily. Without it, all stored secrets vanish on volume loss (which may be fine, since secrets are short-lived by design).

## Resources

Comfortable on 1 vCPU / 512MB. Redis usage stays small unless you store many long-TTL secrets.

## Links

- Project: https://github.com/onetimesecret/onetimesecret
- Docs: https://docs.onetimesecret.com/en/self-hosting/
- License: MIT
