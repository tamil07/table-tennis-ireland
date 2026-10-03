# OpenSpec traceability

The source of truth is `openspec/changes/launch-cork-club-platform`. This map prevents the demonstration UI or implementation details from silently redefining approved behavior.

| OpenSpec capability | Primary code/data location | Current status |
| --- | --- | --- |
| `identity-and-access` | `packages/domain/src/club-context.ts`, `apps/platform`, `profiles`, `club_roles`, `guardian_links` | Foundation |
| `club-content` | `apps/club-web`, `clubs`, `club_domains`, `website_pages` | Foundation/demo |
| `membership-management` | `membership_types`, `memberships`, `manual_payments` | Schema foundation |
| `booking-management` | `session_definitions`, `session_occurrences`, `bookings` | Schema foundation |
| `member-communications` | `notification_outbox` | Schema foundation |
| `attendance-tracking` | `attendance_credentials`, `attendance`, platform UI | Schema/demo foundation |
| `match-records` | `matches`, `match_participants`, `match_games`, `match_reviews` | Schema foundation |
| `tournament-management` | `tournaments`, `tournament_entries`, `tournament_delegations` | Schema foundation |
| `player-development` | `coach_notes`, `development_summaries` | Schema foundation |
| `club-administration` | `admin_work_items`, `audit_events`, platform UI | Schema/demo foundation |

## Change discipline

1. Change requirements and scenarios in OpenSpec before changing behavior.
2. Update `tasks.md` and this table when the implementation surface changes.
3. Link tests to the relevant capability in test names or comments.
4. Never mark an OpenSpec task complete based only on a visual mock-up.
5. Run `openspec validate launch-cork-club-platform` and `npm run check` before merging.
