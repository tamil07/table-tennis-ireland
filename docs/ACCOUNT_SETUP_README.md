# Your account setup checklist

Use this single guide to create and connect the accounts needed for the Leeside website and national app. “Cloudbase” here means **Cloudflare**; the database service is **Supabase**. No separate Cloudbase account is required.

Status: account creation and connections are pending until you confirm completion. Creating accounts alone does not deploy the app or finish the backend workflows.

You own the platform, repository, and shared cloud infrastructure. Your dedicated Gmail is the contact/recovery address. Leeside manages its club through individual app accounts, not through your hosting credentials.

## 1. Create the dedicated Gmail first

- [ ] Open [Google account signup](https://accounts.google.com/signup) and create an address suitable for the national platform.
- [ ] Set a unique password and add recovery details.
- [ ] Enable two-step verification in [Google account security](https://myaccount.google.com/security) and save backup codes privately.
- [ ] Keep the email address available for registering the services below.

You can share the email address here. Keep passwords, one-time codes, recovery codes, and private keys out of chat and GitHub.

## 2. Create Supabase: database and sign-in

Links: [Dashboard/signup](https://supabase.com/dashboard), [getting started](https://supabase.com/docs/guides/getting-started), [regions](https://supabase.com/docs/guides/platform/regions), [pricing](https://supabase.com/pricing).

- [ ] Register using the dedicated email, or link an appropriate GitHub identity if signup requests it. Confirm the account email and recovery ownership.
- [ ] Create a platform organization under your ownership; a temporary organization name is fine.
- [ ] Start with the Free plan and review the current allowances before creating projects.
- [ ] Create a development project, for example `tt-clubs-dev`, in **West EU (Ireland)** if available; otherwise agree an approved EU region before proceeding.
- [ ] Create a separate production project, for example `tt-clubs-prod`, in the approved region. Leave it without real member data until launch gates pass.
- [ ] Save each database password in your password manager.
- [ ] Enable account MFA and invite trusted owners using their own accounts: [access-control guide](https://supabase.com/docs/guides/platform/access-control).
- [ ] Locate each project's URL and browser-safe publishable/legacy anonymous key. Keep secret/service-role keys server-side only.

Development connection work after the projects exist:

- [ ] Link the Supabase CLI to development and apply the repository migrations. Never apply `supabase/tests/plain_postgres_auth_fixture.sql` to Supabase; it is CI-only.
- [ ] Configure the frontend environment variables below, using the development project for local/preview builds.
- [ ] Configure Auth site/redirect URLs and test users, profiles, club roles, and guardian links.
- [ ] Test the venue QR flow using [VENUE_QR_CHECK_IN.md](VENUE_QR_CHECK_IN.md).
- [ ] Finish authorization, registration, notification, backup, and production acceptance work before importing live members.

The current app expects these names in `apps/platform/.env.local`; the browser key may be a supported publishable key even though the variable retains its earlier name:

```dotenv
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_BROWSER_SAFE_KEY
```

Use deployment environment settings for hosted builds. Do not commit `.env.local` or paste private credentials into source. Public browser keys rely on database authorization rules; they do not replace those rules.

## 3. Create Cloudflare: website and app hosting

Links: [Signup](https://dash.cloudflare.com/sign-up), [dashboard](https://dash.cloudflare.com/), [hosting overview](https://developers.cloudflare.com/workers/static-assets/), [hosting tutorial](https://developers.cloudflare.com/workers/static-assets/get-started/).

- [ ] Register with the dedicated email and verify it.
- [ ] Enable MFA and save recovery codes privately.
- [ ] Invite trusted owners individually with appropriate access: [account members](https://developers.cloudflare.com/fundamentals/manage-members/manage/).
- [ ] Start with free hosting; review any chargeable feature before enabling it.
- [ ] Authorize the intended GitHub repository for deployment if using Cloudflare's Git integration.

Deployment work after account access is ready:

| Deployment | Build from repository root | Output | Backend |
| --- | --- | --- | --- |
| Club website | `npm ci` then `npm run build --workspace @tti/club-web` | `apps/club-web/dist` | Development Supabase for previews; production only after approval |
| National app | `npm ci` then `npm run build --workspace @tti/platform` | `apps/platform/dist` | Same environment separation |

- [ ] Configure two independent Workers Static Assets deployments, SPA fallback, HTTPS, headers, and deployment environment variables. Workers/Wrangler deployment configuration still needs to be completed; the build commands alone do not publish the apps.
- [ ] Deploy to temporary `workers.dev` addresses first. A purchased domain is not needed to begin testing.
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
Dedicated email: [address]
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
