## ADDED Requirements

### Requirement: Independent implementation during hosted setup pause
The repository SHALL contain runnable frontend workflows, shared application rules, server-function source, versioned migrations and local tests without requiring a connection to the hosted database. The office-laptop Supabase connection restriction SHALL NOT be bypassed. Hosted database setup, live backend acceptance and services requiring owner account configuration SHALL remain separate release gates.

#### Scenario: Development proceeds on the office laptop
- **WHEN** the hosted Supabase project cannot be connected from the office laptop
- **THEN** implementation uses synthetic local state and isolated local database/HTTP tests, preserves the hosted pause and does not claim live email, authentication or shared booking acceptance

### Requirement: Personal-laptop handover without another coding agent
The repository SHALL provide one ordered launch guide and repeatable helper scripts sufficient for the owner to prepare an existing personal-laptop checkout, reauthenticate Supabase and Cloudflare, review/apply migrations, prepare private environment files, provision the first authorized owner and deploy backend plus independent website/app targets without writing application code or buying another coding-agent subscription.

#### Scenario: CLI authentication is not present on the personal laptop
- **WHEN** the owner opens the checkout on a different laptop
- **THEN** the guide identifies fresh CLI login/link/whoami steps, the existing organization/project/Worker identifiers, browser versus server variables, exact origins/callbacks and the fact that office shell exports and login sessions are not transferred

#### Scenario: Office HTTP settings do not apply
- **WHEN** the owner configures the personal laptop
- **THEN** the guide uses normal permitted HTTPS, recreates provider authentication and private variables, distinguishes HTTPS API access from PostgreSQL connectivity, and does not instruct copying office proxies or disabling TLS verification

#### Scenario: PostgreSQL connections remain unavailable
- **WHEN** the owner's permitted personal connection supports HTTPS but not the PostgreSQL path
- **THEN** a generated transactional SQL-Editor bundle includes ordered repository migrations and migration history, skips recorded versions and excludes CI auth fixtures and synthetic member seeds

#### Scenario: Existing environment files are present
- **WHEN** the environment helper runs again
- **THEN** it preserves existing files, creates only missing ignored files, rejects secret/service-role keys as browser keys and leaves live mode disabled until explicit owner setup is complete

### Requirement: Explicit activation and reproducible function packaging
Live frontends SHALL require explicit live-mode configuration. A missing live configuration or failed server connection SHALL NOT silently switch a real user to synthetic persistence. Backend deployment SHALL prepare function-local copies from the canonical shared rules before HTTP bundling, and frontend deployment SHALL use separate website/app assets and Worker configurations.

#### Scenario: Live service is not configured
- **WHEN** live mode is enabled but required connection settings are missing or unavailable
- **THEN** the UI reports the configuration/connection failure and does not claim that a browser-local write saved a real club record

#### Scenario: Owner deploys without Docker
- **WHEN** the owner follows the backend deployment script
- **THEN** shared source is staged inside the function tree and the CLI uses HTTP bundling without requiring Docker or edits to imports

### Requirement: Configuration and verification evidence
The guide and OpenSpec status SHALL distinguish local tests, source delivery, public synthetic deployment, hosted migration application and live acceptance. Sending-provider credentials, Auth SMTP, optional Google/SMS providers, approved policies, backups and account recovery SHALL remain explicit owner configuration. Credentials and generated private SQL/environment files SHALL be excluded from Git.

#### Scenario: Local checks pass
- **WHEN** type checks, domain tests, HTTP-handler tests and isolated PostgreSQL tests pass
- **THEN** the repository records those checks without marking hosted migrations, cross-device acceptance or external email delivery as verified

#### Scenario: Owner revisits the project with another agent
- **WHEN** another coding agent reads root AGENTS.md
- **THEN** it finds the active architecture, exact setup guide, pending checklist, source-to-capability mapping and explicit deferred/live-only work without relying on chat history

### Requirement: Automated local and integration verification
The repository SHALL provide a single local verification command for type checks, domain and shared-client unit tests, isolated setup-helper regressions, both frontend builds, backend HTTP tests and browser workflows for website and app. The command SHALL stage generated function rules, manage temporary browser builds and servers, preserve existing environment/deployment files and require no cloud login or local database service. First-use free test-tool downloads and any OS browser-library prerequisite SHALL be documented.

#### Scenario: Owner verifies a fresh checkout
- **WHEN** the owner installs dependencies on Node 22 and runs the documented verification command
- **THEN** checks run without manual server startup, Docker or provider credentials, report failures with nonzero exit status, and distinguish local simulations from hosted acceptance

#### Scenario: Existing live configuration is present
- **WHEN** browser checks run in a checkout containing live configuration
- **THEN** they use separate temporary synthetic builds, refuse to mutate live records and preserve existing environment files and deployable assets

#### Scenario: Website and app compete for the same place
- **WHEN** the CI integration suite submits simultaneous commands through the actual API/domain service backed by isolated PostgreSQL
- **THEN** exactly one command commits, the other returns a conflict, retries do not duplicate inventory, and a maintainer's approval is visible to another client

#### Scenario: Personal-laptop setup files are regenerated
- **WHEN** automated setup tests exercise environment, bootstrap, migration, function packaging and schedule helpers in fresh temporary directories
- **THEN** unsafe keys and malformed owner identifiers are refused, private files are protected, existing owner settings survive reruns and all documented local client origins are supported

#### Scenario: CI verifies the database handover
- **WHEN** CI prepares its isolated database
- **THEN** it applies the generated migration bundle and fake-owner bootstrap twice, checks SQL permissions and booking constraints, and runs API/database integration with explicit local Auth/PostgREST adapters without contacting hosted Supabase

#### Scenario: Preview output contains terminal colours
- **WHEN** Vite prints a coloured address on CI or Windows
- **THEN** the verification launcher extracts the actual loopback port, starts the browser checks successfully and reports failures through scoped diagnostics instead of waiting indefinitely
