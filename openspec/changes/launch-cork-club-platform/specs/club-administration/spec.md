## ADDED Requirements

### Requirement: Unified administration
Authorized club admins SHALL be able to manage club content and website portfolio, user access, guardian links, memberships, bookings, tournaments, matches, communications, shared work, and club settings from either their club website's authenticated administration area or that club's management section in the platform app.

#### Scenario: Admin accesses management area
- **WHEN** an authenticated user with the required admin permission opens a management function
- **THEN** the system displays the relevant records and permitted actions

#### Scenario: Non-admin accesses management area
- **WHEN** a user without the required admin permission requests a management function
- **THEN** the system refuses access

#### Scenario: Admin uses either management entry point
- **WHEN** an authorized admin changes the same club record through the club website or platform app
- **THEN** the system applies identical server-side permissions and updates the same canonical club-scoped record

#### Scenario: Multi-club admin switches context
- **WHEN** an admin who holds roles in more than one club switches management context
- **THEN** the system updates the visible portfolio and permitted actions to the selected club and does not mix data between clubs

### Requirement: Administrative audit history
The system SHALL retain an audit history for security-sensitive and member-affecting administrative changes, including the acting user, action, affected record, time, and prior and new values where applicable.

#### Scenario: Admin changes a member record
- **WHEN** an admin changes membership, guardian linkage, role, payment, tournament, match, or development access data
- **THEN** the system creates an audit entry that the acting admin cannot edit

### Requirement: Club data boundary
Every non-public operational record SHALL belong to an explicit club, and data access SHALL be restricted to the relevant club even while only one club is active.

#### Scenario: Request references another club boundary
- **WHEN** an authenticated request attempts to read or change operational data outside the user's authorized club
- **THEN** the system refuses the request and discloses no data from the other club

### Requirement: Personal data administration
An authorized admin SHALL be able to locate personal data for correction, export, retention review, or deletion handling, subject to legal and safeguarding retention obligations.

#### Scenario: Valid personal data request
- **WHEN** an authorized admin starts a verified personal-data request for a member
- **THEN** the system identifies the member's relevant stored data and records the request for accountable handling

### Requirement: Shared admin work ownership
The system SHALL allow a configurable group of individually authenticated club admins to view, claim, assign, release, comment on, and resolve shared operational alerts without using a shared login.

#### Scenario: Admin claims an alert
- **WHEN** an authorized admin claims an unassigned membership, attendance, payment, notification, or data-quality alert
- **THEN** the system assigns it to that admin while keeping its status visible to the rest of the admin group

#### Scenario: Admin reassigns work
- **WHEN** an authorized admin reassigns a claimed alert to another eligible admin and supplies a note where required
- **THEN** the system updates ownership and retains the prior owner, acting admin, time, and note in history

#### Scenario: Admin resolves shared work
- **WHEN** an authorized admin records the required outcome and resolves an alert
- **THEN** the system closes it for the team while retaining ownership, comments, actions, and resolution details

#### Scenario: Two admins act concurrently
- **WHEN** two admins attempt a conflicting ownership or resolution update
- **THEN** the system accepts one current update, rejects or refreshes the stale action, and prevents silent loss of either admin's work
