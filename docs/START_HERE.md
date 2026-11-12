# Resume on an old or new laptop

Use the existing repository, Supabase project and Cloudflare account. You need Git and Node 22, not another paid coding agent. The website and national app already show live-mode sign-in screens; do not restart their setup from zero.

## 1. Get the saved files

In an existing checkout:

```bash
git status --short
git switch main
git pull --ff-only origin main
npm ci
npm run setup:doctor
```

Preserve any local edits before switching/pulling; do not force-reset the checkout. For a new checkout, first run `git clone https://github.com/tamil07/table-tennis-ireland.git` and `cd table-tennis-ireland`. Confirm this repository is the one you push to. Private environment files, CLI sessions and shell exports are intentionally not in Git.

`setup:doctor` inventories local files/settings without logging in, contacting providers, changing files or printing credentials. Warnings identify missing local configuration; it cannot prove hosted setup is complete. `npm run setup:doctor -- --production` also requires explicit live client settings and local backend maintenance configuration. Mail/provider checks remain separate.

## 2. Verify the code locally

```bash
npm run verify:local
```

This checks types, unit/setup tests, backend HTTP handlers, both builds and automatic desktop/mobile browser workflows. It downloads free Deno/Chromium test tools when needed, starts its own local test servers and cleans them up. No cloud login or Docker is required. Browser tests use temporary synthetic builds and preserve deployment assets/private settings. Linux browser-library prerequisites and exact test boundaries are in [TESTING.md](TESTING.md).

## 3. Use the existing deployment first

- Website: https://table-tennis-ireland.ttclubsie.workers.dev
- App: https://ttclubs-app.ttclubsie.workers.dev
- Existing Supabase project: `ttclubs`, reference `mkxqrkqwpvjtkjfjjckm`, region `eu-north-1`.

Sign in using the owner account you already created. Do not create another project or repeat owner bootstrap solely because you changed laptops. Anonymous sign-in screens and a working public endpoint do not establish that private membership/booking workflows are accepted. Use the owner smoke test in [PERSONAL_LAPTOP_LAUNCH.md](PERSONAL_LAPTOP_LAUNCH.md).

The [deployment status](DEPLOYMENT_STATUS.md) separates verified observations from owner-only checks. Fill its remaining fields with non-secret outcomes after checking your accounts; never enter passwords, tokens, real member lists or private SQL there.

## 4. Restore only the local settings you need

To run a local client against the existing backend, locate the browser-safe publishable key in the existing Supabase project's API settings:

```bash
npm run setup:env -- --frontend-only
```

This creates missing frontend environment files, preserves existing files and does not generate/rotate backend scheduler secrets. Review both app files and explicitly enable live mode only when you intend to use the shared backend. Local synthetic testing remains available without cloud configuration.

For backend maintenance, retrieve your existing private server configuration from your approved private storage. Do not upload a freshly generated scheduler token over an existing deployment: its Edge Function secret and Vault/cron value must match. If the original token is unavailable, deliberately rotate both together through the providers and verify cron afterwards. `setup:env` without `--frontend-only` is for first-time preparation; it does not recover deployed secrets.

Use your normal permitted internet connection. CLI logins, HTTPS API access and PostgreSQL connectivity are separate. Do not copy office proxy/VPN settings or disable TLS verification.

## 5. Maintenance and deployment

Only when you need provider access, recreate CLI sessions on this laptop:

```bash
npx supabase login
npx supabase link --project-ref mkxqrkqwpvjtkjfjjckm
npx wrangler login
npx wrangler whoami
```

Use the existing accounts and confirm the Cloudflare account contains both Workers. Review `npx supabase db push --remote --dry-run` before applying any genuinely missing migrations; do not reset the hosted database or upload fixtures/seeds. The launch guide includes an HTTPS SQL-Editor fallback. Office-laptop hosted setup remains paused; use the permitted personal connection for account/database work.

Production commands now require `VITE_ENABLE_LIVE=true`, a browser-safe key and the existing project URL. They fail before publishing when configuration is missing or synthetic. Each deploy rebuilds fresh assets:

```bash
npm run deploy:club
npm run deploy:platform
```

Keep `npm run check`/`verify:local` for local testing. Production `build:club`/`build:platform` intentionally reject demo mode. This avoids replacing a live site with a synthetic build from an older laptop.

**Before the next Git build:** set the four browser variables in Cloudflare's build environment for each Git-connected target: `VITE_ENABLE_LIVE=true`, `VITE_ENABLE_PHONE_LOGIN=false`, the existing project URL, and `VITE_SUPABASE_ANON_KEY` containing the publishable/anon key. Laptop files and Worker runtime secrets do not configure Vite's Git-build environment. Server credentials never go there. If the guard blocks a build, correct these settings and retry; keep the existing live release.

## 6. Save progress without credentials

Update `docs/DEPLOYMENT_STATUS.md` with dates, public URLs, deployed commit/version where known, and passed/pending outcomes. Then commit those specific non-secret notes:

```bash
git add docs/DEPLOYMENT_STATUS.md
git commit -m "docs: record owner deployment verification"
git push origin main
```

Keep private `.env` files, generated SQL, passwords, provider tokens and recovery codes out of Git and chat. Cloudflare Builds may run on a push; check the result and both served sites afterwards. [AGENTS.md](../AGENTS.md) and OpenSpec remain the handover for future code changes.
