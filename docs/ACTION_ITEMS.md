# Remaining owner actions

Updated 7 November 2026. **Execute [PERSONAL_LAPTOP_LAUNCH.md](PERSONAL_LAPTOP_LAUNCH.md) in order.** It includes commands and helpers; no further application coding or paid agent subscription is required to exercise the supplied core workflows. [OpenSpec status](../openspec/changes/launch-cork-club-platform/implementation-status.md) and [tasks](../openspec/changes/launch-cork-club-platform/tasks.md) distinguish source completion from hosted acceptance and advanced refinements.

## Personal laptop — initial owner-only launch

- [ ] Pull main, install Node 22 and run `npm ci`. Optionally run the complete automated local check with `npm run verify:local`; [TESTING.md](TESTING.md) covers free first-use downloads and Linux browser libraries. The database service remains a CI check, not a laptop prerequisite.
- [ ] Fresh `npx supabase login`, link existing ttclubs project `mkxqrkqwpvjtkjfjjckm` (eu-north-1); fresh `npx wrangler login` and `whoami` for the existing Cloudflare account.
- [ ] Recreate private environment files. Office CLI sessions/exports/proxy settings do not transfer; never disable TLS checks.
- [ ] Review/apply migrations using CLI remote dry-run/push or the generated HTTPS SQL-Editor bundle. Never run the synthetic seed/CI Auth fixture on hosted Supabase.
- [ ] Deploy the three supplied functions through the HTTP bundler, create the verified Auth owner and run the generated non-destructive bootstrap SQL.
- [ ] Enable live mode in both local frontend files, build/check and deploy website/app to their separate Workers. The website Worker is `table-tennis-ireland`; the app config is `ttclubs-app`.
- [ ] Configure the Cloudflare Git-build public variables separately so later main builds retain live mode. Keep server credentials out of frontend variables.
- [ ] Configure exact Auth callbacks/site URL and function origins. Google is optional; phone OTP stays off. Test owner/password sign-in first.
- [ ] Run the launch-guide smoke test with synthetic test accounts across website/app, including guardian scope, revoked permissions, conflicting bookings, attendance, review/privacy and summary sign-off. Refresh the PWA after deployment.

Accounts already created: `ttclubsie@gmail.com` (platform contact), `leesidettie@gmail.com` (club contact/reply-to), Supabase organization TT Clubs Ireland/project ttclubs and the Cloudflare account. Do not create duplicate projects. Office-laptop hosted setup remains paused; no firewall bypass is requested.

## Email and scheduled work

- [ ] Create/configure the transactional sending account, verify an owned domain and add the private API key/from address to server secrets. Gmail is the contact/reply-to, not the application sending transport.
- [ ] Configure Supabase Auth SMTP separately for verification, recovery and email links.
- [ ] Generate/review the private Vault/cron SQL, apply once and inspect schedule/function logs.
- [ ] Verify actual delivery, bounce/failure handling, renewal suppression and unsubscribe with owner test accounts. Review provider limits; the app's default 90 daily attempts is a protective cap, not a free-service guarantee.
- [ ] Keep optional advance reminders and attendance digests off initially. The default expiry notice follows the inclusive Ireland expiry day, to player/guardian plus management summary.

## Leeside runtime configuration

These can be entered/changed through management forms after launch; they do not require a hard-coded staff roster or code redeployment.

- [ ] Bootstrap first owner, then grant scoped permissions to individually registered trusted managers. Revocations apply on subsequent server requests.
- [ ] Enter real membership types/prices/durations/entitlements and assign manual start/end/payment details. No payment gateway or bank credentials.
- [ ] Publish the already agreed five weekly session times with actual table inventory, capacities/allocations and holiday exceptions. Configure camps and holds/cancellations as needed.
- [ ] Configure club-approved privacy/safeguarding contacts, policy text and approved retention. Trials default to one calendar month with configurable extensions; the policy decision is already closed.
- [ ] Check public contacts/branding and resolve remaining Wix archive/calendar/media/document imports; preserve the confirmed timetable over the conflicting draft. Content reuse consent is already recorded.
- [ ] Test session-time app/rotating-QR presence and linked-child selection on real phones. Expired/no-membership attendance counts with follow-up; Not attending stays separate. Booking never implies attendance.
- [ ] Configure tournament formats/points/tie-breaks per event. Same-club review, five-day inaction, coach dispute ownership, incomplete exclusion, doubles/guests and no initial ratings are already agreed.

## Before real member operation / Wix cutover

- [ ] Enable provider/GitHub MFA and store recovery codes; invite trusted owners individually. Never share cloud passwords with the club management group.
- [ ] Approve privacy/guardian verification, safeguarding, retention purposes and data-request/escalation ownership, especially before junior data import.
- [ ] Configure encrypted off-site database **and** storage backups, backup expiry, monitoring and a restore rehearsal away from production. The encrypted-export helper is source, not a tested recovery service.
- [ ] Check real Safari/iPhone and Chrome/Android/PWA installation, keyboard/screen-reader use and venue connectivity. Local Chromium smoke tests are already supplied.
- [ ] Complete hosted authorization/concurrency/privacy acceptance and usage/load checks; the pilot aggregate is not a nationwide scaling guarantee.
- [ ] Purchase/attach Leeside's domain when ready; record registered holder, renewal payer/recovery and any transfer arrangement. A domain is unnecessary for temporary workers.dev testing.
- [ ] Keep Wix available until content/operations are accepted; rehearse domain rollback and agree support/incident ownership.
- [ ] Review remaining low/moderate build-tool advisories and provider usage/costs before public launch. Do not enable paid resources without reviewing their billing.

## Deferred / later

- Broader pilot recruitment dates are parked; the owner may begin with owner-only testing.
- NFC hardware/card kiosks and offline device queues are parked; do not buy equipment for the QR/app pilot.
- Native Expo/App Store/Google Play binaries follow evidence from the installable PWA pilot.
- Full Wix archive/media import, alternate-contact preferences, automatic invitations for unregistered managers, persistent recurrence-definition editing and advanced tournament structure changes remain tracked source refinements.
- Automated Facebook posting is deferred; canonical links/manual sharing and public RSS/calendar source exist.
- Retain this repository for at least one live year; review website extraction only then and with three or more clubs. No generic website hosting service or per-club app/backend fork is approved.

Use [implemented flows](IMPLEMENTED_FLOWS.md) for screen behavior and [traceability](TRACEABILITY.md) for code locations. Do not import real members just because account setup or local tests pass.
