# Tasks: website announcements, closures and maps

Phases run in order. Each phase ends with a check and a recorded result.

## Phase 1 — Logo and address (no consent needed)
- [ ] 1.1 Owner supplies the original logo file (Leeside Logo 2025) and confirms it may be used as the browser and home-screen icon.
- [ ] 1.2 Generate the icon set (SVG or 512 PNG, 180 apple-touch, 192 and 512 manifest, 32 favicon.ico) and add the link tags to the website head.
- [ ] 1.3 Show the address as text with an "Open in Google Maps" link using https://www.google.com/maps/search/?api=1&query=ADDRESS (no API key).
- [ ] 1.4 Check the icon in a browser tab, on an iPhone home screen and on an Android home screen.

## Phase 2 — Closures and holidays
- [ ] 2.1 Owner confirms the public holiday dates for the year; they are entered as closures, not imported automatically.
- [ ] 2.2 Publish active closures (next 60 days) in the public feed with dates and reasons.
- [ ] 2.3 Show closures on the home page and timetable; mark closed days on the timetable.
- [ ] 2.4 Add opening-hours specifications with valid-from and valid-through dates that match the visible text; check with a structured data test.
- [ ] 2.5 Owner sets the same closures as special hours in the Google Business Profile.
- [ ] 2.6 Gate: check closures on the live site, including after a closure ends.

## Phase 3 — Newsletter with consent and closure notices
- [ ] 3.1 Add the newsletter sign-up: an unticked checkbox with the purpose stated, a double opt-in confirmation email, and consent evidence (time, source, wording).
- [ ] 3.2 Add an unsubscribe link to every subscriber message, working without sign-in.
- [ ] 3.3 Send closure notices to opted-in subscribers through the notification outbox and the daily send limit.
- [ ] 3.4 Owner reviews the consent wording and the privacy notice with legal advice where needed.
- [ ] 3.5 Gate: test sign-up, confirmation, notice and unsubscribe with test accounts only.

## Phase 4 — Embedded map (after the privacy notice is updated)
- [ ] 4.1 Add the click-to-load map placeholder: no request to Google until the visitor clicks "Show map".
- [ ] 4.2 Update the content security policy so the map frame is allowed only after the click.
- [ ] 4.3 Update the privacy notice to describe the map and its third-party request.
- [ ] 4.4 Gate: confirm no request to Google happens before the click, using the browser's network log.
