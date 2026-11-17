## Context

The current platform stores each club's data separately within one database project, with shared sign-in. Club onboarding is still a manual, Leeside-specific script. The owner will run the platform personally and commit full time. Clubs are expected to pay.

## Decisions

- **Operator model.** One operator (the owner). Other people get access only through individual accounts with the minimum permissions needed. Access, recovery codes and backups are documented in the operator runbook.
- **Commercial model.** Clubs pay a recurring subscription per club. The exact price, billing provider and support level are decided in phase 2, before the first paid club. No pricing is committed in this document.
- **Onboarding.** A club is created by the operator through a tool, never by hand-written SQL. Each club gets its own slug, join code, website address and branding configuration.
- **Data protection.** Before a second club joins, the platform needs: a data processing agreement with each club, a privacy notice, a retention schedule approved by the owner, a documented data-request process, and a review of safeguarding obligations for junior data and coach vetting, with legal advice where needed.
- **Hosting.** Paid hosting and automated off-site backups with tested restore are required before the second club. Monitoring and an incident process are required before any club pays.
- **Scale.** Load testing on realistic multi-club data is required before onboarding a third club. The current single-record-per-club storage design is reviewed in that test.
- **Styling.** Out of scope here. The visual-design change decides it separately.

## Risks

- Holding children's data for several clubs raises the stakes of any mistake; the legal review is a gate, not an option.
- One operator is a single point of failure; trusted co-maintainers are needed before paid clubs depend on the platform.
- Free tiers have no backup or uptime guarantees; they cannot support paying clubs.
- A single shared database project means a mistake could affect every club; isolation tests and per-club key handling must be verified.
- Clubs may expect online payments, store apps or imports from existing websites. These are deferred and must be stated honestly in sales material.
