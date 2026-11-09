# Verification without cloud setup

From a checkout with Git and Node 22 installed:

```bash
npm ci
npm run verify:local
```

This runs the type checks, unit tests, isolated setup-helper tests, both production builds, local backend HTTP tests, and automatic desktop/mobile browser workflows for both clients. It stages current backend rules automatically, downloads the free Deno test runtime and Chromium on first use when needed, chooses free loopback ports, starts/stops the test servers and removes its temporary builds. No Supabase/Cloudflare login, hosted database, paid account, manual server startup or Docker is required for this command. Initial downloads require internet access.

On Linux, Chromium may require system libraries. If the command reports missing libraries, run `npx playwright install --with-deps chromium` (may request your OS administrator password), then retry. Windows/macOS use the same npm command; do not copy office proxy/TLS settings.

Existing environment files are preserved. Browser tests force fake synthetic settings in temporary builds and refuse live mode. The ordinary `npm run check` step still validates/builds your configured deployment settings; it fails visibly if those settings contain server secrets. The browser stages do not replace deployable `dist` assets. Never remove a failing environment guard to get a successful result.

## Coverage and boundaries

| Layer | Checks | What it does not establish |
| --- | --- | --- |
| Domain unit tests | Membership/trials/dates, permissions/guardians, booking/resources, scoring/brackets, review/deadlines, reflections/privacy, notifications/retention | Hosted Auth, remote database or device behavior |
| Shared live adapter unit tests | Explicit activation, missing settings, failed reads/writes without synthetic fallback, revision refresh, account/club cache isolation, stable retry ID and denied exports | Browser OAuth/provider configuration |
| Setup-helper tests | Fresh private files, rerun preservation, safe browser keys, all documented local origins, owner ID/SQL quoting, function packaging, deterministic migrations and private schedule token | Permission to modify real cloud accounts |
| HTTP integration tests | Actual API/public/jobs handlers with local fake Auth/PostgREST/provider boundaries | Supabase gateway settings or real email delivery |
| PostgreSQL integration in CI | Actual API/domain commands and migration RPCs against PostgreSQL 17; simultaneous place requests, retry, app-to-website approval, revocation, unrelated/wrong club access, raw-read/duplicate-place refusal | Real Supabase Auth/PostgREST: these boundaries use explicit local adapters |
| Browser workflows | Built website **and** PWA; guardian booking/approval, attendance/reports, scores/reflection privacy/review, coaching summaries; 390px/320px reflow and browser errors | Physical iPhones/Android, native stores, production distributed load |

Screenshots are stored in ignored `test-results/`. GitHub CI uploads only synthetic screenshots with seven-day retention. Setup tests use temporary directories and fake identities/keys; they never read or overwrite your private app configuration. CI additionally applies the generated SQL-Editor bundle and fake-owner bootstrap twice to verify first-run and rerun behavior, then runs database permission tests.

## Smaller commands

| Command | Purpose |
| --- | --- |
| `npm run check` | Type checks, domain/adapter unit tests, setup tests and both deployment builds |
| `npm run test:setup` | Setup helper regressions only |
| `npm run test:edge` | Stage shared rules, Deno type checks and three local backend HTTP suites |
| `npm run test:browser:local` | Automatically build/serve/check both synthetic frontends; preserve deployment assets |
| `npm run test:browser` | Low-level check against an already running **synthetic** site; `APP_TEST_URL` selects it |

The PostgreSQL suite is deliberately a CI/developer check, not another personal-laptop setup prerequisite. It requires the CI Auth fixture and repository migrations in an isolated loopback database whose name begins `tti_test`; the test refuses other targets. Run with `TTI_TEST_DATABASE_URL` and `deno test --config supabase/functions/deno.json --allow-env --allow-net supabase/functions/database.integration.test.ts`. Never apply the fixture or fake-owner SQL to hosted Supabase.

## After local checks

Passing local/CI tests does not activate hosting. Follow [PERSONAL_LAPTOP_LAUNCH.md](PERSONAL_LAPTOP_LAUNCH.md) for fresh CLI authentication, reviewed hosted migrations, server secrets, real owner setup, exact callbacks/origins and independent website/app deployment. The owner-only live smoke test, real email, policies and backup restoration remain necessary. No paid coding agent is required to execute those documented steps.
