# Wix migration and member portal audit

Audited 6 November 2026 against source code, the saved Wix inventory and accessible public Wix pages. This is a plan and gap assessment, not a completed import or implementation.

## Outcome

The deployed Cloudflare Worker serves only `apps/club-web`: a single-page synthetic/demo landing page. It is not a full replacement for Wix. `apps/platform` is a different frontend with a demo dashboard and partial venue-QR flow; no separate platform Worker is confirmed deployed. The website has no working player portal or membership administration. Its Begin registration button has no action. Several app links point only to roadmap cards (`#features`) rather than implemented screens. Do not present these as finished features.

## Content reconciliation

| Wix source / content | Current implementation | Planned destination |
| --- | --- | --- |
| [Home](https://leesidetabletennis.wixsite.com/home): club intro, five sessions, membership descriptions | Partial facts and timetable; rewritten demo copy | Real public Home and Sessions pages |
| [About](https://leesidetabletennis.wixsite.com/home/about): club story, coaching team, fees, address, contact form | Venue/phone only; no About page or working enquiry form | About, Coaching and Contact pages |
| [Policies](https://leesidetabletennis.wixsite.com/home/general-5): governance, handbook instructions, safeguarding link and photography policy | Absent | Policies page with source links and approved documents |
| [News](https://leesidetabletennis.wixsite.com/home/blog) | Two placeholder stories, not imported articles | News archive, dated article pages, approved media and source attribution |
| [Calendar](https://leesidetabletennis.wixsite.com/home/general-1) | Static recurring timetable, not calendar/event import | Calendar and event details with booking/app links |
| Wix logo, photography and social links | Abstract demo artwork; most assets/links absent | Approved brand assets, photos, alt text and social links |
| Membership descriptions, fees and durations | Generic copy without a real catalogue | Public membership information plus separate authenticated management |

News/calendar extraction failed through the browsing tool during this audit, so completeness of their entries, pagination, attachments and historical events is not established. Obtain them through a follow-up crawl/feed/export before claiming the import is complete. The linked policy PDF also needs retrieval and verification; a listed link is not an imported document. Never invent unavailable content.

## Newly identified published data

The About page currently lists full membership at EUR 190 for six months with five weekly sessions, partial membership at EUR 100 for six months with one weekly session, and pay-as-you-go at EUR 10/adult or EUR 5/child per session. It identifies Ben Haughton, Gary Mahoney, Conall Conroy, Jean Auchapt and Alessandra Fada in the coaching section. Home/About state public-holiday closure.

Treat these as source-attributed initial public content and candidate admin catalogue defaults, not immutable product rules or proof of current payments. Admins retain runtime edit control. Existing owner permission for public-content reuse is already recorded. Use the supplied `leesidettie@gmail.com` as the new club contact/reply-to rather than inventing an email from Wix.

The separate local timetable draft conflicts with the confirmed Wix-based schedule (notably Friday/Saturday and category labels). Preserve the last owner-confirmed timetable until an explicit revision is agreed; do not silently substitute the draft or display categories as settled.

## Where users will find each area

| Audience | Planned entry and functions | Actual status |
| --- | --- | --- |
| Public visitor | Leeside site: Home, About/Coaching, Sessions/Calendar, Membership, Book a table, News, Policies, Contact | Landing demo only |
| Player | Website Member login / Open app link → app → My Clubs → Leeside → membership status, attendance, bookings, results/reflections | Not an implemented player portal |
| Parent | Same app login → explicitly select self or linked child → permitted membership/booking/attendance/history | Guardian selection exists only in partial attendance flow; rest pending |
| Membership manager | App/website management entry → Leeside → Members, Membership types, assignments/renewals/manual payments | Required in OpenSpec, not built |
| Booking maintainer | Management → hall/tables/availability and pending approval queue | Specified, not built |
| Coach | Management/development → matches/tournaments and permitted reflections/goals | Roadmap/demo, not built |

Public Membership explains options and signup. Private My membership shows a person's own record. Staff Members/Memberships manages other records only with current club permissions. Do not publish a private player directory to satisfy a public Players navigation label.

## Delivery phases

1. **Public content inventory/import:** enumerate all Wix pages, news pagination, events, images and document URLs. Create a source manifest with original URL/date, destination, retrieval status, selected content and unresolved items. Import only approved public material; do not scrape contact submissions/member data. Keep Wix available.
2. **Public website completion:** implement real navigation/routes and the missing pages, membership information, policy access and source-backed news/events. Replace placeholder stories. A contact form must use a configured delivery path or honestly offer a mail link; no fake success messages. Use responsive/accessibility checks and compare every manifest item before sign-off.
3. **Deploy the separate app demo:** add a distinct Worker/config for `apps/platform` with a neutral product name and synthetic repository-backed demo data; omit Supabase build variables while setup is paused. Add website links to the actual app URL only after deployment. Demo users/role switching must be labelled as preview behavior, not real authentication.
4. **Build the operational screens with a testable data boundary:** real views for player/guardian profile, membership types/assignments/manual renewal, staff grants, sessions and approved table booking. Test empty catalogue, expired/no membership, guest/guardian and denied-access states without promising live backend persistence.
5. **Resume Supabase only when requested:** review/apply migrations, complete authentication/profile provisioning/RLS and connect screens to shared services. Create the initial authorized admin, configure email/outbox/scheduled work and migrate approved records through a dry run. No private live-data import while setup is paused.
6. **Verification:** prove shared website/app booking inventory and permissions, verify no private records in public APIs, review content parity and routing, check deployed asset/build commits, and test on phones. Broad club pilot recruitment stays parked; owner-led review can proceed. Switch the purchased domain only when replacement content/operations are accepted, with rollback available.

## Completion criteria

- Every discovered public source item is imported, intentionally linked/archived, or explicitly deferred with a reason; no blanket claim of full migration while sources remain inaccessible.
- Public news is source-backed and historical events are not shown as upcoming; source-policy contents are not silently rewritten.
- Player, guardian and staff areas have actual routes and explicit permissions rather than inactive buttons/roadmap anchors.
- The website and app URLs are documented separately and demos are clearly distinguished from live service.
- No token/password is committed, Supabase setup is not resumed implicitly, and the existing PDF is preserved untouched.
