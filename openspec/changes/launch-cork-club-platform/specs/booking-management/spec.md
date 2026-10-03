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

