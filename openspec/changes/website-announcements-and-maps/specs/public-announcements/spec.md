# Public announcements, closures and maps

## ADDED Requirements

### Requirement: Club logo as browser icon
The public website SHALL use the owner-supplied club logo for the browser tab icon, the home-screen icon, and the social preview image. The set SHALL include an SVG or 512-pixel PNG, a 180-pixel apple-touch icon, 192-pixel and 512-pixel manifest icons, and a 32-pixel favicon.ico fallback.

#### Scenario: Browser tab shows the club logo
- **WHEN** a visitor opens the website in a browser
- **THEN** the tab shows the club logo, not a generic icon

### Requirement: Closures and holidays
Club admins with timetable permission SHALL record a closure with a start date, an end date and a visible reason. Active closures within the next 60 days SHALL appear on the home page and timetable with their dates and reasons, and affected days SHALL be marked closed. Closures SHALL also be published as opening-hours specifications with valid-from and valid-through dates that match the visible text.

#### Scenario: Holiday closure shown
- **WHEN** an admin records a closure from 25 to 26 December with the reason "Christmas"
- **THEN** the home page and timetable show "Closed: Christmas, 25–26 December" and those days are marked closed

#### Scenario: Closure ends
- **WHEN** a closure's end date passes
- **THEN** it is removed from the home page and timetable, and the record is kept for history

### Requirement: Closure notice to subscribers
When a closure is recorded, the club SHALL be able to send a closure notice to people who have opted in to club announcements. The notice SHALL go through the notification outbox, count against the daily send limit, and include a working one-click unsubscribe link. Club service messages to members with bookings SHALL NOT depend on this opt-in.

#### Scenario: Subscriber notified of closure
- **WHEN** an admin chooses to notify subscribers about a closure
- **THEN** each opted-in subscriber receives one notice with the dates, the reason and an unsubscribe link

#### Scenario: Unsubscribe without login
- **WHEN** a recipient clicks the unsubscribe link in a notice
- **THEN** the subscription stops without requiring a sign-in, and the change is recorded

### Requirement: Newsletter consent
The newsletter sign-up SHALL use an unticked checkbox with the purpose stated. The sign-up SHALL be confirmed by a double opt-in email. The system SHALL record the time, the page or form used, and the wording shown for each consent. No box SHALL be pre-ticked.

#### Scenario: Sign-up confirmed
- **WHEN** a visitor ticks the box and submits the form
- **THEN** the system sends a confirmation email, and the subscription becomes active only after the visitor confirms

#### Scenario: Consent evidence kept
- **WHEN** a subscription is confirmed
- **THEN** the consent time, source and wording are stored with the subscriber record

### Requirement: Address and map
The public website SHALL show the club address as text with an "Open in Google Maps" link that opens the address in Google Maps. An embedded map MAY be shown, but it SHALL NOT contact Google until the visitor clicks a button to load it.

#### Scenario: Visitor opens directions
- **WHEN** a visitor clicks "Open in Google Maps"
- **THEN** Google Maps opens with the club address

#### Scenario: Map loads only on request
- **WHEN** a visitor has not clicked the map button
- **THEN** no request is made to Google, and the page shows a placeholder with the address

### Requirement: Privacy notice updated
The privacy notice SHALL describe the embedded map, the newsletter and closure notices, the consent records and how to unsubscribe, before these features are enabled.

#### Scenario: Notice before launch
- **WHEN** the embedded map or newsletter is enabled
- **THEN** the privacy notice has been updated and approved by the owner
