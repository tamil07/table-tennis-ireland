# Decisions and open items

Last reconciled: 1 November 2026. Detailed implementation work remains in the OpenSpec `tasks.md`; external setup remains in `ACTION_ITEMS.md`.

## Closed decisions

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

- Trial players: a new applicant gets limited try-out access, not paid membership. Proposed rule: up to two attended eligible sessions within 14 calendar days from trial activation, ending at the first exhausted limit. Missed sessions do not use visits. Juniors use a guardian, admins may extend with an audited reason, and later attendance is still recorded with membership follow-up rather than discarded. This rule needs owner approval and remains configurable.
- Retention: unsuccessful applications 12 months; attendance/bookings/general notification and audit logs 24 months; private coach notes 12 months after leaving/supersession; membership/payment records 7 years; credential revocation evidence 24 months; encrypted backups 35 days.
- Safeguarding contacts: at least one trained Club Children's Officer, a Designated Liaison Person, and a public privacy/data-protection contact. Use role contact addresses where possible.
- NFC purchase guidance below is optional future reference, not a pilot action.

## Open items requiring the owner or Leeside

1. Create platform/Leeside Gmail accounts as needed with MFA/recovery; create Supabase, Cloudflare and Resend accounts/projects. Configure Google OAuth later. Put secrets directly into approved provider settings.
2. Choose the national app name and domain, and buy/connect the Leeside domain under the owner-managed Leeside account.
3. Accept or change the proposed two-attendances/14-day trial policy and trial-eligible sessions; this can be configured by admins.
4. Safeguarding: nominate the Club Children's Officer/Designated Liaison Person or confirm existing appointments, the contact for concerns and guardian-verification/escalation procedures. These protect juniors and define who acts on concerns; they are separate from ordinary membership permissions. Reference: https://tabletennisireland.ie/safeguarding/
5. Privacy: identify the club/platform data responsibilities and privacy contact; approve what member/child data is collected, who can access coach notes/reflections, retention/deletion periods and how people request access/correction. Public-photo reuse permission does not settle private member-data handling. Reference: https://www.dataprotection.ie/en/organisations/know-your-obligations
6. Operational configuration when ready: sender/reply-to and acknowledgement wording/default checkbox; match formats, league points/tie-breaks, seeding and guest-data rules. Names/roles, membership products, attendance-email recipients and non-timetable session settings can be added/changed in the admin UI and are not prerequisite answers for development.

## Parked owner activities

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
