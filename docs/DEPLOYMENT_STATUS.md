# Deployment status and owner follow-up

This is the non-secret status record shared between laptops. Update outcomes here after provider checks; keep credentials and member records in private storage. Source implementation and full remaining product scope live in [OpenSpec status](../openspec/changes/launch-cork-club-platform/implementation-status.md) and [tasks](../openspec/changes/launch-cork-club-platform/tasks.md).

## Membership correction — 16 November 2026

The owner reported a problem while creating a player/membership; the precise screen/error has not yet been supplied. Source review independently reproduced an adult creation blocker (a required guardian selector shown for adults), renewal overwriting an existing period and historical catalogue snapshots changing during correction. Source now separates adult/junior creation and the new/correct/renew editors, preserves period history and snapshots, and strengthens guardian, trial and account-link checks. Details and minimal owner update instructions: [MEMBERSHIP_WORKFLOW.md](MEMBERSHIP_WORKFLOW.md).

No hosted database mutation, migration, private sign-in or manual deployment was performed during this correction. The authorized Git push triggered the existing automatic website deployment; its result is recorded below. Backend and app updates and authenticated cross-device acceptance remain owner actions. There is no new SQL migration for this correction and no need to repeat bootstrap.

Local correction checks passed: 100 domain/adapter tests, 12 setup regressions, type checks, both builds, all three backend checks/HTTP suites and expanded browser workflows for both frontends. OpenSpec and whitespace validation passed. GitHub/production release evidence is recorded separately below when available.

### Verified source and public release evidence

- Source correction **3f6496d** is pushed to `main`. All four [Quality jobs](https://github.com/tamil07/table-tennis-ireland/actions/runs/43892027989) passed: check, edge-functions, venue-qr-database and browser-workflows.
- The independent [Cloudflare website build](https://dash.cloudflare.com/6502a73494f4ee7107b36c620ee76471/workers/services/view/table-tennis-ireland/production/builds/2ab7ed07-ae69-4639-a9bd-b6bb6aeb69a8) **succeeded**. The earlier automatic-build failure did not recur; its previous cause was not independently established or changed by this correction.
- Anonymous reads returned HTTP 200 on both public sites. Website asset `/assets/index-CrbDP0_x.js` returned HTTP 200, references the pilot project and contains the new renewal editor and junior-only guardian label. This confirms website UI publication, not authenticated backend behavior.
- The app still serves `/assets/index-Cb3vBNfk.js`, which lacks both new UI strings. Its release remains pending. Backend release/version and private acceptance were not tested; update `club-api`, `club-jobs` and `club-public` through `npm run deploy:backend`, then the app through `npm run deploy:platform` on the personal laptop. Website deployment can be repeated through `deploy:club` if needed. Empty payment dates and strengthened server checks require the updated backend; the website UI alone does not fix these rules.
- Offline `setup:doctor` completed with zero failures and four local configuration warnings; it performed no network/provider changes.

Earlier owner progress is recorded in the OpenSpec status: on 10 November the personal-laptop session reported migrations, backend functions and empty owner bootstrap completed; on 11 November the owner reported Auth callbacks, password recovery and sign-in working. These reports supersede the initial pending-confirmation entries below for those steps, without providing current deployment-version or private-workflow acceptance evidence.

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

## Post-push evidence for source commit 483701c

All four [Quality jobs](https://github.com/tamil07/table-tennis-ireland/actions/runs/43267222371) passed: check, edge-functions, venue-qr-database and browser-workflows. Both public URLs still returned HTTP 200 with sign-in screens and no demo role selector after the push.

Cloudflare's separate automatic website build **failed**: [build 4e0fae3d-b80b-44d8-a719-974df4e6f2ad](https://dash.cloudflare.com/6502a73494f4ee7107b36c620ee76471/workers/services/view/table-tennis-ireland/production/builds/4e0fae3d-b80b-44d8-a719-974df4e6f2ad). Its GitHub check provides no error text; the failure reason is unverified until the owner reads the provider build log. The existing live release remained available. Check the build variables/commands below before retrying; do not remove the production guard to make a failed build green.

| If the build log reports | Owner action |
| --- | --- |
| `production requires VITE_ENABLE_LIVE=true` | Add that exact flag to the Worker's **build** variables |
| Wrong/missing pilot project URL | Set `VITE_SUPABASE_URL` to the existing project URL |
| Missing/unsafe browser key | Set `VITE_SUPABASE_ANON_KEY` to the publishable/anon key; server credentials belong only in server secrets |
| Wrong workspace/build target | Use root `npm run build:club`, `npm run deploy:club`, Node 22 and the existing website Worker/config |
| Another error | Retain its non-secret diagnostic and follow the matching layer; do not reset Supabase or overwrite the live release |

`VITE_ENABLE_PHONE_LOGIN=false` remains the pilot build setting. Configure each Git-connected target separately; laptop environment files do not populate these settings. Rebuild/retry after correcting the actual log-reported issue and verify both public sites afterwards.

## Confirm on the owner account

Use `confirmed YYYY-MM-DD`, `pending`, or `not configured`. Fill public URLs/version IDs where useful; no secret values.

| Check | Owner outcome |
| --- | --- |
| Supabase migration history matches all repository migrations | Owner reported all three applied on 10 November; current audit not repeated |
| Existing owner login and club ownership verified | Owner reported bootstrap on 10 November and successful sign-in/recovery on 11 November |
| `club-api` and `club-jobs` deployed at intended source version | Owner reported deployment on 10 November; 16 November source update and version acceptance pending |
| Exact website/app Auth callbacks configured | Owner reported app Site URL and both redirect origins set on 11 November |
| Both live origins allowed by the API | Pending authenticated acceptance |
| Website request → app approval → website refresh works | Pending acceptance |
| Revoked privileges and unrelated guardian access refused | Pending acceptance |
| Cloudflare Git-build public variables set on each connected target | Website build for 3f6496d succeeded through the live guard; app Git-build configuration remains unverified |
| Private server settings retained in approved storage | Pending confirmation; never copy them into this table |
| Scheduler secret matches function configuration and Vault | Pending confirmation |
| Scheduled jobs execute successfully | Pending confirmation |
| Transactional sending domain/provider configured and test delivered | Pending confirmation |
| Supabase Auth SMTP configured and verification/recovery delivered | Pending confirmation |
| Privacy/safeguarding policy and contacts approved | Pending club configuration |
| Encrypted off-site database/storage backups and restore rehearsal | Pending confirmation |
| Current website source commit / Cloudflare version | 3f6496d automatic build succeeded; new membership UI asset observed above; Worker version ID not queried |
| Current app source commit / Cloudflare version | Source commit/version not supplied; observed asset still predates membership UI correction |

## Remaining product work

Wix archive/media/document parity, additional contact preferences, invitations for unregistered managers, persistent recurrence-definition editing and advanced tournament structure changes remain tracked refinements. Native stores and NFC equipment remain deferred. These do not require inventing another cloud project or forking the app per club.

Use [START_HERE.md](START_HERE.md) for laptop resumption, [PERSONAL_LAPTOP_LAUNCH.md](PERSONAL_LAPTOP_LAUNCH.md) for first-time/remaining account work, and [TESTING.md](TESTING.md) for verification commands and their boundaries.
