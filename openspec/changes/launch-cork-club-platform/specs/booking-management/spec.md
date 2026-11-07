## ADDED Requirements

### Requirement: Session and event booking
An eligible member or linked guardian SHALL be able to book an available training session or event for themselves or an eligible linked junior.

Table-practice bookings SHALL use the maintainer-approval workflow below rather than the automatic session-place confirmation scenario.

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

Leeside's initial timetable SHALL be Monday 18:00–20:00, Wednesday 20:15–22:15, Thursday 17:30–19:30, Friday 18:00–20:00 and Sunday 12:45–15:30, in Europe/Dublin local time. These times are owner-confirmed. Authorized session managers SHALL be able to change future schedules, capacity, audience, booking/trial settings and exceptions at runtime without editing OpenSpec or redeploying; historical occurrences SHALL remain intact.

#### Scenario: Session manager changes future schedule
- **WHEN** an authorized manager changes a recurring session with an effective date
- **THEN** the system applies it to future affected occurrences, preserves attendance history and warns about affected bookings without requiring a code/spec change for ordinary schedule values

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

### Requirement: Session player-place inventory
The booking unit SHALL be one player place at an assigned table for an entire dated session, replacing the former hourly whole-table model. Each table SHALL accommodate at most four reserved players. A player SHALL hold at most one pending or confirmed place across all tables in that session; the limit SHALL use player identity, not the requester/parent account. A parent MAY request separate places for each actively linked child and themselves. Maintainers SHALL configure table allocations per session as reservable, reserved for coaching, walk-in-only or unavailable. They SHALL retain runtime control of schedules, table count, eligibility, holds, fees and cancellation policy. A place SHALL NOT imply coaching, exclusive table access or a chosen partner. Four places support doubles or club-managed play/rotation and SHALL NOT imply four unrelated independent games.

#### Scenario: Maintainer publishes three tables
- **WHEN** a permitted maintainer publishes Tables 1, 2 and 3 as reservable for a dated session
- **THEN** the website and app display twelve player places, four per table, and show guest/member eligibility and any manually collected fee

#### Scenario: Pre-tournament practice
- **WHEN** a maintainer publishes extra practice hours before a tournament
- **THEN** the app supports one-off table availability without changing the regular training timetable or generating tournament fixtures

### Requirement: Unified website and app requests
Players, parents and verified guest registrants SHALL be able to request a published player place for the entire session from the app and Leeside website using the same canonical backend records and live availability. The retained Leeside website MAY render a shared booking interface or link to the same app booking route; independent future websites MAY link to it. Confirmation SHALL require authenticated verified identity; juniors SHALL be represented by a designated guardian. Guest registration SHALL NOT grant membership or privileged access.

#### Scenario: Parent requests a table for a child
- **WHEN** a verified parent selects an available session player place and an actively linked junior
- **THEN** the system records the parent as requester and the junior as intended attendee with pending approval status and a clear statement that the request is not yet confirmed

#### Scenario: Guest books from the website
- **WHEN** a non-member selects an eligible guest practice slot through the Leeside website and completes verified registration
- **THEN** the request enters the same app management queue without creating active membership or a separate website booking copy

### Requirement: Shared cross-channel booking state
The Leeside website and national app SHALL use the same canonical club-scoped resources, availability, holds, booking requests and decisions. Successful changes SHALL become visible through both channels on refresh, and open booking screens SHALL refresh automatically through subscriptions or bounded polling, with connection/loading/stale states. The backend SHALL revalidate availability and authorization at every write regardless of UI freshness. Reconnect SHALL refetch authoritative state; interrupted writes SHALL be reconciled through idempotency/status lookup rather than assumed successful. Public updates SHALL NOT disclose requester/child details.

#### Scenario: Website request approved in app
- **WHEN** a guest or parent submits through the website and an authorized maintainer approves in the app
- **THEN** both channels show the same confirmed reservation and remaining tables, and the requester receives the specified email and in-app confirmation once

#### Scenario: Website has stale availability
- **WHEN** a user selects a table that another app user has just held or booked
- **THEN** the backend refuses the conflicting write, refreshes availability and offers the current eligible alternatives without double booking

#### Scenario: Booking screen reconnects
- **WHEN** a website/app screen regains connectivity after missing booking changes
- **THEN** it reloads current table/booking state and identifies unresolved submissions without displaying cached availability as confirmed

### Requirement: Hall operations management
Authorized maintainers SHALL be able to configure hall opening hours, date-specific closures, maintenance blocks and table allocations for practice, regular sessions, camps and tournaments from permitted website/app management entry points. Both channels SHALL enforce the same club-scoped permissions, audit and resource constraints. Hall management SHALL NOT imply an externally bookable whole-hall exclusive rental; that is a separate future scope decision.

#### Scenario: Maintainer closes the hall
- **WHEN** a permitted maintainer blocks the hall for maintenance during published practice hours
- **THEN** all affected tables are unavailable and existing holds/bookings require explicit resolution and notifications rather than silent deletion

### Requirement: Pending holds and maintainer approval
Request creation SHALL atomically hold one of four places at the selected table for the entire session. Pending SHALL remain distinct from confirmed. Server constraints SHALL enforce unique session/player and unique session/table/place for active holds/confirmed reservations, while table-resource allocations separately prevent incompatible overlapping sessions. Maintainers SHALL approve/reject with current permissions and audited transitions. Hold timeout SHALL be configurable and bounded by session start; expired/rejected/withdrawn requests SHALL release their place. Stale approval SHALL NOT reacquire a place silently. Request retries SHALL be idempotent.

#### Scenario: One of three tables is approved
- **WHEN** a request holds one player place at Table 1 and a maintainer approves it
- **THEN** that place becomes confirmed, Table 1's other three places remain available, and Tables 2 and 3 each retain four places through both channels

#### Scenario: Concurrent requests target one table
- **WHEN** two requests attempt the same player place or the same player requests another table in the same session
- **THEN** database constraints allow at most one live reservation for that place/player, report the conflict and never rely only on client-side checks

#### Scenario: Pending request receives no decision
- **WHEN** a hold reaches its configured deadline or the slot start without approval
- **THEN** it expires, releases that player place and notifies the requester; it does not automatically become confirmed

#### Scenario: Approval races expiry
- **WHEN** a maintainer approves an expired request or another maintainer has already resolved it
- **THEN** the system reports the current state and does not overwrite another decision or booking

### Requirement: Schedule conflicts and safe changes
Table allocation SHALL account for regular sessions, camps, tournaments and explicit maintenance blocks using the same resources. Ambiguous whole-hall events SHALL block affected tables unless a maintainer explicitly assigns non-conflicting resources. An overlap warning override for event publication SHALL NOT create duplicate table reservations. Retiring a table or editing availability with active holds/bookings SHALL require an explicit affected-booking resolution and notification rather than silently remove confirmed access. Adjacent bookings MAY share an endpoint but SHALL NOT overlap.

#### Scenario: Practice collides with tournament usage
- **WHEN** a maintainer attempts to publish an open-play table allocation that overlaps a tournament or coaching allocation
- **THEN** the system refuses conflicting allocation until an authorized schedule change resolves the resource conflict

#### Scenario: Coaching table is not reservable
- **WHEN** a maintainer assigns a table to coaching, walk-ins or closure
- **THEN** no new online player reservation is allowed and existing live places must first be explicitly moved or resolved

### Requirement: Cancellation and staff overrides
Requesters SHALL be able to withdraw pending requests and cancel their own confirmed table bookings within the configured policy. Maintainers SHALL be able to cancel or reschedule with a reason and audit history. Rescheduling SHALL acquire the new allocation atomically before releasing the old one, or leave the existing booking unchanged on failure. Staff override SHALL NOT bypass resource exclusivity. Fees and payment status SHALL remain manual and separate from approval; no payment gateway is introduced.

#### Scenario: Requester cancels a permitted booking
- **WHEN** the requester cancels before the configured cutoff
- **THEN** the reservation is retained as cancelled, inventory is released and affected parties are notified without promising an automated refund

#### Scenario: Maintainer resolves a late cancellation
- **WHEN** the requester is beyond the self-service cutoff
- **THEN** the app offers a maintainer contact/request path and an authorized maintainer may resolve it with an audited reason

### Requirement: Booking remains separate from attendance
A player-place booking SHALL represent reserved access, not proof that anyone attended. Existing QR/app or staff check-in SHALL record actual attendance separately. Public availability SHALL expose counts/status, not player/child identities; permitted maintainers and requesters/guardians see appropriate details. Staff MAY move a player to a free place without changing their session entitlement. Players/guardians SHALL be able to release their own place when leaving early. Configurable no-show handling SHALL use an explicit staff presence check or approved attendance evidence; absence of a scan alone SHALL NOT silently cancel a present player's reservation. The prior decline/availability response SHALL NOT erase a booking or attendance.

#### Scenario: Confirmed guest arrives
- **WHEN** a confirmed guest or guardian records arrival through an authorized check-in flow
- **THEN** the system links attendance to the practice occurrence, preserves guest/no-membership classification and does not convert the guest into a paid member

#### Scenario: Booked user does not attend
- **WHEN** a confirmed session place passes without check-in
- **THEN** the booking remains historical and creates no attendance visit or top-attendee credit

#### Scenario: Parent books for two children
- **WHEN** a parent requests distinct places for two linked children
- **THEN** both requests are permitted while a second active place for either child in the same session is refused

#### Scenario: Early departure or staff rotation
- **WHEN** a player/guardian releases their place after leaving or staff moves them to an available place
- **THEN** inventory updates without duplicating the player's reservation or automatically altering attendance

### Requirement: Honest disconnected booking preview
While hosted setup is paused, the website and app MAY expose a labelled synthetic interactive preview with role simulation, browser-local storage and the same reusable player-place UI. It SHALL NOT claim real identity verification, server concurrency guarantees, cross-device synchronization, email delivery or durable production booking. Source HTML's Claude-specific database/user APIs SHALL be replaced rather than shipped as a runtime dependency.

#### Scenario: User tries the prototype
- **WHEN** a visitor requests and approves a synthetic place using preview roles
- **THEN** the UI displays local pending/confirmed/released state and clearly states that no real reservation, email or authenticated maintainer action occurred

