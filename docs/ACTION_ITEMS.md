# Remaining actions and account setup

This is the handoff checklist for moving the synthetic foundation into a live Leeside pilot. Do not load real adult or junior data until the security, privacy, safeguarding, and recovery gates are complete.

The concise decision register and current owner questions are in [DECISIONS_AND_OPEN_ITEMS.md](DECISIONS_AND_OPEN_ITEMS.md). Public Leeside details gathered from the temporary Wix site are in [LEESIDE_CONTENT_INVENTORY.md](LEESIDE_CONTENT_INVENTORY.md).

**Owner** means the product/club owner must create an account, buy or approve something, supply policy information, or make a business decision. **Development** work is also tracked in OpenSpec.

## 1. Ownership and security

- [ ] **Owner:** Confirm the legal owner of the Leeside domain and the owner of the national platform brand, repository, cloud services, backups, and future store accounts.
- [x] **Owner decision:** A new shared Gmail account may own the pilot Cloudflare, Supabase, Resend, and Google Cloud accounts initially; migrate to a platform role mailbox after a domain is available.
- [ ] **Owner:** Enable MFA and securely store recovery codes for GitHub, domain registrar, Supabase, Cloudflare, Resend, and Expo.
- [ ] **Owner:** Give at least two trusted owners recovery access without sharing passwords.
- [ ] **Owner:** Choose the national product name and check domain/brand availability before promotion.

## 2. GitHub

- [ ] **Owner:** Confirm `github.com/tamil07/table-tennis-ireland` is the intended long-term repository and ownership is appropriate.
- [ ] **Owner:** Add maintainers with minimum required access.
- [ ] **Owner:** Protect `main` with pull requests, the `Quality` check, and review once a second contributor joins.
- [ ] **Owner:** Enable secret scanning and dependency alerts where available.
- [ ] **Development:** Keep deployment credentials in GitHub/hosting secrets, never in source or workflow text.

## 3. Supabase development and production

Create an account in the [Supabase dashboard](https://supabase.com/dashboard) and an organization owned by the platform owner.

- [ ] **Owner:** Create a **development** project in an approved EU region. It must contain synthetic data only.
- [ ] **Owner:** Create a separate **production** project in the same approved region. Never connect previews to it.
- [ ] **Owner:** Store database passwords and recovery information in a password manager.
- [ ] **Development:** Install the [Supabase CLI](https://supabase.com/docs/guides/local-development), link development, and apply `supabase/migrations`.
- [ ] **Development:** Put each project URL and anonymous/public key in its deployment environment. Keep the service-role key server-side only.
- [ ] **Development:** Configure exact Auth site and redirect URLs for local, preview, club, and platform domains.
- [x] **Owner decision:** Use email/password and email magic link as guaranteed pilot methods and offer optional Google sign-in. Any valid email provider is accepted.
- [x] **Owner decision:** Defer phone OTP and SMS delivery during the pilot; still capture mobile contacts independently.
- [ ] **Owner:** Create or select a platform-owned Google Cloud project, configure the OAuth consent screen, and nominate its recovery owners.
- [ ] **Owner/Development:** Create separate development and production Google OAuth client credentials and add the exact callback URLs supplied by Supabase.
- [ ] **Development:** Enable Google in each Supabase environment, store its client secret only in provider configuration, and retain email/password and magic-link fallbacks.
- [ ] **Development:** Test new Google users, existing email users, cancelled/failed OAuth, duplicate prevention, and assisted claims for existing unclaimed profiles.
- [ ] **Development:** Store email/mobile contacts separately, normalize mobile numbers to E.164, verify each independently, and prevent duplicate identities across both methods.
- [ ] **Development:** Keep person/player profiles separate from authentication so juniors and offline members do not need fabricated credentials.
- [ ] **Development:** Customize verification, invitation, recovery, and account messages with the neutral platform identity.
- [ ] **Development:** Create profiles after verified signup without accepting client-supplied roles.
- [ ] **Development:** Complete table-specific RLS policies and automated tests for visitor, player, guardian, coach, admin, scanner operator, and cross-club denial.
- [ ] **Development:** Prove that hostname, URL, slug, and client `club_id` never grant authorization.
- [ ] **Development:** Configure rate limits, bot controls where useful, and logs that do not contain sensitive content.
- [ ] **Owner:** Configure usage alerts and name the person who can authorize an upgrade.

References: [React quickstart](https://supabase.com/docs/guides/getting-started/quickstarts/reactjs), [Google OAuth](https://supabase.com/docs/guides/auth/social-login/auth-google), [local development](https://supabase.com/docs/guides/local-development), [RLS](https://supabase.com/docs/guides/database/postgres/row-level-security).

## 4. Domains and Cloudflare

Create a [Cloudflare account](https://dash.cloudflare.com/) under platform ownership.

- [ ] **Owner:** Purchase the Leeside domain; record its owner, renewal date, recovery contacts, and payment owner.
- [ ] **Owner:** Purchase a separate platform domain only after the national product name is approved.
- [ ] **Owner:** Add the Leeside DNS zone to Cloudflare or delegate the necessary records.
- [ ] **Development:** Create independent Workers Static Assets projects for `club-web` and `platform`.
- [ ] **Development:** Configure builds using `npm ci` and the relevant workspace build; publish each `dist` directory.
- [ ] **Development:** Point previews only to development Supabase and production domains only to production Supabase.
- [ ] **Development:** Attach the Leeside domain to `club-web`; use a temporary `workers.dev` platform address until its domain exists.
- [ ] **Development:** Implement verified-host lookup, unknown-host rejection, security headers, CSP, HTTPS, caching, and SPA fallback.
- [ ] **Development:** Configure availability/error monitoring and an alert owner.

Future clubs connect a verified domain or temporary platform subdomain to the same club-site deployment. They do not receive a code fork or separate database.

References: [Workers Static Assets](https://developers.cloudflare.com/workers/static-assets/), [custom domains](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/).

## 5. Resend transactional email

Create a [Resend account](https://resend.com/) under platform ownership.

- [x] **Owner decision:** Use Resend with a verified club/platform sending domain instead of a personal Gmail account for automated email.
- [ ] **Owner:** Choose a verified Leeside or neutral platform sending subdomain.
- [ ] **Owner/Development:** Add the exact SPF, DKIM, and verification DNS records supplied by Resend.
- [ ] **Development:** Put the API key only in a server/Edge Function secret, never in a Vite client.
- [ ] **Owner:** Approve sender, reply-to address, and wording for account, renewal, match review, digest, and non-formal payment messages.
- [ ] **Development:** Implement the notification outbox, retries, duplicate prevention, bounces, and admin delivery view.
- [ ] **Development:** Route junior messages to the designated guardian and keep sensitive detail behind authenticated links.
- [ ] **Owner:** Assign someone to monitor bounces and correct member addresses.

Reference: [Resend domains](https://resend.com/docs/dashboard/domains/introduction).

## 6. Scheduled work

- [ ] **Development:** Add versioned Supabase Edge Functions for renewal reminders, five-day match auto-approval, match reminders, attendance digests, notification retries, and housekeeping.
- [ ] **Development:** Schedule with Supabase Cron/`pg_cron`, respecting each club’s timezone.
- [ ] **Development:** Make jobs idempotent so retries cannot duplicate emails or approvals.
- [ ] **Development:** Add failure monitoring and an admin operations view.
- [x] **Owner decision:** Send one renewal reminder initially, 10 days before expiry; keep daily attendance email disabled to reduce noise.
- [ ] **Owner:** Confirm immediate expired/no-membership alert recipients and the follow-up owner.

## 7. Backup and recovery

- [ ] **Owner:** Create a private Cloudflare R2 bucket or another approved backup destination with separate ownership credentials.
- [ ] **Development:** Use a least-privilege backup credential and schedule encrypted logical PostgreSQL exports.
- [ ] **Development:** Export storage objects separately because a database dump includes only their metadata.
- [ ] **Owner:** Approve retention and deletion periods.
- [ ] **Development:** Restore into development, record the recovery time, repeat on schedule, and alert on failure.
- [ ] **Owner:** Upgrade before launch if free-tier pausing or recovery constraints are unacceptable.

## 8. Leeside data and operating rules

- [x] **Research:** Inventory the public Wix club name, venue, telephone, five published timetable entries, social links, news feed, and content surfaces without copying protected media.
- [ ] **Owner:** Confirm the inventoried address, phone, social links, safeguarding/privacy contacts, logo, colors, photos, and domain.
- [ ] **Owner:** Approve migration rights for temporary Wix content.
- [ ] **Owner:** Confirm five sessions, venues, times, audiences, capacity, booking eligibility, cancellation, and exceptions.
- [x] **Owner decision:** Admins can create and maintain membership types, prices, durations, entitlements, and active status; membership periods and external payments are assigned manually and audited. Online payments are future scope.
- [ ] **Owner:** Supply the initial membership type names, EUR prices, durations, entitlements, and pay-as-you-go rules.
- [ ] **Owner:** Define trial duration/visit allowance and the point when a permanent card is issued.
- [ ] **Owner:** Approve manual-payment methods, fields, correction authority, and acknowledgement wording. Never enter bank credentials.
- [x] **Owner decision:** Start with one 10-day expiry reminder; retain configuration for 3-day or both later.
- [x] **Owner decision:** Make the membership/payment-update acknowledgement email optional through an admin checkbox.
- [ ] **Owner:** Approve the acknowledgement wording, sender/reply-to, and default checkbox state.
- [ ] **Development:** Produce a dry-run member import report and get approval before any live import.
- [ ] **Owner:** Keep Wix available through acceptance and approve DNS cutover.

## 9. Attendance kiosk and cards

- [x] **Owner decision:** Pilot with a club-controlled NFC-capable Android phone/tablet and camera-based QR fallback; do not build custom scanner hardware initially.
- [ ] **Owner:** Select one secured, continuously powered NFC-capable Android device for the venue.
- [ ] **Development:** Test Web NFC, camera, screen wake, kiosk recovery, venue connectivity, sound, and accessibility on that exact device.
- [ ] **Owner/Development:** Buy a small test batch of NDEF-compatible cards/tags with printed QR; do not bulk-order before the pilot.
- [ ] **Development:** Use opaque, random, revocable credentials. Never encode names, emails, dates of birth, or membership status.
- [ ] **Development:** Restrict the kiosk account and never download the full member database to it.
- [ ] **Development:** Add duplicate prevention, session selection, feedback, offline limits, synchronization, and reconciliation.
- [ ] **Owner:** Define forgotten/lost-card, manual correction, guest, and kiosk opening/closing procedures.
- [ ] **Owner:** Print a separate public registration QR; it is not an attendance credential.

## 10. Match and tournament decisions

- [x] **Owner decision:** Coaches/admins can create mobile-first ad hoc league or knockout tournaments from that day's checked-in players and can check in missing participants.
- [ ] **Owner:** Approve best-of formats and win-by-two validation.
- [ ] **Owner:** Define result-entry/review eligibility, five-day reminder timing, change requests, and coach dispute ownership.
- [ ] **Owner:** Define retirement/incomplete display, league points, tie-breaks, repeated pairings, seeding, and bracket rules.
- [ ] **Owner:** Define permitted guest data and retention.
- [ ] **Development:** Test singles, doubles, guests, guardian review, auto-approval, edits, coach resolution, delegation expiry, and cross-club denial.

## 11. Privacy, juniors, and coaching

- [ ] **Owner:** Obtain appropriate Irish/EU privacy and safeguarding advice; this checklist is not legal advice.
- [ ] **Owner:** Approve privacy notices, lawful basis, consent, guardian verification, child safeguarding, acceptable use, and cookie behavior.
- [ ] **Owner:** Set retention periods for applications, memberships, payment metadata, attendance, credentials, matches, guests, notes, summaries, messages, audits, and backups.
- [ ] **Owner:** Decide who can read private coach notes and whether junior summaries need second review.
- [ ] **Owner:** Define access-request, correction, closure, incident, complaint, and safeguarding-escalation procedures and owners.
- [ ] **Development:** Keep private notes separate from published summaries and out of player/guardian APIs.
- [ ] **Development:** Implement data export, correction, and deletion/anonymization where permitted.
- [ ] **Development:** Complete a data-protection impact assessment before live junior tracking if advised.

## 12. Accessibility, security, and acceptance

- [ ] **Development:** Test keyboard use, focus, labels, errors, contrast, zoom/reflow, reduced motion, and screen readers.
- [ ] **Development:** Test current Safari/iPhone, Chrome/Android, and desktop browsers, including PWA installation/camera.
- [ ] **Development:** Threat-model account takeover, role escalation, cross-club access, leaked cards, kiosk theft, offline scan forgery, result tampering, email abuse, and backup exposure.
- [ ] **Development:** Add dependency/secret scanning, rate limits, headers, audits, and an incident runbook.
- [ ] **Development:** Pilot with synthetic users, then a small explicitly approved Leeside group.
- [ ] **Owner:** Sign off accounts, membership, payment, attendance, alerts, reports, digest, matches, tournaments, guardians, and coaching summaries.
- [ ] **Owner/Development:** Rehearse Wix DNS rollback, read-only operations, and backup restoration.

## 13. Native iOS and Android later

The first mobile release is the PWA. Native distribution should follow only if pilot evidence shows a meaningful limitation.

- [ ] **Owner:** Decide after the pilot whether store discovery, native push, or device APIs justify native apps.
- [ ] **Owner:** If approved, create organization-owned [Expo](https://expo.dev/), Apple Developer, and Google Play Console accounts.
- [ ] **Development:** Create Expo/React Native clients against the same APIs; do not fork business rules.
- [ ] **Owner:** Supply privacy disclosures, support URL, assets, age-rating answers, review accounts, and agreements.
- [ ] **Development:** Configure signed builds, secure credentials, submissions, staged rollout, and monitoring.

Reference: [Expo EAS Build setup](https://docs.expo.dev/build/setup/).

## 14. Onboard the next club

- [ ] **Owner:** Define onboarding agreement, support boundary, data responsibilities, and price before club two.
- [ ] **Development:** Build platform-operator-only provisioning for tenant, slug, verified domain/subdomain, branding, and first admin.
- [ ] **Development:** Run full cross-club tests with one person in both clubs and an admin in only one.
- [ ] **Owner:** Review hosting, email, database, backup, support, and availability costs before accepting club two.
- [ ] **Development:** Keep self-service onboarding, subscriptions, and billing outside the pilot unless separately specified.

## 15. Events and public distribution

- [x] **Owner decision:** Support five recurring weekly sessions plus one-off sessions and bounded programmes such as seven-day camps.
- [x] **Owner decision:** Publish public events through the website, RSS/Atom, and iCalendar; invitations by email are separate and consent-aware.
- [x] **Owner decision:** Provide canonical links and share-ready copy for manual Facebook Page posting in the pilot. Automated Meta posting is optional later and is not a launch dependency.
- [ ] **Owner:** Confirm session audiences, capacities, booking cut-offs, trial eligibility, and which recipients may receive event email invitations.

## Launch gate

Do not begin live member operation until ownership/MFA, RLS tests, privacy/safeguarding, retention, email monitoring, backups and restore, venue scanner testing, Leeside acceptance, and rollback are complete. The release commit must pass both `npm run check` and `openspec validate launch-cork-club-platform`.
