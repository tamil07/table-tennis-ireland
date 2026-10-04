## ADDED Requirements

### Requirement: Contact and delivery preferences
The system SHALL keep sign-in identifiers, contact methods, verification state, notification consent, and delivery preferences distinct. The email-first pilot SHALL send transactional external messages only to verified email recipients; storing a mobile number SHALL NOT imply SMS consent or that SMS delivery is available.

#### Scenario: Member prefers mobile contact during email-first pilot
- **WHEN** a member has a mobile number but no verified email and SMS delivery is not enabled
- **THEN** the system retains the mobile contact for authorized staff, creates an in-app admin follow-up where an external notification is required, and does not falsely mark an SMS or email as sent

#### Scenario: Member changes primary contact
- **WHEN** an adult account holder verifies another contact method and selects it as primary
- **THEN** the system uses that verified method only for notification categories supported by the deployment and preserves delivery history for earlier destinations

#### Scenario: SMS is enabled later
- **WHEN** the platform enables an approved SMS provider and the recipient has a verified mobile number with the required notification consent
- **THEN** the system may deliver configured notification categories by SMS with duplicate prevention, delivery outcome recording, opt-out handling, and a permitted fallback

### Requirement: Membership renewal email
The system SHALL allow an authorized admin to enable the predefined 10-day reminder, 3-day reminder, or both, and SHALL send enabled membership-renewal email to the adult player's registered email address or, for a junior, to the registered email address of each guardian designated to receive club communications.

#### Scenario: Admin configures reminder points
- **WHEN** an authorized admin enables or disables the 10-day or 3-day reminder option
- **THEN** the system stores the configuration for future renewal processing without altering reminders already sent

#### Scenario: Adult renewal reminder
- **WHEN** an adult player's membership reaches the configured renewal-notice point
- **THEN** the system queues a renewal email containing the membership end date and renewal instructions for the player's registered address

#### Scenario: Junior renewal reminder
- **WHEN** a junior player's membership reaches the configured renewal-notice point
- **THEN** the system queues the renewal email for the designated linked guardian recipients and does not rely on the junior's email address

#### Scenario: Reminder point disabled
- **WHEN** a membership reaches a predefined reminder point that the club has disabled
- **THEN** the system does not queue that reminder

### Requirement: Notification history and duplicate prevention
The system SHALL record the type, intended recipient, related member, time, and delivery outcome of each transactional email and SHALL prevent duplicate reminders for the same configured renewal stage.

#### Scenario: Reminder already sent
- **WHEN** renewal processing encounters a membership for which the same renewal-stage reminder has already been sent
- **THEN** the system does not send that reminder again

#### Scenario: Email delivery fails
- **WHEN** the email provider reports that a transactional message could not be delivered
- **THEN** the system records the failure and makes it visible to an authorized admin without marking it delivered

### Requirement: Daily attendance digest
The system SHALL allow authorized club admins to configure daily attendance-summary recipients and a delivery time in the club's timezone.

#### Scenario: Daily digest is due
- **WHEN** the configured daily delivery time is reached for a day containing a session, attendance, or check-in attempt
- **THEN** the system sends each configured admin one digest containing total visits, unique attendees, per-session totals, active and approaching-expiry attendance, expired or missing-membership attendance, unresolved membership alerts, and scanner synchronization failures

#### Scenario: No attendance activity occurred
- **WHEN** the configured delivery time is reached for a day with no session, attendance, or check-in activity
- **THEN** the system follows the club's configured choice to send a zero-activity digest or suppress it

#### Scenario: Admin opens digest details
- **WHEN** an authorized admin follows the protected dashboard link in a digest
- **THEN** the system requires authentication before displaying member-level attendance details

#### Scenario: Digest delivery fails
- **WHEN** a daily attendance digest cannot be delivered
- **THEN** the system records the failure in notification history and exposes it to authorized admins for retry

### Requirement: Membership exception alert
The system SHALL notify the configured admin team when attendance is recorded for a player whose membership is expired or missing, while avoiding duplicate alerts for the same player and session.

#### Scenario: Expired member attends
- **WHEN** attendance is recorded with an expired membership classification
- **THEN** the system creates an in-app admin alert containing the player, session, attendance time, and membership end date and includes it in the daily digest

#### Scenario: Player without membership attends
- **WHEN** attendance is recorded with no applicable membership
- **THEN** the system creates an in-app admin alert containing the player, session, and attendance time and includes it in the daily digest

#### Scenario: Immediate email is enabled
- **WHEN** an expired or missing-membership attendance alert is created and the club has enabled immediate email for that alert type
- **THEN** the system emails configured admin recipients once for that player and session

#### Scenario: Admin resolves an alert
- **WHEN** an authorized admin marks an alert resolved after adding membership details, contacting the player, or recording another outcome
- **THEN** the system stores the resolution reason, acting admin, and resolution time without changing the historical attendance classification

### Requirement: Match review notifications
The system SHALL send in-app notifications for match review and modification events to the appropriate participants, linked guardians for juniors, and authorized coaches.

#### Scenario: Opponent review requested
- **WHEN** a completed result is submitted for opponent review
- **THEN** the system notifies each eligible opposing-side reviewer with the result, submission time, five-day deadline, and actions to approve or request a modification

#### Scenario: Review deadline approaches
- **WHEN** an awaiting result reaches the club-configured reminder point before its five-day deadline
- **THEN** the system sends one in-app reminder to eligible opposing-side reviewers who have not acted

#### Scenario: Modification requested
- **WHEN** an opponent requests a modification
- **THEN** the system notifies the submitter and authorized coaches with the supplied reason and a protected link to the result

#### Scenario: Result is resolved or auto-approved
- **WHEN** a result is approved by an opponent or coach, auto-approved after five days, or marked incomplete by a coach
- **THEN** the system notifies participating players or their linked guardians of the final status

### Requirement: Manual payment acknowledgement email
The system SHALL email a non-formal payment acknowledgement when an authorized admin records an external membership payment, without presenting the message as a tax invoice or proof of bank settlement.

#### Scenario: Adult payment recorded
- **WHEN** an admin records an external payment for an adult player's membership
- **THEN** the system emails the player's registered address with the amount, currency, recorded date, method, reference where present, membership start/end dates, confirming club, and correction contact

#### Scenario: Junior payment recorded
- **WHEN** an admin records an external payment for a junior player's membership
- **THEN** the system sends the acknowledgement to the designated linked guardian recipients rather than relying on the junior's email

#### Scenario: Payment record corrected
- **WHEN** an admin corrects a payment record after an acknowledgement was sent
- **THEN** the system sends a revised acknowledgement clearly identifying that it replaces the earlier record and retains both notification events
