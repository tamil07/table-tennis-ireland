## ADDED Requirements

### Requirement: Event-linked result entry
An authenticated participant or designated guardian for a linked junior SHALL be able to select a tournament event and recording club, save a draft and submit singles/doubles results with date, sides, opponent identity or minimal external opponent name, permitted format, match-level games won/lost and optional game scores. The system SHALL validate score/outcome consistency and distinguish aggregate-only scores from complete game scores. External participation SHALL NOT require club-session check-in or create local attendance.

#### Scenario: Player records an external tournament match
- **WHEN** a participant selects an external event and supplies a valid completed result
- **THEN** the app stores event, club context, sides, author, date and score completeness with an optional personal reflection

#### Scenario: Guardian acts for a junior
- **WHEN** a designated guardian submits for a junior with an active link in the recording club
- **THEN** the result/reflection belongs to the junior and records the guardian as acting author

#### Scenario: Inconsistent or incomplete scores
- **WHEN** scores contradict the selected format or a match is marked retired/incomplete
- **THEN** inconsistent completed scores are rejected, while incomplete records retain entered details and reflections but are excluded from completed-match statistics

### Requirement: Provenance and same-club review
The system SHALL determine opposing-side review eligibility server-side from active player relationships in the recording club at submission, separately from paid membership. External-opponent results SHALL be saved immediately as player-reported without mandatory approval or five-day promotion to verified status. Same-club results SHALL use existing opponent/guardian review, five-day auto-approval, edit requests and coach resolution. Doubles SHALL require opposing-side review if at least one opposing player qualifies. Eligibility evidence SHALL be retained without revealing unrelated club relationships. Self-reported external results SHALL NOT update official/internal standings or advance local brackets.

#### Scenario: External opponent requires no approval
- **WHEN** no opposing player has an active player relationship in the recording club
- **THEN** the result becomes available in permitted history as player-reported and no mandatory approval notification or automatic verification is generated

#### Scenario: Same-club opponent has expired membership
- **WHEN** a recognized same-club opponent's paid membership has expired
- **THEN** the existing same-club review workflow still applies

#### Scenario: Mixed doubles opponent team
- **WHEN** at least one opposing doubles player belongs to the recording club
- **THEN** eligible opposing players/guardians receive review and one eligible opposing-side approval suffices without requiring the external teammate to register

#### Scenario: Same-club opponent lacks login
- **WHEN** a recognized same-club opponent cannot receive review and no designated guardian can act
- **THEN** staff receive an assisted-review work item and a coach may intervene while the existing review deadline/status remains applicable rather than reclassifying the result as external

### Requirement: Structured personal reflections
Each participant SHALL be able to maintain optional Worked well and Needs work tags and a free-text note of at most 2000 characters for their own participation. Default tags SHALL include forehand, backhand, serving, serve receive, chopping, blocking, footwork, spin reading, placement and tactics. Authorized coaches SHALL be able to add or retire club tags while preserving historical identifiers. Reflections SHALL be player/guardian observations, separate from score approval, opponent evaluations, private coach notes and published coach assessments. Multiple tags and both categories MAY be selected; omission SHALL NOT imply performance quality.

#### Scenario: Player adds reflection
- **WHEN** a player selects Needs work: backhand and Worked well: serving and saves a note
- **THEN** the app attributes the observations to that player's participation without opponent approval or an objective skill diagnosis

#### Scenario: Opponent reviews score
- **WHEN** an opponent opens result review
- **THEN** they see permitted score details without the other participant's private reflection

#### Scenario: Reflection revision or removal
- **WHEN** a player or designated guardian edits/removes their reflection
- **THEN** attributed revision history is retained subject to retention rules and summaries update without changing the score, other participants' reflections or coach notes

#### Scenario: Coach retires a tag
- **WHEN** a club tag is retired
- **THEN** it becomes unavailable for new selection while historical labels and trend grouping remain meaningful

### Requirement: Descriptive coaching summaries
Authorized coaches SHALL be able to group observations by recording club, event, date range, player, permitted training group/team and tag. Worked well and Needs work SHALL have separate counts deduplicated per player-match-tag-category. Views SHALL show unique reporting players, submitted match-reflection counts and relevant denominators; missing reflections SHALL NOT count as strengths or weaknesses. Result statistics SHALL distinguish reported, reviewed/auto-approved, awaiting/disputed and incomplete outcomes. Incomplete-match reflections MAY contribute only to explicitly labelled reflection views.

#### Scenario: Coach reviews group priorities
- **WHEN** eight of twelve reporting players tag serve receive as needing work
- **THEN** the app shows eight of twelve reporting players, contributing match counts, filters and self-reported provenance without claiming eight players objectively lack the skill

#### Scenario: Coach drills into player history
- **WHEN** an authorized coach opens an aggregate tag
- **THEN** permitted contributing reflections and result provenance are visible and the coach can separately author a training goal or published development summary

#### Scenario: Few or no reflections
- **WHEN** a selected period has limited or no reports
- **THEN** the app states the reporting count and does not invent an assessment or interpret missing data as successful performance

### Requirement: Club-scoped access and duplicate control
Each result/reflection SHALL have an explicit recording club. Multi-club players SHALL select that context; private reflections SHALL NOT automatically flow to another club or external opponents. Players/designated guardians SHALL see their permitted reflections, while authorized recording-club coaches/admins MAY view grouped coaching data. Group summaries SHALL NOT be public. Retries SHALL be idempotent; likely duplicate event/opponent/date entries SHALL be flagged before creating another match and existing fixture entry SHALL reuse its match identity.

#### Scenario: Player belongs to two clubs
- **WHEN** a Leeside/Dublin player records an event in Leeside's context
- **THEN** Dublin gains no private reflection/coaching access merely because that player belongs to both clubs

#### Scenario: Repeated save or existing fixture
- **WHEN** a client retries submission or selects an already represented fixture
- **THEN** the system reuses the logical record or prompts permitted correction instead of double-counting the result

#### Scenario: Human coaching conclusion
- **WHEN** a coach uses summaries to create goals
- **THEN** human authorship and publication controls remain and the app generates no automatic diagnosis, ranking or internal skill rating from scores/tags
