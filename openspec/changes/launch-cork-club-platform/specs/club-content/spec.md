## ADDED Requirements

### Requirement: Public club information
The system SHALL publish each onboarded club's current contact details, location information, training information, and instructions for joining through that club's public website without requiring an account or membership.

#### Scenario: Visitor views club information
- **WHEN** a visitor opens the club website
- **THEN** the system presents the currently published information for the club mapped to that website domain on mobile and desktop screen sizes

#### Scenario: Player visits another club website
- **WHEN** a player opens a public website for a club to which they do not belong
- **THEN** the system shows that club's public information without exposing private club or member data

### Requirement: News and announcements
Authorized club admins SHALL be able to draft, publish, edit, and unpublish news and announcements only for clubs in which they hold the required permission.

#### Scenario: Admin publishes an announcement
- **WHEN** an authorized admin publishes an announcement
- **THEN** the system makes it visible through the website and mobile app with its publication date

#### Scenario: Unauthorized publishing attempt
- **WHEN** a user without content-management permission attempts to publish content
- **THEN** the system refuses the change

### Requirement: Accessible content experience
Public and authenticated content SHALL support keyboard operation, readable text scaling, labelled interactive controls, and sufficient colour contrast.

#### Scenario: Keyboard navigation
- **WHEN** a visitor navigates an interactive page using only a keyboard
- **THEN** every available action is reachable and has a visible focus state

### Requirement: Distinct website and app identity
Each public club website SHALL use that club's verified domain, branding, navigation, and public portfolio, while the platform app SHALL use a separate national product identity suitable for table-tennis clubs and players across Ireland.

#### Scenario: Visitor opens the Leeside website
- **WHEN** a visitor opens the club's website domain
- **THEN** the system presents Leeside branding and Leeside public content without presenting the website as the national app

#### Scenario: User opens the platform app during the pilot
- **WHEN** a user opens the platform app while Leeside is the only active club
- **THEN** the system presents the neutral platform identity and shows Leeside as a club within the app rather than branding the app itself as Leeside

#### Scenario: Visitor opens another onboarded club website
- **WHEN** a visitor opens a verified domain mapped to another onboarded club
- **THEN** the system presents that club's branding and public portfolio without displaying Leeside branding or content

### Requirement: Shared published club content
Content published for a club SHALL be available consistently through that club's public website and that club's context in the platform app without requiring duplicate entry.

#### Scenario: Admin updates shared club content
- **WHEN** an authorized Leeside admin publishes shared club information
- **THEN** the updated information appears on the club website and within Leeside's area of the platform app

#### Scenario: Dublin club admin publishes content
- **WHEN** an authorized admin for an onboarded Dublin club publishes shared club information
- **THEN** the update appears on the Dublin club website and its platform-app context without affecting Leeside

### Requirement: Club website portfolio
The system SHALL maintain a club-scoped website portfolio containing branding, pages, contacts, policies, timetable, membership information, news, media, and domain mapping for each onboarded club.

#### Scenario: Admin manages portfolio from club website
- **WHEN** an authorized club admin signs in through their club website and updates a permitted portfolio item
- **THEN** the system updates the canonical club-scoped record used by both the website and platform app

#### Scenario: Admin manages portfolio from platform app
- **WHEN** the same authorized admin selects that club in the platform app and updates the same portfolio item
- **THEN** the system updates the same canonical record without creating a duplicate website copy

#### Scenario: Admin attempts another club's portfolio
- **WHEN** a club admin attempts to update a website portfolio for a club where they lack permission
- **THEN** the system refuses the action and discloses no private portfolio-management data
