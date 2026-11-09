# Personal-laptop launch — no coding agent required

This is the account/hosting handover. All commands below are for **you on your personal laptop**. No hosted migrations, function deployment, account changes or live email tests were performed from the office laptop. Office Supabase database connections are blocked. The website currently remains in synthetic mode.

Latest verification, 9 November 2026: automated handover/integration tests `974e70f`, CI/Windows compatibility fix `fb07828`; all four [Quality jobs](https://github.com/tamil07/table-tennis-ireland/actions/runs/42616047886) passed. The website serves the synthetic operational portal; the separate app Worker and hosted backend still need owner deployment.

You do not need to buy another repository or pay for a coding-agent subscription to follow this guide. Use the existing Supabase project, Cloudflare account and repository. Email-domain verification, live acceptance and any outstanding product limitations are listed below; connecting accounts does not prove those checks passed.

## 1. Get the repository and tools

Install [Git](https://git-scm.com/downloads) and [Node.js 22](https://nodejs.org/en/download). Open a terminal in your checkout:

```bash
git clone https://github.com/tamil07/table-tennis-ireland.git
cd table-tennis-ireland
git switch main
git pull --ff-only origin main
npm ci
node --version
```

If already cloned, start with `git switch main` and pull; preserve any personal edits. Sign in with your GitHub account if the repository is private. Shell helpers use Bash (macOS/Linux or WSL/Git Bash on Windows); the individual `npx`/`npm` commands can also be run separately.

**One-command local verification:** run `npm run verify:local`. It runs unit/setup/backend tests and automatically builds, starts and checks both clients, including desktop/mobile browser workflows. No cloud login or Docker is needed; free test tools/browser are downloaded on first use. See [TESTING.md](TESTING.md) for the Linux browser-library prerequisite and exact test boundaries. These checks also run in CI, so you do not need to recreate its PostgreSQL test service on the laptop.

## 2. Reauthenticate the CLIs on this laptop

Office-laptop CLI sessions and environment exports do **not** transfer automatically.

Start with your personal laptop's normal internet connection. Recreate CLI logins and private environment files using this guide; do not copy office proxy, VPN, certificate or HTTP settings, and do not disable TLS verification to work around connection errors. CLI HTTPS login/function deployment and PostgreSQL connections are separate paths: successful login does not prove the database port is reachable. Route B below uses the dashboard over HTTPS if needed.

```bash
npx supabase login
npx supabase link --project-ref mkxqrkqwpvjtkjfjjckm
npx wrangler login
npx wrangler whoami
```

Supabase: use your existing account/organization **TT Clubs Ireland**, project **ttclubs**, region **eu-north-1 (Stockholm)**. Cloudflare: use the account holding the existing `table-tennis-ireland` Worker and `ttclubsie.workers.dev` subdomain (account ID `6502a73494f4ee7107b36c620ee76471`). Do not create replacement accounts/projects or reuse an old expired token. If the account differs, stop before deploying to it.

Browser-based CLI login is the simplest route. For headless HTTP/CI later, the providers support `SUPABASE_ACCESS_TOKEN` and `CLOUDFLARE_API_TOKEN`/`CLOUDFLARE_ACCOUNT_ID`; create fresh appropriately scoped tokens in those providers and keep them private. They are not database passwords and never belong in `VITE_*` variables. A shell export affects that terminal only.

## 3. Apply database migrations — choose ONE route

### Route A: Supabase CLI over a permitted personal connection

```bash
npx supabase db push --remote --dry-run
```

Review the proposed files, then:

```bash
npx supabase db push --remote
```

The installed CLI used by this repository targets local by default, so `--remote` matters. If your installed CLI changes, check `npx supabase db push --help`. Enter the database password privately if requested. Do not run a hosted reset and do not include the synthetic seed or CI auth fixture.

### Route B: HTTPS dashboard SQL Editor if database ports are unavailable

```bash
npm run setup:migrations
```

Open generated `supabase/migrations.local.sql`, review it, and paste/run it in the existing project's **SQL Editor** in the [Supabase dashboard](https://supabase.com/dashboard/project/mkxqrkqwpvjtkjfjjckm). The bundle contains only ordered repository migrations, runs transactionally and records CLI migration history. Already recorded versions are skipped. It does not include passwords or test Auth stubs. Generation itself performs no network operation. Use this from your personal environment, respecting office restrictions.

Never apply `supabase/tests/plain_postgres_auth_fixture.sql` to hosted Supabase. That file creates fake roles/Auth only for isolated tests.

## 4. Prepare private environment files

Find the project's **publishable key** in its API settings; the URL is `https://mkxqrkqwpvjtkjfjjckm.supabase.co`. Use a publishable/legacy **anon** key, never a secret or service-role key.

```bash
npm run setup:env
```

Paste the browser-safe key when prompted. This creates missing files, preserving existing ones:

- `apps/club-web/.env.local`
- `apps/platform/.env.local`
- `.env.server.local` (including a generated private scheduler token)

All are ignored by Git. Review existing files if copied from another laptop. Keep `VITE_ENABLE_LIVE=false` for now. Phone OTP stays off; enabling it needs a separately configured SMS provider, limits and budget.

The server file contains exact website/app/local origins and the intended app URL. If your deployment URLs differ, edit `APP_URL` and `APP_ORIGINS` to those exact origins (comma separated, no wildcard). Supabase supplies its server URL/service-role credentials to deployed functions; do not copy them into frontend files or the server environment template.

Newly generated files allow both `localhost` and `127.0.0.1` on ports 4173/4174. If you already have a server file, the helper deliberately preserves it: add the exact local origin you use to `APP_ORIGINS` if missing, then upload the updated server secrets before testing local clients against the deployed API. Do not add wildcards.

## 5. Deploy the backend and create the initial owner

```bash
npx supabase secrets set --env-file .env.server.local
npm run deploy:backend
```

This prepares function-local copies of the shared rules and deploys **club-api**, **club-jobs** and **club-public** using the CLI's HTTP bundler (`--use-api`), so Docker is not required on the laptop. `club-api` verifies the bearer user through Auth; `club-jobs` requires the generated job token; `club-public` projects public fields only. Never deploy a function with its authentication checks removed.

In Supabase **Authentication → Users**, create your first real owner user with your intended email and a strong private password. For this initial owner-only test you can use the dashboard's verified/auto-confirm option after verifying it is your own address. This is a platform end-user account, separate from your Supabase administrator GitHub login. Copy its Auth user UUID, then:

```bash
npm run setup:bootstrap -- --owner YOUR_AUTH_USER_UUID --email ttclubsie@gmail.com --name "Your name"
```

Review `supabase/bootstrap.local.sql` and run it once in SQL Editor. It creates the Leeside club and an **empty** real workspace owned by that account. It does not copy synthetic people, demo memberships or fake domains. Existing runtime state is never overwritten. Only the owner bootstrap needs SQL; subsequent management permissions, plans, people and sessions are edited in the app.

## 6. Enable and deploy the two frontends

Change `VITE_ENABLE_LIVE=false` to `VITE_ENABLE_LIVE=true` in **both** app `.env.local` files after steps 3–5 succeed. Then:

```bash
npm run check
npm run deploy:club
npm run deploy:platform
```

`npm run check` builds both apps before the deploy scripts publish those assets. The website uses `wrangler.club-web.jsonc` and the existing Worker `table-tennis-ireland`; the app uses `wrangler.platform.jsonc` and a separate `ttclubs-app` Worker. Rebuild after changing frontend environment variables. Do not deploy the app over the website Worker.

Expected URLs in the existing account:

- Website: `https://table-tennis-ireland.ttclubsie.workers.dev`
- App: `https://ttclubs-app.ttclubsie.workers.dev`

Confirm the actual Wrangler output. No purchased domain is needed for these URLs. A future Leeside domain can point to the website; update exact Auth callbacks and origins when adding it.

After deployment, hard-refresh both clients (or close/reopen the installed PWA) to load the new version before testing. Confirm live mode and the expected account; an old browser tab can still display a cached synthetic build.

**Cloudflare Git builds also need the four browser variables** (`VITE_ENABLE_LIVE=true`, `VITE_ENABLE_PHONE_LOGIN=false`, project URL and publishable key) in their build environment. Your laptop `.env.local` is not uploaded to Git. Until the dashboard build variables are updated, a later main push can rebuild the website in synthetic mode. Never add the server secrets/job token/email API key to Cloudflare frontend build variables.

In Supabase **Authentication → URL Configuration**, set the Site URL to the real app URL and allow the exact website/app callback URLs used above, plus local development origins only if needed. The app handles password recovery and OAuth callbacks at the root. Google sign-in additionally needs Google OAuth configuration in Supabase; it is optional, so password sign-in can be tested first.

## 7. Run the owner smoke test before real members

1. Open the app and sign in as the bootstrapped owner. There must be **no synthetic role picker** in live mode.
2. In Management, enter the club-approved privacy contact, safeguarding contact and policy. Keep automatic retention off until approved. Add individually authenticated trusted managers and grant only their required permissions.
3. In People & memberships, create the real membership types; add a synthetic test player/guardian before any real child data. Confirm create/edit/retire, manual membership dates and optional acknowledgement queueing.
4. Publish future sessions/tables in Ireland local time. Request a place from a second permitted test account in the website, approve it in the app, and verify four-place capacity and one-place-per-player rules. Try a revoked role and a conflicting request; both must be refused.
5. During an open test session, try app/venue-QR attendance, expired/no-membership follow-up, Not attending and correction. Bookings alone must not add attendance.
6. Create a singles/doubles event and score a match. Switch to the opponent for approval and verify private reflections stay hidden. Coach summaries must show reporting counts, not diagnoses. A development summary needs distinct coach and player/guardian sign-off.
7. Inspect **Functions → Logs** for server failures and the app's messages/work queue for delivery issues. Share errors without passwords/tokens if you need help.

These hosted checks were deliberately not performed from the office laptop. Local unit, database and HTTP-handler tests do not replace them.

## 8. Configure real email and scheduling when ready

Club notification code is implemented, but external delivery requires your account configuration:

- Set up the selected transactional provider (Resend), verify an owned sending domain/DNS and obtain its API key. The two Gmail addresses remain account/contact/reply-to addresses; Gmail alone is not this app's bulk transactional transport.
- Add `RESEND_API_KEY` and verified `EMAIL_FROM` to `.env.server.local`; retain `EMAIL_REPLY_TO=leesidettie@gmail.com`. Run `npx supabase secrets set --env-file .env.server.local` again.
- Configure **Supabase Auth custom SMTP separately** for sign-up verification, recovery and magic-link emails. Application notification sending does not configure Auth SMTP. See [Auth SMTP](https://supabase.com/docs/guides/auth/auth-smtp) and [Google provider](https://supabase.com/docs/guides/auth/social-login/auth-google).
- Run `npm run setup:schedule`, review private `supabase/schedule.local.sql`, and run it **once** in SQL Editor. It creates a Vault-held job token and a fifteen-minute `pg_cron`/`pg_net` HTTP schedule. Check Cron run history. Do not create duplicate schedules or post the generated file publicly. See [Supabase Cron](https://supabase.com/docs/guides/cron).
- Test owner-only email delivery and unsubscribe preferences before inviting members. Missing email secrets leave messages queued; they are never falsely marked sent. End-of-day processing uses Europe/Dublin dates and runs on the next successful scheduler pass; provider/cron delays remain possible.

The application defaults to at most 90 notification-send attempts per UTC day across clubs. This is our protective cap, not a provider allowance or a guarantee of free service. Review your provider's current limits; Auth SMTP traffic also consumes its allowances. Keep daily attendance digests off initially and optional advance reminders disabled to reduce noise.

## Before public launch

Configure encrypted off-site backups and restore verification, monitoring/usage alerts, current policies/retention decisions and the domain when purchased. `scripts/backup-database.sh` prepares encrypted database exports using private standard PostgreSQL environment variables; it needs local `pg_dump`/OpenSSL and an approved off-site destination. Storage objects need separate backups and a 35-day backup-expiry policy. Never test restore against production.

Historical Wix articles/calendar/media/documents are still source-linked rather than fully imported. Native store binaries, NFC hardware and automated Facebook posting remain deferred. Read [OpenSpec implementation status](../openspec/changes/launch-cork-club-platform/implementation-status.md) and [tasks](../openspec/changes/launch-cork-club-platform/tasks.md) for precise code versus live-acceptance status.
