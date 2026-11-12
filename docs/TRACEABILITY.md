# OpenSpec traceability

The source of truth is `openspec/changes/launch-cork-club-platform`. This map prevents the demonstration UI or implementation details from silently redefining approved behavior.

The active architecture is the private `club_runtime` aggregate and command service, described in [runtime design](../openspec/changes/launch-cork-club-platform/runtime-design.md). Earlier normalized tables/QR RPCs remain legacy foundations and are not dual-written by the portal. Every row below means supplied source and local verification, not hosted acceptance.

| OpenSpec capability | Primary current source | Supplied workflows / remaining gate |
| --- | --- | --- |
| `identity-and-access` | `packages/ui/src/ClubAuth.tsx`, `club-client.ts`, `packages/domain/src/operations.ts`, `routes.ts`, `club-api` | Verified auth, current grants/guardians, profile claim, My Clubs; provider/live acceptance pending |
| `club-content` | `ClubPublished.tsx`, `ClubPortal.tsx`, `club-public` | Plain-text CMS, JSON/RSS/ICS; Wix archive/media import partial |
| `membership-management` | `operations.ts`, `ClubPortal.tsx` | Editable catalogue/manual periods/payments/trials; hosted mail/permission acceptance pending |
| `booking-management` | `session-booking.ts`, `operations.ts`, `ClubPortal.tsx`, `202611080001_club_runtime.sql` | Full-session four-place inventory, approval/reschedule, hall/table settings, SQL CAS/uniqueness; hosted concurrency acceptance pending |
| `member-communications` | `operations.ts`, `club-jobs`, `_shared/runtime.ts` | Recipient checks, leases/retry/idempotency, global budget; sender/cron/SMTP/live delivery pending |
| `attendance-tracking` | `operations.ts`, `ClubPortal.tsx`, `club-api` | Direct/rotating QR/guardian attendance, absences, corrections/reports; venue acceptance pending, NFC parked |
| `match-records` | `operations.ts`, `ClubPortal.tsx` | Validated scores, singles/doubles/guests, review/dispute/autoapproval, incomplete exclusion |
| `tournament-management` | `operations.ts`, `ClubPortal.tsx` | Leagues/knockouts/byes/delegation/fixtures/external events; advanced structural edits remain |
| `player-development` | `operations.ts`, `ClubPortal.tsx` | Private coach notes, summaries/goals with two-party sign-off; policy/retention acceptance pending |
| `tournament-reflections` | `operations.ts`, `ClubPortal.tsx` | Private player/guardian tags/notes/revisions, filtered coach counts/contributing observations |
| `club-administration` | `operations.ts`, `ClubPortal.tsx`, `club-api` | Scoped grants, policy editor, shared work, audit, privacy requests/export/retention subset |
| `deployment-and-handover` | `scripts/`, `wrangler.platform.jsonc`, `docs/PERSONAL_LAPTOP_LAUNCH.md`, `AGENTS.md` | Login/environment, migration/HTTP fallback, bootstrap/functions/schedule helpers; owner executes account-required steps |

Current resumption files: `docs/START_HERE.md`, `docs/DEPLOYMENT_STATUS.md`, `scripts/setup-doctor.mjs`; production guard/rebuild commands prevent publishing synthetic assets through the documented deployment scripts. Frontend-only preparation preserves existing server secrets.

Additional handover verification: `scripts/setup.test.mjs`, `packages/ui/tests/club-client.test.ts`, `scripts/verify-local.mjs` and `supabase/functions/database.integration.test.ts`. See [TESTING.md](TESTING.md) for the one-command local path, CI SQL coverage and explicit mock/live boundaries.

Shared domain tests: `operations.test.ts`, `session-booking.test.ts`, `routes.test.ts`; HTTP tests: `supabase/functions/*.integration.test.ts`; database guards: `supabase/tests/runtime.sql`; synthetic browser walkthrough: `scripts/browser-smoke.mjs`. Prepare generated function-local rules before Deno tests. Exact latest counts/results are in implementation-status.md.

Public source-to-destination status is maintained in [the content manifest](PUBLIC_CONTENT_MANIFEST.md). Root [AGENTS.md](../AGENTS.md) is the entry point for a new coding agent.

## Change discipline

All capability files reviewed for delivery reconciliation on 7 November 2026. See [implementation status](../openspec/changes/launch-cork-club-platform/implementation-status.md) for remaining work and the owner's personal-laptop Supabase handover. Hosted migrations are not applied. The club-supplied `Leeside Table Booking.html` is a visual source, not a Claude runtime dependency.

1. Change requirements and scenarios in OpenSpec before changing behavior.
2. Update `tasks.md` and this table when the implementation surface changes.
3. Link tests to the relevant capability in test names or comments.
4. Never mark an OpenSpec task complete based only on a visual mock-up.
5. Run `openspec validate launch-cork-club-platform` and `npm run check` before merging.
