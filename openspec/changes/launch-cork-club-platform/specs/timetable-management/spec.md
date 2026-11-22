## ADDED Requirements

Source: the club's decisions of 22 November 2026. One editable timetable drives the sessions that members book, the public calendar and the subscribed calendar feed. Maintainers and coaches make the changes. Staff review bookings affected by a change; nothing moves or cancels a booking silently.

### Requirement: One timetable drives every session
The club SHALL keep one editable timetable of weekly sessions (day, start, end, title, venue, audience, capacity, tables). Dated sessions for the next sixty days SHALL be generated from it, and table booking, the subscribed calendar feed, the public calendar page and reminders SHALL read those dated sessions. A change made once in the timetable SHALL appear in all of them after it is saved.

#### Scenario: Weekly time change
- **WHEN** a maintainer or coach changes the Monday session from 18:00–20:00 to 18:30–20:30 from 7 December 2026
- **THEN** every dated Monday session from that date shows the new time in booking, the calendar feed and the public calendar

#### Scenario: New weekly session
- **WHEN** a maintainer adds a Saturday session with an effective date
- **THEN** dated Saturday sessions appear from that date, and the timetable history records the change

### Requirement: Changes to one date
A maintainer or coach SHALL be able to change a single dated session, by moving its time, cancelling it, or adding an extra session on that date. Each change SHALL carry a reason.

#### Scenario: One-off time change
- **WHEN** a coach moves the Thursday session on 3 December 2026 to 18:00–20:00 with the reason "hall shared with a school"
- **THEN** that date shows the new time in booking, the calendar feed and the public calendar; other Thursdays are unchanged

#### Scenario: One-off cancellation
- **WHEN** a maintainer cancels the Sunday session on 13 December 2026 with a reason
- **THEN** that session is no longer bookable, the calendar shows it cancelled, and players with places on it are notified and listed for staff review

#### Scenario: Extra session
- **WHEN** a coach adds an extra session on a Saturday with a title, times and venue
- **THEN** that single session appears in booking and the calendar

### Requirement: Closures stop booking
Public holidays and any closure the club adds (maintenance, resurfacing, private hire) SHALL stop table booking for every session they overlap, and SHALL show on the public calendar as closed. Closures SHALL NOT cancel player bookings automatically. Affected players SHALL be notified and the bookings SHALL be listed for staff review.

#### Scenario: Christmas closure across a range
- **WHEN** a maintainer adds a closure from 23 December 2026 to 5 January 2027
- **THEN** no session in that range is bookable, the calendar shows the range as closed, and players with places in the range are notified and listed for staff review

#### Scenario: Closure lifted
- **WHEN** the closure is reopened
- **THEN** the sessions in the range become bookable again unless they are cancelled separately

### Requirement: Staff review of affected bookings
When a session with active bookings is moved, cancelled, or falls in a closure, the booking SHALL keep its status, the player SHALL be notified of the change, and the booking SHALL appear in the staff review list until staff act on it (move, cancel, or confirm the new time).

#### Scenario: Review list
- **WHEN** a session with two bookings is moved to another time
- **THEN** staff see both bookings in the review list with the old and new times, and the players are told the session has changed

### Requirement: Change history
Every timetable change, one-off change, closure and reopening SHALL be recorded with the date, the person, the reason and what changed. The history SHALL be readable in plain language on the timetable page and SHALL NOT be editable.

#### Scenario: History entry
- **WHEN** a coach moves a session
- **THEN** the history shows, for example, "Thursday 3 December 2026: moved from 17:30–19:30 to 18:00–20:00 by Coach name on 22 November 2026. Reason: hall shared with a school."

### Requirement: Permissions
Maintainers and coaches SHALL be able to edit the timetable, one-off changes, closures and the history view. Other members SHALL see the public timetable and calendar only. Changes SHALL be refused for people without the permission, and the refusal SHALL be recorded.

#### Scenario: Member tries to change the timetable
- **WHEN** a member without the maintainer or coach permission submits a timetable change
- **THEN** the change is refused and the refusal is recorded

### Requirement: Holidays are a decision, not a hard-coded list
Public holidays SHALL be imported with their substitute days, and each holiday SHALL carry a decision (closed, open or pending) that the club sets. A club may open on a holiday after a recorded decision. The club's rule for holidays that fall on a weekend SHALL be recorded by the club; the system SHALL NOT assume a rule that the club has not confirmed.

#### Scenario: Holiday decision
- **WHEN** the club confirms that it is closed on a holiday
- **THEN** that date is closed for booking and the calendar, and the decision is recorded

### Requirement: Public projection
The public calendar page and the calendar feed SHALL read the same dated sessions and closures. The public projection SHALL NOT include player or booking details.

#### Scenario: Public calendar shows a closure
- **WHEN** a closure is added
- **THEN** the public calendar shows it as closed without showing any booking
