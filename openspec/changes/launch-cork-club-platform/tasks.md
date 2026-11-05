## 1. Workspace foundation

- [x] 1.1 Create an npm-workspaces monorepo for the club website, national platform PWA, and shared packages
- [ ] 1.2 Configure shared TypeScript, linting, formatting, testing, and environment-variable conventions
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
- [ ] 3.4 Enable row-level security and add club-scoped policies using server-controlled role relationships
- [ ] 3.5 Implement shared Supabase clients and authenticated session handling for both frontends
- [ ] 3.6 Add local seed data for Leeside and synthetic multi-club authorization tests
- [ ] 3.7 Add automated database tests proving cross-club access is denied

## 4. Independent website integration (supersedes generic portfolio hosting)

- [ ] 4.1 Build approved HTTPS club website URL configuration, authorization, audit and invalid-destination handling
- [ ] 4.2 Build stable app club/join/event/admin routes with validated identifiers and safe post-login return navigation
- [ ] 4.3 Support website-to-app administration links; keep app authorization independent of website roles
- [ ] 4.4 DEFERRED: review Leeside website extraction only after at least one year of live pilot operation AND more than two participating clubs (three or more); retain the current folders/build targets until a separate implementation decision
- [ ] 4.5 Publish public-safe app event pages and optional RSS/Atom/iCalendar feeds for independent websites
- [ ] 4.6 Generate public-safe sharing links/text; keep automated Meta posting behind separate approval

## 5. Platform PWA and multi-club access

- [ ] 5.1 Build provider-independent email sign-up, sign-in, verification, password recovery, and account session flows
- [ ] 5.2 Add Google OAuth with exact redirect allowlists, safe fallback, and provider secrets held outside frontend bundles
- [ ] 5.3 Build independently verified email/mobile contact management, primary-contact preferences, and duplicate-identity prevention
- [ ] 5.4 Build audited identity linking and secure claim/recovery flows that attach authentication to an existing player profile without losing history
- [ ] 5.5 Add optional rate-limited mobile OTP login behind approved SMS-provider configuration
- [ ] 5.6 Build My Clubs with per-club relationship and membership status
- [ ] 5.7 Build explicit club switching and verified club-website links
- [ ] 5.8 Build guardian-linked junior selection and adult-routed actions
- [ ] 5.9 Add installable PWA metadata, offline shell behavior, and clear offline status

## 6. Membership and communications

- [ ] 6.1 Build public QR/join-code adult and guardian-led junior applications
- [ ] 6.2 Build pending applicant, trial-pass, and admin approval workflows
- [ ] 6.3 Build configurable membership types and historical membership periods
- [ ] 6.4 Build audited manual payment recording and correction without storing bank credentials
- [ ] 6.5 Build 10-day and 3-day renewal reminder scheduling with duplicate prevention
- [ ] 6.6 Build non-formal payment acknowledgements and notification delivery history
- [ ] 6.7 Make acknowledgement delivery an explicit admin choice and preserve the selection in the audit history
- [ ] 6.8 Build consent-aware event subscriptions, invitations, and unsubscribe/preference controls
- [ ] 6.9 Build verified self/guardian trial registration with configurable calendar-month duration, individual extensions and historical end-date preservation
- [ ] 6.10 Build trial-end player/guardian reminders and membership-team follow-up with current-recipient checks, extension/conversion suppression and idempotency

## 7. Sessions, bookings, and attendance

- [ ] 7.1 Build recurring session definitions, dated occurrences, cancellations, and capacity-aware bookings
- [ ] 7.2 Build NFC/QR credential issuance, rotation, revocation, and member-card output
- [ ] 7.3 Build the restricted Android kiosk scanner with duplicate prevention and feedback
- [ ] 7.4 Build membership-aware check-in that records expired and no-membership attendance and creates deduplicated alerts
- [ ] 7.5 Build an idempotent, bounded offline scan queue and reconciliation interface
- [ ] 7.6 Build authorized manual check-in, correction, and audit history
- [ ] 7.7 Build daily, weekly, monthly, session-utilization, membership-segment, and top-attendee reporting
- [ ] 7.8 Build configurable daily staff digests without exposing member details in email
- [ ] 7.9 Build one-off and bounded multi-day programmes, including conflict warnings against recurring occurrences
- [x] 7.10 Add venue QR preview, staff rotating display, existing-user sign-in, guardian selection, and atomic Supabase challenge/confirmation RPCs
- [ ] 7.11 Complete live venue-device acceptance, Auth provisioning, and notification delivery for the venue QR flow before production launch
- [ ] 7.12 Add session-time direct app presence with self-declared provenance and explicit self/linked-child selection; retain QR confirmation as an alternative
- [ ] 7.13 Add separate Not attending availability from home; exclude it from attendance totals and prevent silent overwrites of existing presence
- [ ] 7.14 Add table resources, recurring/date-specific practice availability and configurable hourly request/hold/cancellation settings
- [ ] 7.15 Build shared website/app table booking entry for players, verified guests and designated guardians without automatic membership activation
- [ ] 7.16 Implement atomic provisional holds, maintainer approve/reject, bounded expiry, cancellation and rescheduling with database overlap constraints and audit
- [ ] 7.17 Integrate regular session/camp/tournament resource blocks and separate practice attendance from reservations
- [ ] 7.18 Build current-permission management queue/email alerts and requester/guardian decision notifications through the idempotent outbox
- [ ] 7.19 Test concurrent same-table requests/approvals, expiry races, adjacent intervals, reschedule rollback, permission revocation, guest/guardian access, cross-club denial and shared-channel availability
- [ ] 7.20 Add cross-channel availability subscriptions or bounded polling, stale/reconnect states and idempotent reconciliation of interrupted requests
- [ ] 7.21 Build hall opening hours/closures/table allocation and test whole-hall maintenance blocking without enabling exclusive public hall rental

## 8. Matches and tournaments

- [ ] 8.1 Build singles/doubles session match creation with registered and guest participants
- [ ] 8.2 Build game-by-game scoring with best-of and win-by-two validation
- [ ] 8.3 Build result submission, opposing-side review, modification, five-day auto-approval, and reminders
- [ ] 8.4 Build coach correction and dispute resolution with immutable audit events
- [ ] 8.5 Build player match history excluding incomplete results from statistics
- [ ] 8.6 Build configurable round-robin league tournaments, fixtures, points, tie-breaks, and standings
- [ ] 8.7 Build configurable single-elimination brackets and confirmed-result progression
- [ ] 8.8 Build tournament-scoped player organizer delegation and participant check-in
- [ ] 8.9 Build a mobile-first ad hoc tournament flow seeded from the current day's checked-in roster
- [ ] 8.10 Add stable internal/external tournament event records linked from news/calendar; preserve event identity on archive and support unlisted-event drafts
- [ ] 8.11 Build external event result entry with aggregate/optional game scores, singles/doubles and guardian attribution without local attendance requirements
- [ ] 8.12 Implement server-side same-recording-club review eligibility, mixed doubles and unclaimed-opponent follow-up; retain immediate external player-reported provenance
- [ ] 8.13 Test duplicate/idempotent entry, fixture reuse, score consistency, incomplete exclusions and reviewed/reported statistics separation

## 9. Player development and administration

- [ ] 9.1 Build private coach working notes with restricted access and retention controls
- [ ] 9.2 Build deliberately published strengths, improvement areas, and future-goal summaries
- [ ] 9.3 Build player and guardian visibility for published summaries only
- [ ] 9.4 Build unified club administration with least-privilege role management
- [ ] 9.5 Build claimable, assignable, commentable, and resolvable shared admin work items
- [ ] 9.6 Build personal-data export and correction support with audit history
- [ ] 9.7 Build club management group invitations, membership removal, and scoped admin/content/event/communications permissions with audit history and cross-club denial tests
- [ ] 9.8 Build participant-owned strengths/improvement tags, bounded notes, guardian editing and attributed revision/removal history
- [ ] 9.9 Build coach-managed tag taxonomy with stable historical identifiers and retirement
- [ ] 9.10 Build club/event/date/player/group coaching summaries with distinct reporting denominators, provenance and permitted drill-down
- [ ] 9.11 Test private reflection access, opponent-review privacy, cross-club denial and human-authored goals separated from descriptive aggregates
- [ ] 9.12 Enforce runtime permission grants/revocation on every privileged request; support owner bootstrap and empty editable membership catalogue without redeployment
- [ ] 9.13 Build permission-scoped management editing/publication of safeguarding/privacy contacts, policies and approved data-handling settings with revision history and unconfigured states
- [ ] 9.14 Verify website/app management entry points share table/hall, communication and membership services, current permissions and non-duplicated notifications/audits

## 10. Operations and release

- [ ] 10.1 PAUSED by owner, 5 November 2026: resume Supabase setup for ttclubs (reference mkxqrkqwpvjtkjfjjckm; eu-north-1 Stockholm), diagnose hosted temporary-role timeout/possible corporate firewall, confirm CLI access/plan, dry-run/review then apply migrations. Metadata and local frontend configuration exist; remote migrations are not applied. Only this setup is paused; synthetic UI work may continue.
- [ ] 10.2 Configure the national app and retained Leeside pilot website deployments using current targets; future independent website integration does not require a generic club-website service
- [ ] 10.3 Configure authenticated transactional email and scheduled Edge Functions
- [ ] 10.4 Configure encrypted off-site database and storage backups and test restoration
- [ ] 10.5 Complete accessibility, privacy, safeguarding, security, and retention reviews
- [ ] 10.6 Run the Leeside acceptance pilot for accounts, scanning, membership, reports, matches, and tournaments
- [ ] 10.7 Document Wix cutover, monitoring, free-tier thresholds, rollback, and support ownership
- [ ] 10.8 Prepare Expo native clients and store submissions only after the PWA pilot justifies them
- [ ] 10.9 Implement and test approved retention, deletion/anonymization, and backup-expiry schedules by data class
- [ ] 10.10 Implement inclusive end-of-day Europe/Dublin expiry emails to player/guardian plus current management summary, with renewal-race suppression, recipient revocation checks and idempotency
- [x] 10.11 Inspect Cloudflare account/Worker/build logs through authorized read-only APIs and record observed failure separately from proposed remediation
- [x] 10.12 Correct Cloudflare workspace typo (@ttti/club-web to @tti/club-web), align existing table-tennis-ireland Worker via wrangler.club-web.jsonc, pin Wrangler/Node 22 and configure website production/preview commands; platform Worker remains separate future work
- [ ] 10.13 Retry and verify website main-commit build, actual workers.dev content/assets/mobile routing, preview behavior and rollback; current remote deployment is a starter template
- [ ] 10.14 Configure a separate synthetic platform-app Worker without hosted Supabase bindings while setup is paused; review dependency/install-script warnings independently
- [x] 10.15 Verify successful Cloudflare website build af21ba36-d5ea-4df0-9eba-7d87a70e2fe2 from fix commit 8484e83, root/JS/CSS HTTP 200, exact local/remote asset hashes and SPA fallback; preview/mobile/rollback acceptance in 10.13 remains pending

## Parked owner activity (not a development prerequisite)

- Broader pilot participant recruitment and club testing dates are deferred at the owner's request; initial owner-only testing is supported. This does not mark production readiness, security, privacy or automated verification complete.
- NFC/card hardware purchases are deferred while QR/app attendance is the pilot path.
