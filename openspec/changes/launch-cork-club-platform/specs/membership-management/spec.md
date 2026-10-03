## ADDED Requirements

### Requirement: Membership application
The system SHALL capture a membership application with the applicant details, membership type, required consent, and responsible guardian details when the applicant is a junior.

#### Scenario: Complete application
- **WHEN** an applicant submits all required valid information and consent
- **THEN** the system records the application as pending and confirms receipt

#### Scenario: Incomplete application
- **WHEN** an applicant omits required information or consent
- **THEN** the system does not submit the application and identifies the fields requiring attention

#### Scenario: Applicant follows a club sign-up link
- **WHEN** a person scans Leeside's public sign-up QR and opens the platform app or responsive web flow
- **THEN** the system selects Leeside as the application club and asks the person to sign in or create a platform account before submission

#### Scenario: Applicant enters a club join code
- **WHEN** a signed-in person enters a valid public Leeside join code in the platform app
- **THEN** the system opens the same Leeside application flow without treating the code as proof of membership or privileged access

#### Scenario: Parent applies for a junior
- **WHEN** a parent or guardian uses the sign-up flow for a child
- **THEN** the system creates or links the junior profile under the responsible adult's account and submits the application with the required guardian consent

### Requirement: Pending applicant and trial status
A submitted application SHALL remain distinct from active membership, and the system SHALL allow the club to configure whether verified pending applicants may receive a limited trial pass before approval.

#### Scenario: Application submitted without automatic membership
- **WHEN** a new player submits a complete application
- **THEN** the system marks the application pending and does not grant active-member entitlements

#### Scenario: Trial access is enabled
- **WHEN** the club allows trials and an eligible verified applicant receives a trial pass
- **THEN** the system records its validity period or visit limit and clearly labels it as trial access rather than paid membership

#### Scenario: Trial limit reached
- **WHEN** an applicant has exhausted the configured trial validity or visit allowance
- **THEN** the system prevents further automatic trial attendance until an authorized admin extends, approves, or otherwise resolves the application

### Requirement: Membership lifecycle
An authorized club admin SHALL be able to manually set a member's membership type, start date, end date, and status, including pending, active, expired, and cancelled, with every change attributed and timestamped.

#### Scenario: Admin activates membership
- **WHEN** an authorized admin records a valid membership period and marks the membership active
- **THEN** the system stores the new status, period, acting admin, and change time

#### Scenario: Invalid membership dates
- **WHEN** an admin enters an end date earlier than the start date
- **THEN** the system refuses the update and identifies the date error

#### Scenario: Player attends before payment is recorded
- **WHEN** a recognized player has no active membership period yet
- **THEN** the system keeps the player account and attendance history available while classifying attendance as no membership

#### Scenario: Unauthorized membership update
- **WHEN** a user without membership-management permission attempts to change a membership
- **THEN** the system refuses the update

### Requirement: Configurable membership types
The system SHALL allow an authorized club admin to create and manage club-specific membership types, durations, prices, attendance entitlement, and active status without a software deployment.

#### Scenario: Admin creates a membership type
- **WHEN** an authorized admin supplies valid details for a new membership type
- **THEN** the system makes the type available for member assignment and records the acting admin and change time

#### Scenario: Retire a membership type
- **WHEN** an authorized admin deactivates a membership type already used by historical memberships
- **THEN** the system prevents new assignment while preserving existing and historical member records

### Requirement: Admin-managed members
An authorized club admin SHALL be able to add a member and manage their profile, guardian relationships, membership type, start date, end date, and status.

#### Scenario: Admin adds a member
- **WHEN** an authorized admin submits the required valid member and membership details
- **THEN** the system creates the member record and an auditable membership assignment

#### Scenario: Admin updates membership details
- **WHEN** an authorized admin changes a member's membership type, dates, or status
- **THEN** the system saves the change and retains the prior values, acting admin, and change time

### Requirement: Manual payment record
An authorized club admin SHALL be able to record against a specific membership that a payment was received outside the platform, including amount, currency, date, method, external reference or note, payment status, and acting admin, without processing money or storing personal bank-account credentials.

#### Scenario: Record offline payment
- **WHEN** an authorized admin enters the required details for a payment received outside the platform
- **THEN** the system attaches an auditable payment record to the relevant membership and identifies the admin who confirmed receipt

#### Scenario: Record unpaid or partial membership
- **WHEN** an authorized admin creates or updates a membership whose amount is unpaid, partially paid, paid, or waived
- **THEN** the system stores that payment status independently from the membership dates and attendance history

#### Scenario: Set dates after external payment
- **WHEN** an authorized admin confirms an external payment and enters the agreed membership start and end dates
- **THEN** the system stores the payment record and membership period without contacting a bank or payment gateway

#### Scenario: Correct a payment record
- **WHEN** an authorized admin corrects a manual payment record
- **THEN** the system preserves who made the correction, when it occurred, and the previous values

### Requirement: Renewal status
The system SHALL identify memberships approaching their configured end date and memberships that have expired.

#### Scenario: Membership enters renewal window
- **WHEN** an active membership reaches the club-configured renewal-notice window
- **THEN** the system marks it due for a renewal notification without changing it to expired early

#### Scenario: Membership expires
- **WHEN** the configured membership end date passes without renewal
- **THEN** the system marks the membership expired and retains its history
