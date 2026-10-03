## ADDED Requirements

### Requirement: Shared member account
The system SHALL provide one account per person for authenticated use of both the website and mobile app.

#### Scenario: Use the same account on both channels
- **WHEN** a registered user signs in with valid credentials on the website or mobile app
- **THEN** the system grants access to the same profile, permissions, and club data

#### Scenario: Invalid sign-in
- **WHEN** a person submits invalid or inactive account credentials
- **THEN** the system denies access without revealing whether a particular account exists

### Requirement: Role-based access
The system SHALL enforce permissions for adult players, parents or guardians, coaches, and club admins on the server, independently of what controls are visible in the interface and independently for each club relationship.

#### Scenario: Authorized action
- **WHEN** an authenticated user requests an action granted to one of their roles
- **THEN** the system permits the action

#### Scenario: Unauthorized action
- **WHEN** a user requests an action not granted to their roles
- **THEN** the system refuses the action and does not disclose protected data

#### Scenario: Role applies only to its club
- **WHEN** a user with a coach or admin role in one club requests the same privileged action in another club where they do not hold that role
- **THEN** the system refuses the action and discloses no protected data from the other club

### Requirement: Multi-club participation
The system SHALL allow one platform identity to have active relationships with multiple clubs at the same time, including different player, coach, guardian, or admin roles in each club.

#### Scenario: Player joins another club
- **WHEN** an existing player is accepted as a member of another club
- **THEN** the system adds a separate club membership to the same platform identity without replacing the player's existing club memberships or history

#### Scenario: Coach works with multiple clubs
- **WHEN** an existing user is granted a coach role by another club
- **THEN** the system adds that club-scoped coach role without extending it to clubs that did not grant the role

#### Scenario: User changes active club context
- **WHEN** a user who belongs to multiple clubs selects a different club in the platform app
- **THEN** the system shows the selected club's permitted content, membership, attendance, match, and coaching context without mixing records from another club

#### Scenario: App shows player's clubs
- **WHEN** a player has a Leeside membership and a membership with a Dublin club
- **THEN** the app's My Clubs view shows both clubs once, including the player's current membership or relationship status for each

#### Scenario: User opens a club from My Clubs
- **WHEN** a user selects one club from My Clubs
- **THEN** the system enters that club context for website links, membership, attendance, tournaments, matches, coaching, communications, and permitted administration

#### Scenario: User follows club website link
- **WHEN** a user selects the public website action from a club context
- **THEN** the system opens that club's verified branded website rather than a generic or different club website

#### Scenario: User signs in through a club website
- **WHEN** a registered person signs in from an onboarded club website
- **THEN** the system uses the same platform identity and opens the permitted context for that club without creating a duplicate account

### Requirement: Independent club membership records
Each player's membership type, dates, payment records, status, attendance entitlement, and renewal configuration SHALL be maintained independently for each club.

#### Scenario: Membership expires in one club
- **WHEN** a player's membership expires in one club while another club membership remains active
- **THEN** the system restricts only the expired club relationship and leaves the other club membership unchanged

### Requirement: Junior and guardian relationship
The system SHALL allow an authorized club admin to link a junior player with one or more responsible parent or guardian accounts, with the relationship and permitted actions scoped to the relevant club where required.

#### Scenario: Guardian views linked junior
- **WHEN** a guardian opens a junior profile to which they are actively linked
- **THEN** the system displays only the junior information and actions permitted to guardians

#### Scenario: Guardian attempts to view an unlinked junior
- **WHEN** a guardian requests information for a junior to whom they are not linked
- **THEN** the system refuses access
