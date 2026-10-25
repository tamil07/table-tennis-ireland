# Venue QR attendance

The platform now includes a local synthetic preview and a Supabase-backed check-in screen. Run `npm run dev:platform` and open the Club QR check-in section. Without environment configuration, preview actions never write real attendance.

## Activate the backend

1. Apply all versioned Supabase migrations, including `202610250001_venue_qr.sql`, first in development.
2. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `apps/platform/.env.local`; restart Vite. Never use the service-role key here.
3. Provision verified test Auth users and matching `profiles.auth_user_id` records. Add explicit club roles and active guardian links as needed. This screen supports existing email/password users; full registration, Google and email-link interfaces remain separate tasks.
4. Create a session occurrence with `status = 'open'`, a past/current start and a future non-null end. Give the display user an admin, coach, or scanner-operator role in that club.
5. Sign in, open Staff display, load sessions, and select one. The QR refreshes every 60 seconds and expires after at most 90 seconds. Use HTTPS and a deployed public URL for phone testing; a localhost QR is not reachable from another phone.
6. Scan with the phone camera, sign in if needed, select self or a linked child, and confirm. If sign-in takes too long, scan again. Verify attendance, audit event, and membership-review work item in Supabase.

## Behavior and limits

Database regression checks are in `supabase/tests/venue_qr.sql` and run in CI on PostgreSQL 17 with a minimal Auth identity fixture. They exercise authorization, guardians, duplicates, active/expired/missing membership, cancellation, expiry, and audit/work-item creation. They do not replace end-to-end testing against a configured Supabase Auth deployment and physical venue phones.

- The displayed code contains a random bearer challenge, never a name or membership details. Only its hash is stored in the database.
- Club/session and eligible people come from the server. The client cannot authorize arbitrary participant IDs.
- Database uniqueness prevents repeated or concurrent scans from creating multiple attendance records.
- Expired/no-current membership records attendance and an admin work item. Email delivery for those work items is still part of the notification-outbox work, not sent by this feature.
- This slice recognizes date-valid active memberships. Trial visit accounting, approaching-expiry labels, and detailed entitlement reporting remain existing roadmap work; no-current membership is flagged for review rather than granting entitlements.
- Self-check-in requires connectivity; it does not queue stale venue tokens offline. The separately planned kiosk offline queue is unchanged.
- Live codes can still be forwarded. This is attendance confirmation, not strong proof of physical location.
- Keep the staff screen awake; an expired image disappears. Foreground/background browser throttling can delay rotation, in which case refresh manually or rescan once the display recovers.
- The fragment is consumed into memory and removed from browser history. Refreshing the confirmation page requires scanning again.
- The website/PWA opens through a standard HTTPS link; native-app universal links are future work.
- Existing full-database RLS completion, signup/profile provisioning, notification delivery and deployment gates in ACTION_ITEMS.md still apply before production use.
