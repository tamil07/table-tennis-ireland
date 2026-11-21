# Manual test plan: live member app and public website

Use the owner account for management checks, and separate test accounts for player, guardian, coach and manager checks. Name every test record starting with `TEST` (for example "TEST Player One", "TEST Adult Monthly"), so it can be found and removed later. Never use real people's details. Record the result of each step (pass, fail, or note) with the date.

Live app: https://ttclubs-app.ttclubsie.workers.dev/
Public website: https://table-tennis-ireland.ttclubsie.workers.dev/

## 0. Before testing
- Hard-refresh both sites (Cmd+Shift+R) so the latest build loads.
- Confirm the sign-in page appears and the demo role picker does not.
- Confirm the backend has been redeployed after the phone and date-of-birth changes (see task 14.x and section 19 of tasks.md).

## 1. Sign-in and account (live app)
1. Sign in with the owner account. Expected: the workspace opens with the owner's name.
2. Sign out, then choose "Forgot password" and enter the owner email. Expected: a reset email arrives; the link opens the app.
3. Sign in with a wrong password. Expected: a clear error, no access.
4. Sign in with a second test account that has no role. Expected: no management tabs, only what that person may see.

## 2. Overview
1. Open Overview. Expected: counts and setup hints load without errors.
2. Add one TEST person. Return to Overview. Expected: the people count changes.

## 3. Table booking
1. Publish a TEST session first (see Sessions & hall). Open Table booking and choose it.
2. As a second test player, request a place. Expected: the request shows as pending.
3. As the owner, approve it. Expected: the place shows as confirmed; the table counts update.
4. Try a second request by the same player for the same session. Expected: refused (one place per player per session).
5. Fill all four places on one table, then try a fifth. Expected: refused.
6. Decline or cancel a request. Expected: the place is released.

## 4. People & memberships
1. Add a TEST adult with first name, second name and nickname. Expected: the full name appears in lists; the nickname shows in the editor.
2. Enter a mobile number: choose Ireland (+353) and type `087 123 4567`. Expected: saved; the editor shows the number in the same format.
3. Enter an invalid mobile number (for example `12`). Expected: refused with a clear message.
4. Enter a date of birth in the future. Expected: refused.
5. Add a TEST junior (through a guardian account) without a date of birth. Expected: refused, asking for a date of birth.
6. Add the same junior with a date of birth. Expected: saved.
7. Create a TEST membership type with a price and duration. Expected: it appears in the catalogue.
8. Assign that type to the TEST adult with start and end dates, status active. Expected: the membership shows as active.
9. Set the status to cancelled. Expected: the membership no longer counts as active; history is kept.
10. Retire the TEST membership type. Expected: it can't be assigned to new members; existing records remain.
11. Edit the TEST adult's name and save. Expected: the new name appears everywhere (lists, booking, attendance).
12. On a phone width, check the people list and editor stack without sideways scrolling.

## 5. Attendance
1. During an open TEST session, check in the TEST adult with the app. Expected: attendance recorded.
2. Mark a second TEST player "Not attending". Expected: recorded separately from booking.
3. Check in a person whose membership has expired (or was cancelled). Expected: check-in is recorded, with a follow-up alert for admins.
4. Make a correction to an attendance entry. Expected: the correction is recorded, and the original is kept in history.
5. Confirm that a booking alone does not count as attendance.

## 6. Sessions & hall
1. Publish a session for a future date and time in Ireland time. Expected: it appears on Sessions & hall and on the public timetable once published.
2. Set the tables and their capacities. Expected: saved; shown in Table booking.
3. Cancel the TEST session. Expected: marked cancelled; players with places are told (check Messages).
4. Check a holiday exception. Expected: the day is closed.

## 7. Matches
1. Create a TEST singles event. Expected: it appears in the events list.
2. Enter a match between two TEST players and score it. Expected: the result saves.
3. Ask the opponent to approve the result from their account. Expected: the result shows as approved after approval; without approval within five days it is auto-approved.
4. Write a private reflection as one player. Expected: the opponent cannot see it.
5. Check that coach summaries show counts only, not private notes.

## 8. Tournaments
1. Create a TEST tournament with a format and points. Expected: it appears in the list.
2. Add players or a delegation. Expected: they appear in the draw.
3. Enter a result. Expected: standings update; a dispute goes to the coach.

## 9. Coaching
1. Add a TEST coaching tag (for example "forehand"). Expected: it appears in the tag list.
2. Record a development note for a TEST player. Expected: the note is private to the coach and the player/guardian sign-off is needed before a summary shows as complete.
3. Check the coaching aggregate report. Expected: counts only, no diagnoses.

## 10. Messages
1. Send a test notice to the TEST adult. Expected: queued, not marked sent, until the email provider is configured.
2. Unsubscribe the TEST adult from optional emails. Expected: the preference saves.
3. Check the work queue for delivery issues. Expected: any failed or queued messages are listed.

## 11. Management
1. Enter the privacy contact, safeguarding contact and policy text. Expected: saved; the public website shows the policy text.
2. Keep automatic retention off. Expected: setting saved as off.
3. Grant a second TEST account the membership permission only. Expected: that account can open People & memberships but not Management.
4. Revoke that permission. Expected: the account loses access on its next page load.
5. Check the club's public join code and website address. Expected: correct values.

## 12. Public website
1. Open the home page on a phone (390 pixels) and a desktop. Expected: no sideways scrolling; header, menu and skip link work.
2. Check the next-session card, the timetable, the membership plan, news, FAQ and policy links, with and without published content.
3. Switch the device to dark appearance. Expected: text stays readable.
4. Turn on reduced motion. Expected: the ticker and animations stop or slow.
5. Sign in on the website with a test account and try the join, child and subscription forms. Expected: each saves or refuses with a clear message; a child needs a date of birth.

## 13. Cross-cutting checks
- Accessibility: use Tab through each page; focus is always visible.
- Errors: a failed save shows a message and keeps what was typed.
- Refresh: after a change on one screen, reload and confirm it persists.
- Two devices: sign in on a phone and a laptop; a change on one appears on the other after refresh.

## Table booking: detailed test cases (21 November 2026)

Prerequisites: one published session in the future (Sessions & hall), with at least one reservable table; a TEST player account and a second TEST player account; the owner account for management steps.

### As a member (TEST player account)
| # | Steps | Expected |
|---|---|---|
| MB1 | Open Table booking. | Sessions you may book are listed; no approve, decline, cancel-for-others or move controls. |
| MB2 | In "Request a player place", choose your player, choose a table and place, press Save. | A pending request shows against that session and place. |
| MB3 | Try to request a second place in the same session. | Refused: one active place per player per session. |
| MB4 | Cancel your own pending request with "Cancel place". | It is removed and the place is free. |
| MB5 | Request again, then wait for the owner's decision. Refresh the page. | The status is still pending, and it updates after approval. |
| MB6 | After approval, check the booking shows as confirmed. | Confirmed status and table and place are shown. |
| MB7 | Try to cancel within the cutoff period (default 2 hours before the session). | Refused with a message about the cancellation cutoff; no change. |
| MB8 | Check a booking for another player's name is not visible or editable to you. | Not visible or editable. |

### As management (owner account)
| # | Steps | Expected |
|---|---|---|
| MG1 | Open Table booking. | The TEST member's pending request is listed with Approve place and Decline. |
| MG2 | Press Approve place. | Status changes to confirmed; the table count updates. |
| MG3 | Press Decline on a second request. | That request is declined and the place is free. |
| MG4 | Fill one table to four places with four TEST players (approve each). Request a fifth. | The fifth is refused: session or table capacity reached. |
| MG5 | Press "Move to…" on a confirmed place and choose another table. | The place moves; the old place is free. |
| MG6 | Press Release place on a confirmed place (no-show). | The place is released and free for another request. |
| MG7 | Press Cancel place on a confirmed place. | Cancelled; the member sees it cancelled. |
| MG8 | Check the hold: leave a pending request past the booking hold (default 30 minutes). | The request is released automatically, or marked as expired, as the owner's setting says. |
| MG9 | Check the member's view again after each change. | Matches management's view after a refresh. |
| MG10 | Cancel the whole session from Sessions & hall with bookings in place. | Players with places see the cancellation (Messages). |

Record each result as pass or fail with the exact message. Start with MB2 and MG1, since the others depend on them.
