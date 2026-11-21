# Tasks: website announcements, closures and maps

Phases run in order. Each phase ends with a check and a recorded result.

## Phase 1 — Logo and address (no consent needed)
- [x] 1.1 Logo: the "Leeside Logo 2025" image from the Wix site is used, with the owner's approval (21 November 2026). Resized to square icons; white padding around the round badge.
- [x] 1.2 Icon set generated (32, 180, 192 and 512 pixels); linked from the page head; web app manifest added; 512 pixel image used as the social preview image. A favicon.ico file is not included; modern browsers use the PNG icons.
- [x] 1.3 Address link to Google Maps already present ("Open in Maps", no API key), verified in the existing Find us tile.
- [x] 1.4 Logo shown in the header on the home page at desktop and phone widths, with no sideways scrolling. Tab and home-screen icons still to be checked on real devices (owner).

## Phase 2 — Closures and holidays
- [x] 2.1 Source: the open-source Nager.Date public holiday service for Ireland (date.nager.at, country code IE). It returned all eleven 2026 Irish public holidays when checked on 21 November 2026. The service is called by the owner's import step, never by visitors' browsers, and the owner confirms each date before it becomes a closure.
- [x] 2.2 Closure kinds: public holiday (imported and confirmed), and a club closure (any date range, for example 23 December to 3 January, with a reason). Both publish to the public feed with dates and reasons.
- [x] 2.3 Warnings for admins (implemented 21 November 2026; the timetable marking of closed days is still to do): an upcoming public holiday that has no closure decision, and any published session that falls on a closed day, shown in Management and the work queue before the day.
- [ ] 2.4 Add opening-hours specifications with valid-from and valid-through dates that match the visible text; check with a structured data test.
- [ ] 2.5 Owner sets the same closures as special hours in the Google Business Profile.
- [ ] 2.6 Gate: check closures on the live site, including after a closure ends.

## Phase 3 — Newsletter with consent and closure notices
- [ ] 3.1 Add the newsletter sign-up: an unticked checkbox with the purpose stated, a double opt-in confirmation email, and consent evidence (time, source, wording).
- [ ] 3.2 Add an unsubscribe link to every subscriber message, working without sign-in.
- [ ] 3.3 Send closure notices to opted-in subscribers through the notification outbox and the daily send limit.
- [~] 3.4 Consent wording approved by the owner (21 November 2026). Privacy notice and any legal review still to do before the sign-up is switched on.
- [ ] 3.5 Gate: test sign-up, confirmation, notice and unsubscribe with test accounts only.

## Phase 4 — Embedded map (after the privacy notice is updated)
- [ ] 4.1 Add the click-to-load map placeholder: no request to Google until the visitor clicks "Show map".
- [ ] 4.2 Update the content security policy so the map frame is allowed only after the click.
- [ ] 4.3 Update the privacy notice to describe the map and its third-party request.
- [ ] 4.4 Gate: confirm no request to Google happens before the click, using the browser's network log.

## Phase 2 status (21 November 2026)
- Done: ten years of Irish holidays (2026 to 2035) stored in the repository from the open-source Nager.Date list; import, confirm and open decisions; Dublin-time closures; warnings for undecided holidays and sessions on closed days; closures published in the public feed; a closure notice on the home page.
- Still open: marking closed days on the timetable; structured data for closures (validFrom and validThrough); owner setting the same closures in the Google Business Profile.
- Note: confirming a holiday as closed cancels overlapping sessions but does not yet send notices to players; use the existing hall closure notices for now.

## Phase 5 — Shareable closure notices (WhatsApp, Facebook, X, Instagram)
- [x] 5.1 Each closure notice on the home page has share options: WhatsApp, Facebook, X, copy text (for Instagram), and the phone share menu where available.
- [x] 5.2 The shared text is short and public: the club name, the reason, the dates and a link to the home page closures section.
- [ ] 5.3 Owner tests each share option on a phone and a desktop, and confirms the preview card looks right.
- [ ] 5.4 Later: an image card for Instagram, once the logo and approved wording are fixed.

