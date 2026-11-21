## Method and decisions

**Source.** The Wix sitemap index (`/home/sitemap.xml`) lists four child sitemaps: blog posts, blog categories, event pages and pages. Crawl those URLs, one at a time, with a short pause between requests. Use the blog RSS feed as a cross-check only, since it holds 20 items.

**Why not an export.** Wix does not provide a full export of blog posts or events to another platform, so the import reads the public pages. The owner's confirmed reuse permission (1 November 2026) covers the public content.

**Dry run first.** Each run writes a manifest: source URL, date, title, destination, publication status, images found, and any item that could not be read. Nothing is published until the owner approves the manifest.

**Events.** Weekly training pages are grouped into one archive entry per term, with the list of dates. Tournaments and one-off events keep their own entry. Past events are shown only in the archive.

**Images.** Images are downloaded from Wix's media host, compressed to the limits in task 20, and stored in file storage. Each image's source and attribution are kept in the manifest. Images without a clear reuse right are left out and the post is published without them.

**Redirects.** `/home/post/<slug>` maps to the new news item; `/home/event-details/<slug>` maps to the event or archive entry; `/home/general-1` maps to the sessions section; `/home/general-5` maps to the policies page; `/home/about` maps to the about section. Each old address redirects in one step to its final address, not through another redirect.

**Keep Wix until the switch.** The Wix subscription stays active until the redirects are checked on the new site.

**Limits.** Blog categories (49) become tags only if they are used on at least two posts. The RSS feed is not a source of truth for older posts.
