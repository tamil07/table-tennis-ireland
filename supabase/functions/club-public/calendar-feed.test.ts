import { buildFeed, closureDates, dublinDay, escapeText } from "./calendar-feed.ts";
function assert(value: unknown, message: string) { if (!value) throw new Error(message); }

const club = "00000000-0000-4000-8000-000000000001";
const at = (iso: string) => Date.parse(iso);

Deno.test("Dublin calendar day follows summer and winter time", () => {
  assert(dublinDay(at("2026-12-23T00:30:00Z")) === "2026-12-23", "winter day");
  assert(dublinDay(at("2026-06-30T23:30:00Z")) === "2026-07-01", "summer time crosses midnight in Dublin");
});

Deno.test("Christmas closure 23 December to 5 January is one all-day block ending exclusively on 6 January", () => {
  // Stored as local midnight 23 Dec through midnight 6 Jan (exclusive end)
  const closure = { id: "xmas", start: at("2026-12-23T00:00:00Z"), end: at("2027-01-06T00:00:00Z"), reason: "Christmas closure", active: true };
  assert(JSON.stringify(closureDates(closure)) === JSON.stringify({ first: "2026-12-23", endExclusive: "2027-01-06" }), "closure dates");
});

Deno.test("closure that ends at 23:59 covers its last day", () => {
  const closure = { id: "c", start: at("2026-12-23T00:00:00Z"), end: at("2027-01-05T23:59:00Z"), reason: "x", active: true };
  assert(closureDates(closure).endExclusive === "2027-01-06", "last day included");
});

Deno.test("feed: sessions are dated events, cancelled and past are absent, closures are all-day", () => {
  const now = at("2026-11-21T12:00:00Z");
  const feed = buildFeed({
    club,
    name: "Leeside Table Tennis Club",
    now,
    sessions: [
      { id: "mon-1", title: "Monday training", start: at("2026-11-23T18:00:00Z"), end: at("2026-11-23T20:00:00Z") },
      { id: "past", title: "Old", start: at("2026-11-01T18:00:00Z"), end: at("2026-11-01T20:00:00Z") },
    ],
    closures: [{ id: "xmas", start: at("2026-12-23T00:00:00Z"), end: at("2027-01-06T00:00:00Z"), reason: "Christmas closure", active: true }],
    events: [{ id: "tour", title: "Open, tournament", date: "2026-12-05", status: "published" }],
  });
  assert(feed.startsWith("BEGIN:VCALENDAR\r\n") && feed.endsWith("END:VCALENDAR\r\n"), "envelope");
  assert(feed.includes("REFRESH-INTERVAL;VALUE=DURATION:PT1H") && feed.includes("X-PUBLISHED-TTL:PT1H"), "refresh hints");
  assert(feed.includes("UID:session-mon-1@" + club) && feed.includes("DTSTART:20261123T180000Z"), "dated session");
  assert(!feed.includes("session-past"), "past session excluded");
  assert(feed.includes("DTSTART;VALUE=DATE:20261223") && feed.includes("DTEND;VALUE=DATE:20270106"), "closure all-day");
  assert(feed.includes("SUMMARY:Closed: Christmas closure"), "closure label");
  assert(feed.includes("SUMMARY:Open\\, tournament"), "escaped event title");
  const uids = [...feed.matchAll(/^UID:(.*)\r\n/gm)].map((m) => m[1]);
  assert(new Set(uids).size === uids.length, "unique UIDs");
});

Deno.test("cancelled sessions and inactive or ended closures are left out", () => {
  const now = at("2026-11-21T12:00:00Z");
  const feed = buildFeed({
    club,
    name: "x",
    now,
    sessions: [],
    closures: [
      { id: "off", start: at("2026-12-23T00:00:00Z"), end: at("2027-01-06T00:00:00Z"), reason: "Off", active: false },
      { id: "ended", start: at("2026-10-01T00:00:00Z"), end: at("2026-10-06T00:00:00Z"), reason: "Ended", active: true },
    ],
    events: [{ id: "gone", title: "Hidden", date: "2026-12-05", status: "draft" }],
  });
  assert(!feed.includes("VEVENT"), "nothing should be published");
});

Deno.test("text escaping", () => {
  assert(escapeText("a,b;c\\d\ne") === "a\\,b\;c\\\\d\\ne", "escape");
});
