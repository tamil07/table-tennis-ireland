## Why

Leeside Table Tennis needs one accessible place to run membership, club activity, attendance, match history, and player development instead of relying on a temporary website and disconnected manual records and messages. The initial Cork launch should also validate a product that can later serve table-tennis clubs and players across Ireland.

## What Changes

- Launch a responsive, Leeside-branded public website and a separately branded platform app backed by the same accounts and club data, using a reusable club-website portfolio model for future clubs.
- Present only Leeside in the pilot app while keeping the app's product identity, navigation, and information architecture suitable for clubs across Ireland.
- Model each person with one platform identity that can later hold player, coach, guardian, or administrative relationships with multiple clubs at the same time.
- Capture email addresses and mobile numbers independently, accept non-Gmail addresses, require only one verified identifier for independent login, and allow both methods to link to the same identity.
- Allow junior and offline player profiles to exist without personal login credentials, with guardian or authorized club administration providing the permitted access path.
- Show every club in which a user has a relationship in the app's My Clubs area, allowing the user to switch club context and open the correct branded club website.
- Serve visitors, adult players, parents/guardians, coaches, and club committee/admin staff with role-appropriate access.
- Publish club information, contacts, news, announcements, training times, and events.
- Support member registration, member records, and links between junior players and their parent/guardian.
- Allow club admins to add and manage members, configure membership types, manually record externally received payments, and set membership start/end dates and status without a payment gateway.
- Email the adult player or junior's guardian a clearly labelled non-formal acknowledgement when an admin records or corrects an external membership payment.
- Let admins enable renewal reminders at the predefined 10-day and 3-day points and email the registered player or, for a junior, the appropriate parent/guardian.
- Support session and event booking while preventing unauthorized or invalid bookings.
- Let attending players start singles or doubles matches during a club session, record game-by-game scores, pause/resume, submit or abandon matches, and retain structured history.
- Give the opposing side five days to approve a submitted result or request a modification, auto-approve inaction after the deadline, and allow an authorized coach to approve, correct, or resolve disputes at any time.
- Let a coach/admin create configurable dated league or knockout tournaments, select registered or guest singles/doubles participants, generate fixtures or brackets, and nominate players to operate a specific tournament when staff are absent.
- Give each player a published summary of strengths, areas to improve, and future goals while keeping coaches' private working notes separate.
- Register actual presence at a club kiosk using a member's NFC card with printed QR fallback regardless of membership status, classify membership at check-in, alert admins about expired or missing membership, support manual correction, and report participation by session and date range.
- Let a new player scan a public Leeside sign-up QR or enter a public club join code in the platform app, submit an adult or guardian-led junior application immediately, and optionally receive a limited trial pass without being misclassified as an active member.
- Let recognized players and guardians display short-lived digital attendance QR passes in the app without implying active/paid membership, while retaining the physical NFC/QR card as the universal option for children and members without phones.
- Give admins a configurable daily attendance digest and dashboard charts for daily, weekly, monthly, membership-status, session-utilization, and top-attendee views.
- Give individually authenticated admins a shared work queue where alerts can be claimed, assigned, commented on, and resolved as a team.
- Let each club's authorized admins manage the same canonical club portfolio and operational data from either their branded website administration area or their club section in the platform app.
- Provide club administrators with tools to manage users, content, memberships, bookings, matches, and communications.
- Keep club data boundaries and configuration explicit so that additional Irish clubs can be supported later without making multi-club operation part of the first launch.

## Capabilities

### New Capabilities

- `identity-and-access`: Shared website/mobile accounts, authentication, club-scoped roles and permissions, multi-club participation, and parent/guardian-to-junior relationships.
- `club-content`: Reusable club-branded website portfolios plus shared club details, contacts, policies, news, announcements, training information, and event listings presented in the correct club context inside the neutral platform app.
- `membership-management`: QR/join-code registration, pending and trial applicants, member records, membership periods, manual status/payment marking, and renewal lifecycle.
- `booking-management`: Member booking and club administration of training sessions and events.
- `member-communications`: Renewal messages, match-review alerts, non-formal manual-payment acknowledgements, and configurable daily admin attendance digests routed to the appropriate adult.
- `match-records`: In-session match setup and scoring, later result entry, opponent review with timed auto-approval, coach resolution, correction, viewing, and retention of local player match history.
- `tournament-management`: Coach-configured league and knockout tournaments, delegated player organizers, participant check-in, fixtures/brackets, standings, and completion.
- `player-development`: Coach-supported player summaries covering strengths, improvement areas, and future goals with suitable visibility controls.
- `attendance-tracking`: NFC and QR kiosk check-in, membership-aware attendance decisions, visitor sign-up QR, manual administration, and attendance analytics.
- `club-administration`: Role-protected administration and shared work ownership across content, people, memberships, bookings, tournaments, matches, alerts, and club settings.

### Modified Capabilities

None. This is the first product specification.

## Impact

- Introduces a new website, mobile application, shared backend, database, email delivery mechanism, and administrator experience.
- Stores personal information for adults and children, membership history, match history, and coaching observations; privacy, safeguarding, consent, retention, and access controls are therefore core requirements.
- Requires reliable email delivery but no paid club-management, calendar, messaging, or payment integration for the first release.
- Introduces attendance records, hybrid NFC/QR member cards, a club-controlled Android kiosk, a public sign-up QR, attendance notifications, and staff reporting.
- The first release operates for one Cork club; future multi-club expansion must not expose one club's data to another.
- The club website and national-platform app are distinct frontends and brands, but they consume the same authorized backend capabilities.
- A person's identity is platform-wide, while their roles, memberships, coaching assignments, and access permissions are independently scoped to each club.
- Future club websites resolve their verified domains to club-specific branding and public content while sharing one multi-tenant website codebase and backend.
- A future club is initially provisioned by the platform operator with its own tenant, slug, verified domain or temporary platform subdomain, and first club-admin invitation; routine club management then belongs to that club's authorized admins.

## Non-goals for the First Release

- Onboarding or operating multiple clubs in production.
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
- Match records initially cover local/internal club matches and are not official national results.
- Coaches' private working notes are not shown to players or guardians; a coach deliberately publishes a separate player-facing development summary.
- A submitted match is confirmed by opposing-side approval, automatic approval after five days without action, or an authorized coach decision; a modification request stops the auto-approval timer until resubmission.
- Coaches resolve disputed results. Retired, abandoned, or otherwise incomplete matches are retained but excluded from player statistics and tournament standings unless a coach records a resolved result.
- Admins can enable the predefined 10-day reminder, 3-day reminder, or both; arbitrary reminder offsets are outside the first release.
- Attendance represents physical presence and is recorded even when membership is expired or missing; the historical record retains that classification and creates an admin alert for follow-up.
- The first release does not trust a plain self-check-in button as proof of venue presence; children and adults can use the issued card, with staff manual check-in as fallback.
- A club join code is a public convenience that selects Leeside in the app; it is not a password, membership credential, or authorization mechanism.
- App attendance QR passes are short-lived and distinct from the permanent physical-card credential so a saved screenshot cannot remain valid indefinitely.
- Detailed membership rules, booking rules, safeguarding policy, attendance correction rules, and data-retention policy remain to be confirmed with Leeside Table Tennis.
