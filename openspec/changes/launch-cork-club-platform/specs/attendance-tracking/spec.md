## ADDED Requirements

### Requirement: Hybrid club attendance card
If the deferred physical-card option is enabled, the system SHALL allow an authorized club admin to issue revocable NDEF NFC/printed-QR credentials mapped to a member without readable personal data. This optional path SHALL NOT require a card purchase or NFC device for the QR/app-first pilot.

#### Scenario: Admin issues a card
- **WHEN** an authorized admin assigns an unused physical card to a member
- **THEN** the system activates its opaque NFC and QR credentials for that member and records the issuer and issue time

#### Scenario: Child checks in without a phone
- **WHEN** a junior member taps their issued card at the club kiosk
- **THEN** the system processes the check-in without requiring the child or guardian to have a phone at the venue

#### Scenario: NFC cannot be read
- **WHEN** an issued card cannot be read through NFC
- **THEN** the kiosk allows its printed QR credential to be scanned through the device camera

#### Scenario: Card is lost or shared
- **WHEN** an authorized admin revokes and replaces a card
- **THEN** neither credential on the old card can create attendance and the replacement credentials can

### Requirement: Digital attendance QR
The platform app SHALL allow an authenticated recognized club participant, or a linked guardian acting for a junior, to display a time-limited club attendance QR that the venue kiosk can scan without exposing the permanent physical-card credential; displaying the pass SHALL NOT imply that membership is active or paid.

#### Scenario: Member displays app QR
- **WHEN** a recognized player opens their Leeside attendance pass in the platform app
- **THEN** the system displays a short-lived QR bound to that player, club, and validity window and shows the current membership classification separately

#### Scenario: Guardian displays junior QR
- **WHEN** a guardian opens the attendance pass for an eligible linked junior
- **THEN** the system displays the junior's short-lived QR without requiring the junior to own a phone or account credentials

#### Scenario: Screenshot or expired app QR is scanned
- **WHEN** the kiosk scans a digital attendance QR outside its validity window
- **THEN** the system refuses the credential and instructs the user to refresh the pass or use the physical card

#### Scenario: App is unavailable
- **WHEN** a member cannot access the app or phone
- **THEN** the member can use their physical NFC/QR card or request an authorized manual check-in

### Requirement: Club-controlled attendance kiosk
If the deferred kiosk/card option is enabled, the system SHALL provide an authenticated restricted scanner interface with NFC and camera QR support. The QR/app-first pilot SHALL NOT require this hardware path.

#### Scenario: Kiosk starts a session
- **WHEN** an authorized operator opens the kiosk and selects a current session occurrence
- **THEN** the system displays the session, scanner status, synchronization status, and check-in controls without exposing the wider admin area

#### Scenario: Valid credential is scanned
- **WHEN** the kiosk reads a recognized NFC or QR credential during an open session
- **THEN** the system evaluates attendance eligibility and gives immediate visual and audible feedback

#### Scenario: Unknown credential is scanned
- **WHEN** the kiosk reads an unknown or revoked credential
- **THEN** the system creates no attendance record, records a restricted diagnostic event, and displays a non-sensitive failure message

#### Scenario: Duplicate scan
- **WHEN** the same member is successfully scanned again for the same session occurrence
- **THEN** the system creates no duplicate attendance and indicates that the member is already checked in

### Requirement: Membership-aware check-in
The system SHALL evaluate the member's club membership and attendance entitlement at check-in and SHALL store the membership classification that applied at that time.

#### Scenario: Active eligible member
- **WHEN** a member with an active membership entitled to the selected session scans their card
- **THEN** the system records attendance with the membership type and active status snapshot

#### Scenario: Membership is about to expire
- **WHEN** a member whose membership is within an enabled 10-day or 3-day renewal window scans their card
- **THEN** the system records attendance, classifies it as approaching expiry, and displays a discreet renewal notice for the operator or appropriate adult

#### Scenario: Expired or missing membership
- **WHEN** a member with an expired membership or no applicable membership scans their card
- **THEN** the system records attendance with the expired or no-membership classification, alerts the admin team and kiosk operator, and does not publicly expose financial details

#### Scenario: Membership is updated after attendance
- **WHEN** an admin later adds or renews the player's membership dates after receiving payment outside the platform
- **THEN** the system updates the current membership while retaining the membership classification captured on the earlier attendance record

### Requirement: Visitor sign-up QR
The system SHALL provide a separate static club QR code and matching public join code that open Leeside's mobile-friendly membership or visitor registration flow and are never treated as proof of membership or privileged access.

#### Scenario: Adult visitor scans sign-up QR
- **WHEN** an adult visitor scans the displayed club sign-up QR
- **THEN** the system opens Leeside's registration flow with the club context already selected

#### Scenario: Visitor enters join code in the app
- **WHEN** a person enters the valid public Leeside join code in the platform app
- **THEN** the system selects Leeside and opens the same registration flow

#### Scenario: Junior visitor registration
- **WHEN** registration is for a junior
- **THEN** the system requires the responsible parent or guardian details and applicable consent before submission

#### Scenario: Visitor completes registration
- **WHEN** a visitor submits all required valid registration information
- **THEN** the system creates a pending application and does not mark the visitor as an active member or automatically register attendance

#### Scenario: Eligible applicant uses trial pass
- **WHEN** a verified pending applicant with a valid club-configured trial pass presents its digital QR at the kiosk
- **THEN** the system records attendance as trial attendance, consumes any applicable visit allowance, and keeps the applicant distinct from active members

### Requirement: Venue-presence check-in
The pilot SHALL prioritize phone QR and app-based attendance, without requiring NFC hardware/cards. Members SHALL be able to scan the rotating club QR or open the app during an open session to confirm physical presence for self or an actively linked child. QR challenges SHALL be short-lived and bound server-side to the club/session. Direct app actions SHALL be labelled self-declared presence rather than independently verified location. Authentication, explicit person selection and confirmation SHALL be required. An ordinary phone camera may open the flow; no child phone, device contact access or geolocation is required. Kiosk cards remain optional future alternatives.

#### Scenario: User presses an unverified check-in action
- **WHEN** a user attempts to record presence outside an open session or without an authorized identity/guardian relationship
- **THEN** the system refuses attendance; inside a session a permitted direct app confirmation is recorded with self-declared provenance rather than proof of location

#### Scenario: Parent is also a player
- **WHEN** an authenticated parent opens the QR/app attendance screen
- **THEN** the app lets them explicitly choose self and/or linked children, confirms each selected person separately and records only those chosen without inferring that a parent attending means their child attended

#### Scenario: Member uses the app during session time
- **WHEN** an authorized player explicitly confirms presence through the app while the selected session is open
- **THEN** the server validates session time, identity, duplicates and membership, records self-declared attendance, and does not imply GPS or QR location verification

### Requirement: Not-attending availability response
Members or designated guardians SHALL be able to record Not attending for a dated session from home, including before session time. Availability SHALL be separate from physical attendance, membership entitlement and booking cancellation; it SHALL NOT count toward visits or top-attendee charts. Authorized staff SHALL see the response and permitted revisions. A contradictory response after a presence record SHALL require an explicit staff correction workflow rather than silently erase attendance.

#### Scenario: Player declines from home
- **WHEN** a player or guardian selects Not attending for self or a linked child
- **THEN** the app stores that session availability response without creating attendance or a negative visit and without automatically cancelling an existing booking

#### Scenario: Member scans the venue display
- **WHEN** a member scans the club QR with their phone camera
- **THEN** the platform opens a sign-in or confirmation screen showing the server-resolved club, session, and eligible player identity without requesting device location or contacts

#### Scenario: Guardian confirms a child
- **WHEN** an authenticated guardian selects an actively linked junior and confirms physical presence
- **THEN** the backend verifies that club-specific guardian relationship before recording attendance

#### Scenario: Expired code or closed session
- **WHEN** the code has expired or the linked session is cancelled, closed, or outside its attendance time window
- **THEN** the backend refuses attendance and asks the member to scan a current display or contact staff

#### Scenario: Duplicate or unpaid attendance
- **WHEN** a valid confirmation repeats an existing attendance or the participant has expired or missing membership
- **THEN** the backend prevents duplicate attendance and otherwise retains attendance with a deduplicated membership-review work item when applicable

#### Scenario: Staff operates the display
- **WHEN** an authorized coach, admin, or scanner operator selects an open session
- **THEN** the platform displays a QR refreshed every minute with a maximum 90-second lifetime and stores only its hash server-side

### Requirement: Temporary connectivity loss
The kiosk SHALL be able to queue a scan locally during a temporary network interruption and synchronize it when connectivity returns, while protecting queued credential data on the device.

#### Scenario: Scan while offline
- **WHEN** an authorized kiosk loses connectivity after its session roster and scanner authorization have been established
- **THEN** it records the scan as pending locally and clearly indicates that eligibility and synchronization may still be outstanding

#### Scenario: Connectivity returns
- **WHEN** a kiosk with pending attendance regains connectivity
- **THEN** the system synchronizes each pending scan once, applies eligibility and duplicate checks, and reports any rejected or override-required record to the operator

### Requirement: Manual attendance administration
An authorized coach or admin SHALL be able to add, correct, or remove a session attendance record, and a nominated tournament organizer SHALL be able to add attendance for that tournament's linked session, with a reason and immutable audit entry.

#### Scenario: Member forgot their card
- **WHEN** an authorized coach or admin manually checks in an eligible member and supplies a reason
- **THEN** the system records the attendance as manual with the membership status snapshot, acting user, and time

#### Scenario: Tournament organizer checks in a participant
- **WHEN** a nominated tournament organizer confirms that a selected participant is physically present but not checked in
- **THEN** the system creates an audited manual attendance record limited to the tournament's linked session

#### Scenario: Admin corrects attendance
- **WHEN** an authorized admin corrects an erroneous attendance record and supplies a reason
- **THEN** the system applies the correction and retains the previous value in the audit history

### Requirement: Attendance dashboard and charts
The system SHALL provide authorized coaches and admins with attendance summaries and charts for daily, weekly, monthly, and custom date ranges.

#### Scenario: Admin views attendance trend
- **WHEN** an authorized admin selects a valid period and grouping
- **THEN** the system displays total visits, unique attendees, and attendance trends grouped by day, week, or month

#### Scenario: Admin compares membership status
- **WHEN** an authorized admin views membership-related attendance for a period
- **THEN** the system shows attendance grouped by active, approaching expiry, expired, no membership, trial, and pay-as-you-go status as captured at check-in

#### Scenario: Admin views session utilization
- **WHEN** an authorized admin selects a session or recurring session type
- **THEN** the system shows attendance totals, unique attendees, capacity utilization when capacity exists, and comparison with prior equivalent periods

#### Scenario: Admin views top attendees
- **WHEN** an authorized admin requests the attendance leaderboard for a selected date range
- **THEN** the system ranks members by confirmed attendance with ties handled consistently and keeps the member-level ranking restricted to authorized staff

#### Scenario: Admin exports attendance
- **WHEN** an authorized admin requests an export for a permitted date range
- **THEN** the system exports the filtered attendance records and their historical membership classifications without exposing data from another club

#### Scenario: Player views personal attendance
- **WHEN** an adult player or linked guardian opens the permitted attendance history
- **THEN** the system shows only that player or linked junior's attendance records and does not expose the staff leaderboard
