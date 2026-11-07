# OpenSpec traceability

The source of truth is `openspec/changes/launch-cork-club-platform`. This map prevents the demonstration UI or implementation details from silently redefining approved behavior.

| OpenSpec capability | Primary code/data location | Current status |
| --- | --- | --- |
| `identity-and-access` | `packages/domain/src/club-context.ts`, `apps/platform`, `profiles`, `profile_contacts`, `club_roles`, `guardian_links` | Foundation |
| `club-content` | `apps/club-web`, `clubs`, `club_domains`, `website_pages` | Foundation/demo |
| `membership-management` | `membership_types`, `memberships`, `manual_payments` | Schema foundation |
| `booking-management` | `packages/domain/src/session-booking.ts`, `packages/ui/src/SessionBookingDemo.tsx`, both frontend entry points; `session_definitions`, `session_occurrences`, `bookings` | Shared synthetic four-place/whole-session preview and tested local rules; production inventory schema/RPCs and sync pending |
| `member-communications` | `notification_outbox` | Schema foundation |
| `attendance-tracking` | `apps/platform/src/Attendance.tsx`, `202610250001_venue_qr.sql`, `supabase/tests/venue_qr.sql` | Rotating venue QR, confirmation and RPCs implemented; live setup/venue acceptance pending; other scanner flows planned |
| `match-records` | `matches`, `match_participants`, `match_games`, `match_reviews` | Schema foundation |
| `tournament-management` | `tournaments`, `tournament_entries`, `tournament_delegations` | Schema foundation |
| `player-development` | `coach_notes`, `development_summaries` | Schema foundation |
| `tournament-reflections` | OpenSpec detailed event/reflection scenarios | Requirements only; external-result entry, privacy and coaching aggregates pending |
| `club-administration` | `admin_work_items`, `audit_events`, platform UI | Schema/demo foundation |

Public source-to-destination status is maintained in [the content manifest](PUBLIC_CONTENT_MANIFEST.md). Root [AGENTS.md](../AGENTS.md) is the entry point for a new coding agent.

## Change discipline

All eleven capability files reviewed for delivery reconciliation on 7 November 2026. See [implementation status](../openspec/changes/launch-cork-club-platform/implementation-status.md) for remaining work and the owner's personal-laptop Supabase handover. Hosted migrations are not applied. The club-supplied `Leeside Table Booking.html` is a visual source, not a Claude runtime dependency.

1. Change requirements and scenarios in OpenSpec before changing behavior.
2. Update `tasks.md` and this table when the implementation surface changes.
3. Link tests to the relevant capability in test names or comments.
4. Never mark an OpenSpec task complete based only on a visual mock-up.
5. Run `openspec validate launch-cork-club-platform` and `npm run check` before merging.
