## Why

Leeside Table Tennis needs one accessible place to run membership, club activity, attendance, match history, and player development instead of relying on a temporary website and disconnected manual records and messages. The initial Cork launch should also validate a product that can later serve table-tennis clubs and players across Ireland.

## What Changes

- Pilot sequencing: retain the existing Leeside website, app, backend and build targets in this repository for at least one year of live operation. Review independent website extraction only after that period and once more than two clubs participate (three or more). No immediate or automatic split is planned; app-only hosting below is the longer-term direction with this Leeside pilot exception.
- Launch the national platform app and shared backend, integrating independently hosted club websites through verified external links and app entry links. Each club website may have its own repository; the platform does not host a generic website service.
- Present only Leeside in the pilot app while keeping the app's product identity, navigation, and information architecture suitable for clubs across Ireland.
- Model each person with one platform identity that can later hold player, coach, guardian, or administrative relationships with multiple clubs at the same time.
- Capture email addresses and mobile numbers independently, accept non-Gmail addresses, require only one verified identifier for independent login, and allow both methods to link to the same identity.
- Offer optional Google sign-in for convenience while retaining email/password and magic-link access for Gmail and non-Gmail users and preventing duplicate player profiles when identities are linked.
- Allow junior and offline player profiles to exist without personal login credentials, with guardian or authorized club administration providing the permitted access path.
- Show every club in which a user has a relationship in the app's My Clubs area, allowing the user to switch club context and open the correct branded club website.
- Serve visitors, adult players, parents/guardians, coaches, and club committee/admin staff with role-appropriate access.
- Publish club information, contacts, news, announcements, training times, and events.
- Support member registration, member records, and links between junior players and their parent/guardian.
- Allow club admins to add and manage members, configure membership types, manually record externally received payments, and set membership start/end dates and status without a payment gateway.
- Let an admin optionally email the adult player or junior's guardian a clearly labelled non-formal acknowledgement when manually recording/correcting an external payment or renewing membership.
- Let admins enable renewal reminders at the predefined 10-day and 3-day points and email the registered player or, for a junior, the appropriate parent/guardian.
- Support session and event booking while preventing unauthorized or invalid bookings.
- Model Leeside's five recurring weekly sessions and let admins add one-off or bounded multi-day programmes such as a seven-day camp with configurable capacity, audience, booking, and attendance.
- Publish approved app events plus optional RSS/Atom/iCalendar feeds for independently integrated websites, send consent-aware email invitations and provide manual Facebook sharing; automation requires an approved Meta integration.
- Let attending players start singles or doubles matches during a club session, record game-by-game scores, pause/resume, submit or abandon matches, and retain structured history.
- Give the opposing side five days to approve a submitted result or request a modification, auto-approve inaction after the deadline, and allow an authorized coach to approve, correct, or resolve disputes at any time.
- Let a coach/admin create configurable dated league or knockout tournaments, select registered or guest singles/doubles participants, generate fixtures or brackets, and nominate players to operate a specific tournament when staff are absent.
- Let a coach/admin start an ad hoc tournament from that day's checked-in roster and operate scoring and completion from a phone.
- Give each player a published summary of strengths, areas to improve, and future goals while keeping coaches' private working notes separate.
- Register actual presence at a club kiosk using a member's NFC card with printed QR fallback regardless of membership status, classify membership at check-in, alert admins about expired or missing membership, support manual correction, and report participation by session and date range.
- Let a new player scan a public Leeside sign-up QR or enter a public club join code in the platform app, submit an adult or guardian-led junior application immediately, and optionally receive a limited trial pass without being misclassified as an active member.
- Let recognized players and guardians display short-lived digital attendance QR passes in the app without implying active/paid membership, while retaining the physical NFC/QR card as the universal option for children and members without phones.
- Give admins a configurable daily attendance digest and dashboard charts for daily, weekly, monthly, membership-status, session-utilization, and top-attendee views.
- Give individually authenticated admins a shared work queue where alerts can be claimed, assigned, commented on, and resolved as a team.
- Let club groups manage operational records, app news/events and communications inside the app. Independent websites manage their own presentation/content and link to app administration; optional public feeds may reuse explicitly published app records.
- Let players select an internal/external tournament event, record singles/doubles results and structured personal reflections, and let coaches view grouped descriptive summaries. Same-recording-club opponents use the existing review process; external reports are immediately retained as player-reported without mandatory approval.
- Provide club administrators with tools to manage users, content, memberships, bookings, matches, and communications.
- Keep club data boundaries and configuration explicit so that additional Irish clubs can be supported later without making multi-club operation part of the first launch.

## Capabilities

### New Capabilities

- `identity-and-access`: Shared app web/mobile accounts, authentication, club-scoped roles, multi-club participation and guardian relationships; independent websites link into app sign-in.
- `club-content`: App club profiles, verified external website links, published news/events and optional public feeds for independently hosted websites.
- `membership-management`: QR/join-code registration, pending and trial applicants, member records, membership periods, manual status/payment marking, and renewal lifecycle.
- `booking-management`: Member booking and club administration of training sessions and events.
- `member-communications`: Renewal messages, match-review alerts, non-formal manual-payment acknowledgements, and configurable daily admin attendance digests routed to the appropriate adult.
- `match-records`: In-session match setup and scoring, later result entry, opponent review with timed auto-approval, coach resolution, correction, viewing, and retention of local player match history.
- `tournament-management`: Coach-configured league and knockout tournaments, delegated player organizers, participant check-in, fixtures/brackets, standings, and completion.
- `player-development`: Coach-supported player summaries covering strengths, improvement areas, and future goals with suitable visibility controls.
- `tournament-reflections`: Tournament-linked internal/external results, conditional same-club review, structured player reflections and descriptive coach group summaries with club-scoped privacy.
- `attendance-tracking`: NFC and QR kiosk check-in, membership-aware attendance decisions, visitor sign-up QR, manual administration, and attendance analytics.
- `club-administration`: Role-protected administration and shared work ownership across content, people, memberships, bookings, tournaments, matches, alerts, and club settings.

### Modified Capabilities

None. This is the first product specification.

## Impact

- Introduces the national web/mobile app, shared backend, database, email delivery and club administration, with independent website integration through links and optional public feeds.
- Stores personal information for adults and children, membership history, match history, and coaching observations; privacy, safeguarding, consent, retention, and access controls are therefore core requirements.
- Requires reliable email delivery but no paid club-management, calendar, messaging, or payment integration for the first release.
- Uses a verified club or platform sending domain through Resend for automated messages; a Gmail or club mailbox may receive replies but is not the automated SMTP sender.
- Introduces attendance records, hybrid NFC/QR member cards, a club-controlled Android kiosk, a public sign-up QR, attendance notifications, and staff reporting.
- The first release operates for one Cork club; future multi-club expansion must not expose one club's data to another.
- Independent club websites retain their own brands and deployments; operational accounts and records live in the national app, with optional public-only content integration.
- A person's identity is platform-wide, while their roles, memberships, coaching assignments, and access permissions are independently scoped to each club.
- Club websites have independent repositories, domains and deployments. The national app/backend stay shared; no per-club app copy or platform website folder is required.
- A future club is provisioned by the operator with its tenant, slug, approved external website URL and first admin invitation; routine app management belongs to that club's authorized admins.

## Non-goals for the First Release

- Onboarding or operating multiple clubs in production.
- Hosting a generic website platform, copying the app/backend into club repositories, or automatically moving the existing Leeside prototype into another repository as part of this requirements update.
- Automated self-service club onboarding, subscriptions, and platform billing; future clubs are provisioned through a controlled onboarding process first.
- Branding the Ireland-wide app as a Leeside-owned club app.
- Integration with Stripe or another online payment gateway.
- Paid SMS authentication and SMS notification delivery during the email-first pilot; the data model remains ready for a provider-backed phone OTP phase.
- Integration with Table Tennis Ireland, ranking systems, WhatsApp, Sport80, or external calendars.
- Official national competition registration or automatic ranking calculations.
- Internal player rating or ranking calculations; the first release retains confirmed results and tournament standings only.
- Automated AI coaching conclusions; development notes and goals remain human-led.
- Automated internal player ratings; confirmed match history and tournament standings remain available without calculating a persistent skill rating.
- A custom-built scanner, turnstile or door-access system, high-security smart-card infrastructure, facial recognition, or continuous location tracking.
- Member self-service booking cancellation and booking waiting lists.

## Assumptions and Unresolved Decisions

- “Manual payment status” means an authorized admin records a payment received outside the platform against a membership and separately sets the membership dates/status; the platform does not process money or store personal bank credentials.
- Match records cover internal matches and player-reported external tournament participation; neither constitutes official national results.
- Coaches' private working notes are not shown to players or guardians; a coach deliberately publishes a separate player-facing development summary.
- Same-recording-club matches follow opposing-side review, five-day auto-approval and coach resolution. External-opponent results are player-reported immediately and do not auto-become verified after five days.
- Coaches resolve disputed results. Retired, abandoned, or otherwise incomplete matches are retained but excluded from player statistics and tournament standings unless a coach records a resolved result.
- Admins can enable the predefined 10-day reminder, 3-day reminder, or both; arbitrary reminder offsets are outside the first release.
- Attendance represents physical presence and is recorded even when membership is expired or missing; the historical record retains that classification and creates an admin alert for follow-up.
- The first release does not trust a plain self-check-in button as proof of venue presence; children and adults can use the issued card, with staff manual check-in as fallback.
- A club join code is a public convenience that selects Leeside in the app; it is not a password, membership credential, or authorization mechanism.
- App attendance QR passes are short-lived and distinct from the permanent physical-card credential so a saved screenshot cannot remain valid indefinitely.
- Membership values, safeguarding appointments, policy approval, attendance-correction rules, and final retention periods remain to be confirmed with Leeside Table Tennis; implementation uses the documented configurable/provisional defaults until approval.
