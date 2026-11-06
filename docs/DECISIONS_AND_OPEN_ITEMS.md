# Decisions and open items

Last reconciled: 6 November 2026. Detailed implementation work remains in the OpenSpec `tasks.md`; external setup remains in `ACTION_ITEMS.md`.

## Closed decisions

- Wix migration is not complete: deployed site is a landing demo, separate app deployment and player/membership screens remain pending. See [Wix migration and member portal plan](WIX_MIGRATION_AND_MEMBER_PORTAL_PLAN.md) for missing pages, actual source-backed fees, delivery phases and user entry points. Supabase setup remains paused; neither content inventory nor schema foundation proves a finished import or live member portal.
- Cloudflare website build/deployment fixed and verified: commit `8484e83`, successful build `af21ba36-d5ea-4df0-9eba-7d87a70e2fe2`, live demo https://table-tennis-ireland.ttclubsie.workers.dev. Production/preview commands now use root scripts and explicit Worker assets config on Node 22. HTTP/asset-hash/SPA checks passed; prior failure observations below are historical. Platform-app deployment, business workflows and Supabase setup remain pending/paused as applicable.
- Cloudflare account is created and read-only API inspection succeeded: account `6502a73494f4ee7107b36c620ee76471`, subdomain `ttclubsie`, Worker `table-tennis-ireland`. Website build failed because Cloudflare uses `@ttti/club-web` instead of `@tti/club-web`; deploy target `Leeside-web` also differs from the actual Worker. The current deployment is a starter template, not the repo website. Fix/retry and preview verification remain pending; see [deployment plan](CLOUDFLARE_DEPLOYMENT_PLAN.md). No token is stored in repository documentation and no Cloudflare settings were changed during inspection.
- Supabase setup confirmed by owner: GitHub administrator sign-in; organization **TT Clubs Ireland**; project **ttclubs**; reference **mkxqrkqwpvjtkjfjjckm**; URL **https://mkxqrkqwpvjtkjfjjckm.supabase.co**; assigned region **eu-north-1 (Stockholm, Sweden)**. Frontend publishable key supplied but omitted here. Plan, backend connection and access-control completion remain pending. Start with this one hosted project plus local synthetic development; a second hosted environment is deferred. Passwords/secrets are excluded from repository documentation.
- Pilot website/app synchronization: one canonical backend for table/hall operations, communication and membership management. Open booking screens automatically refresh; reconnect reloads authoritative state and backend conflict checks prevent double booking even with stale screens. Hall hours, closures, maintenance and table allocations are included; exclusive public whole-hall rental is not yet requested/approved. Implementation remains pending.
- Table-wise practice booking: maintainers publish specific tables/hours (for example three tables for one hour). Players, verified guests and parents for linked children submit requests through the app or Leeside website. Maintainers receive an in-app queue plus email alerts at configured addresses, including Gmail, and approve after sign-in. A provisional hold blocks the requested table/hour; approval confirms it while other tables remain available. Rejection/withdrawal/expiry releases it; no double booking. Hold timeouts, availability, guest rules, manual fees and cancellation policy are editable. Booking remains separate from actual attendance and does not imply coaching. Feature implementation is pending, not a new account-setup prerequisite.
- Trial policy finalized: verified self/guardian registration starts a one-calendar-month trial by default with no default visit cap. Management can change duration or extend individuals at runtime. At the recorded trial end notify player/guardian then the membership team, with stale-message suppression and duplicate prevention.
- Safeguarding/privacy contacts, policies and approved retention/access settings are management-maintained runtime configuration. Supplying them is delegated operational setup, not a prerequisite questionnaire for development; accurate published information and access controls remain required before relevant live-data use.
- Owner confirmed both Gmail accounts created on 4 November 2026: **leesidettie@gmail.com** for Leeside contact/reply-to and domain-account contact; **ttclubsie@gmail.com** for the national platform and cloud account registration/contact. Gmail receives replies; Resend still sends automated messages through a verified domain. MFA/recovery and provider connections remain unconfirmed.
- Tournament settings are configured per internal competition by its coach/organizer. External event logs need event/opponent/format/score and reflections, without rebuilding external fixtures, points tables or seeding. Neither requires advance rules answers to continue development.
- The owner confirms consent to reuse Leeside public content, branding and photographs (1 November 2026); reuse permission is closed, while source accuracy and final publication selection remain separate.
- Leeside's group permissions and membership catalogue are runtime settings: authorized admins grant/revoke access immediately for subsequent server requests and permitted managers add/change membership products and player assignments at any time. A complete staff roster or catalogue is not a development/deployment prerequisite. Implementation remains pending; the owner bootstraps the initial admin.
- Latest pilot sequencing decision: keep the current Leeside website/app/backend layout and build targets for at least one year of live operation. Separate website repositories are a future review only after that period and once more than two clubs participate (three or more). No immediate extraction or automatic migration is planned; this exception supersedes the app-only deployment timing below.
- The platform repository hosts the national app/shared backend only. Club websites may have separate repositories and hosting, integrating through approved HTTPS website URLs, stable app routes and optional public feeds. No per-club app/backend fork or generic website-hosting service is planned. The existing website prototype remains until separately migrated.
- Tournament news/calendar entries link to stable internal/external event identities. Players/guardians can record results and personal strengths/improvement tags; external-opponent results are immediately player-reported, while same-recording-club opponents use existing review. Coaches receive private descriptive grouped summaries with reporting denominators, not automatic skill diagnoses. See the tournament-reflections OpenSpec capability.
- Phone users can scan a rotating club display QR and confirm self/linked-child attendance after sign-in. Physical NFC/QR cards and staff check-in remain alternatives. The code refreshes every minute and expires within 90 seconds; forwarding a live code remains possible.
- Leeside Table Tennis is the single production pilot club.
- The founder personally owns the national platform, brand, repository, and shared cloud-service setup. A separate Gmail address is the contact and recovery mailbox, not the legal owner. It must use MFA and recovery methods.
- Trusted platform owners receive individual provider access; contributors propose repository changes through PRs and authorized maintainers merge them.
- Leeside manages branding, photographs, club records, marketing messages, calendar events, sessions, camps, and sharing through its own management group. Members sign in individually; authorized club admins invite/remove members and assign scoped admin, content, event, and communications permissions. Club roles do not grant cloud, repository, or other-club access.
- Authentication supports email/password, email magic link, and optional Google sign-in. Any valid email provider works; phone OTP/SMS is deferred.
- Automated email uses Resend with a verified club/platform domain. Gmail may be the monitored reply-to mailbox, not the automated sender.
- The five Europe/Dublin sessions are finalized: Monday 18:00–20:00, Wednesday 20:15–22:15, Thursday 17:30–19:30, Friday 18:00–20:00, Sunday 12:45–15:30. Admins can modify future schedules and add camps at runtime without a code/OpenSpec change for ordinary configuration.
- Public events publish to the website, RSS/Atom, and iCalendar. Email invitations are separate and consent-aware.
- Facebook Page automation is not a pilot dependency. The pilot provides a canonical link/share copy for manual posting; a Meta integration can be evaluated later.
- Admins configure membership types, prices, duration, attendance entitlements, and active state without deployment. Assignments, renewals, and external payments are manual and audited; Stripe is future scope.
- Default expiry email goes to the player/guardian and current management recipients at the close of the inclusive expiry day (processed at 00:00 Europe/Dublin the next day). Management receives a consolidated summary; 10/3-day advance reminders are optional and off by default. Renewal checks, current-recipient permissions and deduplication apply.
- Daily attendance email is disabled initially to reduce noise; the dashboard and work queue remain available.
- The membership/payment update form contains an email-acknowledgement checkbox. Email is sent only when selected and is not a bank receipt or tax invoice.
- Coaches/admins can create an ad hoc league or knockout tournament from that day's checked-in players and manage it on a phone.
- QR/app attendance is the pilot path; NFC/cards and purchasing a dedicated scanner are deferred. Parents explicitly select self and/or linked children. Direct app presence during open sessions is self-declared, not location verified. Not attending can be submitted from home and is availability only, never attendance or automatic booking cancellation.
- Copy public contact/address/social defaults from the owner-approved Wix inventory; unknown fields stay empty and admins can edit them later.
- The owner manages the Leeside domain through the dedicated Leeside Gmail contact account; mailbox management does not itself define legal registrant ownership.
- Organizing a broader club pilot/testing team is parked; the owner can start testing alone. This is not a blocker to continued implementation; automated checks and safeguards before real-data use still apply.

## Recommended defaults awaiting Leeside approval

- Trial access is finalized above; the former two-visits/14-day recommendation is superseded.
- Retention: unsuccessful applications 12 months; attendance/bookings/general notification and audit logs 24 months; private coach notes 12 months after leaving/supersession; membership/payment records 7 years; credential revocation evidence 24 months; encrypted backups 35 days.
- Safeguarding contacts: at least one trained Club Children's Officer, a Designated Liaison Person, and a public privacy/data-protection contact. Use role contact addresses where possible.
- NFC purchase guidance below is optional future reference, not a pilot action.

## Open items requiring the owner or Leeside

1. Complete/confirm account MFA/recovery and database-password rotation. Supabase reference/URL/region are now supplied; next configure authenticated CLI access in the working environment, review/apply migrations and wire frontend configuration. Create Cloudflare/Resend accounts as pending. Supabase dashboard uses the owner's GitHub sign-in; app Google OAuth comes later. Keep secrets in approved provider settings.
2. Choose the national app name and domain, and buy/connect the Leeside domain under the owner-managed Leeside account.
3. Connect/verify the automated sending domain and configure leesidettie@gmail.com as Leeside contact/reply-to; provider setup and delivery testing remain required, but the mailbox address is no longer pending.

Management can add policy contacts/text, approved data-handling settings, membership products, staff access and internal tournament settings through admin configuration. These are delegated setup activities, not unresolved feature approvals or development blockers.

## Parked owner activities

- Supabase setup ONLY is paused at the owner's request (5 November 2026): hosted connection/authentication troubleshooting, remote migration preview/application and further setup are deferred. CLI temporary-role connection timed out; a corporate firewall is suspected, not confirmed. Resume by checking authorized network access or choosing an approved migration path, then dry-run/review before application. Existing project metadata/local frontend configuration are retained; no live database migration is claimed complete. This pause does not pause UI work or other project implementation.
- Broad pilot participant recruitment and club test scheduling: owner will return to this later and can test alone initially.
- Physical NFC/cards/scanner purchase: deferred; use QR/app attendance first.
- Website repository split: review only after one live year and more than two clubs.
- Checkout/departure tracking: future scope; arrival-only remains current.

## NFC purchase specification for India

Buy only a small pilot batch until the exact Cork kiosk device passes testing:

- 25–50 white PVC NTAG213 cards or durable key fobs, explicitly NDEF-compatible and rewritable.
- 13.56 MHz ISO/IEC 14443-A; avoid 125 kHz RFID cards and avoid MIFARE Classic-only stock.
- At least 144 bytes usable memory; enough for the platform's opaque URL/token.
- Vendor should provide a sample and confirm each card has a distinct chip and can be NDEF formatted.
- Add printed QR codes as the universal fallback. Do not print names, email addresses, or membership state into either credential.
- Do not permanently lock tags during the pilot; credentials must remain revocable and replaceable in the backend.
- Do not buy a USB reader yet. First test a powered, secured Android device with NFC, a rear camera, current Chrome, Wi-Fi, and kiosk/managed-screen support.

Avoid bulk purchases, custom card printers, turnstiles, Raspberry Pi readers, and access-control-grade smart cards until the simple phone/card pilot provides evidence that they are necessary.
