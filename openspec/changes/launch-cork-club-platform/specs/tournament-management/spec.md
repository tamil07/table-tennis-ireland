## ADDED Requirements

### Requirement: Configurable club tournament
An authorized coach or admin SHALL be able to create a dated club tournament linked to a club session and configure its name, competition format, singles or doubles mode, participants, match format, optional table assignments, start time, and publication state.

#### Scenario: Coach creates a league tournament
- **WHEN** an authorized coach selects a round-robin league format, valid participants, and permitted scoring settings
- **THEN** the system saves a draft tournament and previews the fixtures and standings rules before publication

#### Scenario: Coach creates a knockout tournament
- **WHEN** an authorized coach selects a single-elimination format, valid participants, and a permitted seeding method
- **THEN** the system saves a draft bracket including any required byes before publication

#### Scenario: Doubles tournament
- **WHEN** an authorized organizer creates a doubles tournament
- **THEN** the system requires valid two-player teams and generates team-based fixtures or bracket positions

#### Scenario: Guest participant
- **WHEN** an authorized organizer includes an identified guest who has no platform account
- **THEN** the system retains that guest identity in tournament and match records and permits a later account link without rewriting history

#### Scenario: Optional table number omitted
- **WHEN** an organizer creates or schedules a match without a table number
- **THEN** the system accepts the match and allows a table to be assigned later

### Requirement: Tournament lifecycle
The system SHALL maintain tournament states including draft, published, in progress, completed, and cancelled, and SHALL audit state and configuration changes.

#### Scenario: Publish tournament
- **WHEN** an authorized organizer publishes a valid draft tournament
- **THEN** the system makes its participants, format, fixtures or bracket, and start details visible to permitted users

#### Scenario: Start tournament
- **WHEN** an authorized organizer starts a published tournament on its session date
- **THEN** the system marks it in progress and enables its scheduled matches for scoring

#### Scenario: Change structure after start
- **WHEN** an organizer attempts to change participants or regenerate fixtures after the tournament has started
- **THEN** the system warns about affected matches, requires a reason and confirmation, and retains the prior structure in audit history

#### Scenario: Cancel tournament
- **WHEN** an authorized coach or admin cancels a tournament and supplies a reason
- **THEN** the system marks it cancelled, retains its records, and notifies affected participants

### Requirement: Delegated player organizer
An authorized coach or admin SHALL be able to nominate one or more registered players as organizers for a specific tournament without granting them general coach or admin privileges.

#### Scenario: Nominate player organizer
- **WHEN** a coach or admin appoints a player to a tournament with organizer permissions
- **THEN** the player can start that tournament, manage its participant check-in, fixtures, optional table assignments, and match operations only within the delegated scope

#### Scenario: Revoke nomination
- **WHEN** a coach or admin revokes a player's organizer nomination
- **THEN** the player immediately loses tournament-management actions while their previous audited actions remain

#### Scenario: Delegate attempts club administration
- **WHEN** a nominated player attempts to manage memberships, club roles, payments, or another tournament outside their delegation
- **THEN** the system refuses the action

### Requirement: Tournament participant attendance
An authorized coach, admin, or nominated tournament organizer SHALL be able to select registered players and guests from the app and record tournament-session attendance for participants who did not use the kiosk.

#### Scenario: Add checked-in player
- **WHEN** an organizer selects a player already recorded as attending the linked session
- **THEN** the system adds the player to the tournament without creating duplicate attendance

#### Scenario: Organizer checks in absent player
- **WHEN** an organizer selects a recognized player who has not checked in and confirms that the player is physically present
- **THEN** the system creates an audited manual attendance record with the player's current membership classification and adds the player to the tournament

#### Scenario: Organizer checks in guest
- **WHEN** an organizer confirms that an identified guest is physically present
- **THEN** the system creates guest attendance linked to the tournament and keeps it distinct from active membership

### Requirement: League fixtures and standings
For a round-robin league tournament, the system SHALL generate the configured participant pairings and calculate standings only from confirmed, completed match results using the tournament's configured points and tie-break rules.

#### Scenario: Generate round-robin fixtures
- **WHEN** an organizer confirms a valid league participant list
- **THEN** the system creates the required fixtures so each configured opponent pairing occurs the configured number of times

#### Scenario: Confirmed result updates standings
- **WHEN** a league match becomes confirmed
- **THEN** the system updates played, won, lost, game and point differences, competition points, and table position according to the tournament rules

#### Scenario: Incomplete match
- **WHEN** a league match is abandoned or marked incomplete
- **THEN** the system excludes it from player performance statistics and standings calculations unless a coach later records a resolved result

#### Scenario: Tied standings
- **WHEN** participants have equal competition points
- **THEN** the system applies the configured tie-break order consistently and displays which rule determined their positions

### Requirement: Knockout bracket progression
For a single-elimination tournament, the system SHALL generate a bracket using the configured manual, seeded, or random placement and SHALL advance winners only from confirmed match results.

#### Scenario: Bracket includes a bye
- **WHEN** the participant count does not fill the bracket size
- **THEN** the system assigns configured or generated byes and advances those participants without creating false match results

#### Scenario: Confirmed winner advances
- **WHEN** a knockout match result becomes confirmed
- **THEN** the system advances its winner to the correct next-round position

#### Scenario: Result is disputed
- **WHEN** a knockout result enters changes-requested or disputed state
- **THEN** the system prevents dependent next-round confirmation until a coach resolves the result

### Requirement: Tournament completion
An authorized coach or admin SHALL be able to complete a tournament while preserving confirmed results and explicitly classifying unresolved matches.

#### Scenario: Complete tournament normally
- **WHEN** all required matches are confirmed and an authorized coach or admin completes the tournament
- **THEN** the system freezes the final standings or bracket and publishes the permitted final results

#### Scenario: Complete with incomplete matches
- **WHEN** an authorized coach completes a tournament containing abandoned or unresolved matches and supplies a reason
- **THEN** the system preserves those matches as incomplete, excludes them from player statistics, and clearly marks any affected standings or bracket outcome
