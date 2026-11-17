# Tasks: grow to paying clubs

Gates must be passed in order. A later phase does not start until its gate is recorded here with the date and the evidence.

## Phase 0 — Prove Leeside (gate: one full season run)

- [ ] 0.1 Complete the owner smoke test, sign-in and password recovery checks in `launch-cork-club-platform` task 14.2 and 14.3.
- [ ] 0.2 Set up transactional email, scheduler and Auth SMTP (14.6–14.10).
- [ ] 0.3 Set up encrypted off-site backups and complete a restore test (14.13).
- [ ] 0.4 Run Leeside with real members for at least one full season; record admin time per task, incidents, and member feedback.
- [ ] 0.5 Gate: write the Phase 0 result (what worked, what failed, what was fixed) into implementation-status.md with the date.

## Phase 1 — Repeatable onboarding (gate: a second club set up with no manual SQL)

- [ ] 1.1 Replace the Leeside-only bootstrap with a parameterised club setup (name, slug, join code, owner, website address).
- [ ] 1.2 Build the operator screen: create a club, approve its website address, invite its first admin.
- [ ] 1.3 Make branding (name, logo, colours) per-club configuration.
- [ ] 1.4 Extend the cross-club isolation tests to every new screen and operator action.
- [ ] 1.5 Decide the platform name, domain and trademark position before any public use.
- [ ] 1.6 Write the operator runbook: access, recovery codes, backups, deployments, incident steps.
- [ ] 1.7 Gate: onboard a test club end to end using only the operator tools; record evidence.

## Phase 2 — Paid pilot with one or two clubs (gate: signed pilot agreements and a paid-hosting review)

- [ ] 2.1 Decide the price model, billing provider and support hours; record them in design.md.
- [ ] 2.2 Draft the terms of service, data processing agreement, privacy notice and retention schedule; obtain legal review.
- [ ] 2.3 Complete the safeguarding review for junior data and coach vetting, with legal advice where needed.
- [ ] 2.4 Move hosting from free tiers to paid plans; set spending limits and alerts.
- [ ] 2.5 Set up monitoring, uptime checks and an incident process with a status page.
- [ ] 2.6 Recruit trusted co-maintainers with individual accounts and MFA, able to deploy and recover.
- [ ] 2.7 Sign pilot agreements with one or two friendly clubs, covering data terms, exit, and support contact.
- [ ] 2.8 Onboard the pilot clubs with the Phase 1 tools; collect feedback and usage.
- [ ] 2.9 Gate: decide, with evidence, whether to offer the platform more widely.

## Phase 3 — General offering (gate: phase 2 evidence accepted)

- [ ] 3.1 Publish terms, pricing and support commitments.
- [ ] 3.2 Run load tests on realistic multi-club data; decide whether storage design changes before a third club.
- [ ] 3.3 Prepare sales material from real pilot results only; state the deferred items honestly (online payments, store apps, imports).
- [ ] 3.4 Review store apps and online payments on demand from paying clubs, with their cost recorded.
