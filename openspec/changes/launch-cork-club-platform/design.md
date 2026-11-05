## Context

Leeside currently uses an independent Wix website. The national app adds authenticated club operations and launches with Leeside while supporting future Irish clubs. Confirmed on 1 November 2026: the platform hosts only the app and shared backend. Club websites may use separate repositories and hosting; they integrate through verified website links, app routes and optional public feeds rather than a generic hosted website service.

The system will hold adult and junior personal data, guardian relationships, membership/payment metadata, attendance, local match results, and coaching information. The initial architecture therefore needs strong authorization, auditability, recoverability, and explicit club data boundaries even though only Leeside is active.

## Goals / Non-Goals

**Goals:**

- Deliver a national installable app and shared backend that link to independent club websites without per-club app copies or website directories.
- Keep pilot infrastructure at or close to zero recurring cost other than the club's domain, while documenting free-tier limits and an upgrade path.
- Support a future native application and multiple Irish clubs without implementing either during the pilot.
- Allow attendance scanning with commodity equipment already available to the club.
- Keep privileged changes, junior information, private coaching notes, and cross-club boundaries protected on the server.
- Make operational data exportable and backed up so the product is not trapped in a hosting provider.

**Non-Goals:**

- App Store or Play Store distribution in the first release.
- Custom-built attendance hardware, turnstile access control, high-security smart-card infrastructure, facial recognition, or passive location tracking.
- Online payment processing, federation integration, national ranking, or automated coaching advice.
- Automated internal skill ratings; initial statistics are descriptive and tournament-specific.
- Production operation for more than one club during the pilot.

## Decisions

Verified website deployment: fix commit `8484e83` triggered successful Cloudflare build `af21ba36-d5ea-4df0-9eba-7d87a70e2fe2`, deploying version `5fdab8bb-e862-4095-b0f0-a693d4e8ec09` at https://table-tennis-ireland.ttclubsie.workers.dev. Root, JS, CSS and SPA fallback return HTTP 200; remote asset hashes match the local build. This supersedes earlier failed/template-only observations; full visual acceptance, preview/rollback rehearsal and the separate platform Worker remain pending. Supabase setup remains paused and live business workflows are not implied implemented.

Cloudflare remediation now authorized: production commands corrected through the Builds API to root scripts `build:club` and `deploy:club`; preview defaults corrected to `build:club` and `preview:club`. Repository configuration `wrangler.club-web.jsonc` specifies the existing Worker, static assets and SPA fallback; Wrangler is pinned and Node 22 selected for CLI compatibility. This supersedes the earlier inspection-only state. Verify the GitHub-triggered remote build and served content before marking deployment complete; Supabase setup remains paused.

Cloudflare inspection (5 November 2026, read-only): account `6502a73494f4ee7107b36c620ee76471`, Workers subdomain `ttclubsie`, existing Worker `table-tennis-ireland` (tag `d699159f1a6740de815d4229e261d85d`), connected to `tamil07/table-tennis-ireland` main/root. Build `fbcb4efe-d58e-47dc-b205-2e1c1bf3ea7b` failed on the configured `@ttti/club-web` workspace typo; correct package is `@tti/club-web`. Its deploy command also targets `Leeside-web` instead of the existing Worker, a separate configuration mismatch to resolve before retry. The current remote deployment is dashboard-template code without assets, not the repository website. See `docs/CLOUDFLARE_DEPLOYMENT_PLAN.md` for evidence and pending execution steps. No credentials are recorded and no Cloudflare settings/deployments were changed; Supabase remains paused.

Setup status, 5 November 2026: the owner paused only further Supabase setup after a remote CLI temporary-role connection timeout. A corporate firewall may be involved but the cause is not established. Keep project metadata and local frontend configuration, defer remote migrations/connection troubleshooting, and continue independent synthetic UI work. Resume requires authorized connectivity or an approved migration path, a dry run and review before database changes; no migration is marked applied.

### 0. Platform ownership and club management

Supabase setup update (owner-reported 5 November 2026): administrator sign-in uses the owner's GitHub account; organization is **TT Clubs Ireland**, project name **ttclubs**, project reference **mkxqrkqwpvjtkjfjjckm**, URL **https://mkxqrkqwpvjtkjfjjckm.supabase.co**, and assigned region **eu-north-1 (Stockholm, Sweden)** following the general Europe selection. The owner supplied a frontend publishable key; its value is omitted from documentation. Plan, MFA/recovery, password rotation and deployed app/database connection remain unconfirmed. Region selection alone is not proof of complete privacy compliance. No database password or secret belongs in this record.

Current environment decision: begin with one hosted `ttclubs` project and synthetic data, testing changes locally with Supabase. Separate hosted development/production projects in the earlier topology are deferred, not a prerequisite to this setup. Before real-data use, complete permissions, backups/recovery, region verification and release gates; do not run destructive local test/reset procedures against the hosted project. Revisit a second hosted environment when needed.

Confirmed mailboxes (owner-reported created 4 November 2026): `ttclubsie@gmail.com` is the national platform account/contact mailbox for cloud-service registration and administration; `leesidettie@gmail.com` is Leeside's club contact/reply-to and owner-managed domain-account contact. These addresses are configuration defaults, not authorization roles or automated sending domains. MFA/recovery setup, provider accounts, domain verification and delivery connections are not implied complete. Authorized staff retain individual logins; automated email continues through the verified domain/provider.

The founder personally owns the national platform, brand, and repository and operates the shared cloud infrastructure. A separate Gmail address serves as the account contact, billing, and recovery mailbox; the address itself is not the legal owner. External contributions are submitted through pull requests and merged by authorized maintainers. Trusted platform owners use individual provider accounts with explicitly assigned access, separate from club-management permissions.

Leeside's club-scoped group manages app branding/content, records, marketing messages, news, events, sessions, camps and sharing through individual accounts and scoped permissions. Independent website content remains in that website's CMS/repository; app records can be reused only through implemented public connectors. A website management link leads to app sign-in and club permissions. Manual Facebook sharing and consent-aware announcements remain the pilot approach.

The Leeside domain's registered holder and any future transfer to the authorized individual or club entity remain to be agreed. Managing its website does not require transferring the national platform, repository, or shared cloud accounts. Content reuse, member-data responsibilities, export, and offboarding arrangements remain subject to agreement with Leeside.

### 1. One platform repository and independent website repositories

Pilot sequencing decision (1 November 2026): retain `apps/club-web`, `apps/platform`, shared packages, backend and existing build targets here for at least one year of live operation. Count from actual pilot go-live, not this document date. Review separation only when both that period has elapsed and more than two clubs participate (three or more). This is a review gate, not an automatic migration or permission to onboard extra production clubs. The independent-website architecture below is the future direction and does not require current extraction, removal or disabling of the Leeside website. Retaining the pilot code does not introduce a generic website hosting service.

This repository owns `apps/platform`, shared packages, Supabase migrations and platform deployment. A club may use an independent website repository and hosting account, including its existing Wix site. Club repositories hold website code/content and app links, not copies of the national app, authentication or operational backend.

My Clubs derives from authorized relationships and exposes an approved HTTPS external website URL for each club. Opening a website and switching app club context are distinct actions. Onboarding adds configuration, relationships and links without a new club directory here. The app owns stable HTTPS club/join/event/admin routes, validates identifiers and safe return destinations, and preserves intended navigation through authentication. Website links never convey roles or authentication tokens.

An optional public feed can supply deliberately published event/news fields to an independent website; private records and reflections stay behind app authorization. Website synchronization requires an explicit connector. The current `apps/club-web` is a legacy Leeside prototype, not a future generic hosting engine. Extraction into a club repository is a separately tracked migration; this documentation update neither deletes files nor creates external repositories.

The rejected alternative is duplicating the app/backend per club. Independent website repositories are supported and do not require separate platform identities or databases.

### 2. Ship the platform app as an installable Progressive Web App first

Build the app as a responsive TypeScript PWA with a web app manifest, service worker, install prompt guidance, offline scanner queue, and camera access. The app supports phones, tablets, laptops, and desktops while the Leeside website remains a conventional responsive web experience.

This gives Android, iPhone, tablet, laptop, and desktop access without separate application codebases or store accounts. A native application can later be built with Expo/React Native against the same backend APIs if PWA limitations or national distribution justify it. Apple App Store distribution is deliberately deferred because Apple currently requires a paid developer membership.

Alternatives considered:

- Separate native iOS and Android apps: better store presence and deeper device integration, but significantly more build, review, maintenance, and distribution cost for an unproven pilot.
- A thin native wrapper around the website: adds store overhead without enough first-release benefit.

### 3. Use hosted frontends plus managed authentication and PostgreSQL

Recommended pilot services:

- Cloudflare Workers Static Assets for the national PWA on its product domain or preview subdomain; club website hosting is independently chosen and outside the shared platform deployment.
- Supabase Free in the specific West EU (Ireland) region for PostgreSQL, authentication, row-level security, and small file storage.
- Resend Free for password, renewal, cancellation, and other transactional emails sent from a verified club or platform domain; a monitored Gmail or club mailbox may be the reply-to address but is not the automated SMTP sender.
- Supabase Cron (`pg_cron`) invoking TypeScript Edge Functions for renewal reminders, five-day match auto-approval, daily attendance digests, notification retries, and housekeeping.

Supabase is preferred over building directly on Cloudflare D1 because managed authentication, relational PostgreSQL, row-level security, and an admin-friendly data platform reduce security-sensitive custom work. A Cloudflare-only design remains a future cost-optimization option.

The free tiers are suitable for a small active pilot, not a permanent availability guarantee. At design time, official limits include two Supabase free projects, 500 MB database size, 1 GB file storage, 50,000 monthly active users, and 5 GB egress; low-activity free projects can be paused. Cloudflare Workers Free permits 100,000 requests per day. Resend Free permits 3,000 transactional emails per month and 100 per day. Usage alerts and an upgrade decision threshold must be configured before launch.

Official references:

- https://supabase.com/docs/guides/platform/billing-on-supabase
- https://supabase.com/docs/guides/platform/free-project-pausing
- https://supabase.com/docs/guides/platform/regions
- https://supabase.com/docs/guides/auth/social-login/auth-google
- https://supabase.com/docs/guides/auth/auth-smtp
- https://developers.cloudflare.com/workers/platform/limits/
- https://resend.com/pricing
- https://developer.apple.com/programs/whats-included/
- https://support.google.com/googleplay/android-developer/answer/6112435
- https://expo.dev/pricing
- https://developers.cloudflare.com/r2/pricing/

#### Pilot deployment topology

Keep app/backend source in this repository; club website source and deployments are independent:

| Target | Address | Service | Initial tier |
| --- | --- | --- | --- |
| Leeside website (external integration) | Club-approved website/domain | Independently chosen by the club | Independent budget |
| National platform PWA | Temporary `workers.dev` address, then a separate product domain when named | Cloudflare Workers Static Assets | Free |
| Production API, Auth and PostgreSQL | Supabase project in West EU (Ireland) | Supabase | Free |
| Development API, Auth and PostgreSQL | Second Supabase project with synthetic data only | Supabase | Free |
| Transactional email | Verified subdomain of the club/product domain | Resend | Free |
| Schedules | `pg_cron` plus Supabase Edge Functions | Supabase | Free allowance |
| Encrypted off-site logical backups | Private Standard bucket with lifecycle retention | Cloudflare R2 | Free allowance |
| Native builds, when required | Expo EAS | Expo | Free build allowance |

Static files must be served directly wherever possible because Cloudflare static-asset requests are free and unlimited; only dynamic Worker requests consume the Workers allowance. The frontends call Supabase through its published project endpoint, so a paid Supabase custom domain is unnecessary.

Use the two Supabase free projects as `production` and `development`. Development must contain generated/test identities only, never copied live junior, payment, attendance, coaching, or contact data. Cloudflare preview deployments point to development; the production branches and domains point only to production. Secrets live in deployment secret stores and are never committed.

The club purchases only the Leeside domain initially. The platform PWA can use a free preview address until its national product name is chosen, then it receives a separate purchased product domain. Buying a domain does not buy hosting or an application; DNS maps the purchased name to the free Cloudflare deployment.

When another club is onboarded, its independently hosted website is registered as an approved external URL in the app. The club links back to stable app club/join/event routes; its domain does not point to a generic platform website deployment. No app/backend copy or shared-website subdomain provisioning is required.

Multi-club provisioning is controlled by the operator: create the club/slug, approve its external website URL, configure its app profile and invite its first admin. Clubs manage their app operations and independent website content under separate permissions; self-service onboarding and club billing remain later work.

Supabase Free does not provide the same accessible managed-backup guarantees as paid plans. Run an encrypted logical database export on a schedule, upload it to a private R2 bucket, apply short retention and least-privilege credentials, and test restoration into the development project. Storage objects require their own export because a database dump contains only their metadata. No backup or production data belongs in Git or public build artifacts.

The initial mobile product is the PWA and requires no store account. If native distribution is later approved, Expo builds the React Native iOS and Android binaries against the same production backend. Store accounts remain separate costs: Google Play currently charges a one-time USD 25 registration fee and Apple currently charges USD 99 per membership year, subject to local pricing and any eligible organization waiver. Expo's free tier currently includes a limited number of Android and iOS builds and app-store submission support.

#### Upgrade triggers

Free service is a pilot constraint, not a permanent reliability promise. Review paid service before onboarding a second production club, and upgrade earlier when any of these occur:

- The club cannot tolerate a paused backend or manual restore process.
- Database, storage, egress, function, email, or request usage reaches 70% of a free quota.
- Resend's daily email cap would delay renewal, receipt, match, or safeguarding-related communication.
- The required recovery point or recovery time cannot be met by tested logical exports.
- Store distribution, native push notifications, contractual support, or an availability commitment becomes necessary.

### 4. Make club tenancy a data invariant

All club-owned tables include a non-null `club_id`. Database row-level-security policies derive accessible clubs and roles from server-controlled relationship records; a hostname, URL parameter, or client-provided club identifier is never sufficient authorization. Leeside is the only production club initially, but no schema or query assumes a single global club.

Core data areas include clubs, verified club domains, website portfolios, branding and settings, profiles and identities, club roles, guardian links, join codes, applications, trial passes, membership types, memberships, manual payment records, recurring session definitions, session occurrences, bookings, attendance, check-in attempts, physical and digital credentials, tournaments, tournament organizers, entries, fixtures, brackets, standings rules, matches, match participants, result reviews, development summaries, private coach notes, shared admin work items, notifications, and audit events.

### 5. Separate member identity from club membership

A person has one platform person/profile record. Authentication is an optional one-to-one attachment to that profile rather than the profile's primary key, allowing juniors and members without digital access to retain a normal player history without fabricated credentials. Their club role, membership period, membership type, payment metadata, and status belong to each club through separate historical records. This supports membership renewal without overwriting history and allows a player to belong to multiple clubs concurrently.

Coach status is also a club-scoped relationship rather than a global privilege. The same person can be a player at one club, a coach at another, both player and coach at Leeside, or have no privileged role elsewhere. Switching club context in the app changes the authorized data and actions, while the platform identity and sign-in remain the same.

Junior profiles are linked to designated guardian identities. Sensitive junior actions and messages are routed through those guardian relationships rather than assuming a junior owns an email inbox or mobile phone. A later secure account-claim process attaches authentication to an existing person/profile and never creates a replacement profile that loses club history.

### 5a. Separate authentication identifiers from contact and delivery preferences

Accept any valid email provider; Gmail is not a product dependency. Store email addresses and mobile numbers as independently verified contact methods attached to the person/profile, with one primary method and category-specific delivery preferences. Normalize mobile numbers to E.164. A contact method may be usable for sign-in, notifications, both, or neither, and storing a mobile number never implies SMS consent.

Use verified email with password or passwordless link as the guaranteed pilot authentication path. Supabase phone OTP requires a configured third-party SMS provider and every OTP/recovery attempt has a variable delivery cost and abuse exposure. Keep phone OTP behind provider configuration, rate limits, resend cooldowns, attempt limits, monitoring, and an explicit budget. When enabled, a verified email and verified phone for the same person must resolve to the same authentication user and platform profile.

Enable Supabase's Google OAuth provider as an optional convenience method. The platform-owner account creates and owns the Google Cloud OAuth configuration; exact development, preview, club-site, and platform-app callback origins are allowlisted. Provider secrets stay in Supabase configuration and never enter either frontend bundle. Email/password and magic link remain visible fallbacks, so Google is neither a product dependency nor a requirement for non-Gmail users.

Before creating a person/profile after any authentication callback, resolve the authenticated identity against existing linked identities, normalized verified contacts, pending applications, and eligible unclaimed profiles. Automatic identity linking is permitted only when the provider email is verified and the platform's linking rules are satisfied. Ambiguous or unclaimed-profile matches enter an assisted claim flow rather than creating another player record. Record security-sensitive link/unlink events in the audit history and require recent authentication for manual linking.

During the email-first pilot, an adult with only a phone number can have an admin-created or application-created player profile, membership, physical card, attendance, and match history, but cannot be promised self-service login or SMS notifications. The UI must state this limitation and create an admin follow-up instead of pretending delivery occurred. Guardians provide the authenticated path for juniors without independent credentials.

### 6. Use a hybrid NFC and QR membership card with an Android kiosk

Each member receives one inexpensive physical card containing an NDEF-compatible NFC tag and a printed QR fallback. Both credentials resolve to the same card assignment but use opaque, random, revocable values rather than a name, email, membership number, or other readable personal information. Only a one-way representation of credential secrets is stored where practical.

The platform app also displays a short-lived QR attendance pass for an authenticated recognized player, including one whose membership needs attention. A guardian can display the pass for a linked junior, but the child does not need a phone because the physical card remains universal. The pass displays membership state separately and does not imply payment. The digital QR is a separate rotating credential rather than a copy of the permanent card token, limiting the usefulness of screenshots and allowing app access to be revoked independently.

The recommended scanner is a spare club-controlled NFC-capable Android phone or tablet mounted on a stand with continuous power and the attendance PWA open in kiosk mode. Android Chrome supports Web NFC for NDEF tags; browser NFC support is not consistent across platforms, which is why Leeside controls the kiosk device rather than relying on every member's phone. The device camera scans the printed QR when NFC fails. This is simpler than constructing a reader, maintaining a Raspberry Pi agent, or depending on vendor-specific USB drivers.

Web NFC requires HTTPS, a visible page, user permission, enabled NFC hardware, and an initial user gesture to start scanning. Kiosk startup must therefore include an explicit “Start scanner” action, capability checks, and clear recovery instructions. If Web NFC proves unreliable on the selected device during the pilot, the same card's camera-readable QR remains a complete fallback; a dedicated PC/SC or keyboard-wedge reader is a later alternative, not a launch dependency.

The kiosk is authenticated as a restricted club device or operator, selects the active session occurrence, provides immediate visual/audio feedback, blocks duplicates, and stores the check-in time and membership-status snapshot. A coach/admin manual check-in remains available when a member forgets a card.

Attendance records physical presence independently from membership payment or validity. When membership is expired or missing, the backend still records attendance, snapshots that classification, warns the operator discreetly, and creates a deduplicated admin alert for follow-up. A later membership renewal does not rewrite the historical classification of the earlier visit.

For short connectivity outages, the PWA stores encrypted or minimally identifying pending scans in IndexedDB and synchronizes idempotently when online. Offline authorization is time-limited and must be established while online; the device must not download the full member database merely to scan credentials.

The public sign-up QR is separate from attendance credentials. It is a static deep link to Leeside's responsive registration flow and can be displayed at the entrance, on posters, and on the website. The same flow is reachable by entering a memorable public Leeside join code in the platform app. The link/code selects the club but grants no authorization.

A new adult creates or signs into a platform identity and submits the Leeside application; a parent/guardian does the same on behalf of a junior. A completed form creates a pending applicant rather than an active member. If Leeside enables trials, an email-verified pending applicant can receive a time- or visit-limited digital trial pass. Its kiosk scans are explicitly classified as trial attendance, and exhausting the allowance requires staff action. An admin issues the permanent physical card when the application or membership reaches the club's configured approval point.

Phone users can scan a rotating venue QR using their phone camera. The web app requires authentication, shows the server-resolved club/session and self or actively linked junior, explains the recorded data, and requires explicit confirmation. Staff display a code refreshed every minute, valid for at most 90 seconds and bounded by the open session. The backend validates the challenge hash, server time, role/guardian relationship, membership classification, and uniqueness atomically. Expired/missing membership still records attendance and creates an admin work item. Challenge values remain in URL fragments/in-memory state rather than query strings or persistent storage. Authentication that outlasts the challenge requires a fresh scan. This deters stale-code reuse but cannot prevent forwarding a live code. Physical cards and manual check-in remain available for children and people without phones; printed static venue attendance QR is not enabled by this implementation.

### 7. Model attendance as session occurrences

Recurring timetable definitions generate dated session occurrences. Attendance attaches to a dated occurrence rather than only to a weekday schedule. This handles public holidays, cancellations, exceptional sessions, and historical timetable changes without rewriting past attendance.

Reports aggregate visits, unique attendees, membership status at check-in, session utilization, and date-range trends. The dashboard supports daily, weekly, monthly, and custom groupings; active versus approaching-expiry versus expired/no-membership segmentation; and a staff-only top-attendee ranking. Raw member-level attendance is limited to authorized staff and the relevant player/guardian.

A scheduled daily digest uses the club's timezone and configurable recipients/time. It summarizes sessions, total and unique attendance, membership-status segments, unresolved membership alerts, and scanner synchronization failures. Member-level details remain behind an authenticated dashboard link rather than being placed in email.

### 8. Use state machines for membership, matches, and notifications

Membership moves through explicit states such as pending, active, expired, and cancelled. An authorized admin manually records an externally received payment against a specific membership and sets its start/end dates and status. Payment status (`unpaid`, `partially_paid`, `paid`, or `waived`) remains separate from membership validity and attendance so players can attend before payment is reconciled. The system stores amount, EUR currency, date, method, external reference/note, and confirming admin but never personal bank credentials. Corrections are audited. Recording/correcting payment or renewing membership presents an explicit option to queue a non-formal acknowledgement to the adult player or junior's designated guardian; it is not represented as a tax invoice or bank-issued receipt. Renewal processing can enable 10-day, 3-day, or both reminder points and uses a unique membership/reminder-stage key to prevent duplicates.

A session match moves through `in_progress`, `awaiting_opponent_review`, `changes_requested`, `confirmed`, `auto_approved`, or `incomplete`. An attending player starts singles or doubles play, selects registered or guest participants and a permitted best-of format, optionally records a table, and records game scores under standard win-by-two validation. Final submission confirms the submitting side and starts a five-day deadline. An eligible opposing player or junior's guardian can approve or request a reasoned modification. Modification stops auto-approval; resubmission starts a fresh five-day period. Silence auto-approves the result. An authorized coach can approve, request correction, or make an audited final resolution at any point. Incomplete and retired matches retain their record but do not affect statistics.

A tournament moves through `draft`, `published`, `in_progress`, `completed`, or `cancelled`. Coaches/admins configure at least round-robin league and single-elimination formats, singles or doubles, entries, match format, points/tie-break rules, seeding, and optional table assignments. Fixtures, standings, and bracket progression use only confirmed results. Incomplete results do not affect player statistics or standings unless a coach resolves them.

Tournament delegation is a scoped relationship with a start/end or revocation boundary. A nominated player can operate only the named tournament: start it, select/check in present participants, manage fixtures and tables, and support scoring. The delegation does not confer coach, admin, membership, payment, role-management, or dispute-resolution authority.

Operational membership and attendance alerts use a shared admin queue. Each admin signs in individually; work can be claimed, reassigned, commented on, and resolved with optimistic concurrency and audit history. There is no shared admin password.

Email is written to a notification outbox before delivery. Provider outcomes update the outbox, allowing retries without duplicate logical notifications and giving admins a failure view.

### 9. Separate private coach notes from published development summaries

Private coach working notes and player-visible development summaries are different records and permissions. Coaches deliberately publish a summary containing strengths, improvement areas, and goals. Adult players see their published summary; guardians see the published summary for linked juniors. Players and guardians never receive private notes through the ordinary UI or exports intended for them.

This is safer than making every coaching note immediately visible, lets coaches write candid working observations, and creates a clear publication event. The club must agree policy for note retention, safeguarding access, and handling subject-access requests before launch.

### 10. Treat audit, privacy, and recovery as launch requirements

Role, guardian, membership, manual payment, attendance correction, match approval/correction, and development-publication actions create append-only audit events. Secrets and service keys remain server-side. Rate limiting, secure cookies/tokens, password-reset controls, and least-privilege database policies are required.

The club must approve privacy notices, consent wording, safeguarding rules, and retention periods. Automated database exports must be encrypted and copied outside the primary Supabase project on a schedule; restore instructions must be tested before storing live member data.

Use provisional retention defaults for product design, subject to Leeside's documented legal/privacy approval before live data: unsuccessful applications 12 months after closure; attendance, bookings, notification delivery logs, and general security audit events 24 months; private coach notes 12 months after the player leaves or the note is superseded; membership, manual-payment, and related audit records 7 years after the membership ends; revoked credential secrets removed immediately with revocation evidence retained 24 months; encrypted backups 35 days. Aggregate anonymized statistics may be retained longer. Published match/tournament history and photographs require separate documented purposes and review rules rather than inheriting operational retention automatically.

Leeside should nominate a public privacy contact, at least one trained Club Children's Officer, and a Designated Liaison Person following Table Tennis Ireland/Sport Ireland safeguarding guidance. The system stores role contacts rather than exposing unnecessary personal details. These are governance roles selected by the club; the platform cannot appoint them.

### 11. Publish events once and distribute deliberately

Five weekly recurring Leeside sessions remain the base timetable. Admins can add bounded programmes such as a seven-day camp, producing dated occurrences with independent capacity, booking, cancellation, and attendance. Publishing creates a canonical public page plus RSS/Atom and iCalendar entries. RSS does not send email: invitations are separate, consent-aware notification jobs addressed to eligible members/guardians or verified subscribers.

For the pilot, provide a share-ready public link and copy for manual Facebook Page posting. Automated Page posting is technically possible only after a platform-owned Meta application, Page-admin authorization, appropriate permissions/review, token lifecycle handling, and failure monitoring are configured. Treat it as a later optional integration rather than making camps or announcements depend on Facebook.

### 12. Use configurable memberships with a conservative trial default

Admins configure membership name, duration, price, attendance entitlements, and active state; assignments, renewals, external payments, and corrections remain manual and audited until a separately specified payment integration exists. Configuration changes never rewrite historical periods.

Users self-register for trial access; guardians act for juniors. The default is one calendar month from successful registration with no default visit cap, replacing two visits/14 days. Managers configure duration and individual extensions at runtime. Month-end dates clamp to the last valid day and default changes do not rewrite existing periods. At the recorded trial end, queue a player/guardian reminder then a current membership-team follow-up without making team delivery depend on recipient delivery. Suppress stale messages after extension/conversion; retain audit/idempotency.

Leeside's default is player/guardian expiry email plus one consolidated summary per current authorized management recipient at the close of the inclusive expiry date, processed at 00:00 Europe/Dublin the next day. Advance 10/3-day reminders and daily attendance email are off by default and remain separately configurable. Renewal checks and current permissions are evaluated before queue/delivery with deduplication/retry. Membership/payment acknowledgement remains optional and is not a bank receipt or tax invoice.

### 13. Runtime configuration and QR/app-first pilot (latest decisions)

Roles, recipients, memberships, prices and future session schedules are runtime settings, not a fixed roster/catalogue requiring prior answers or redeployment. Permission revocation applies on subsequent server requests, regardless of cached UI or existing sign-in sessions. Preserve historical membership assignments when products change. Seed the owner-confirmed five-session timetable and Wix public contacts; values remain editable and absent source fields remain blank. The owner manages the Leeside domain through the Leeside Gmail contact account.

QR and direct app session-time attendance are the current pilot path. The person selector offers the authenticated adult where eligible and actively linked children, each explicitly selected. Direct app presence is self-declared, not independently location-verified; QR is a rotating challenge, not absolute proof of location. A separate Not attending response can be submitted from home, including before session time; it never adds visits, cancels bookings automatically or silently erases an existing attendance. NFC/card equipment is deferred and the earlier physical-card descriptions are optional future paths. The current venue QR implementation does not yet implement direct app presence, availability or the new expiry emails.

Owner-led testing can start without recruiting a broader club pilot team; scheduling that team is parked and is not a prerequisite to continued development. Automated checks, secure access and appropriate private-data handling remain production requirements. Trial policy and safeguarding/privacy decisions remain open as listed in the decision register.

## Risks / Trade-offs

### Table-wise practice reservations (approved 2 November 2026; implementation pending)

Cross-channel integration explicitly includes table/hall operations, communication and membership management. Both pilot entry points use shared canonical APIs and permission checks. Open booking screens subscribe to permitted changes or use bounded polling, refetch after reconnect and reconcile ambiguous requests through idempotency/status lookup. Database constraints remain authoritative even if client availability is stale. Hall operations cover hours, closures and table allocation; externally bookable whole-hall rental is not yet approved.

Use club-scoped table resources, recurring/date-specific availability and dated allocations rather than just decrementing an integer capacity. Three published tables represent three separate reservable resources for an hour. Support player, verified guest and guardian-for-child requests. The retained Leeside website and app use the same backend via a shared component or app booking route, avoiding independent website booking inventories.

The lifecycle is pending approval (provisional resource hold), confirmed, rejected, expired, withdrawn or cancelled. A pending hold blocks the exact table/time until its configurable timeout, bounded by the slot start. Approval converts the hold, leaving the other two tables available in the three-table example. Use database-enforced non-overlapping time ranges per table, transactional state changes, request idempotency and optimistic concurrency for maintainer decisions. Rejection/withdrawal/expiry/cancellation releases allocation. Reschedule acquires a new allocation atomically or retains the old booking. Resource conflicts with training/camps/tournaments cannot be bypassed by a generic warning override.

Maintainers receive a shared in-app request queue plus email alerts through the existing outbox; their configured Gmail is a recipient, not an approval credential. Protected approval links require sign-in and current club booking-management permission. Notify requesters/guardians of all relevant status transitions and expose delivery failures without losing the canonical request. Public availability contains no requester/child identities. Date/times use Europe/Dublin and fee/payment recording stays manual. A table reservation offers practice access, not an implied coaching lesson; actual arrival is recorded separately through the attendance workflow.

- [Independent websites can drift from app events] → Use stable app links; implement explicit public-feed connectors when desired and never imply automatic private-data synchronization.
- [Player reflections can be mistaken for measured weaknesses] → Show self-reported provenance, denominators and separate coach conclusions; preserve external result provenance and club privacy.

- [Free services can pause, throttle, change limits, or provide no production SLA] → Monitor usage and availability, keep exports, and define thresholds for moving to paid service before member reliance grows.
- [A free Supabase project may pause after low activity] → Expect normal club usage to keep it active, monitor owner warnings, and budget an upgrade if uninterrupted availability becomes essential.
- [PWA behavior is less consistent on iOS than a native app] → Test installation, camera permission, and offline scanning on target iPhones; retain manual check-in and plan a native client only if evidence supports it.
- [NFC cards and printed QR codes can be shared or copied] → Use revocable random credentials, show the member's name/photo only to the authorized operator after a scan, retain scanner/time audit data, and allow reviewed corrections; this is attendance evidence, not high-security access control.
- [Web NFC is limited mainly to compatible Android Chrome devices and NDEF tags] → Standardize and test one club-owned Android kiosk model, retain camera QR as a complete fallback, and avoid relying on members' devices.
- [Venue connectivity may be weak] → Provide a bounded offline queue, visible sync state, idempotent writes, and manual reconciliation.
- [A five-day auto-approved result may contain an unnoticed error] → Notify every eligible opposing reviewer, send one reminder, retain the approval source and deadline, and allow a coach to intervene with full audit history.
- [Delegated player organizers could gain excessive access] → Use tournament-scoped permissions, individual identities, revocation, server-side authorization, and denial tests for club administration and other tournaments.
- [Private coach notes create sensitive records] → Minimize content, tightly restrict access, log access/changes where appropriate, define retention, and train club staff.
- [Multi-club identities and club-scoped roles add authorization complexity now] → Test every permission with both allowed and cross-club denial cases; defer multi-club onboarding, billing, branding, and national discovery while preserving the identity and relationship model.
- [Email delivery is still an external dependency] → Use authenticated club-domain sending, process bounces, expose failures, and allow admins to correct addresses and retry safely.
- [Free infrastructure is not actually zero-cost over the product lifetime] → Present the pilot as near-zero hosting cost and maintain a transparent scale-up budget rather than promising permanent free operation.

## Migration Plan

1. Configure separate app development/production environments and agree the independent website URL and club-domain ownership.
2. Create the Supabase project in West EU (Ireland), apply versioned migrations and row-level-security tests, and configure encrypted external backups.
3. Deploy the national PWA to a Cloudflare preview address and connect its product domain after acceptance; retain Leeside's current independent website while adding app links.
4. Verify the sending domain with Resend and test renewal and account emails with non-member test addresses.
5. Import approved app club details, timetable, membership types and member data using dry-run reports; independent website pages are not automatically imported or replaced.
6. Pilot accounts, NFC/QR cards, kiosk scanning, expired-membership handling, attendance correction, dashboard totals, daily digest, a league and knockout tournament, delegated organizer access, opponent review/auto-approval, and coach dispute resolution with a small staff/member group.
7. Separately plan extraction of the legacy website prototype only if Leeside chooses a replacement website; app onboarding does not require a Wix DNS cutover.
8. Roll back the app release and disable external integration links if needed; use approved restore procedures for data recovery without changing independent website hosting.

### Tournament reflections implementation design (approved scope; not implemented)

Separate a selectable competition event from a managed tournament engine. News and calendar records reference a stable event ID; external competitions need no local fixture/session. Proposed migrations add event provenance and match score completeness, participant-owned reflections, stable club tag definitions, category-tag assignments and revision metadata. Existing match/review/notification tables remain canonical; external result provenance must not be forced into the confirmed state or silently change standings.

At submission the server checks whether any opposing player has an active player relationship in the recording club. Same-club matches retain the five-day review/coach workflow, even if paid membership expired; unclaimed opponents create staff follow-up. Otherwise save immediately as player-reported with no approval dependency. A minimal guest name is sufficient for an external opponent; do not require their contact details or expose their unrelated memberships. Edits to submitted reported results retain revisions. Selecting a managed fixture reuses its match ID; retries use idempotency keys and likely duplicate entries prompt review.

Reflection categories are Worked well and Needs work; default tags are forehand, backhand, serving, serve receive, chopping, blocking, footwork, spin reading, placement and tactics, with optional notes up to 2000 characters. One participant's reflection is not visible to the opposing score reviewer. Coaches may manage tags and group counts by event/date/player/training group, showing reporting-player and match denominators. Count each player-match-tag-category once, exclude missing responses from conclusions, separate result provenance and exclude incomplete outcomes from completed-match statistics. Coach goals remain deliberately human-authored and private working notes remain separate. RLS tests must cover guardian access, cross-club denial, opponent privacy, retired tags, duplicate correction and aggregate refresh after edits/removal.

## Open Questions

- Nominate the Leeside admin recipients for expired/no-membership work items and identify who owns follow-up; daily attendance email is initially disabled.
- NFC/card purchases and broader pilot participant scheduling are parked; no dedicated scanner purchase is required for the QR/app-first pilot.
- Membership names/prices/entitlements, staff grants and recipient lists are runtime admin configuration and not outstanding product decisions blocking implementation.
- Trial policy is finalized at a configurable one-month default; management may configure eligible sessions and extensions later.
- Define the permitted best-of match formats, league win/loss points, tie-break order, knockout seeding options, and whether league pairings play once or multiple times.
- Approve the membership-update email wording, default state of its admin checkbox, sending identity, and monitored reply-to mailbox.
- Define who can view private coach notes, their retention period, and whether a second coach/admin review is needed before publishing a junior summary.
- Confirm the club's legal entity/domain owner, trained Club Children's Officer, Designated Liaison Person, privacy contact, and approved data-import source.
- Approve or amend the provisional retention schedule with Leeside's privacy/legal adviser and decide the historical/public treatment of match results and photographs.
- Public-content reuse and Wix contact defaults are approved and the five session times are finalized; admins retain runtime edit control.
- Choose the national platform app's product name, logo, and product domain before public promotion; founder ownership is confirmed and the identity must remain distinct from Leeside's club brand.
- Decide whether phase-two automated Facebook Page publishing justifies a Meta app; the pilot uses manual Page sharing plus public feeds and email invitations.
- Decide whether check-out time is needed later; the first release records arrival only.
