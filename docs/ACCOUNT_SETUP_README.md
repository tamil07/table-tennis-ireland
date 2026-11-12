# Your account setup checklist

**Already set up on another laptop?** Start with [START_HERE.md](START_HERE.md) and [DEPLOYMENT_STATUS.md](DEPLOYMENT_STATUS.md). Public website/app sign-in and club-public availability were observed on 12 November; old first-time pending checkboxes below are an inventory, not instructions to recreate existing resources. Private/provider acceptance stays explicit.

**First-time account steps:** [Personal-laptop launch — complete ordered commands](PERSONAL_LAPTOP_LAUNCH.md). That runbook supersedes older setup snippets below, includes fresh Supabase/Cloudflare CLI logins and HTTPS migration fallback, and requires no paid coding agent. This file is the account inventory; exact implementation gaps remain in OpenSpec.

> Latest pilot decision, 1 November 2026: retain the current Leeside website and national app in this repository, with independent deployment targets as listed below. Defer website repository separation until review after at least one year of live operation and more than two participating clubs. Creating another repository is not a current setup task.

Use this single guide to create and connect the accounts needed for the Leeside website and national app. “Cloudbase” here means **Cloudflare**; the database service is **Supabase**. No separate Cloudbase account is required.

Status updated 7 November 2026: both Gmail accounts, the Supabase project and Cloudflare account exist; the website demo has deployed successfully. Hosted Supabase connection/migrations remain paused for the personal-laptop handover below. Creating accounts alone does not finish backend workflows.

You own the platform, repository, and shared cloud infrastructure. Your dedicated Gmail is the contact/recovery address. Leeside manages its club through individual app accounts, not through your hosting credentials.

## 1. Create the dedicated Gmail first

- [x] Owner confirmed account creation on 4 November 2026: **ttclubsie@gmail.com** (national platform/cloud account contact) and **leesidettie@gmail.com** (Leeside contact/reply-to and domain-account contact).
- [ ] Set a unique password and add recovery details.
- [ ] Enable two-step verification in [Google account security](https://myaccount.google.com/security) and save backup codes privately.
- [x] Platform registration email supplied: **ttclubsie@gmail.com**. Provider account creation and connections remain separate pending steps.

You can share the email address here. Keep passwords, one-time codes, recovery codes, and private keys out of chat and GitHub.

## 2. Create Supabase: database and sign-in

**Personal-laptop handover (owner confirmed 7 November 2026):** Supabase connections are blocked from the office laptop. The CLI timed out while connecting to the hosted PostgreSQL pooler. Hosted setup/migration application remain paused; the owner will complete connection setup from their personal laptop once repository updates are available. Continue code, synthetic UI and local tests independently. Do not bypass company network restrictions or treat the preview as a shared live service.

The detailed reason, capability status and handover sequence are recorded in [OpenSpec implementation status](../openspec/changes/launch-cork-club-platform/implementation-status.md). Supabase supplies real authentication, shared PostgreSQL records, permissions and transactional booking inventory. Cloudflare can serve the frontend without it. Email delivery additionally needs provider/sender configuration.

On the personal laptop, pull `main`, use Node 22, run `npm ci`, then:

```bash
npx supabase login
npx supabase link --project-ref mkxqrkqwpvjtkjfjjckm
npx supabase db push --remote --dry-run
```

Review the proposed migrations before `npx supabase db push --remote`. These commands follow the CLI behavior already observed in this project; use `--help` if the installed version changes. Do not reset the hosted database or upload CI auth fixtures. Configure private environment variables, exact Auth callbacks and synthetic users/roles/guardian links afterwards. Share only success/errors without credentials. A successful connection does not complete pending application features or authorize live member import.

Links: [Dashboard/signup](https://supabase.com/dashboard), [getting started](https://supabase.com/docs/guides/getting-started), [regions](https://supabase.com/docs/guides/platform/regions), [pricing](https://supabase.com/pricing).

- [x] Owner reports Supabase administrator registration/sign-in through GitHub. Account contact email and recovery settings still need checking.
- [x] Organization created: **TT Clubs Ireland**.
- [ ] Start with the Free plan and review the current allowances before creating projects.
- [x] Owner reports project **ttclubs** created with general **Europe** region selected (5 November 2026).
- [x] Owner supplied assigned region **eu-north-1 (Stockholm, Sweden)**, reference **mkxqrkqwpvjtkjfjjckm**, and URL **https://mkxqrkqwpvjtkjfjjckm.supabase.co**. The publishable key is available for environment configuration and is omitted from this guide.
- [x] Environment decision: one hosted project initially plus local development; a second hosted project is deferred. Use synthetic data until live-data gates pass.
- [ ] Save each database password in your password manager.
- [ ] Enable account MFA and invite trusted owners using their own accounts: [access-control guide](https://supabase.com/docs/guides/platform/access-control).
- [ ] Locate each project's URL and browser-safe publishable/legacy anonymous key. Keep secret/service-role keys server-side only.

Development connection work after the projects exist:

- [ ] From the personal laptop, link the existing single hosted project and review/apply repository migrations. Never apply `supabase/tests/plain_postgres_auth_fixture.sql` to Supabase; it is CI-only.
- [ ] Configure frontend environment variables privately. Use local synthetic development or disconnected previews; a second hosted development project is deferred.
- [ ] Configure Auth site/redirect URLs and test users, profiles, club roles, and guardian links.
- [ ] Test the current portal QR/direct attendance flow using the launch runbook; VENUE_QR_CHECK_IN.md describes the earlier legacy RPC prototype.
- [ ] Deploy and verify the supplied authorization/registration/notification source; configure backups and complete hosted production acceptance before importing live members.

The current apps require explicit `VITE_ENABLE_LIVE=true` only after owner setup; see the runbook for all flags. Connection names in `apps/platform/.env.local`; the browser key may be a supported publishable key even though the variable retains its earlier name:

```dotenv
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_BROWSER_SAFE_KEY
```

Use deployment environment settings for hosted builds. Do not commit `.env.local` or paste private credentials into source. Public browser keys rely on database authorization rules; they do not replace those rules.

## 3. Create Cloudflare: website and app hosting

**Website demo deployed successfully:** https://table-tennis-ireland.ttclubsie.workers.dev. Use `npm run build:club` and `npm run deploy:club` from repository root with Node 22 and the committed `wrangler.club-web.jsonc`. Production and preview commands are corrected in Cloudflare. Root/assets/SPA checks passed; the national app Worker and live-data setup remain separate pending work. The failed-state paragraphs below are retained history; see the updated deployment result in the plan.

Account creation and API inspection are confirmed. Worker `table-tennis-ireland` on the `ttclubsie` subdomain has successfully deployed the repository website demo, superseding the earlier failed build/template. Use [CLOUDFLARE_DEPLOYMENT_PLAN.md](CLOUDFLARE_DEPLOYMENT_PLAN.md) for verification evidence. Each new commit still needs deployment verification; Supabase setup stays paused.

Links: [Signup](https://dash.cloudflare.com/sign-up), [dashboard](https://dash.cloudflare.com/), [hosting overview](https://developers.cloudflare.com/workers/static-assets/), [hosting tutorial](https://developers.cloudflare.com/workers/static-assets/get-started/).

- [x] Cloudflare account registration is complete; confirm verified account/recovery contact in its settings.
- [ ] Enable MFA and save recovery codes privately.
- [ ] Invite trusted owners individually with appropriate access: [account members](https://developers.cloudflare.com/fundamentals/manage-members/manage/).
- [ ] Start with free hosting; review any chargeable feature before enabling it.
- [x] GitHub main is connected to the existing Cloudflare website deployment; operational code commit `2577059` was verified publicly on 7 November 2026.

Deployment work after account access is ready:

| Deployment | Build from repository root | Output | Backend |
| --- | --- | --- | --- |
| Club website | `npm ci` then `npm run build:club`; publish with `npm run deploy:club` | `apps/club-web/dist` | Shared portal/command adapter supplied; live activation paused |
| National app | `npm ci` then `npm run build --workspace @tti/platform` | `apps/platform/dist` | Shared portal and PWA supplied; hosted setup and separate deployment pending |

- [x] Website Worker/assets, HTTPS and SPA fallback configured through `wrangler.club-web.jsonc`; public demo and current asset hashes verified.
- [ ] Deploy the supplied separate national-app Worker config, review headers/environment variables and verify its deployment. Do not overwrite the website Worker.
- [x] Website has a temporary `workers.dev` address. A purchased domain is not needed for preview testing; a separate app URL remains pending.
- [ ] Record both preview URLs and allow the exact required Auth redirect URLs in Supabase.
- [ ] Verify that preview deployments never connect to production member data.

## 4. Purchase/connect the Leeside domain

Links: [Cloudflare Registrar](https://www.cloudflare.com/products/registrar/), [Worker custom domains](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/).

- [ ] Agree with Leeside on the address, registered holder, renewal payer, and any later transfer.
- [ ] Purchase through a registrar supporting the chosen domain extension; it does not have to be Cloudflare.
- [ ] Save renewal and recovery details and arrange renewal reminders.
- [ ] Add/manage the DNS records needed for Cloudflare hosting. Coordinate any nameserver change and preserve existing email/DNS records.
- [ ] Attach the Leeside domain to the club website after acceptance; keep the national app at its own temporary address until its name/domain is selected.

Do not move Leeside away from Wix until the replacement has passed acceptance and rollback is ready.

## 5. Create Resend: automated email

Links: [Signup](https://resend.com/signup), [domain verification](https://resend.com/docs/dashboard/domains/introduction), [pricing](https://resend.com/pricing).

- [ ] Create the platform Resend account with the dedicated email.
- [ ] Choose an owned sending domain/subdomain once the domain is available.
- [ ] Add the exact verification/SPF/DKIM records supplied by Resend to DNS and wait for verification.
- [ ] Choose sender name, monitored reply-to mailbox, and the owner who monitors delivery failures.
- [ ] Store sending credentials only in Supabase/provider server secrets.
- [ ] Configure Supabase Auth's custom SMTP separately from application notification delivery: [SMTP setup](https://supabase.com/docs/guides/auth/auth-smtp).
- [ ] Implement/test the notification outbox, reminders, retries, and delivery handling; this remains development work.

The Gmail mailbox can receive replies. Automated emails use the verified sending domain rather than sharing the Gmail password.

## 6. Google sign-in: after basic email login works

Links: [Google Cloud console](https://console.cloud.google.com/), [Supabase Google setup](https://supabase.com/docs/guides/auth/social-login/auth-google).

- [ ] Create a platform Google Cloud project under your control.
- [ ] Configure the consent screen/Google Auth Platform and the appropriate audience/test users.
- [ ] Create development and production OAuth clients with the exact callbacks shown by Supabase.
- [ ] Store client secrets in the Supabase Google-provider configuration.
- [ ] Complete/test the app's Google sign-in interface, account linking, and fallback email login before enabling it publicly.

Google Cloud OAuth configuration is distinct from merely creating a Gmail account. It is not required for the current existing-user email/password venue QR test.

## 7. Storage and backups

Links: [R2 getting started](https://developers.cloudflare.com/r2/get-started/), [R2 pricing](https://developers.cloudflare.com/r2/pricing/).

- [ ] Set up a private backup destination with restricted credentials and approve retention before live operation.
- [ ] Schedule encrypted database/file backups and prove restoration into development.
- [ ] When the media library needs separate storage, evaluate R2 for public photographs; private files require authorization and temporary links. Media integration remains proposed work, not activated by account creation.
- [ ] Review R2 billing requirements and usage costs before activation; a free allowance is not a hard spending cap.

## 8. Existing GitHub account and trusted owners

Repository: [tamil07/table-tennis-ireland](https://github.com/tamil07/table-tennis-ireland).

- [ ] Keep your existing repository ownership; another GitHub account is not required solely because Gmail is new.
- [ ] Nominate trusted platform owners and invite their individual identities separately into each relevant provider.
- [ ] Assign contributor/maintainer permissions deliberately; contributors propose PRs and authorized maintainers merge.
- [ ] Configure repository/deployment secrets, MFA/recovery, and appropriate branch controls.

Leeside club admins/editors/event organizers receive club-scoped app permissions. They do not need cloud-account or repository access to manage club content.

## What to report back

Send a short update with non-secret details only:

```text
Dedicated platform email: ttclubsie@gmail.com
Leeside contact/reply-to email: leesidettie@gmail.com
Supabase organization: [name]
Development project: [name/reference and selected region]
Production project: [name/reference and selected region, or pending]
Cloudflare account created: [yes/no]
Trusted owners invited: [complete/pending]
Leeside domain: [chosen address, or pending]
Domain registered holder agreed: [yes/no]
Resend account/domain verification: [status]
Google OAuth: [pending/configured]
```

Put private credentials directly into the provider's secret settings or an approved secret manager. Share project names/references and setup status here; never passwords or recovery codes.

The complete feature, governance, and launch checklist remains in [ACTION_ITEMS.md](ACTION_ITEMS.md); the account-independent decisions are in [DECISIONS_AND_OPEN_ITEMS.md](DECISIONS_AND_OPEN_ITEMS.md).
