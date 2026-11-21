// Writes the club calendar feed (iCalendar, RFC 5545) to apps/club-web/public/leeside-calendar.ics.
// Inputs: one-off events in apps/club-web/src/content/calendar.json and the weekly timetable in
// packages/domain. Run after editing either:
//   node --experimental-strip-types scripts/build-calendar.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { leesideSessions } from "../packages/domain/src/demo.ts";
import { buildCalendar } from "./calendar-ics.mjs";

const target = "apps/club-web/public/leeside-calendar.ics";

// seasonStart: first date of the weekly timetable in the feed. Change it when a new season starts.
const { seasonStart, events } = JSON.parse(readFileSync("apps/club-web/src/content/calendar.json", "utf8"));
const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
const text = buildCalendar({ events, sessions: leesideSessions, seasonStart, stamp });
writeFileSync(target, text, "utf8");
console.log(`Wrote ${events.length} one-off events and ${leesideSessions.length} weekly sessions to ${target}`);
