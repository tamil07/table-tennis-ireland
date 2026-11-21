# Tasks: Wix content migration

## Phase A: Inventory and dry run
- [x] A.1 Read the Wix sitemap index and its four child sitemaps; record counts (38 posts, 49 categories, 57 event pages, 4 pages).
- [x] A.2 Crawler written and run (21 November 2026): 38 posts, 57 event pages, 4 pages captured with title, date, author, text, images and source address. Scratch output; the approved content is in apps/club-web/src/content/wix-content.ts. with a pause between requests; save each page's title, date, author, text, images and category into the manifest.
- [ ] A.3 Cross-check the manifest with the RSS feed (20 items) and the posts sitemap.
- [~] A.4 Owner approved phases 1 to 3 in principle (21 November 2026). The manifest is still to be reviewed item by item: publish, archive, or leave out.

## Phase B: Images and rights
- [x] B.1 Owner confirmed the image rights (21 November 2026).
- [x] B.2 Images copied to the site (21 November 2026): first four images per post, resized to 1200 pixels, JPEG, each under 500 KB; 82 images, 15 MB, in apps/club-web/public/news/. Stored with the site, not in Supabase, so they don't use the database or Supabase storage limit.

## Phase C: Import into the website
- [x] C.1 News: 38 posts imported as dated news items, newest first, each with its source link (apps/club-web/src/Pages.tsx). Known issue: some longer posts run paragraphs together; fix the text splitting before the post pages are published. Categories are not yet shown as tags.
- [ ] C.2 Events: import tournaments and one-off events; weekly training is kept as a recurring list (owner decision, 21 November 2026), not one page per session.
- [x] C.3 Pages created (21 November 2026) at /news, /news/<slug>, /events, /about and /policies, using the Wix text with source links. Content is kept source-accurate; the About page lists coaches as on the Wix site.
- [~] C.4 News and event archive pages are on the website, with training grouped by weekday and one-off events listed separately. Still to do: link the pages from the home page, and check the archive on a phone.

## Phase D: Redirects and cutover
- [x] D.1 Redirect rules generated from the Wix sitemap: 197 rules in apps/club-web/public/_redirects (38 posts, 57 event pages, the blog, calendar, policies and home), covering both the /home/... and custom-domain forms. Each points straight to its final address.
- [ ] D.2 Test every redirect on the deployed site (the local preview does not run _redirects). Note: old wixsite.com addresses belong to Wix and cannot be redirected once the subscription ends; the redirects only work on a domain we control (see the research note below).
- [ ] D.3 Owner confirms the new site and the redirects, and then the Wix subscription is ended. Not started.

## Owner decisions (21 November 2026)
- Approved: phases 1 (inventory), 2 (images and rights), and 3 (import into the website).
- Images: rights confirmed by the owner.
- Weekly training: kept as a recurring list, not as separate pages.
- Pages to create: News, Event archive, About, Policies, built from the Wix text.
- Phase 4 (redirects and cutover) explained to the owner; approval pending.

## Status (21 November 2026)
- Pages built and checked in a browser (no page errors, no sideways scrolling): News list, news post, Event archive, About, Policies.
- Open follow-ups: paragraph splitting in some posts; re-host images (B.2) before ending the Wix subscription; categories as tags; home page links; phase 4 redirects (D.1 to D.3), which need the owner's approval.

## Research and decisions (21 November 2026)
- Wix redirects only work while the domain stays on Wix. Once the site leaves Wix, the wixsite.com addresses are gone, and only a domain we own can keep old links working. Purchasing the domain (task 14.16 and 22.4) is therefore needed for the redirects to matter.
- Cloudflare static assets accept a _redirects file (up to 2,000 static rules); 197 rules fit.
- Wix has no full export of posts or events. The migration reads the public pages, which keeps the text, dates, authors and images with each source address.
- Scale: 38 posts, 53 weekly training pages, 4 one-off events, 4 static pages. The import is small enough to run as a script and check by hand, so a heavier tool is not needed.
- Event one-off pages have no dates in the Wix data; they are listed without a date until the owner adds them.
- Paragraph extraction was corrected after the first run; 21 posts now have more than 200 characters of body text.

