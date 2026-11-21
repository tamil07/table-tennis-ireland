import { test } from "node:test";
import assert from "node:assert/strict";
import { buildCalendar, escapeText, fold, firstOccurrence, parseTimeRange } from "./calendar-ics.mjs";

test("text values are escaped per RFC 5545", () => {
  assert.equal(escapeText("Cork, Ireland; hall\\n"), "Cork\\, Ireland\; hall\\\\n");
  assert.equal(escapeText("a\nb"), "a\\nb");
});

test("long lines fold at 75 octets and unfold losslessly", () => {
  const long = "SUMMARY:" + "é".repeat(80);
  const folded = fold(long);
  for (const part of folded.split("\r\n")) assert.ok(Buffer.byteLength(part, "utf8") <= 75, part);
  assert.equal(folded.split("\r\n ").join(""), long);
});

test("weekly sessions start on the first matching weekday on or after the season start", () => {
  assert.equal(firstOccurrence("2026-09-01", "Monday"), "2026-09-07"); // 1 Sept 2026 is a Tuesday
  assert.equal(firstOccurrence("2026-09-01", "Sunday"), "2026-09-06");
});

test("time ranges parse with en dash or hyphen", () => {
  assert.deepEqual(parseTimeRange("20:15–22:15"), ["20:15", "22:15"]);
  assert.deepEqual(parseTimeRange("9:00-10:30"), ["09:00", "10:30"]);
  assert.throws(() => parseTimeRange("evening"));
});

const feed = buildCalendar({
  stamp: "20261121T120000Z",
  seasonStart: "2026-09-01",
  sessions: [{ id: "s2", title: "Wednesday training", day: "Wednesday", time: "20:15–22:15", venue: "Hall", audience: "All ages" }],
  events: [
    { id: "e1", title: "Tournament, Cork", startUtc: "2026-12-05T08:00:00Z", endUtc: "2026-12-05T16:00:00Z", venue: "Hall", address: null, description: "Bring ID; numbers", source: "https://example.org/e1", cancelled: false },
    { id: "e2", title: "Cancelled night", startUtc: "2026-12-09T18:00:00Z", endUtc: null, venue: null, address: null, description: null, source: null, cancelled: true },
  ],
});

test("feed is a valid calendar envelope with CRLF line endings", () => {
  assert.ok(feed.startsWith("BEGIN:VCALENDAR\r\n"));
  assert.ok(feed.endsWith("END:VCALENDAR\r\n"));
  assert.equal(feed.split("\n").length, feed.split("\r\n").length);
  assert.equal((feed.match(/BEGIN:VEVENT/g) || []).length, 3);
  assert.equal((feed.match(/END:VEVENT/g) || []).length, 3);
});

test("weekly timetable is a recurring Dublin-time event", () => {
  assert.match(feed, /DTSTART;TZID=Europe\/Dublin:20260902T201500/);
  assert.match(feed, /RRULE:FREQ=WEEKLY;BYDAY=WE/);
  assert.match(feed, /BEGIN:VTIMEZONE\r\nTZID:Europe\/Dublin/);
});

test("one-off events are UTC, escaped and cancellations are marked", () => {
  assert.match(feed, /DTSTART:20261205T080000Z/);
  assert.match(feed, /SUMMARY:Tournament\\, Cork/);
  assert.match(feed, /DESCRIPTION:Bring ID\; numbers/);
  assert.match(feed, /STATUS:CANCELLED/);
  assert.match(feed, /REFRESH-INTERVAL;VALUE=DURATION:PT12H/);
});

test("every UID is unique", () => {
  const uids = [...feed.matchAll(/^UID:(.*)\r\n/gm)].map((m) => m[1]);
  assert.equal(new Set(uids).size, uids.length);
});
