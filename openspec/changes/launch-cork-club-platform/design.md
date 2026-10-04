## Context

Leeside Table Tennis currently has a temporary Wix site publishing news, calendar, policies, club information, five weekly sessions, and flexible full, partial, and pay-as-you-go membership. The replacement must add authenticated club operations, work well on phones and computers, and remain inexpensive during a one-club pilot. The website is specifically Leeside's branded property; the app is a separately branded Ireland-wide product that happens to launch with Leeside as its only club. The Leeside implementation is also the template and learning base for future club-branded websites connected to the same national platform.

The system will hold adult and junior personal data, guardian relationships, membership/payment metadata, attendance, local match results, and coaching information. The initial architecture therefore needs strong authorization, auditability, recoverability, and explicit club data boundaries even though only Leeside is active.

## Goals / Non-Goals

**Goals:**

- Deliver a Leeside-branded public website and a separately branded installable platform app from shared foundations, with a reusable domain-mapped website portfolio for future clubs.
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

### 1. Separate the club website from the national-platform app

Use a monorepo with two frontend applications and shared packages:

- A multi-tenant club-website application that initially serves the Leeside domain and later resolves each verified club domain to that club's branding, public portfolio, and authenticated administration context.
- A neutrally branded Ireland-wide platform app on its own product domain, containing member, guardian, coach, admin, match, and scanner experiences. During the pilot its club directory contains only Leeside.
- Shared design primitives, domain types, API client, validation, and authentication/session handling, without forcing the two products to share logos, names, navigation, or page layout.

Both frontends use the same backend and canonical club-scoped records, so an admin never maintains separate website and app copies. The website resolves a trusted hostname through a `club_domains` mapping before requesting that club's public content and permitted admin context. The app requests data within an explicit selected club context.

The platform app presents a My Clubs list derived from the signed-in person's club relationships. A player belonging to Leeside and a Dublin club sees two entries under one identity, each with its independent membership, roles, attendance, matches, tournaments, coaching data, communications, and verified website link. Switching context changes authorization and presentation; it does not sign the user into a different account.

An admin may enter management through their branded club website or the national app. Both routes call the same APIs, enforce the same club-scoped permissions, and edit the same records. A person who administers two clubs must explicitly switch context and receives no cross-club access merely because they are an admin elsewhere.

Alternatives considered:

- One Leeside-branded application for everything: simplest initially, but creates the wrong national identity and a costly rebrand/migration when other clubs join.
- Completely separate systems or repositories per club: preserves branding but duplicates data, authentication, permissions, fixes, and maintenance and makes cross-club player identity unreliable.

### 2. Ship the platform app as an installable Progressive Web App first

Build the app as a responsive TypeScript PWA with a web app manifest, service worker, install prompt guidance, offline scanner queue, and camera access. The app supports phones, tablets, laptops, and desktops while the Leeside website remains a conventional responsive web experience.

This gives Android, iPhone, tablet, laptop, and desktop access without separate application codebases or store accounts. A native application can later be built with Expo/React Native against the same backend APIs if PWA limitations or national distribution justify it. Apple App Store distribution is deliberately deferred because Apple currently requires a paid developer membership.

Alternatives considered:

- Separate native iOS and Android apps: better store presence and deeper device integration, but significantly more build, review, maintenance, and distribution cost for an unproven pilot.
- A thin native wrapper around the website: adds store overhead without enough first-release benefit.

### 3. Use hosted frontends plus managed authentication and PostgreSQL

Recommended pilot services:

- Cloudflare Pages/Workers for both frontend deployments: the Leeside site on the purchased club domain and the platform PWA on a separate product domain or free preview subdomain during discovery.
- Supabase Free in the specific West EU (Ireland) region for PostgreSQL, authentication, row-level security, and small file storage.
- Resend Free for password, renewal, cancellation, and other transactional emails sent from the club's domain.
- Supabase Cron (`pg_cron`) invoking TypeScript Edge Functions for renewal reminders, five-day match auto-approval, daily attendance digests, notification retries, and housekeeping.

Supabase is preferred over building directly on Cloudflare D1 because managed authentication, relational PostgreSQL, row-level security, and an admin-friendly data platform reduce security-sensitive custom work. A Cloudflare-only design remains a future cost-optimization option.

The free tiers are suitable for a small active pilot, not a permanent availability guarantee. At design time, official limits include two Supabase free projects, 500 MB database size, 1 GB file storage, 50,000 monthly active users, and 5 GB egress; low-activity free projects can be paused. Cloudflare Workers Free permits 100,000 requests per day. Resend Free permits 3,000 transactional emails per month and 100 per day. Usage alerts and an upgrade decision threshold must be configured before launch.

Official references:

- https://supabase.com/docs/guides/platform/billing-on-supabase
- https://supabase.com/docs/guides/platform/free-project-pausing
- https://supabase.com/docs/guides/platform/regions
- https://developers.cloudflare.com/workers/platform/limits/
- https://resend.com/pricing
- https://developer.apple.com/programs/whats-included/
- https://support.google.com/googleplay/android-developer/answer/6112435
- https://expo.dev/pricing
- https://developers.cloudflare.com/r2/pricing/

#### Pilot deployment topology

Keep all source in this monorepo but deploy independent targets:

| Target | Address | Service | Initial tier |
| --- | --- | --- | --- |
| Leeside website | Purchased Leeside club domain | Cloudflare Workers Static Assets | Free |
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

When another club is onboarded, its verified custom domain points to the same club-website deployment. The trusted domain mapping selects that club's portfolio and branding; it does not require another source repository, backend, or copy of the member database. A platform-managed club subdomain can be offered until that club connects its own domain.

Multi-club provisioning is controlled by the platform operator at first: create the club record and unique slug, verify its domain, configure its initial portfolio, and invite its first club admin. Self-service onboarding, club billing, and automatic domain setup remain later product work. Once provisioned, the club's admins maintain their own portfolio and operations without platform-wide access.

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

A plain in-app “Check in” button is deferred because it does not establish venue presence and does not work equitably for children without phones. If adult self-check-in is later justified, the safer extension is a short-lived rotating venue QR that an authenticated member scans; the physical card remains the universal method.

### 7. Model attendance as session occurrences

Recurring timetable definitions generate dated session occurrences. Attendance attaches to a dated occurrence rather than only to a weekday schedule. This handles public holidays, cancellations, exceptional sessions, and historical timetable changes without rewriting past attendance.

Reports aggregate visits, unique attendees, membership status at check-in, session utilization, and date-range trends. The dashboard supports daily, weekly, monthly, and custom groupings; active versus approaching-expiry versus expired/no-membership segmentation; and a staff-only top-attendee ranking. Raw member-level attendance is limited to authorized staff and the relevant player/guardian.

A scheduled daily digest uses the club's timezone and configurable recipients/time. It summarizes sessions, total and unique attendance, membership-status segments, unresolved membership alerts, and scanner synchronization failures. Member-level details remain behind an authenticated dashboard link rather than being placed in email.

### 8. Use state machines for membership, matches, and notifications

Membership moves through explicit states such as pending, active, expired, and cancelled. An authorized admin manually records an externally received payment against a specific membership and sets its start/end dates and status. Payment status (`unpaid`, `partially_paid`, `paid`, or `waived`) remains separate from membership validity and attendance so players can attend before payment is reconciled. The system stores amount, EUR currency, date, method, external reference/note, and confirming admin but never personal bank credentials. Corrections are audited. Recording or correcting payment queues a non-formal acknowledgement to the adult player or junior's designated guardian; it is not represented as a tax invoice or bank-issued receipt. Renewal processing can enable 10-day, 3-day, or both reminder points and uses a unique membership/reminder-stage key to prevent duplicates.

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

## Risks / Trade-offs

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

1. Register the club domain and configure separate development and production environments.
2. Create the Supabase project in West EU (Ireland), apply versioned migrations and row-level-security tests, and configure encrypted external backups.
3. Deploy the Leeside website and separately branded platform PWA to Cloudflare preview addresses; attach the club domain only to the Leeside site after acceptance.
4. Verify the sending domain with Resend and test renewal and account emails with non-member test addresses.
5. Import current public pages, policies, timetable, membership types, and approved member data using a dry-run report before any live import.
6. Pilot accounts, NFC/QR cards, kiosk scanning, expired-membership handling, attendance correction, dashboard totals, daily digest, a league and knockout tournament, delegated organizer access, opponent review/auto-approval, and coach dispute resolution with a small staff/member group.
7. Run the new site alongside Wix during acceptance, then point the club domain to the new deployment. Keep the Wix content available until the club signs off.
8. Roll back by restoring DNS to the previous public site and placing operational features in read-only mode; restore the database from the tested export if data rollback is required.

## Open Questions

- Confirm which admin recipients receive immediate expired/no-membership alerts in addition to the daily digest and who owns follow-up.
- Select and test the club-owned NFC Android kiosk device and exact NDEF card/tag stock before purchasing cards in bulk.
- Define membership prices, durations, entitlement rules, and how pay-as-you-go attendance is represented.
- Define the permitted best-of match formats, league win/loss points, tie-break order, knockout seeding options, and whether league pairings play once or multiple times.
- Approve the wording and sender identity for the non-formal manual-payment acknowledgement email.
- Define who can view private coach notes, their retention period, and whether a second coach/admin review is needed before publishing a junior summary.
- Confirm the club's legal entity/domain owner, safeguarding contact, privacy contact, and approved data-import source.
- Choose the national platform app's product name, logo, product domain, and ownership before public promotion; these must remain distinct from Leeside's club brand.
- Decide whether check-out time is needed later; the first release records arrival only.
