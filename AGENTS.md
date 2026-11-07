# Coding-agent handover

## Start here

This repository contains the Leeside club website and the national TT Clubs app. Read these files before changing behavior:

1. `openspec/changes/launch-cork-club-platform/proposal.md` — approved scope.
2. `openspec/changes/launch-cork-club-platform/implementation-status.md` — current implementation, blockers and personal-laptop handover.
3. `openspec/changes/launch-cork-club-platform/tasks.md` — full remaining checklist; unchecked work is not implemented merely because a schema/demo exists.
4. The affected `specs/<capability>/spec.md` and `design.md` — behavior and scenarios.
5. `docs/ACCOUNT_SETUP_README.md` — owner account actions; `docs/TRACEABILITY.md` — code mapping; `docs/WIX_MIGRATION_AND_MEMBER_PORTAL_PLAN.md` and `docs/PUBLIC_CONTENT_MANIFEST.md` — content/portal gaps and source destinations.
6. `openspec/changes/launch-cork-club-platform/runtime-design.md` — active command-service architecture, replacing the original normalized-table implementation assumption.
7. `docs/PERSONAL_LAPTOP_LAUNCH.md` — ordered user-executable deployment guide, including fresh CLI login and HTTP/SQL-Editor fallback. The owner specifically wants no further agent subscription or application coding on that laptop.

Updated 7 November 2026. Later explicit user decisions take precedence. Keep requirements, tasks, status and README consistent when behavior changes. Do not silently mark a production feature complete based on synthetic UI.

## Current blocker and ownership

The owner confirms the office laptop blocks Supabase connections and will complete connection setup from a personal laptop after repository updates. Do not bypass the office network, repeatedly retry remote writes, create another project or apply hosted migrations during the pause. The project already exists: `ttclubs`, ref `mkxqrkqwpvjtkjfjjckm`, region `eu-north-1` (Stockholm). The timeout does not prove the SQL is broken. Commands and the review-before-apply sequence are in the status/setup files.

Continue independent implementation/tests/builds and clearly labelled synthetic previews. Do not describe browser-local state as shared persistence, preview role selectors as authentication, or simulated notifications as email delivery. Real data needs complete RLS, permissions, auth/profile provisioning, backup and acceptance work. Never store passwords, tokens, service-role keys or private member records in git or public frontend variables.

Fresh CLI login and HTTP settings belong in docs/PERSONAL_LAPTOP_LAUNCH.md: office sessions, exports and proxy/VPN settings do not transfer. Recreate private local files and exact provider settings on the personal connection; never disable TLS checks. The handover must remain usable without another coding-agent subscription.

The user owns the platform, repo and shared cloud infrastructure. Individual Leeside management accounts administer club content, membership, sessions and communications. Gmail addresses are contact/recovery identities, not legal owners or shared admin login credentials. Club roles and membership products must be editable at runtime, with revocation enforced server-side on subsequent requests.

## Repository and implementation boundaries

Current operational source is `packages/domain/src/operations.ts`, `packages/ui/src/ClubPortal.tsx`, `ClubAuth.tsx`, `ClubPublished.tsx` and `club-client.ts`, backed by `supabase/functions/club-api`, `club-jobs`, `club-public` and migration `202611080001_club_runtime.sql`. Both clients use the same command store. `club_runtime` is canonical; the original normalized schema/venue RPCs remain legacy foundations, not an inventory to dual-write. Read runtime-design.md for the deliberate pilot aggregate/CAS tradeoff and load-testing gate.

Run `npm run prepare:functions` before Deno checks/tests/deployment. It stages canonical rules in ignored `supabase/functions/_shared/domain`; never edit or commit generated copies. `deploy:backend` prepares them automatically and uses HTTP bundling without Docker. No hosted deployment has been performed by implementing these files.

`VITE_ENABLE_LIVE=false` is the default. Live mode uses verified Auth and server-side permission checks and must not silently fall back to synthetic persistence. A personal-laptop `.env.local` does not configure Cloudflare Git build variables; those must be set separately before Git builds can publish live mode. Never pass server secrets to Vite.

- `apps/club-web`: React/Vite Leeside public website, current Cloudflare target.
- `apps/platform`: React/Vite national PWA; a separate remote deployment is not yet verified.
- `packages/domain`: shared domain types, rules and unit tests.
- `packages/ui`: reusable UI, including `SessionBookingDemo.tsx` and `booking.css`.
- `supabase/migrations`: versioned schema/RPC source, not proof of hosted application.
- `supabase/tests`: database tests; `plain_postgres_auth_fixture.sql` is CI-only and must never be applied to hosted Supabase.
- Root club HTML/PDF files are source material, not automatically public assets. Preserve unrelated/untracked owner files. Do not publish PDFs without inspecting their contents and intended purpose.

Keep website/app/backend in this repo for at least one live pilot year. Review extraction only after that period and three or more clubs. Do not fork the national app/backend per club or create a generic website-hosting service without a new decision.

## Decisions that must not regress

- Table booking: **four player places per table, full session, one active pending/confirmed place per player/session**. Parents may book distinct linked children. Maintainer-approved holds; reservable/coaching/walk-in/closed allocations; moves and releases. No exclusive hourly whole-table inventory. The active command service validates resource conflicts and SQL commit guards enforce revision and player/place uniqueness; hosted concurrent acceptance remains required.
- Synthetic booking UI is reused by both frontends, only under Leeside in the app. Twelve tables, six initial coaching allocations, thirty-minute holds and two-hour cancellation cutoff are demo defaults; the live bootstrap starts empty and managers configure real inventory/policy through the supplied forms.
- Attendance is independent of booking. Record expired/no-membership attendance and alert staff. QR or direct app presence is the pilot path; Not attending from home is separate and never counts as attendance. NFC purchases are parked.
- Memberships/payment dates are manually managed; no payment gateway. Default expiry notice goes to player/guardian and current management at the end of the inclusive expiry day in Europe/Dublin. Optional advanced 10/3-day reminders are disabled by default. Optional acknowledgements require the admin's selection.
- Trial: one calendar month by default, management configurable; trial-end reminder to adult/guardian then membership team.
- Internal matches support doubles/guests; opponent review, five-day inaction auto-approval, coach dispute resolution, incomplete matches excluded from statistics, no initial internal rating. External tournament results/reflections have distinct provenance/review rules; read their specs.
- Private coach notes, published development summaries and participant reflections have different access scopes. Never infer public access from a club website role.
- Leeside timetable is owner-confirmed; preserve it unless changed explicitly. The separate timetable draft has conflicts. Wix content consent is confirmed; inaccessible news/media/policies are still import gaps, not invented content.

## Next implementation order

1. Verify the shared booking preview and its delivered commit/deployment; keep production limitations visible.
2. Complete source-backed Wix content/pages/media and real navigation; use honest source links for missing archive/calendar/policy material. Track every deferred source item.
3. Use the implemented operational forms/command service and read the current task ledger for remaining advanced cases. Do not rebuild the old standalone preview or assume all feature screens are still missing. Auth, membership/manual payments/trials, grants, table/hall operations, attendance/reports, scoring/tournaments/reflections, coaching and notification source now exist.
4. Maintain adversarial tests for the active store and SQL commit guards. The old normalized bookings foundation is not the new inventory. Verify capacity, uniqueness, resource conflicts, guardian scope/revocation, stale writes, retries, review/privacy and email suppression when modifying rules.
5. After owner connection handover, follow the supplied launch scripts to apply migrations/deploy functions, bootstrap the real owner and configure exact Auth callbacks, sender/provider and schedule. Verify website/app cross-device synchronization and authorization; do not mark it passed from local mocks.
6. Complete backups/restore, privacy/safeguarding configuration, retention jobs, monitoring, domain cutover/rollback and live acceptance before importing real members. Broader pilot recruitment is parked; native store releases follow the PWA pilot.

These are ordered implementation streams, not claims that setup is the sole remaining task. The full task checklist remains authoritative.

## Checks and deployment

Use Node 22 (`.nvmrc`) and repository lockfile. Run `npm ci` if dependencies are missing, `npm run check` for type checks/tests/both builds, and `openspec validate launch-cork-club-platform` when the OpenSpec CLI is available. Add meaningful tests for new domain/security rules. Record unavailable checks honestly.

Backend checks use the explicit standalone function config (automatic npm resolution), so a clean CI checkout does not depend on a populated root node_modules directory. Run `npm run prepare:functions`, then `deno check --config supabase/functions/deno.json supabase/functions/club-api/index.ts supabase/functions/club-jobs/index.ts supabase/functions/club-public/index.ts` and `deno test --config supabase/functions/deno.json --allow-env --allow-net supabase/functions/runtime.integration.test.ts` (or `npx --yes deno ...`). The HTTP test uses local fake Auth/PostgREST, not hosted accounts. Isolated SQL checks are `supabase/tests/venue_qr.sql` and `runtime.sql` after the CI fixture/migrations. Frontend smoke test: start the website, install Playwright Chromium if missing (`npx playwright install chromium`), then `npm run test:browser`; it refuses live mode.

Personal-laptop helpers: `setup:personal` reviews connection/dry-run only; `setup:migrations` generates an ignored SQL-Editor bundle; `setup:env` preserves existing private files; `setup:bootstrap` emits non-destructive owner setup; `setup:schedule` emits private Vault/cron SQL. Scripts generate files locally and must not be executed against hosted accounts during the pause. Generated environment/bootstrap/schedule files, backups and screenshots are ignored.

Local servers: `npm run dev --workspace @tti/club-web -- --host 127.0.0.1 --port 4173` and `npm run dev --workspace @tti/platform -- --host 127.0.0.1 --port 4174`. Root script argument forwarding is not equivalent to these workspace commands.

Cloudflare website: `npm run build:club`, then `npm run deploy:club`, config `wrangler.club-web.jsonc`, Worker `table-tennis-ireland`, URL `https://table-tennis-ireland.ttclubsie.workers.dev`. Main is connected to Cloudflare Builds. Git push is not deployment verification: check the served assets/build result after each change. Never deploy the platform over the website Worker. See `docs/CLOUDFLARE_DEPLOYMENT_PLAN.md` for historical evidence.

When reporting completion, give commit/push status, checks run, actual deployment evidence, remaining blockers and links to the status/setup files. Do not repeat credentials or claim every target feature is complete while tasks remain open.
