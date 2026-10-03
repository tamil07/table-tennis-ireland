## ADDED Requirements

### Requirement: Start a session match
An authenticated player recorded as attending an open club session SHALL be able to start a singles or doubles match, select participating registered players or identified guests, and choose a permitted match format.

#### Scenario: Player starts a singles match
- **WHEN** an attending player selects the current session, two participants, and a permitted best-of format
- **THEN** the system creates one in-progress singles match with its starter, session, participants, start time, and format

#### Scenario: Player starts a doubles match
- **WHEN** an attending player selects four participants arranged into two teams and a permitted best-of format
- **THEN** the system creates one in-progress doubles match with the selected teams

#### Scenario: Guest takes part
- **WHEN** a permitted local match includes a person without a platform account
- **THEN** the system records a clearly identified guest participant that an authorized admin can later link to an account without rewriting the original match

#### Scenario: Participant is already in a match
- **WHEN** a player attempts to start another match while recorded in an in-progress match
- **THEN** the system warns the player and prevents the conflicting match unless an authorized coach or admin resolves the first one

### Requirement: Record match scoring
The system SHALL allow an authorized match participant to record game scores while the match is in progress and SHALL validate the result against the selected table-tennis format.

#### Scenario: Record a completed game
- **WHEN** a participant enters a valid game score in which the winner reached at least 11 points and won by at least two points
- **THEN** the system stores the game score and updates the match score

#### Scenario: Extended game
- **WHEN** both sides reach 10 points
- **THEN** the system accepts a game result only when one side leads by two points

#### Scenario: Match-winning game recorded
- **WHEN** one side wins the number of games required by the selected best-of format
- **THEN** the system marks scoring complete and prompts the recorder to review and submit the result for approval

#### Scenario: Score is saved during play
- **WHEN** a participant leaves the scoring screen before the match is complete
- **THEN** the system retains the in-progress scores so an authorized participant can resume later

### Requirement: Finish or abandon a match
An authorized participant SHALL be able to submit a completed match for approval or abandon an unfinished match with a reason.

#### Scenario: Submit completed match
- **WHEN** a participant confirms the final participants, format, game scores, and outcome
- **THEN** the system changes the match to awaiting approval and treats the submitter's confirmation as the participant-side approval when eligible

#### Scenario: Abandon unfinished match
- **WHEN** an authorized participant abandons an in-progress match and supplies a reason
- **THEN** the system retains it as abandoned for audit purposes and excludes it from confirmed player performance statistics

### Requirement: Local match recording
An authenticated player SHALL also be able to enter a completed local match after play with its date, competition or session, participants, game scores, result, and optional notes as an unconfirmed record.

#### Scenario: Player submits a completed match
- **WHEN** an authenticated participant submits all required match details with a valid result
- **THEN** the system stores the match as awaiting approval, associates it with each participating player, and treats the submitter's confirmation as the participant-side approval when eligible

#### Scenario: Invalid match result
- **WHEN** submitted game or match scores are inconsistent with the configured table-tennis scoring rules
- **THEN** the system refuses the record and identifies the invalid score information

### Requirement: Opponent result review
The system SHALL treat final submission as confirmation by the submitting side and SHALL give the opposing side five days to approve the result or request a modification before automatic approval.

#### Scenario: Result is submitted
- **WHEN** a participant submits a completed match result
- **THEN** the system records the submitting-side confirmation, starts a five-day review deadline, keeps the match awaiting opponent review, and notifies eligible opposing-side reviewers in the app

#### Scenario: Opponent approves
- **WHEN** an opposing player, or a linked guardian acting for a junior opponent, approves the submitted result before the deadline
- **THEN** the system records the reviewer and approval time, marks the match confirmed, and includes it in permitted statistics

#### Scenario: Doubles opponent approves
- **WHEN** one eligible player or linked guardian from the opposing doubles team approves before the deadline
- **THEN** the system treats the opposing side as having approved and records which person acted

#### Scenario: Opponent requests modification
- **WHEN** an eligible opposing-side reviewer requests a modification before the deadline and supplies a reason
- **THEN** the system changes the match to changes requested, stops automatic approval, records the request, and notifies the submitter and authorized coaches

#### Scenario: Corrected result is resubmitted
- **WHEN** an authorized participant corrects a changes-requested result and resubmits it
- **THEN** the system retains the previous values, starts a new five-day review deadline, and notifies eligible opposing-side reviewers

#### Scenario: Review deadline passes without action
- **WHEN** five days have elapsed since the latest submission and no opponent has approved, requested changes, or opened a dispute
- **THEN** the system marks the match auto-approved, records the reason and approval time, and includes it in permitted statistics

### Requirement: Coach result authority
An authorized club coach SHALL be able to intervene in a submitted match at any point, approve a correct result, request correction, or resolve a disputed result with an auditable reason.

#### Scenario: Coach approves before deadline
- **WHEN** an authorized coach verifies an awaiting result and approves it before opponent review is complete
- **THEN** the system records the coach decision, confirms the match, and closes the review deadline

#### Scenario: Coach resolves requested changes
- **WHEN** an authorized coach reviews the submitted values and requested modification and records a final decision
- **THEN** the system applies the coach-approved result, preserves all prior values and comments, marks the match confirmed, and notifies the participants

#### Scenario: Coach marks result incomplete
- **WHEN** a coach determines that a retirement, abandoned match, or unresolved result has no valid completed outcome
- **THEN** the system marks the match incomplete, preserves its recorded games and reason, and excludes it from player statistics and tournament standings

### Requirement: Player match history
An authorized player, linked guardian, coach, or admin SHALL be able to view confirmed match history permitted for a player under their role, with awaiting or disputed records clearly separated.

#### Scenario: Player views history
- **WHEN** a player opens their match history
- **THEN** the system lists their retained matches in date order with the details they are permitted to see

#### Scenario: Player views session matches
- **WHEN** a player filters match history by a club session or date
- **THEN** the system shows their confirmed matches from that session or date and separately identifies their awaiting, disputed, or abandoned records

### Requirement: Auditable match correction
An authorized participant SHALL be able to correct a changes-requested match before resubmission, and an authorized coach SHALL be able to correct or resolve a match while preserving its prior values, correction time, correcting user, and reason.

#### Scenario: Correct an entered result
- **WHEN** an authorized user corrects a recorded result and supplies a reason
- **THEN** the system shows the corrected result and retains the previous result in the audit history
