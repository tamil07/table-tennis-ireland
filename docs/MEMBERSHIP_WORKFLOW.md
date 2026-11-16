# Players, accounts and memberships

Updated 16 November 2026. These instructions describe the corrected source. They apply to the live site after the owner updates both the backend and frontends; a Git push alone does not establish deployment.

## What to create

| Record | Purpose | Who creates it |
| --- | --- | --- |
| Sign-in account | Verified identity used across clubs, website and app | Each adult or guardian through sign-up; never a shared management login |
| Club player | Club-specific adult or junior profile and history | The applicant/guardian, or a permitted membership manager |
| Membership type | Current price, duration and entitlement offered by the club | Membership management, at any time |
| Membership period | One player's agreed inclusive start/end dates and manually recorded payment status | Membership management |

Creating a player does not send an invitation, create a password, activate paid membership or charge money. Membership status and payment status are separate: the club can grant an active period while recording it as unpaid. No payment gateway is involved.

## Management workflow

1. Sign in using an individual account with current membership-management permission. Open **People & memberships** in the club workspace.
2. Under **Membership catalogue**, create an active membership type with the club's actual terms. Changes affect future assignments; existing periods retain their agreed snapshot. Do not invent a monthly type to represent pay-per-visit fees; that model remains separate product work.
3. Under **Membership team**, add an adult by name; contact details are optional for an offline record. For a junior, check **Junior player** and select at least one eligible adult guardian already in the club. Adults do not need guardians. The form clears after a successful save; cancel editing to return to a new record.
4. Under **Create membership period**, select the player/type and enter the agreed start and end dates. Dates are inclusive. Set membership and payment status separately. Enter the total amount actually received; a received date is required only when that amount is positive. Leave acknowledgement unchecked unless an informal email is wanted.
5. For another term, use **Renew membership** beside the previous period. This adds a new period and preserves the previous one. Suggested dates follow that period and the current type duration; review them before saving. Renewal starts with zero received and unpaid status. Retired types must be replaced with a currently offered type.
6. Use **Correct period** only to correct the selected record. Its previous type snapshot is retained if its type stays the same. Retired types can still have their existing periods corrected or cancelled. Active periods for one player cannot overlap. Trials can coexist with a paid conversion; create a new paid period rather than overwriting the trial history.
7. Use the separate additional-payment/correction workflow for later receipts. An acknowledgement queues a notification; delivery requires configured sending services and a verified recipient. A club-entered contact field alone is not proof of email ownership.

Cancelled trials do not grant another self-service trial. Management can extend the existing trial with a reason. Default trial duration is one calendar month, configurable by management. Membership expiry reminders follow the configured Europe/Dublin end-of-day policy.

## Connecting an offline player to a login

An adult registers and verifies their own account, signs in and applies to Leeside with the adult declaration and published policy consent. Management then uses the **Unclaimed offline profile / Verified account** linking form with a reason to transfer the existing offline history. Review both profiles first; the service refuses an independently authenticated source, unverified target, conflicting active membership periods and duplicate active bookings/participation. It does not merge two independent Auth accounts. Juniors use their linked guardian's account.

The club must publish its application/privacy information before applications and its safeguarding information before guardian-led junior registration. Management maintains those settings; missing policy configuration is a distinct validation failure.

## Applying this correction on the personal laptop

Use [START_HERE.md](START_HERE.md) for Node 22, pulling safely, installing dependencies and restoring only missing private settings. Do not repeat owner bootstrap or reset the database. This correction adds optional JSON fields to the existing command store and needs no new SQL migration.

After reviewing the source locally:

```bash
npm run verify:local
npm run deploy:backend
npm run deploy:club
npm run deploy:platform
```

These deployment commands are owner actions from the permitted personal connection, using the existing Supabase/Cloudflare accounts. Retain deployed secrets; code deployment does not require regenerating scheduler tokens. Frontend builds require the existing explicit live settings described in [DEPLOYMENT_STATUS.md](DEPLOYMENT_STATUS.md). Cloudflare Git builds require those settings separately; do not weaken the production guard. Follow [PERSONAL_LAPTOP_LAUNCH.md](PERSONAL_LAPTOP_LAUNCH.md) if CLI sessions need restoring.

Confirm the provider builds/releases and reload each client. Using disposable test records, verify adult creation with no guardian, junior creation with a guardian, two distinct new players, an unpaid period with no invented payment date, a separate renewal preserving history, and website/app synchronization. Confirm revoked membership privileges are refused server-side. Record non-secret outcomes in DEPLOYMENT_STATUS.md. Source tests do not establish this authenticated hosted acceptance.
