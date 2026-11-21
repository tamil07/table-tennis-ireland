# Tasks: Wix content migration

## Phase A: Inventory and dry run
- [x] A.1 Read the Wix sitemap index and its four child sitemaps; record counts (38 posts, 49 categories, 57 event pages, 4 pages).
- [x] A.2 Crawler written and run (21 November 2026): 38 posts, 57 event pages, 4 pages captured with title, date, author, text, images and source address. Scratch output; the approved content is in apps/club-web/src/content/wix-content.ts. with a pause between requests; save each page's title, date, author, text, images and category into the manifest.
- [ ] A.3 Cross-check the manifest with the RSS feed (20 items) and the posts sitemap.
- [~] A.4 Owner approved phases 1 to 3 in principle (21 November 2026). The manifest is still to be reviewed item by item: publish, archive, or leave out.

## Phase B: Images and rights
- [x] B.1 Owner confirmed the image rights (21 November 2026).
- [ ] B.2 Download, compress and store approved images in file storage within the task 20 limits. Not done yet: post pages currently load images from the Wix media host, so this must happen before the Wix subscription ends.

## Phase C: Import into the website
- [x] C.1 News: 38 posts imported as dated news items, newest first, each with its source link (apps/club-web/src/Pages.tsx). Known issue: some longer posts run paragraphs together; fix the text splitting before the post pages are published. Categories are not yet shown as tags.
- [ ] C.2 Events: import tournaments and one-off events; weekly training is kept as a recurring list (owner decision, 21 November 2026), not one page per session.
- [x] C.3 Pages created (21 November 2026) at /news, /news/<slug>, /events, /about and /policies, using the Wix text with source links. Content is kept source-accurate; the About page lists coaches as on the Wix site.
- [~] C.4 News and event archive pages are on the website, with training grouped by weekday and one-off events listed separately. Still to do: link the pages from the home page, and check the archive on a phone.

## Phase D: Redirects and cutover
- [ ] D.1 Build the redirect table from the manifest; each old address points straight to its final address.
- [ ] D.2 Test every redirect with a script before the switch; keep the Wix sitemap list as the checklist.
- [ ] D.3 Owner confirms the new site, and then the Wix subscription is ended.

## Owner decisions (21 November 2026)
- Approved: phases 1 (inventory), 2 (images and rights), and 3 (import into the website).
- Images: rights confirmed by the owner.
- Weekly training: kept as a recurring list, not as separate pages.
- Pages to create: News, Event archive, About, Policies, built from the Wix text.
- Phase 4 (redirects and cutover) explained to the owner; approval pending.

## Status (21 November 2026)
- Pages built and checked in a browser (no page errors, no sideways scrolling): News list, news post, Event archive, About, Policies.
- Open follow-ups: paragraph splitting in some posts; re-host images (B.2) before ending the Wix subscription; categories as tags; home page links; phase 4 redirects (D.1 to D.3), which need the owner's approval.

