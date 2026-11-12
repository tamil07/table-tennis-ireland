# Deployment status and owner follow-up

This is the non-secret status record shared between laptops. Update outcomes here after provider checks; keep credentials and member records in private storage. Source implementation and full remaining product scope live in [OpenSpec status](../openspec/changes/launch-cork-club-platform/implementation-status.md) and [tasks](../openspec/changes/launch-cork-club-platform/tasks.md).

## Independently observed — 12 November 2026

| Item | Observation | Limit |
| --- | --- | --- |
| Leeside website | `https://table-tennis-ireland.ttclubsie.workers.dev`, HTTP 200; member sign-in visible; demo role selector absent | No private sign-in/write test |
| National app | `https://ttclubs-app.ttclubsie.workers.dev`, HTTP 200; sign-in visible; demo role selector absent | No private sign-in/write test |
| Frontend activation | Both public bundles have `VITE_ENABLE_LIVE=true` and reference the existing Supabase project | Does not prove Cloudflare Git-build variables are set |
| Public content | Ordinary anonymous website visit receives HTTP 200 from `club-public` | Does not prove private API/jobs/email are accepted |
| Source at start of review | Only GitHub branch `main`, commit `1258a44` from 9 November; no newer owner commits were visible | Laptop settings/deployments can change independently of Git |

No hosted migrations, private sign-in tests, email sends or provider-account changes were performed during this review. The office-laptop network restriction remains in place. The previous statements that the app was undeployed and both clients were synthetic are historical; the observations above supersede those public frontend claims only.

## Source verification for this handover

`npm run verify:local` passed with 80 unit tests, 12 setup/helper regressions, three backend HTTP suites, both builds and both automatic browser workflows. The offline doctor completed without failures; missing private configuration remains local/owner work. New production entry points reject demo or wrong-project settings before publication and rebuild fresh assets. No authenticated hosted acceptance follows from these local results.

## Confirm on the owner account

Use `confirmed YYYY-MM-DD`, `pending`, or `not configured`. Fill public URLs/version IDs where useful; no secret values.

| Check | Owner outcome |
| --- | --- |
| Supabase migration history matches all repository migrations | Pending confirmation |
| Existing owner login and club ownership verified | Pending confirmation |
| `club-api` and `club-jobs` deployed at intended source version | Pending confirmation |
| Exact website/app Auth callbacks configured | Pending confirmation |
| Both live origins allowed by the API | Pending authenticated acceptance |
| Website request → app approval → website refresh works | Pending acceptance |
| Revoked privileges and unrelated guardian access refused | Pending acceptance |
| Cloudflare Git-build public variables set on each connected target | Pending confirmation; production guard now refuses demo/missing configuration |
| Private server settings retained in approved storage | Pending confirmation; never copy them into this table |
| Scheduler secret matches function configuration and Vault | Pending confirmation |
| Scheduled jobs execute successfully | Pending confirmation |
| Transactional sending domain/provider configured and test delivered | Pending confirmation |
| Supabase Auth SMTP configured and verification/recovery delivered | Pending confirmation |
| Privacy/safeguarding policy and contacts approved | Pending club configuration |
| Encrypted off-site database/storage backups and restore rehearsal | Pending confirmation |
| Current website source commit / Cloudflare version | Not supplied |
| Current app source commit / Cloudflare version | Not supplied |

## Remaining product work

Wix archive/media/document parity, additional contact preferences, invitations for unregistered managers, persistent recurrence-definition editing and advanced tournament structure changes remain tracked refinements. Native stores and NFC equipment remain deferred. These do not require inventing another cloud project or forking the app per club.

Use [START_HERE.md](START_HERE.md) for laptop resumption, [PERSONAL_LAPTOP_LAUNCH.md](PERSONAL_LAPTOP_LAUNCH.md) for first-time/remaining account work, and [TESTING.md](TESTING.md) for verification commands and their boundaries.
