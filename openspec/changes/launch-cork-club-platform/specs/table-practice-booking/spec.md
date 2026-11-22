## ADDED Requirements

Source: the club board's booking requirements (file "Leeside Table Booking", prototype and rules, 21–22 November 2026) and the decisions recorded on 22 November 2026. These requirements supersede the table-practice requirements in `specs/booking-management` (see the notes there).

### Requirement: Two places per table
Each reservable table SHALL have exactly two player places for a dated session. Tables 1–6 are held for coaching; tables 7–12 are reservable for practice. A booking SHALL be made by one member, who MAY add a partner for the second place on the same table in the same request. A partner is a named person, not an account, and SHALL NOT count as a player for the one-place rule.

#### Scenario: Member books a table with a partner
- **WHEN** a member books place 1 of Table 8 and enters a partner's name
- **THEN** both places on Table 8 are held by the booking, the partner's name is shown on the second place, and the booking can be cancelled as one unit

#### Scenario: Partner cannot be added to a taken table
- **WHEN** a member asks to add a partner but the other place on the table is already taken
- **THEN** the system refuses the whole booking and keeps the table as it was

### Requirement: One active place per player per session
A player SHALL hold at most one active place (booked, offered or waiting) in a session, including through a guardian-linked child.

#### Scenario: Second place refused
- **WHEN** a player who already has a place in a session requests another place in that session
- **THEN** the system refuses the request and explains the one-place rule

### Requirement: Booking opens fourteen days ahead, and books instantly
Advance booking SHALL open fourteen days before the session start and close when the session starts. A request for a free place SHALL be confirmed immediately.

#### Scenario: Too early
- **WHEN** a member tries to book a session more than fourteen days away
- **THEN** the system refuses the request and says when bookings open

#### Scenario: Instant confirmation
- **WHEN** a member books a free place within the window
- **THEN** the place is confirmed at once, with no approval step

### Requirement: Cancellation and the waiting list
A member SHALL be able to cancel their own booking until two hours before the session starts. After that only staff can cancel. When a booked place is freed by cancellation, release or a declined or expired offer, the place SHALL be offered to the first waiting player for that session. An offer SHALL last sixty minutes, and never past the session start. The offered player accepts or declines. Waiting players SHALL NOT be offered places that were already free when they joined the list. The waiting list closes when the session starts.

#### Scenario: Cancellation offers the place
- **WHEN** a member cancels a booking that has a waiting player
- **THEN** the waiting player is offered the place and notified by email and in the app, and the place is not yet theirs

#### Scenario: Offer accepted
- **WHEN** the offered player accepts before the offer expires
- **THEN** the place is confirmed for them

#### Scenario: Offer declined or expired
- **WHEN** the offered player declines, or the offer expires unanswered
- **THEN** the place passes to the next waiting player, and if there is none, it stays free for walk-ins

#### Scenario: Late cancellation
- **WHEN** a member tries to cancel less than two hours before the session
- **THEN** the system refuses and asks them to contact a maintainer

### Requirement: Check-in and staff release
Players or the booker SHALL check in from one hour before the session until it ends. Check-in is required to keep a booked place past the start. Ten minutes after the session starts, staff SHALL be able to release a booked place that has not checked in. A released place is offered to the waiting list while the session is open; otherwise it becomes available to walk-ins.

#### Scenario: Player checks in
- **WHEN** a booked player checks in before the session ends
- **THEN** the booking is marked checked in and cannot be released as a no-show

#### Scenario: Staff release a no-show
- **WHEN** staff release a booked place ten minutes or more after the start, and it is not checked in
- **THEN** the place is released and the booked player is notified

#### Scenario: Release too early
- **WHEN** staff try to release a place before ten minutes after the start
- **THEN** the system refuses and states the rule

### Requirement: Walk-ins on the night
Free reservable places during a running session SHALL be given to walk-ins on a first-come, first-served basis.

#### Scenario: Walk-in takes a released place
- **WHEN** a walk-in asks for a free reservable place while the session is running
- **THEN** the place is confirmed for them as a walk-in

#### Scenario: Advance booking after start
- **WHEN** a member asks to book a place after the session has started, without the walk-in flag
- **THEN** the system refuses and points them to walk-ins on the night

### Requirement: Closed days stop table booking
Public holidays SHALL close the club for table booking. Any closure that the club adds (for example maintenance, resurfacing or a private hire) SHALL also stop table booking for every session it overlaps. Bookings already on an affected date SHALL NOT be deleted silently; staff resolve them and affected players are notified.

Irish public holidays with a substitute day follow the statutory rule: a Christmas Day or St Stephen's Day that falls on a weekend has a substitute weekday. The 2026 and 2027 dates follow the board's list (Monday 28 December 2026; Monday 27 and Tuesday 28 December 2027).

#### Scenario: Public holiday
- **WHEN** a member tries to book a session on a public holiday
- **THEN** the system refuses and states that the club is closed

#### Scenario: Maintenance closure
- **WHEN** an administrator adds a maintenance closure that overlaps a session
- **THEN** the session cannot be booked, the closure reason is shown to the member, and existing bookings are listed for staff to resolve

#### Scenario: Closure lifted
- **WHEN** the administrator lifts the closure
- **THEN** booking reopens for that session

### Requirement: Scope boundaries
An assistant coach rota is out of scope for this version. Booking remains separate from attendance: check-in marks that a booked player arrived, but it does not create a visit record by itself.

#### Scenario: Attendance is not created by booking
- **WHEN** a booked player checks in
- **THEN** the booking is marked checked in, and attendance is recorded only through the attendance workflow
