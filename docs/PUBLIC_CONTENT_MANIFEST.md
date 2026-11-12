# Leeside public-content migration manifest

Source inventory dated 7 November 2026; implementation pointers reconciled 12 November. Source evidence is saved in `LEESIDE_CONTENT_INVENTORY.md` and the 6 November audit in `WIX_MIGRATION_AND_MEMBER_PORTAL_PLAN.md`. This update reuses that evidence; it is not a fresh exhaustive crawl. Public-content reuse consent is already recorded. A source link does not mean its contents or attachments have been imported.

| Source | Destination in current source | Status / next work |
| --- | --- | --- |
| Wix Home: `https://leesidetabletennis.wixsite.com/home` | Website hero, `#sessions`, footer | Club/venue/timetable facts summarized; exact source copy, media and all navigation still need exhaustive reconciliation |
| Wix About: `/home/about` | `#about`, `#membership`, `#contact` | Coaching names, venue and published fee snapshot added; full history/bios/photos not imported |
| Owner-confirmed five weekly session times | `#sessions`, booking preview | Confirmed static public timetable; runtime dated-session/camp and closure editors exist. Configure real inventory/exceptions; public timetable binding and source parity remain separate work. |
| Owner-provided `leesidettie@gmail.com` | Join/contact mail links | Working mail enquiry; no form submission or account registration claim |
| Wix public phone/address | Contact section and footer | Copied from inventory as authorized; management editor pending |
| Wix news: `/home/blog` and `/home/blog-feed.xml` | `#news` source archive link | Fabricated example articles removed; archive pagination, article text, attachments and media import pending |
| Wix calendar: `/home/general-1` | `#news` source calendar link | Event extraction incomplete; do not invent upcoming dates or treat historic events as current |
| Wix policies: `/home/general-5` | `#contact` policies link | Document retrieval/content verification and individual document manifest pending; no invented safeguarding/privacy appointments |
| Wix Facebook link | Contact section | Existing public club link copied |
| Wix Instagram link | Not rendered | Inventory points to Munster account; confirm intended association before displaying as Leeside's own |
| Wix logo/photography | Not imported | Approved assets, photographer/child-image publication details, alt text and destination paths pending; abstract court illustration remains |
| Supplied `Leeside Table Booking.html` | Shared `ClubPortal` in website/app (supersedes standalone `SessionBookingDemo`) | Adapted visual concept into React; Claude APIs replaced; approved four-place model supersedes source two-player slots; source supports synthetic and authenticated live adapters; hosted acceptance tracked separately |
| Local PDF files | No public destination | Preserve source files; inspect purpose/content before reuse. Conflicting timetable draft does not supersede owner-confirmed schedule |

## Completion rule

For every retrieved article/event/document/media item, add the original full URL, retrieval date, intended destination, imported/linked/deferred status and reason. The rows above enumerate known surfaces, not every article or asset. Full migration remains unchecked until archive/calendar/document/media enumeration and responsive/public-content acceptance are complete. Keep Wix available until cutover is accepted.

## Verification completed for this update

The local booking browser walkthrough exercised parent/child requests, duplicate-player refusal, staff approvals, occupied-table protection, moving a player, opening a coaching allocation, persistence after refresh and hiding Leeside booking in another club context. Layouts were checked at 1440, 390 and 320 pixels with no document overflow or browser errors. Domain rules have seventeen booking tests (twenty-one repository tests including earlier domain coverage). These checks are synthetic and do not test hosted concurrency, real email or authentication.
