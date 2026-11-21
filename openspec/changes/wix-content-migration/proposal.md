## Why

The club's news, events and pages (over several years) live on the Wix site. Members and visitors need to find that history on the new website, and old Wix links need to keep working.

## Inventory (from the Wix sitemap, 21 November 2026)

- Blog posts: 38 (`/home/post/…`), with 49 blog categories.
- Event pages: 57 (`/home/event-details/…`). Most are weekly training sessions from September 2025 onward; a few are tournaments and events, such as "Munster ranking tournament 1 of 4" and "2025 national junior classifications".
- Static pages: 4 (home, blog, two general pages: calendar and policies).
- The blog's RSS feed holds only the 20 most recent posts.
- Post and event pages carry their text in the HTML, and event pages carry structured dates.

## What Changes

- Build an import that reads the Wix sitemap, saves each page's text, date, author, images and category, and writes a source manifest.
- Import posts as dated news, events as dated events, and recurring training as one archive per term rather than 57 separate pages.
- Re-host images in file storage, within the limits in `website-announcements-and-maps` and the media limits (task 20).
- Map every old Wix address to its new address with a permanent redirect, and keep the Wix sitemap list for checking.
- Show past events in an archive, never as upcoming.

## Impact

- Website: news list and post pages, event archive, page routes that replace the one-page anchors, and redirects.
- Backend: an import step that writes news and event records, with an audit trail.
- Operations: the owner approves the content list and the image rights before publication; Wix stays on until the redirects are checked.
