Updated 12 November 2026. Checked tasks mean source implementation/local verification, not hosted acceptance. The active architecture is runtime-design.md. Hosted setup and live testing remain excluded; follow docs/PERSONAL_LAPTOP_LAUNCH.md from the personal laptop. PARTIAL/DEFERRED items are stated explicitly.

## 1. Workspace foundation

- [x] 1.1 Create an npm-workspaces monorepo for the club website, national platform PWA, and shared packages
- [ ] 1.2 PARTIAL: shared TypeScript/tests/environment guards and formatted operational source exist; repository-wide automated lint/format enforcement remains
- [x] 1.3 Add continuous-integration checks for type checking, tests, and production builds
- [x] 1.4 Document traceability from code areas to OpenSpec capabilities

## 2. Shared domain and user experience

- [x] 2.1 Implement club, identity, role, membership, attendance, match, tournament, and development domain types
- [x] 2.2 Implement club-context selection and cross-club isolation helpers
- [x] 2.3 Create accessible shared UI primitives and responsive layouts
- [x] 2.4 Add neutral platform and club-specific branding configuration
- [x] 2.5 Add unit tests for membership state, role permissions, and club-context isolation

## 3. Database, authentication, and authorization

- [x] 3.1 Create versioned Supabase migrations for platform identities, clubs, verified domains, profiles, roles, and guardian relationships
- [x] 3.2 Create migrations for website portfolios, memberships, payments, sessions, bookings, attendance, and credentials
- [x] 3.3 Create migrations for matches, result reviews, tournaments, coaching records, notifications, work items, and audit events
- [x] 3.4 Implement active-store RLS/direct-access denial, server-controlled permissions and SQL revision/player-place guards; normalized legacy tables remain unused by the new portal
- [x] 3.5 Implement shared Supabase clients and authenticated session handling for both frontends
- [x] 3.6 Add synthetic Leeside runtime seed and authorization tests for unrelated users/club-scoped access
- [x] 3.7 Add automated database tests proving cross-club access is denied

## 4. Independent website integration (supersedes generic portfolio hosting)

- [x] 4.1 Build approved HTTPS club website URL configuration, authorization, audit and invalid-destination handling
- [x] 4.2 Build stable app club/join/event/admin routes with validated identifiers and safe post-login return navigation
- [x] 4.3 Support website-to-app administration links; keep app authorization independent of website roles
- [ ] 4.4 DEFERRED: review Leeside website extraction only after at least one year of live pilot operation AND more than two participating clubs (three or more); retain the current folders/build targets until a separate implementation decision
- [ ] 4.5 PARTIAL: public JSON, RSS and iCalendar plus event links are implemented; Atom and dedicated public event-detail routes remain refinements
- [x] 4.6 Generate public-safe sharing links/text; keep automated Meta posting behind separate approval
- [ ] 4.7 Complete a source-to-destination Wix manifest for Home/About/coaches/contact, Policies/documents, News pagination, Calendar/events, media/social links; record inaccessible/deferred items explicitly
- [ ] 4.8 Replace the pilot website placeholders with source-backed public pages/routes and owner-approved contact/membership information; implement a real enquiry path or an honest mail link
- [ ] 4.9 Verify public content parity, historical/upcoming event dates, policy access, responsive navigation and accessibility before describing Wix migration as complete
- [ ] 4.10 Add actual website entry links to player/guardian/staff app routes after the separate synthetic app deployment; replace roadmap-only navigation with implemented screens incrementally
- [x] 4.11 Replace inactive registration and fictional news with honest email enquiry/source archive links; add saved source-attributed fees, coaching summary, contact and policy/calendar links without claiming full import

## 5. Platform PWA and multi-club access

- [x] 5.1 Build provider-independent email sign-up, sign-in, verification, password recovery, and account session flows
- [x] 5.2 Add Google OAuth with exact redirect allowlists, safe fallback, and provider secrets held outside frontend bundles
- [ ] 5.3 PARTIAL: verified Auth email/optional phone, mobile contact and optional-event preferences exist; multiple alternate contacts/primary-contact editor remain
- [x] 5.4 Build audited identity linking and secure claim/recovery flows that attach authentication to an existing player profile without losing history
- [x] 5.5 Implement optional phone OTP/linking behind disabled-by-default flag; provider rate/abuse settings and live acceptance are owner setup gates
- [x] 5.6 Build My Clubs with per-club relationship and membership status
- [x] 5.7 Build explicit club switching and verified club-website links
- [x] 5.8 Build guardian-linked junior selection and adult-routed actions
- [x] 5.9 Add installable PWA metadata, offline shell behavior, and clear offline status

## 6. Membership and communications

- [x] 6.1 Build public QR/join-code adult and guardian-led junior applications
- [x] 6.2 Implement pending applicants, self/guardian trials and admin acceptance; physical trial/member credentials remain parked with 7.2
- [x] 6.3 Build configurable membership types and historical membership periods
- [x] 6.4 Build audited manual payment recording and correction without storing bank credentials
- [x] 6.5 Build 10-day and 3-day renewal reminder scheduling with duplicate prevention
- [x] 6.6 Build non-formal payment acknowledgements and notification delivery history
- [x] 6.7 Make acknowledgement delivery an explicit admin choice and preserve the selection in the audit history
- [x] 6.8 Build consent-aware event subscriptions, invitations, and unsubscribe/preference controls
- [x] 6.9 Build verified self/guardian trial registration with configurable calendar-month duration, individual extensions and historical end-date preservation
- [x] 6.10 Build trial-end player/guardian reminders and membership-team follow-up with current-recipient checks, extension/conversion suppression and idempotency

## 7. Sessions, bookings, and attendance

- [ ] 7.1 PARTIAL: weekly-spaced materialized occurrences, programmes, capacity and cancellation are implemented; persistent recurrence-definition reconfiguration remains
- [ ] 7.2 DEFERRED QR/app-first pilot: physical NFC/printed/digital member credential lifecycle and card output
- [ ] 7.3 DEFERRED QR/app-first pilot: restricted Android NFC/card kiosk
- [x] 7.4 Build membership-aware check-in that records expired and no-membership attendance and creates deduplicated alerts
- [ ] 7.5 DEFERRED kiosk/offline hardware path: bounded offline scan queue; live portal never claims offline writes are confirmed
- [x] 7.6 Build authorized manual check-in, correction, and audit history
- [x] 7.7 Build daily, weekly, monthly, session-utilization, membership-segment, and top-attendee reporting
- [x] 7.8 Build configurable daily staff digests without exposing member details in email
- [x] 7.9 Build one-off and bounded multi-day programmes, including conflict warnings against recurring occurrences
- [x] 7.10 Add venue QR preview, staff rotating display, existing-user sign-in, guardian selection, and atomic Supabase challenge/confirmation RPCs
- [ ] 7.11 Complete live venue-device acceptance, Auth provisioning, and notification delivery for the venue QR flow before production launch
- [x] 7.12 Add session-time direct app presence with self-declared provenance and explicit self/linked-child selection; retain QR confirmation as an alternative
- [x] 7.13 Add separate Not attending availability from home; exclude it from attendance totals and prevent silent overwrites of existing presence
- [x] 7.14 Add production table resources and whole-session player-place inventory: four places per table, one active place per player/session, guardian-linked child allowances, runtime allocation and request/hold/cancellation policies
- [x] 7.15 Build shared website/app table booking entry for players, verified guests and designated guardians without automatic membership activation
- [x] 7.16 Implement atomic provisional holds, maintainer approve/reject, bounded expiry, cancellation and rescheduling with database overlap constraints and audit
- [x] 7.17 Integrate regular session/camp/tournament resource blocks and separate practice attendance from reservations
- [x] 7.18 Build current-permission management queue/email alerts and requester/guardian decision notifications through the idempotent outbox
- [ ] 7.19 PARTIAL: local uniqueness/CAS, stale/retry, guardian/permission, expiry, resource and rollback tests exist; extended concurrency/load matrix and hosted cross-channel acceptance remain
- [x] 7.20 Add cross-channel availability subscriptions or bounded polling, stale/reconnect states and idempotent reconciliation of interrupted requests
- [x] 7.21 Build hall opening hours/closures/table allocation and test whole-hall maintenance blocking without enabling exclusive public hall rental
- [x] 7.22 Adapt supplied club HTML into a shared, labelled synthetic website/app booking preview with requests, maintainer approval/decline, per-table allocations, moves/releases, browser-local persistence and no claimed real email/authentication
- [x] 7.23 Test prototype rules for four-place capacity, per-player uniqueness, guardian scope, expiry, permissions, cancellation, atomic moves and Europe/Dublin dates; production concurrency and cross-channel tests in 7.19 remain pending

## 8. Matches and tournaments

- [x] 8.1 Build singles/doubles session match creation with registered and guest participants
- [x] 8.2 Build game-by-game scoring with best-of and win-by-two validation
- [x] 8.3 Build result submission, opposing-side review, modification, five-day auto-approval, and reminders
- [x] 8.4 Build coach correction and dispute resolution with immutable audit events
- [x] 8.5 Build player match history excluding incomplete results from statistics
- [x] 8.6 Implement league pairings, configurable points/tie-break order and confirmed-result standings; structural reconfiguration after start remains an advanced case
- [x] 8.7 Implement knockout byes/progression and dispute blocking; changed qualifiers invalidate dependent results and require fresh scores with prior state in audit
- [x] 8.8 Build tournament-scoped player organizer delegation and participant check-in
- [x] 8.9 Build a mobile-first ad hoc tournament flow seeded from the current day's checked-in roster
- [x] 8.10 Implement stable internal/external events, news/result links and private unlisted proposals/linking; archive-state UI remains a refinement
- [x] 8.11 Build external event result entry with aggregate/optional game scores, singles/doubles and guardian attribution without local attendance requirements
- [x] 8.12 Implement server-side same-recording-club review eligibility, mixed doubles and unclaimed-opponent follow-up; retain immediate external player-reported provenance
- [x] 8.13 Test duplicate/idempotent entry, fixture reuse, score consistency, incomplete exclusions and reviewed/reported statistics separation

## 9. Player development and administration

- [x] 9.1 Build private coach working notes with restricted access and retention controls
- [x] 9.2 Build deliberately published strengths, improvement areas, and future-goal summaries
- [x] 9.3 Implement published summary visibility plus narrowly scoped own/guardian pending-summary sign-off; never expose private coach working notes
- [x] 9.4 Build unified club administration with least-privilege role management
- [x] 9.5 Build claimable, assignable, commentable, and resolvable shared admin work items
- [x] 9.6 Build personal-data export and correction support with audit history
- [ ] 9.7 PARTIAL: runtime registered-user grants/revocation and scoped management are implemented; outbound invitations for unregistered managers remain (manual signup/link works for pilot)
- [x] 9.8 Build participant-owned strengths/improvement tags, bounded notes, guardian editing and attributed revision/removal history
- [x] 9.9 Build coach-managed tag taxonomy with stable historical identifiers and retirement
- [x] 9.10 Implement club/event/date/player and selected training-group/tournament-team summaries, denominators and matching contributing observations; saved named group catalogues remain optional refinement
- [x] 9.11 Test private reflection access, opponent-review privacy, cross-club denial and human-authored goals separated from descriptive aggregates
- [x] 9.12 Enforce runtime permission grants/revocation on every privileged request; support owner bootstrap and empty editable membership catalogue without redeployment
- [x] 9.13 Build permission-scoped management editing/publication of safeguarding/privacy contacts, policies and approved data-handling settings with revision history and unconfigured states
- [ ] 9.14 Owner live acceptance: verify both deployed entry points against the same backend, including permission revocation, retries and notification/audit deduplication

## 10. Operations and release

- [x] 10.1 OWNER HANDOVER: completed on 10 November 2026 from the owner's personal laptop. The office-laptop block (7 November 2026) was avoided by completing the work on a personal laptop; no network restriction was changed. Migrations, secrets, functions, owner bootstrap and frontend deploys are done; see implementation-status.md for scope and the remaining gates.
- [ ] 10.2 Configure the national app and retained Leeside pilot website deployments using current targets; future independent website integration does not require a generic club-website service
- [ ] 10.3 Configure authenticated transactional email and scheduled Edge Functions
- [ ] 10.4 Configure encrypted off-site database and storage backups and test restoration
- [ ] 10.5 Complete accessibility, privacy, safeguarding, security, and retention reviews
- [ ] 10.6 Run the Leeside acceptance pilot for accounts, scanning, membership, reports, matches, and tournaments
- [ ] 10.7 Document Wix cutover, monitoring, free-tier thresholds, rollback, and support ownership
- [ ] 10.8 Prepare Expo native clients and store submissions only after the PWA pilot justifies them
- [ ] 10.9 PARTIAL: approved operational/financial/private-note retention and encrypted-export source exist; remaining data-class decisions, storage/backup expiry and restore acceptance remain
- [x] 10.10 Implement inclusive end-of-day Europe/Dublin expiry emails to player/guardian plus current management summary, with renewal-race suppression, recipient revocation checks and idempotency
- [x] 10.11 Inspect Cloudflare account/Worker/build logs through authorized read-only APIs and record observed failure separately from proposed remediation
- [x] 10.12 Correct Cloudflare workspace typo (@ttti/club-web to @tti/club-web), align existing table-tennis-ireland Worker via wrangler.club-web.jsonc, pin Wrangler/Node 22 and configure website production/preview commands; platform Worker config is now supplied; owner deployment remains separate
- [ ] 10.13 PARTIAL: implementation commit 2577059 website assets/SPA/mobile synthetic flows verified; preview isolation and rollback acceptance remain
- [x] 10.14 Owner deployment (app Worker `ttclubs-app` deployed 10 November 2026; Git build variables and Auth URL configuration still open): separate app Worker source/config is ready; deploy it from the personal laptop without overwriting the website Worker; review remaining build-tool advisories
- [x] 10.15 Verify successful Cloudflare website build af21ba36-d5ea-4df0-9eba-7d87a70e2fe2 from fix commit 8484e83, root/JS/CSS HTTP 200, exact local/remote asset hashes and SPA fallback; preview/mobile/rollback acceptance in 10.13 remains pending
- [x] 10.16 Add root AGENTS.md handover linking approved requirements, all-capability status, complete pending checklist, personal-laptop setup sequence and validation/deployment commands
- [x] 10.17 Verify booking preview code delivery ef10b50: main push, served JS/CSS hashes matching local build, SPA response, live mobile synthetic request/approval; preview-version isolation and rollback in 10.13 remain pending

## Parked owner activity (not a development prerequisite)

- Broader pilot participant recruitment and club testing dates are deferred at the owner's request; initial owner-only testing is supported. This does not mark production readiness, security, privacy or automated verification complete.
- NFC/card hardware purchases are deferred while QR/app attendance is the pilot path.

## 11. Personal-laptop delivery and verification

- [x] 11.1 Implement the shared operational portal and live command adapter; retain explicit synthetic mode while setup is paused
- [x] 11.2 Add private canonical runtime store, derived My Clubs directory, SQL CAS/booking guards and global email budget
- [x] 11.3 Add authenticated club API, public-safe content feeds and protected scheduler/email worker source
- [x] 11.4 Supply CLI login/link guide, frontend environment guard, environment preparation, HTTP function packaging/deploy, owner bootstrap and SQL-Editor migration fallback
- [x] 11.5 Supply private Vault/cron generation, separate platform Worker config, encrypted database export helper and user-executable smoke checks
- [x] 11.6 Verify synthetic browser workflows, domain/security rules, local HTTP handlers and isolated PostgreSQL migrations/constraints; record exact results separately from live acceptance
- [ ] 11.7 PARTIAL: hosted migrations, secrets, functions, owner bootstrap and Worker deployments done 10 November 2026; Auth URL configuration, owner smoke test and Git build variables remain. Original scope: owner performs the personal-laptop runbook, real account/provider configuration and live smoke tests; no office firewall bypass or hosted changes in this implementation pass

## 12. Handover regression and integration verification — 9 November 2026

- [x] 12.1 Add shared live-adapter unit tests for activation, missing settings, revision polling, account/club isolation, failed operations, stable retry IDs and export denial
- [x] 12.2 Add isolated environment/bootstrap/packaging/migration/schedule helper regression tests, including rerun preservation and safe key handling
- [x] 12.3 Fix missing loopback local origins and reject malformed bootstrap owner UUIDs
- [x] 12.4 Add one-command verification with automatic temporary frontend builds, browser setup, ephemeral servers and cleanup; preserve private configuration/deployable assets
- [x] 12.5 Add API-to-PostgreSQL integration for competing place requests, retry, approval visibility, revocation and isolation with explicit fake Auth/PostgREST boundaries
- [x] 12.6 Extend CI to test generated migration/bootstrap reruns and both built browser entry points; document exact coverage/prerequisites in TESTING.md
- [x] 12.7 Confirm all four jobs passed in Quality run 42616047886 for fb07828; hosted provider setup, actual devices and live acceptance remain separate owner release gates

## 14. Live launch checklist (recorded 10 November 2026)

Live backend, owner login, club record, both Workers and live builds are done (see implementation-status.md). The items below are what remains. Owner actions are dashboard or provider steps the owner performs with their own accounts; keep passwords, recovery codes and tokens out of the repository and chat.

### 14A. Required before inviting anyone to the live app

- [x] 14.1 Owner: Supabase Auth Site URL set to `https://ttclubs-app.ttclubsie.workers.dev` and redirect URLs added for the app and website origins. Redirect URLs were checked from the owner's paste on 10 November 2026; the owner reports the Site URL changed from `http://localhost:3000`. Not independently verified by the assistant; confirm with a password-recovery test (13.3).
- [ ] 14.2 Owner: run the owner smoke test in guide section 7 using synthetic test accounts only (sign-in, memberships, session requests and capacity, attendance, match reflection privacy, summary sign-off, function logs). Progress 11 November 2026: owner signed in and found every section empty, as expected for a new club. No smoke-test data entered yet. Order: Management, People & memberships, Sessions & hall, then the flows that depend on them.
- [x] 14.3 Owner: password sign-in and password recovery confirmed for `leesidettie@gmail.com` on 11 November 2026 (owner report). The reset email link opened `https://ttclubs-app.ttclubsie.workers.dev/#` and the password was changed; sign-in with the new password succeeded. Not independently verified by the assistant.
- [ ] 14.4 Owner: add the four public `VITE_*` build variables (`VITE_ENABLE_LIVE`, `VITE_ENABLE_PHONE_LOGIN`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) to the Cloudflare build settings for both Workers, so Git-triggered builds stay live.
- [ ] 14.5 Owner: delete the local `.secrets/cloudflare.token` file and revoke the API token that was shared in chat; the Wrangler browser login is the active credential.

### 14B. Email and scheduled work (guide section 8)

- [ ] 14.6 Owner: create the Resend account, verify the sending domain, and add `RESEND_API_KEY` and `EMAIL_FROM` to `.env.server.local`. Until then, notifications stay queued and are never marked sent.
- [ ] 14.7 Owner: re-upload server secrets after 13.6 (`npx supabase secrets set --env-file .env.server.local`).
- [ ] 14.8 Owner: configure Supabase Auth custom SMTP for sign-up verification, recovery and magic links.
- [ ] 14.9 Owner: generate the private scheduler SQL (`npm run setup:schedule`), review it, and run it once in the SQL Editor; confirm cron run history.
- [ ] 14.10 Owner: test owner-only email delivery, bounce/failure handling and unsubscribe before inviting members.

### 14C. Before real member or junior data (tasks 10.4–10.9)

- [ ] 14.11 Owner: enable MFA and save recovery codes on Supabase, GitHub, Cloudflare and the two Gmail accounts; invite any trusted owners individually (tasks 9.14, 10.5).
- [ ] 14.12 Owner: approve privacy, safeguarding, retention and data-request ownership (tasks 10.5, 10.9).
- [ ] 14.13 Owner: set up encrypted off-site database and storage backups, backup expiry, and a restore rehearsal away from production (task 10.4).
- [ ] 14.14 Owner: test on real iPhone/Safari and Android/Chrome PWA installs, and on venue connectivity (tasks 7.11, 10.6).
- [ ] 14.15 Owner: enter real membership types, session times and tables, privacy/safeguarding contacts and policy text inside the app (task 10.6).
- [ ] 14.16 Owner: decide whether to buy a domain for Leeside; the workers.dev addresses work without one (task 10.7).

### 14D. Code refinements (not blocking the owner-only launch)

- [ ] 14.17 Lint and format enforcement across the repository (task 1.2).
- [ ] 14.18 Public event-detail routes and Atom feed (task 4.5).
- [ ] 14.19 Wix content parity, enquiry path and website links to the app (tasks 4.7–4.10).
- [ ] 14.20 Multiple alternate contacts and primary-contact editor (task 5.3).
- [ ] 14.21 Persistent recurrence-definition editing (task 7.1).
- [ ] 14.22 Extended concurrency and load tests, and hosted cross-channel acceptance (tasks 7.19, 9.14).
- [ ] 14.23 Invitations for unregistered managers (task 9.7).
- [ ] 14.24 Preview isolation and rollback acceptance (tasks 10.13, 10.2).
- [ ] 14.25 Monitoring, free-tier thresholds, rollback and support ownership documentation (task 10.7).
- [x] 14.26 Player name parts: first name, second name (required together) and optional nickname stored separately, with the full name derived, on every form that records a person (join, subscribe, guest, child, own profile, player editor). Verified locally on 16 November 2026 (94 domain tests, UI type check, full check). Not yet deployed: the backend and the member app must be redeployed before the form appears live.

### 14E. Deferred, not part of this launch

- Website extraction review after at least one live year and three or more clubs (task 4.4).
- NFC cards, kiosks and offline scan queues (tasks 7.2, 7.3, 7.5).
- Expo native clients and store submissions (task 10.8).

## 13. Existing deployment and old/new laptop resumption — 12 November 2026

- [x] 13.1 Record anonymous live frontend/public reader observations separately from private-service and owner acceptance
- [x] 13.2 Create START_HERE and non-secret DEPLOYMENT_STATUS files linking the complete first-time guide and current source ledger
- [x] 13.3 Add an offline setup doctor with credential-safe output and strict local maintenance configuration checks
- [x] 13.4 Add frontend-only preparation that preserves existing server secrets and coordinated-token guidance
- [x] 13.5 Require live configuration/existing project for production build scripts and rebuild before publishing; preserve synthetic local testing
- [x] 13.6 Add regression tests for production entry points, wrong-project refusal, frontend-only preservation and offline doctor; reconcile README/AGENTS/guide pointers
- [x] 13.7 Verify full local command, all four Quality jobs for 483701c and anonymous live-site preservation after push; Cloudflare automatic-build failure is tracked separately below
- [ ] 13.8 Owner confirms remaining deployment checklist outcomes: private account/permission/write flows, exact callbacks, current functions/jobs, actual mail/cron and backup/restore; no new project or automatic bootstrap merely for laptop migration

- [x] 13.9 Automatic website build recovered: Cloudflare build 2ab7ed07-ae69-4639-a9bd-b6bb6aeb69a8 for 3f6496d succeeded on 16 November and the new public UI asset was observed without weakening the live guard; the earlier failure cause remains unknown, and app/backend acceptance is tracked separately

## 15. Player creation and membership integrity correction — 16 November 2026

- [x] 15.1 Reproduce the adult creation blocker and distinguish account, player, type and period workflows; condition guardian selection on junior status
- [x] 15.2 Separate independent add/edit form state, explicit cancel/add-new actions and successful-save resets without discarding failed input
- [x] 15.3 Append a new renewal period, preserve existing financial/type snapshots, permit retired-type/trial correction and reject unknown edit identifiers or active-period overlap
- [x] 15.4 Permit zero receipts without an invented payment date; require a date for positive amounts and retain opt-in acknowledgement
- [x] 15.5 Harden adult/guardian scope, classification edits, repeat trials, reactivation/retention and duplicate identifiers; require current Auth proof for offline-profile claims
- [x] 15.6 Supply domain, HTTP and shared frontend browser regressions plus the owner membership workflow/update guide
- [x] 15.7 Complete and record local type/unit/setup/build/HTTP and both browser workflows, OpenSpec validation and all four GitHub Quality jobs for 3f6496d
- [ ] 15.8 Owner updates backend and app releases and performs authenticated creation/renewal/link/revocation and cross-device acceptance; website automatic build and new UI publication verified, no new migration/bootstrap for this correction
- [ ] 15.9 Confirm the owner's exact failing screen/error if different from the reproduced adult-creation issue; do not treat source review as proof of the original live failure
- [ ] 15.10 Clarify and implement genuine per-visit/pay-as-you-go entitlement if required; the current duration-based catalogue is not proof of per-visit charging support

## 17. Visual design pass (decided 16 November 2026)

Source: specs/visual-design/spec.md and design.md "Visual design system". Nothing below is done yet.

- [x] 17.1 Add Tailwind CSS with the Vite plugin to the shared UI and both apps. Pinned to exact 4.3.5 for `tailwindcss` and `@tailwindcss/vite` (owner-approved exception to the two-week rule, recorded in design.md). Preflight is not imported, so existing screens keep their base styles. Verified 17 November 2026: 103 domain, 8 UI, setup checks, builds and both browser workflows pass.
- [~] 17.2 PARTIAL: the existing `ops` palette is now Tailwind theme colours (`ops-ink`, `ops-soft`, `ops-muted`, `ops-line`, `ops-accent`, `ops-primary`) in packages/ui/src/tailwind.css; the light/dark token set is not yet defined. Define the design tokens (colours, type scale, spacing, radius, focus ring, elevation) once in packages/ui, with light and dark sets following the system preference.
- [ ] 17.3 Migrate packages/ui/src/operations.css, booking.css and both application styles.css into the token system; remove per-screen palettes; keep the attendance screen unchanged until migrated.
- [ ] 17.4 Build the shared layout pieces: application shell, page header, section card, form grid, data table with a scroll container, stacked record card, and a phone menu.
- [~] 17.5 PARTIAL (17 November 2026): shared form uses a two-column grid from the large breakpoint, consistent input styling, migrated person and membership rows, and legacy styles sit in a lower cascade layer. A sticky member list was tried and removed: it covered the editors' save buttons while scrolling, which the browser workflow caught. The two-column layout stays. Phone layout measured at 390 pixels with no sideways overflow. Remaining: owner review of screenshots (17.9) and any sub-pages the owner wants split out.
- [ ] 17.6 Rebuild the remaining member app screens: booking, sessions and hall, attendance, matches, tournaments, coaching, messages, management.
- [ ] 17.7 Rebuild the public website pages using the same tokens and the same join, child and subscription forms.
- [ ] 17.8 Add browser checks at 360px and desktop widths, and automated accessibility checks, to the existing browser workflows.
- [ ] 17.9 Produce screenshots of the people and membership screens for owner review before deploying the visual release.
- [ ] 17.10 Deploy the backend, member app and website after the owner approves the screenshots; record the versions in DEPLOYMENT_STATUS.md.

## 16. Modern website presentation and management workspace usability — 17 November 2026

Presentation-only work: no change to the command service, permissions, booking rules or stored data, and no new SQL migration. Source-backed content gaps remain tracked in 4.7–4.10 and 14.19.

- [x] 16.1 Redesign the public website (`apps/club-web`) with current patterns: bento-style sections, large type, light/dark schemes, restrained scroll reveal that respects reduced motion, skip link, and a keyboard-operable mobile navigation menu (the old navigation was hidden below 760px)
- [x] 16.2 Add a next-session indicator computed from the owner-confirmed timetable in Europe/Dublin, with a plain-timetable fallback and the public-holiday caveat
- [x] 16.3 Add accurate search/social metadata and JSON-LD using only confirmed facts; no invented testimonials, ratings, counts, news or photographs
- [x] 16.4 Clarify sign-in/join/enquiry entry points for synthetic, live and email-enquiry states; preserve existing `#club-portal`, `#join` and published-content anchors used by browser tests
- [x] 16.5 Management workspace: read-only permission-aware Overview landing tab, desktop sidebar / mobile scrolling navigation, design-token visual refresh, people search/filter and empty states; existing tab names and form labels are preserved
- [x] 16.6 Add unit tests for next-session and overview calculations and extend both browser workflows (overview, mobile menu, search, 320px no horizontal scroll); keep `npm run check` and browser checks green
- [ ] 16.7 DEFERRED: split `ClubPortal.tsx` (about 3,200 lines) into per-area components in a behaviour-neutral refactor with the existing browser/HTTP suites as the safety net
- [ ] 16.8 Owner: deploy through the normal commands, review the live website/app on real phones and desktop, and supply real photographs, logo and imported news so placeholders can be replaced (depends on 4.7)
- [ ] 16.9 Open accessibility follow-ups: add a visible pause control for the decorative ticker (WCAG 2.2.2) and run a formal contrast/screen-reader audit of the website and Overview tab before describing the redesign as accessibility-reviewed

## 18. Contact details and date of birth (17 November 2026)

- [x] 18.1 Mobile numbers stored in international format; forms use a country-code dropdown (default +353) and a national number field; invalid numbers refused. Implemented and tested locally (107 domain tests).
- [x] 18.2 Date of birth added to the person record; optional for adults; required when a guardian registers a junior; future dates refused. Implemented and tested locally.
- [x] 18.3 Child form retitled "Add a junior player (your child)" with a required date of birth.
- [ ] 18.4 Owner: decide whether to extend the country list beyond the ten listed and whether adult date of birth is required once the privacy review (14.12) is approved.
- [ ] 18.5 Restrict date of birth visibility to membership managers and the person themselves, and show age group only to other members (spec: membership-management). Not yet built; the current screens show the date to anyone who can open the person editor.
- [ ] 18.6 Deploy the backend first, then the member app and website, after the owner approves the visual release (17.9).

## 19. Full Tailwind migration (started 17 November 2026)

Method: management portal classes are replaced by Tailwind utilities in the JSX; element-level rules move into packages/ui/src/portal.css using Tailwind @apply, and the hand-written operations.css is removed.

- [x] 19.1 Batch 1, shell and layout: page shell, section cards, grids, tables (wrapped in scrollable containers), notices, statistics, setup panel, session picker. Verified at 320 pixels on every workspace tab with no sideways scrolling.
- [x] 19.2 Batch 2, controls and elements: buttons, inputs, selects, labels, headings, navigation, tables and details, moved to portal.css with @apply. operations.css removed.
- [x] 19.3 Batch 3: booking demo styles moved to Tailwind @apply (packages/ui/src/booking.css); shared base styles moved to packages/ui/src/base.css; styles.css removed; both apps load the shared Tailwind stylesheet. Verified on all portal tabs at 320 pixels, full check and browser verification passing.
- [x] 19.4 Batch 4: website and member app stylesheets moved into the Tailwind pipeline (@reference to the shared theme, @apply for standard values). Verified by comparing computed styles and positions of every element (282 on the website, 223 in the member app) at 1440, 820 and 390 pixels, before and after: zero differences. Residual plain declarations are kept where Tailwind does not express them cleanly: keyframe animations, radial gradients, color-mix, backdrop blur, and a few exact pixel values. Full check and browser verification passing.
- [ ] 19.5 Owner review of screenshots for all batches before any visual release (17.9).
- [ ] 19.6 Review set of screenshots for every portal tab at 1440 and 390 pixels, regenerated 17 November 2026 from a fresh build and saved outside the repository in ~/Downloads/tti-review-2026-11-17/ (desktop-*.png and phone-*.png, one per tab). Regenerate after batch 4 and replace the folder contents.
- [x] 19.7 Regression fix (18 November 2026): the portal's scope class was removed during the utility mapping, so portal button styles were not applied and the selected workspace tab looked unselected. Restored the scope, and the navigation now uses its own utilities with a visible selected state (dark background, white text). Checked in the browser at desktop and phone widths; full check and verification passing. Not yet pushed or deployed.

## 20. Media storage limits (deferred, recorded 19 November 2026)

- [ ] 20.1 Build image upload for posts and events only after the Share and post features are approved: store images in file storage, not in the database record.
- [ ] 20.2 Resize and compress images on upload (1600 pixels longest side, 500 KB per file); accept JPEG, PNG and WebP only.
- [ ] 20.3 Limit each post to four images; delete replaced and removed images from storage.
- [ ] 20.4 Show total file storage against the 1 GB Supabase free limit in Management; warn at 70 percent and refuse new uploads at 90 percent.
- [ ] 20.5 Review these limits before choosing a paid plan.
- [x] 18.7 Under-18 rule (19 November 2026): a person under 18 cannot be saved as an adult, and a junior over 18 cannot be registered; both refuse with a clear message. Implemented and tested locally (109 domain tests). Not live until the backend is redeployed.
- [x] 18.8 Irish mobile validation (19 November 2026): ten digits starting 083, 085, 086, 087 or 089 (or +353 with nine digits), spaces and hyphens allowed, letters refused; stored as +353 followed by nine digits. Other countries: digits only. Prefix list checked against published sources; carrier ownership not relied on, since number portability applies. Tested locally (111 domain tests). Not live until the backend is redeployed.

## 21. Landing rally and plain-text posts (19 November 2026)

- [x] 21.1 Landing page: the single ball is replaced by an SVG paddle and ball on the court, animated with CSS keyframes (ball path, bounce, paddle swing). Hidden from assistive technology; stops under reduced motion. Checked by screenshot at desktop width.
- [x] 21.2 Posts: titles limited to 120 characters; bodies to 10,000; angle brackets and javascript: links refused in titles and bodies. Tested locally (113 domain tests).
- [ ] 21.3 Owner: review the landing animation on a phone and under reduced motion (visual release, task 19.5).
- [ ] 21.4 Later: a second confirmation step before a post goes public, and https-only links once links are rendered.
- [x] 21.5 Landing rally refined (19 November 2026): the paddle is drawn as a table tennis bat (rounded blade with a red rubber face, wooden edge and tapered handle); the net is drawn as a white top tape, a mesh and a post at each end across the middle of the table. Decorative, CSS-animated, stopped under reduced motion. Checked by screenshot at desktop width.
- [x] 18.9 Manual test fixes (21 November 2026): a date of birth with an implausible year (before 1900) is refused with a clear message; a junior's date of birth is checked before guardian consent, so the age rule shows first. Adults without a date of birth stay allowed. Tested locally (120 domain tests). Junior registration also needs the club's privacy, safeguarding and policy text entered in Management first.


## 22. Domain layout: public site and app on subdomains (decided 21 November 2026)

- [ ] 22.1 Add a configured app address (one setting) used by all links to the app; default to the current app address until the domain exists.
- [ ] 22.2 Header: "Member sign-in" button linking to the app address, in the same tab.
- [ ] 22.3 Replace the embedded member workspace on the public page with a "Members & bookings" section that links to the app; move "Join the club" to link to the app's join screen.
- [ ] 22.4 When the domain is bought: point `leeside.ie` at the public site Worker and `app.leeside.ie` at the app Worker; add both to Supabase Auth redirect addresses and allowed origins; update share links and structured data.
- [ ] 22.5 Test: sign-in from the public site, password recovery email link, and the join link, on both the workers.dev and the final addresses.
- [x] 21.6 Rally fix (21 November 2026): one serve and return per shot, one bounce on the far half of the table, paddles drawn outside the table on each side. Horizontal and vertical motion are separate keyframes, with a parabolic arc. Checked by pausing the animation at four moments. Deployed in website version 2c4a1c76.
- [x] 21.7 Table booking test cases written for a member and for management (MB1–MB8, MG1–MG10) in test-plan.md (21 November 2026).

## 23. Table practice booking rules (board decisions, 22 November 2026)

Specification: `specs/table-practice-booking`. Design: "Table-wise practice reservations" in `design.md`. Test plan: "Table booking v2" in `test-plan.md`.

- [x] 23.1 Two places per table; partner added in the same booking; partner seats are not accounts (domain `session-booking.ts`, tests).
- [x] 23.2 Instant confirmation; advance booking opens fourteen days ahead and closes at the session start.
- [x] 23.3 Cancellation two hours before; staff cancel after that; cancelling a partnered booking cancels both places.
- [x] 23.4 Waiting list and offers: sixty-minute offer, accept or decline, pass-on on decline or expiry, offers only for freed places (domain tests).
- [x] 23.5 Check-in window (one hour before to session end) and staff release ten minutes after the start for unchecked places (domain tests).
- [x] 23.6 Walk-ins on the night, first come first served, for free reservable places.
- [x] 23.7 Public holidays and club-added closures (maintenance, private hire) refuse table booking (domain and operation tests).
- [x] 23.8 Holiday list corrected for substitute days (2026: Monday 28 December; 2027: Monday 27 and Tuesday 28 December).
- [x] 23.9 Assistant coach rota removed from scope (decision 4).
- [x] 23.10 Portal booking rows, request form (partner field), check-in, accept/decline and staff release; synthetic demo updated.
- [ ] 23.11 Commit guard migration: cover `offered`, `waiting` and `checkedInAt`, and handle the partner seats, in SQL. Requires a hosted migration (owner approval).
- [ ] 23.12 Offer and release emails: confirm the notification outbox delivers the offer email in production (email provider configured by the owner).
- [ ] 23.13 Board visual design: rebuild the booking screen as the board's floor plan (twelve tables, two places each, legend, my bookings, rules). Shared component for the website and app.
- [ ] 23.14 Staff check-in and no-show release screen for the session, listing unchecked places after the grace period.
- [ ] 23.15 Deploy `club-api` (and `club-public` for the calendar change) and verify with the test plan in `test-plan.md` (Table booking v2).

## 24. Timetable management (decisions 22 November 2026)

Specification: `specs/timetable-management`. Design: "Timetable management" in `design.md`. Test plan: "Timetable management v3" in `test-plan.md`.

- [x] 24.1 Domain: weekly definitions, date overrides and pure occurrence generation with Europe/Dublin times (`timetable.ts`), with unit tests for time changes, cancellations, extras, closures and holidays.
- [x] 24.2 Commands: `timetable_weekly`, `timetable_override`, `timetable_remove_override`, each permitted for `events` or `coach`, validated and audited.
- [x] 24.3 Reconciliation of dated sessions after timetable, closure and holiday commands and in the daily job; bookings notified and listed for review, never moved or cancelled.
- [x] 24.4 Closures no longer cancel bookings automatically (change `close_hall`); affected bookings are notified and listed for review.
- [x] 24.5 Seed the timetable from the owner-confirmed five weekly sessions for clubs that do not have one yet.
- [x] 24.6 Club projection: `club-public` JSON (`format=json`) for dated sessions and closures; tests that it excludes players and bookings.
- [x] 24.7 Website calendar reads the live projection; the static calendar file is retired after acceptance.
- [x] 24.8 Portal Timetable tab: weekly sessions, one-date changes, closures, staff review list and the plain-language change history.
- [ ] 24.9 Deploy `club-api` and `club-public`, then the website; verify with the test plan (owner runs the backend deploy; website follows).
- [ ] 24.10 Club decision recorded on the holiday substitute-day rule (open question for the club).
