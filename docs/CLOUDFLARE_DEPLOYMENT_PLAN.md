# Cloudflare inspection and deployment plan

Current status, 12 November 2026: both public website/app URLs show live-mode sign-in and the website public reader responds successfully. See [DEPLOYMENT_STATUS.md](DEPLOYMENT_STATUS.md) for verified versus unverified items and [START_HERE.md](START_HERE.md) for laptop resumption. Earlier failed-build/demo asset records below are historical. Production scripts now require live build settings and rebuild before publishing; keep Cloudflare Git-build public variables configured independently from laptop files. Missing variables should block publication, retaining the current release.


## Latest website verification — 7 November 2026

Code commit `ef10b50` is pushed to main. The public website now serves `index-mtmbKBKM.js` and `index-CyulaUCm.css`; both return HTTP 200 and SHA-256 hashes match the tested local production build. `/booking` returns the current SPA HTML. A live 390-pixel browser walkthrough requested a synthetic place, switched to maintainer, approved it and verified confirmation with no document overflow. Local walkthrough additionally covered guardian requests, duplicate prevention, occupied-table protection, moves, persistence and club switching at desktop/mobile widths.

`npm run check` passed all workspace type checks, 21 tests and both production builds; OpenSpec validation passed. A final website-only build passed after copy/header corrections. No current Cloudflare build ID is asserted: this verification used served assets and browser behavior rather than the historical API build record below. A documentation-only follow-up commit may trigger another build with unchanged website assets.

The deployed booking is explicitly synthetic/browser-local. Real authentication, production inventory, cross-device synchronization and email delivery remain pending. Supabase office-laptop connections are blocked; the owner will complete connection setup from a personal laptop. Separate app deployment, isolated preview and rollback rehearsal remain pending. Earlier observations below are historical.

## Verified deployment result

The authorized fix is committed as `8484e837f74e8a728a9c81afb385ed0e1b296987`. Its GitHub push triggered build `af21ba36-d5ea-4df0-9eba-7d87a70e2fe2`, which completed successfully and deployed Worker version `5fdab8bb-e862-4095-b0f0-a693d4e8ec09`.

Live demo: **https://table-tennis-ireland.ttclubsie.workers.dev**.

Verified using curl: root HTTP 200 with Leeside title; JavaScript and CSS both HTTP 200 and byte-for-byte SHA-256 matches to the local production build; the JavaScript contains the Leeside venue content; a deep navigation path returns the SPA HTML with HTTP 200. An initial Python HTTP-client probe returned 403, while curl succeeded; no application change was needed for that client-specific response. Visual/mobile acceptance and rollback rehearsal remain pending.

Checks passed: repository type checking, four domain tests, both production builds, Wrangler deployment dry run and OpenSpec validation. Cloudflare used Node 22.23.4 and pinned Wrangler 4.158.0. Non-fatal dependency/install-script and implicit preview-URL warnings remain follow-up items; they did not prevent build or deployment. This remains a synthetic website demonstration, not live booking/membership functionality. Supabase setup is still paused.

The sections below retain the initial inspection evidence and plan; their original pending status is superseded by this verified result where applicable. Subsequent documentation pushes may trigger another normal main build.

Inspected 5 November 2026 using read-only API calls with an owner-supplied temporary user token. Token contents are not stored in this document or repository. Supabase connection/migration setup remains paused.

## Authorized remediation update

The owner subsequently authorized fixing the failing build, pushing code to GitHub and retrying until success. The latest failed retry (`19296bd8-36ae-4892-a6d2-e97278782de2`) still used the old workspace typo because the previous commit was a plan only. Cloudflare production commands have now been changed via the Builds API to `npm run build:club` / `npm run deploy:club`; preview defaults use `npm run build:club` / `npm run preview:club`. Other account/build settings were retained.

Repository deployment is now explicit in `wrangler.club-web.jsonc`, using Worker `table-tennis-ireland`, assets `apps/club-web/dist`, SPA fallback and workers.dev. Wrangler is pinned as a development dependency and `.nvmrc` uses Node 22 to meet the deployment CLI's runtime requirement. `preview:club` uploads an isolated version instead of promoting production. A successful remote build and URL/content verification must still be recorded below after inspection. No token values are stored here.

## Confirmed remote state

| Item | API observation |
| --- | --- |
| Account ID | `6502a73494f4ee7107b36c620ee76471` |
| Account contact/name | `ttclubsie@gmail.com` account |
| Workers subdomain | `ttclubsie` |
| Existing Worker name | `table-tennis-ireland` |
| Worker tag | `d699159f1a6740de815d4229e261d85d` |
| Connected Git repository | `tamil07/table-tennis-ireland` |
| Branch / root | `main` / `/` |
| Latest inspected build | `fbcb4efe-d58e-47dc-b205-2e1c1bf3ea7b`, failed |
| Build trigger ID | `cf9305fe-087f-48e4-a831-5e82aab37ee5` |
| Deployed code source | `dash_template`; `has_assets=false` |

The inspected build failed before deployment. The API lists dashboard-template deployments, not a successful repository website deployment. The likely workers.dev address is `https://table-tennis-ireland.ttclubsie.workers.dev`; route enablement and rendered content still require verification.

## Findings

1. **Proven build failure:** configured command is `npm run build --workspace @ttti/club-web`. The repository package is `@tti/club-web`. Logs end with `No workspaces found: --workspace=@ttti/club-web`.
2. **Deployment mismatch to fix before retry:** the deploy command names `Leeside-web`, but the connected Worker is `table-tennis-ireland`. Align it with the actual Worker rather than unintentionally targeting another service. This was not the observed build failure because deployment was never reached.
3. Dependency installation completed. The log also contains `glob` deprecation and an esbuild install-script warning. These are follow-up dependency/build-policy checks, not the recorded fatal error.
4. The repository has no Wrangler deployment configuration. Plan explicit app/website deployment configuration so monorepo assets and SPA behavior are reproducible instead of relying on auto-detection.

## Proposed settings for the existing website Worker

| Setting | Planned value |
| --- | --- |
| Worker | Keep `table-tennis-ireland` |
| Branch | `main` |
| Root | Repository root `/` |
| Build | `npm run build --workspace @tti/club-web` |
| Deploy | `npx wrangler deploy --name table-tennis-ireland --assets ./apps/club-web/dist` |
| Environment | Synthetic website demo; no Supabase variables or database credentials needed |

If a different Worker name is deliberately chosen later, update the dashboard target, command and committed configuration together. Do not assume the earlier suggested `leeside-web` is the created resource.

The preview command was not returned in the inspected build metadata. Check it in Build settings before using branch previews; do not claim it has been verified. Plan an explicit Wrangler configuration with this asset path and SPA fallback, and validate the actual preview command supported by the installed Wrangler version against that configuration. No Cloudflare setting was changed during this inspection.

## Execution sequence

1. **Done:** corrected `npm run build --workspace @tti/club-web` passes locally (TypeScript and Vite production build, 5 November 2026). This verifies the command, not a remote Cloudflare deployment.
2. Prepare explicit deployment configuration and update Cloudflare build/deploy settings to the intended Worker. Restrict changes to these deployment resources; do not alter DNS, billing or Supabase.
3. Retry the website build and inspect its full install, build and deploy logs. Confirm the successful build's commit matches the intended `main` revision.
4. Verify the actual workers.dev URL serves the Leeside demo assets, mobile layout, asset URLs and expected navigation/SPA behavior rather than a starter template.
5. Configure the national app as a separate Worker/build target from `apps/platform`, keeping Supabase variables unset for its synthetic demo while setup is paused. A local ignored `.env.local` does not automatically become a Cloudflare build variable.
6. Check each channel's preview settings, automatic `main` deployments and rollback behavior; document successful URLs/status only after verification.
7. Review dependency warnings and schedule appropriate updates without misidentifying them as the current failure.

## API access and earlier shell setup

- Browser login, CLI OAuth, user API tokens and Cloudflare's deployment build tokens are distinct credentials/access paths.
- An export in the user's terminal was not inherited by the assistant tool processes. No credential was available there until the owner explicitly supplied a temporary token for this inspection.
- Prefer a user token scoped to the required account and permissions. Cloudflare's dashboard uses `Workers Builds Configuration`, while some endpoint permission documentation uses `Workers CI`; `Workers Scripts: Read` permits Worker discovery. Build-token credentials used by Cloudflare's build system are separate.
- Only GET requests were used: token verification, accounts, Workers/scripts, recent builds, build logs, account Workers subdomain and deployments. No retry, settings mutation, deployment, DNS or billing API call was made.
- Never commit tokens, database passwords or secret keys, nor place a Cloudflare token in `VITE_*` variables. Use a suitable secret store or approved ignored local credential file for future access. Verify token validity at reuse and revoke the temporary token when inspection access is no longer needed; do not assume permission to replace/revoke it automatically.
- An API token with build-edit capability does not authorize unrelated changes. This request authorizes inspection and planning; the pending fixes above are not represented as completed.

References: [Workers Builds API](https://developers.cloudflare.com/workers/ci-cd/builds/api-reference/), [Build configuration](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/).


## Operational portal delivery — 7 November 2026

Main commit `2577059` is pushed and the existing website Worker now serves the shared operational portal in synthetic mode. No API token was needed for public verification. All served assets matched the local production build:

| Asset | SHA-256 |
| --- | --- |
| `index-Bhwyd7TY.js` | `a9c71852ac5407f371cd6163d211745beab33fc4fa159968db0851b2ab757d09` |
| `qr-BeMEBtOm.js` | `7a913a1cc05984bb0be151caf34ea55a65f27e562d7e9b2226e70515154a17c0` |
| `supabase-rGanuP7S.js` | `4aa11d5b6bcd2a97d257c660f2aa538a8f551c45c21cd38b4edcff6b1a8f02c2` |
| `index-DTdpFAQR.css` | `eb4d572b10b761cb8a96868c070b04c708f38aa2f85a4edcad66d41a006ec886` |

SPA fallback and deployed synthetic browser flows passed: catalogue, guardian booking/approval, attendance/report, match review, reflection privacy, coach aggregate and 390px/320px layouts. This does not verify live Supabase, real delivery, preview isolation or rollback. The separate `ttclubs-app` Worker config is ready but not remotely deployed. Follow [the personal-laptop launch guide](PERSONAL_LAPTOP_LAUNCH.md) for fresh CLI logins, account configuration and activation; office hosted setup remains paused.
