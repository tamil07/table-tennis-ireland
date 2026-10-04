## ADDED Requirements

### Requirement: Shared member account
The system SHALL provide one account per person for authenticated use of both the website and mobile app.

#### Scenario: Use the same account on both channels
- **WHEN** a registered user signs in with valid credentials on the website or mobile app
- **THEN** the system grants access to the same profile, permissions, and club data

#### Scenario: Invalid sign-in
- **WHEN** a person submits invalid or inactive account credentials
- **THEN** the system denies access without revealing whether a particular account exists

### Requirement: Flexible verified contact methods
The system SHALL store email addresses and mobile numbers as separate contact methods, allow an adult account holder to maintain either or both, identify the primary contact method, record verification independently, and require at least one verified sign-in identifier for independent account access. Email addresses SHALL accept any valid provider and SHALL NOT be limited to Gmail. Mobile numbers SHALL be normalized to international E.164 format.

#### Scenario: Adult registers with email
- **WHEN** an adult or guardian registers with a valid email address from any provider and completes verification
- **THEN** the system links the verified email sign-in identifier to one platform identity without requiring a mobile number

#### Scenario: Adult supplies both contact methods
- **WHEN** an adult adds an email address and mobile number
- **THEN** the system stores and verifies the methods independently and allows the adult to choose a primary contact method without creating another identity

#### Scenario: Mobile sign-in is enabled
- **WHEN** the platform has an approved SMS provider configured and a user requests sign-in with a verified mobile number
- **THEN** the system sends a short-lived one-time code subject to rate and abuse controls and opens the same platform identity used by that person's email login, where present

#### Scenario: Mobile sign-in is unavailable
- **WHEN** SMS authentication is not configured or is temporarily unavailable
- **THEN** the system does not imply that a text was sent and offers another verified sign-in method or a club-assisted recovery path

#### Scenario: Duplicate identifier is entered
- **WHEN** a verified email address or mobile number is already linked to a platform identity
- **THEN** the system directs the person to sign in or recover that identity instead of creating a duplicate account

### Requirement: Player profile without independent login
The system SHALL allow a player profile to exist without its own authentication account so that juniors, phone-only applicants during an email-first pilot, and members who do not use digital services can still hold club membership, credentials, attendance, matches, and development records.

#### Scenario: Junior has no personal email or phone
- **WHEN** a guardian registers a junior who has no independent contact method
- **THEN** the system creates the junior player profile under the authorized guardian relationship without inventing login credentials for the junior

#### Scenario: Staff records a player without digital access
- **WHEN** an authorized admin creates a player who currently has no supported verified sign-in method
- **THEN** the player can receive a club relationship and physical attendance credential while self-service remains unavailable until an account is securely claimed

#### Scenario: Existing player later claims access
- **WHEN** the player later verifies an approved email address or mobile number and passes the club's identity-matching process
- **THEN** the system attaches authentication to the existing player profile without replacing its club, membership, attendance, or match history

### Requirement: Data-minimized person profile
The system SHALL collect only information needed for account recovery, club operation, age-appropriate participation, safeguarding, or an explicitly approved club purpose. Core registration SHALL capture the person's name, adult-or-junior classification, applicable guardian relationship, at least one reachable adult contact method, and required policy acknowledgements. Date of birth SHALL be required only where age or junior status must be established. Home address, profile photograph, health information, and additional emergency information SHALL remain optional and disabled unless the club documents a purpose, access rule, and retention period.

#### Scenario: Adult supplies minimum registration data
- **WHEN** an adult registers with a name, one verified email or supported mobile identifier, and the required acknowledgements
- **THEN** the system accepts the account registration without requiring an unnecessary home address, photograph, or second contact method

#### Scenario: Junior application is submitted
- **WHEN** a guardian submits a junior application
- **THEN** the system records the junior's name and necessary age information plus the guardian relationship and verified adult contact without requiring the junior to supply personal contact details

#### Scenario: Club enables additional sensitive information
- **WHEN** a club proposes collecting emergency, accessibility, medical, or other sensitive information
- **THEN** the system requires a documented purpose, restricted permissions, retention rule, and approved wording before enabling those fields for that club

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

#### Scenario: Junior contact is optional
- **WHEN** a guardian registers or manages a junior
- **THEN** the system requires an authorized guardian contact method but does not require or use a junior's personal email address or mobile number
