## ADDED Requirements

### Requirement: Coach-led development summary
An authorized coach SHALL be able to maintain private working notes and a separate publishable player development summary containing strengths, areas for improvement, and future goals.

#### Scenario: Coach updates a summary
- **WHEN** an assigned or authorized coach saves a valid development update
- **THEN** the system records the content, visibility state, author, and update time against the player

#### Scenario: Coach keeps working notes private
- **WHEN** a coach saves content as a private working note
- **THEN** the system makes it available only to authorized coaches and admins and excludes it from the player-facing summary

#### Scenario: Player cannot alter coach assessment
- **WHEN** a player or guardian attempts to alter coach-authored assessment content
- **THEN** the system refuses the change

### Requirement: Appropriate development visibility
An adult player SHALL be able to view their own published development summary, and a designated guardian SHALL be able to view the published summary of a linked junior; neither SHALL see private coach working notes.

#### Scenario: Adult player views summary
- **WHEN** an adult player opens their development area
- **THEN** the system displays their currently published strengths, improvement areas, and goals

#### Scenario: Unrelated person requests a summary
- **WHEN** a user who is neither the player, a designated guardian, an authorized coach, nor an authorized admin requests the summary
- **THEN** the system refuses access and reveals no coaching content

### Requirement: Distinct coach and family sign-off
A publishable development summary SHALL require two distinct identities: an authorized coach and the player or designated guardian. The player/guardian MAY see only their own pending summary to review and sign it before publication; this exception SHALL NOT expose private coach working notes or another family's summary. Revising assessment content SHALL reset previous sign-offs.

#### Scenario: Family reviews pending goals
- **WHEN** the player or designated guardian opens their own pending assessment
- **THEN** they can review and sign the publishable strengths, improvement areas and goals, while private working notes remain hidden

#### Scenario: One person holds both roles
- **WHEN** the coach is also the designated guardian and has already signed in one capacity
- **THEN** a second distinct authorized identity is required before publication

### Requirement: Human-controlled conclusions
The system SHALL present development conclusions only when an authorized human has entered or approved them. Descriptive aggregates of player-authored reflections MAY be calculated without coach approval when clearly labelled as reported observations with denominators and provenance; these SHALL NOT be presented as diagnoses or coach assessments.

#### Scenario: Match data exists without coach assessment
- **WHEN** match history exists but no coach has published a development summary
- **THEN** the system does not generate or present automated claims about what the player must improve
