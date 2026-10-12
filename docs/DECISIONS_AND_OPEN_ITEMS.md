# Decisions and open items

Last reconciled: 12 October 2026. Detailed implementation work remains in the OpenSpec `tasks.md`; external setup remains in `ACTION_ITEMS.md`.

## Closed decisions

- Leeside Table Tennis is the single production pilot club.
- The founder personally owns the national platform, brand, repository, and shared cloud-service setup. A separate Gmail address is the contact and recovery mailbox, not the legal owner. It must use MFA and recovery methods.
- Trusted platform owners receive individual provider access; contributors propose repository changes through PRs and authorized maintainers merge them.
- Leeside manages branding, photographs, club records, marketing messages, calendar events, sessions, camps, and sharing through its own management group. Members sign in individually; authorized club admins invite/remove members and assign scoped admin, content, event, and communications permissions. Club roles do not grant cloud, repository, or other-club access.
- Authentication supports email/password, email magic link, and optional Google sign-in. Any valid email provider works; phone OTP/SMS is deferred.
- Automated email uses Resend with a verified club/platform domain. Gmail may be the monitored reply-to mailbox, not the automated sender.
- Leeside has five recurring weekly session definitions. Admins can add one-off sessions and bounded programmes such as seven-day camps.
- Public events publish to the website, RSS/Atom, and iCalendar. Email invitations are separate and consent-aware.
- Facebook Page automation is not a pilot dependency. The pilot provides a canonical link/share copy for manual posting; a Meta integration can be evaluated later.
- Admins configure membership types, prices, duration, attendance entitlements, and active state without deployment. Assignments, renewals, and external payments are manual and audited; Stripe is future scope.
- Leeside initially sends one membership-expiry email 10 days before expiry. Admins retain the ability to choose the 3-day stage or both later.
- Daily attendance email is disabled initially to reduce noise; the dashboard and work queue remain available.
- The membership/payment update form contains an email-acknowledgement checkbox. Email is sent only when selected and is not a bank receipt or tax invoice.
- Coaches/admins can create an ad hoc league or knockout tournament from that day's checked-in players and manage it on a phone.
- The attendance kiosk remains a club-controlled NFC-capable Android phone/tablet with camera QR fallback; custom hardware is out of scope.

## Recommended defaults awaiting Leeside approval

- Trial players: two attended trial sessions within 14 days, only at trial-eligible sessions; juniors require a guardian and extensions require an audited reason.
- Retention: unsuccessful applications 12 months; attendance/bookings/general notification and audit logs 24 months; private coach notes 12 months after leaving/supersession; membership/payment records 7 years; credential revocation evidence 24 months; encrypted backups 35 days.
- Safeguarding contacts: at least one trained Club Children's Officer, a Designated Liaison Person, and a public privacy/data-protection contact. Use role contact addresses where possible.
- NFC purchase: a test batch of 25–50 rewritable NDEF-compatible NTAG213 PVC cards (13.56 MHz, ISO/IEC 14443-A) plus printed QR identifiers; use an existing NFC-capable Android phone/tablet before buying a dedicated reader.

## Open items requiring the owner or Leeside

1. Confirm the Leeside domain's registered holder and any transfer arrangement; choose the national platform name. Founder ownership of the platform/repository/shared infrastructure is closed.
2. Create the dedicated Gmail contact account, enable MFA/recovery, and nominate trusted platform owners with individual provider access.
3. Create development/production Supabase projects, Cloudflare, Google Cloud OAuth, and Resend accounts; secrets must go directly into their secret stores.
4. Buy/confirm the Leeside domain and later choose the separate national platform domain.
5. Confirm the public phone number, preferred club email, exact venue wording, social accounts, and Wix content/media reuse rights.
6. Confirm the five timetable entries, audiences, capacities, booking deadlines, and trial-eligible sessions.
7. Supply actual membership type names, EUR prices, durations, entitlements, and pay-as-you-go rules.
8. Accept or change the proposed two-visit/14-day trial rule.
9. Approve the membership-update email wording, default checkbox state, sender name, and reply-to mailbox.
10. Nominate Leeside's initial management-group admins and their permissions, plus membership-alert owners; daily attendance email is off initially.
11. Define match formats, league points/tie-breaks, knockout seeding, and guest-data rules.
12. Nominate the Club Children's Officer, Designated Liaison Person, and privacy contact; approve privacy/consent/safeguarding wording.
13. Approve or amend the provisional retention schedule, especially photographs and public match/tournament history.
14. Select the exact Android kiosk already available at the venue and test a small card batch before bulk purchase.
15. Decide whether checkout/departure time is needed; arrival-only remains the first-release assumption.

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
