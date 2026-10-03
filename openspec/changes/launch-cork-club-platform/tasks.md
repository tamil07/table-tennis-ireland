## 1. Workspace foundation

- [x] 1.1 Create an npm-workspaces monorepo for the club website, national platform PWA, and shared packages
- [ ] 1.2 Configure shared TypeScript, linting, formatting, testing, and environment-variable conventions
- [x] 1.3 Add continuous-integration checks for type checking, tests, and production builds
- [x] 1.4 Document traceability from code areas to OpenSpec capabilities

## 2. Shared domain and user experience

- [x] 2.1 Implement club, identity, role, membership, attendance, match, tournament, and development domain types
- [x] 2.2 Implement club-context selection and cross-club isolation helpers
- [x] 2.3 Create accessible shared UI primitives and responsive layouts
- [x] 2.4 Add neutral platform and club-specific branding configuration
- [x] 2.5 Add unit tests for membership state, role permissions, and club-context isolation

## 3. Database, authentication, and authorization

- [x] 3.1 Create versioned Supabase migrations for platform identities, clubs, verified domains, profiles, roles, and guardian relationships
- [x] 3.2 Create migrations for website portfolios, memberships, payments, sessions, bookings, attendance, and credentials
- [x] 3.3 Create migrations for matches, result reviews, tournaments, coaching records, notifications, work items, and audit events
- [ ] 3.4 Enable row-level security and add club-scoped policies using server-controlled role relationships
- [ ] 3.5 Implement shared Supabase clients and authenticated session handling for both frontends
- [ ] 3.6 Add local seed data for Leeside and synthetic multi-club authorization tests
- [ ] 3.7 Add automated database tests proving cross-club access is denied

## 4. Club website portfolio

- [ ] 4.1 Resolve a verified request hostname to the correct club portfolio without granting authorization from the hostname alone
- [ ] 4.2 Build accessible public pages for club details, contacts, policies, membership, timetable, news, and events
- [ ] 4.3 Build authenticated club-website administration for permitted portfolio content
- [ ] 4.4 Verify that edits made through either frontend update the same canonical club record

## 5. Platform PWA and multi-club access

- [ ] 5.1 Build sign-up, sign-in, password recovery, and account session flows
- [ ] 5.2 Build My Clubs with per-club relationship and membership status
- [ ] 5.3 Build explicit club switching and verified club-website links
- [ ] 5.4 Build guardian-linked junior selection and adult-routed actions
- [ ] 5.5 Add installable PWA metadata, offline shell behavior, and clear offline status

## 6. Membership and communications

- [ ] 6.1 Build public QR/join-code adult and guardian-led junior applications
- [ ] 6.2 Build pending applicant, trial-pass, and admin approval workflows
- [ ] 6.3 Build configurable membership types and historical membership periods
- [ ] 6.4 Build audited manual payment recording and correction without storing bank credentials
- [ ] 6.5 Build 10-day and 3-day renewal reminder scheduling with duplicate prevention
- [ ] 6.6 Build non-formal payment acknowledgements and notification delivery history

## 7. Sessions, bookings, and attendance

- [ ] 7.1 Build recurring session definitions, dated occurrences, cancellations, and capacity-aware bookings
- [ ] 7.2 Build NFC/QR credential issuance, rotation, revocation, and member-card output
- [ ] 7.3 Build the restricted Android kiosk scanner with duplicate prevention and feedback
- [ ] 7.4 Build membership-aware check-in that records expired and no-membership attendance and creates deduplicated alerts
- [ ] 7.5 Build an idempotent, bounded offline scan queue and reconciliation interface
- [ ] 7.6 Build authorized manual check-in, correction, and audit history
- [ ] 7.7 Build daily, weekly, monthly, session-utilization, membership-segment, and top-attendee reporting
- [ ] 7.8 Build configurable daily staff digests without exposing member details in email

## 8. Matches and tournaments

- [ ] 8.1 Build singles/doubles session match creation with registered and guest participants
- [ ] 8.2 Build game-by-game scoring with best-of and win-by-two validation
- [ ] 8.3 Build result submission, opposing-side review, modification, five-day auto-approval, and reminders
- [ ] 8.4 Build coach correction and dispute resolution with immutable audit events
- [ ] 8.5 Build player match history excluding incomplete results from statistics
- [ ] 8.6 Build configurable round-robin league tournaments, fixtures, points, tie-breaks, and standings
- [ ] 8.7 Build configurable single-elimination brackets and confirmed-result progression
- [ ] 8.8 Build tournament-scoped player organizer delegation and participant check-in

## 9. Player development and administration

- [ ] 9.1 Build private coach working notes with restricted access and retention controls
- [ ] 9.2 Build deliberately published strengths, improvement areas, and future-goal summaries
- [ ] 9.3 Build player and guardian visibility for published summaries only
- [ ] 9.4 Build unified club administration with least-privilege role management
- [ ] 9.5 Build claimable, assignable, commentable, and resolvable shared admin work items
- [ ] 9.6 Build personal-data export and correction support with audit history

## 10. Operations and release

- [ ] 10.1 Configure development and production Supabase projects and deployment secrets
- [ ] 10.2 Configure Cloudflare deployments, verified club domains, and the national product domain
- [ ] 10.3 Configure authenticated transactional email and scheduled Edge Functions
- [ ] 10.4 Configure encrypted off-site database and storage backups and test restoration
- [ ] 10.5 Complete accessibility, privacy, safeguarding, security, and retention reviews
- [ ] 10.6 Run the Leeside acceptance pilot for accounts, scanning, membership, reports, matches, and tournaments
- [ ] 10.7 Document Wix cutover, monitoring, free-tier thresholds, rollback, and support ownership
- [ ] 10.8 Prepare Expo native clients and store submissions only after the PWA pilot justifies them
