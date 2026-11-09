Updated 9 November 2026. Checked tasks mean source implementation/local verification, not hosted acceptance. The active architecture is runtime-design.md. Hosted setup and live testing remain excluded; follow docs/PERSONAL_LAPTOP_LAUNCH.md from the personal laptop. PARTIAL/DEFERRED items are stated explicitly.

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

- [ ] 10.1 OWNER HANDOVER, updated 7 November 2026: office-laptop Supabase connections are blocked, confirmed by owner. Owner will set up the existing ttclubs project (mkxqrkqwpvjtkjfjjckm; eu-north-1 Stockholm) from a personal laptop after repository updates. Pull main, install dependencies, log in/link, remote dry-run/review then apply migrations. Preserve the hosted-setup pause until that handover; no network bypass or remote migrations in this implementation pass. See implementation-status.md for scope, commands and remaining live-data gates.
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
- [ ] 10.14 Owner deployment: separate app Worker source/config is ready; deploy it from the personal laptop without overwriting the website Worker; review remaining build-tool advisories
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
- [ ] 11.7 Owner performs the personal-laptop runbook, real account/provider configuration and live smoke tests; no office firewall bypass or hosted changes in this implementation pass

## 12. Handover regression and integration verification — 9 November 2026

- [x] 12.1 Add shared live-adapter unit tests for activation, missing settings, revision polling, account/club isolation, failed operations, stable retry IDs and export denial
- [x] 12.2 Add isolated environment/bootstrap/packaging/migration/schedule helper regression tests, including rerun preservation and safe key handling
- [x] 12.3 Fix missing loopback local origins and reject malformed bootstrap owner UUIDs
- [x] 12.4 Add one-command verification with automatic temporary frontend builds, browser setup, ephemeral servers and cleanup; preserve private configuration/deployable assets
- [x] 12.5 Add API-to-PostgreSQL integration for competing place requests, retry, approval visibility, revocation and isolation with explicit fake Auth/PostgREST boundaries
- [x] 12.6 Extend CI to test generated migration/bootstrap reruns and both built browser entry points; document exact coverage/prerequisites in TESTING.md
- [ ] 12.7 Confirm the extended CI run and record its result; hosted provider setup, actual devices and live acceptance remain owner release gates
