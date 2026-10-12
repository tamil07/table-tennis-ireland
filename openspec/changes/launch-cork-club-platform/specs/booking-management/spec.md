## ADDED Requirements

### Requirement: Session and event booking
An eligible member or linked guardian SHALL be able to book an available training session or event for themselves or an eligible linked junior.

#### Scenario: Successful booking
- **WHEN** an eligible person requests a place before the booking deadline while capacity remains
- **THEN** the system confirms the booking and updates remaining capacity

#### Scenario: Full session
- **WHEN** a person requests a place after capacity has been reached
- **THEN** the system does not confirm the booking and clearly reports that no place is available

#### Scenario: Ineligible participant
- **WHEN** a person attempts to book a participant who does not meet the event's configured eligibility rules
- **THEN** the system refuses the booking and explains the applicable rule

### Requirement: Booking administration
An authorized club admin SHALL be able to create, edit, cancel, and review sessions and events, including capacity, eligibility, booking deadline, and attendee list.

#### Scenario: Event cancellation
- **WHEN** an authorized admin cancels an event with existing bookings
- **THEN** the system marks it cancelled, preserves its booking history, and queues a notification to affected bookers

### Requirement: Recurring and temporary session programmes
The system SHALL support Leeside's five weekly recurring training sessions and authorized admins SHALL be able to create one-off sessions and bounded multi-day programmes such as a seven-day camp without altering the recurring timetable.

#### Scenario: Admin creates a recurring session
- **WHEN** an admin configures a weekday, local start/end time, venue, audience, capacity, booking rule, and effective date range
- **THEN** the system generates dated occurrences while preserving historical occurrences when the definition later changes

#### Scenario: Admin creates a seven-day camp
- **WHEN** an admin creates a temporary programme with seven dated sessions, capacity, audience, registration deadline, and attendance rules
- **THEN** the system publishes one programme with individually manageable dated occurrences and bookings

#### Scenario: Temporary session conflicts with another event
- **WHEN** an admin schedules a temporary occurrence that overlaps at the same venue or uses a conflicting resource
- **THEN** the system warns the admin and requires an explicit audited override before publication

### Requirement: Event publication feeds
Published public sessions, camps, and events SHALL expose stable website links plus standards-based RSS/Atom and iCalendar feeds. Feed publication SHALL remain separate from email delivery and SHALL contain public event information only.

#### Scenario: Public camp is published
- **WHEN** an authorized admin publishes a public camp
- **THEN** the website, public event feed, and calendar feed expose its approved title, dates, public description, venue, and registration link without private attendee data

#### Scenario: Subscriber wants email
- **WHEN** a person subscribes to event email updates with the required consent
- **THEN** the notification service records the subscription and sends eligible event announcements independently of whether that person uses an RSS reader

