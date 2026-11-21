// Pure iCalendar (RFC 5545) builder for the club calendar. No file access here; see build-calendar.mjs.

const DAY_CODES = { Monday: "MO", Tuesday: "TU", Wednesday: "WE", Thursday: "TH", Friday: "FR", Saturday: "SA", Sunday: "SU" };
const DAY_INDEX = { Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6 };
const UID_DOMAIN = "leeside-table-tennis";

/** RFC 5545 §3.3.11: escape backslash, semicolon, comma and newline in text values. */
export function escapeText(value) {
  return String(value).replace(/\\/g, "\\\\").replace(/;/g, "\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
}

/** RFC 5545 §3.1: fold lines longer than 75 octets with CRLF and a space. */
export function fold(line) {
  if (Buffer.byteLength(line, "utf8") <= 75) return line;
  const parts = [];
  let rest = line;
  let limit = 75;
  while (Buffer.byteLength(rest, "utf8") > limit) {
    let cut = rest.length;
    while (Buffer.byteLength(rest.slice(0, cut), "utf8") > limit) cut--;
    parts.push(rest.slice(0, cut));
    rest = rest.slice(cut);
    limit = 74; // continuation lines begin with a space
  }
  parts.push(rest);
  return parts.join("\r\n ");
}

/** "2025-09-11T17:30" (Dublin wall clock) -> "20250911T173000" */
export const compactLocal = (wall) => wall.replace(/[-:]/g, "") + "00";
/** "2025-09-11T16:30:00Z" -> "20250911T163000Z" */
export const compactUtc = (utc) => utc.replace(/[-:]/g, "");

/** Parses "18:00–20:00" (en dash or hyphen) into [start, end] as HH:MM. */
export function parseTimeRange(range) {
  const m = /^(\d{1,2}:\d{2})\s*[–-]\s*(\d{1,2}:\d{2})$/.exec(range);
  if (!m) throw new Error(`Unrecognised session time: ${range}`);
  return [m[1].padStart(5, "0"), m[2].padStart(5, "0")];
}

/** First date on or after `from` (YYYY-MM-DD) that falls on the named weekday. */
export function firstOccurrence(from, weekday) {
  const d = new Date(`${from}T12:00:00Z`);
  while (d.getUTCDay() !== DAY_INDEX[weekday]) d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

// Europe/Dublin rules (EU summer time: last Sunday of March to last Sunday of October).
const DUBLIN_TZ = [
  "BEGIN:VTIMEZONE",
  "TZID:Europe/Dublin",
  "BEGIN:DAYLIGHT",
  "TZOFFSETFROM:+0000",
  "TZOFFSETTO:+0100",
  "TZNAME:IST",
  "DTSTART:19700329T010000",
  "RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU",
  "END:DAYLIGHT",
  "BEGIN:STANDARD",
  "TZOFFSETFROM:+0100",
  "TZOFFSETTO:+0000",
  "TZNAME:GMT",
  "DTSTART:19701025T020000",
  "RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU",
  "END:STANDARD",
  "END:VTIMEZONE",
];

/**
 * Builds the calendar.
 * @param {object} input
 * @param {Array} input.events one-off events: { id, title, startUtc, endUtc, venue, address, description, source, cancelled }
 * @param {Array} input.sessions weekly timetable: { id, title, day, time, venue, audience }
 * @param {string} input.seasonStart first date of the weekly timetable (YYYY-MM-DD)
 * @param {string} input.stamp DTSTAMP value, e.g. 20261121T120000Z
 */
export function buildCalendar({ events, sessions, seasonStart, stamp }) {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Leeside Table Tennis Club//Club calendar//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:Leeside Table Tennis Club",
    "X-WR-TIMEZONE:Europe/Dublin",
    "REFRESH-INTERVAL;VALUE=DURATION:PT12H", // Outlook, Apple and Google read this to refresh subscriptions
    "X-PUBLISHED-TTL:PT12H",
    ...DUBLIN_TZ,
  ];

  for (const s of sessions) {
    const [start, end] = parseTimeRange(s.time);
    const date = compactLocal(`${firstOccurrence(seasonStart, s.day)}T${start}`);
    const endDate = compactLocal(`${firstOccurrence(seasonStart, s.day)}T${end}`);
    lines.push("BEGIN:VEVENT");
    lines.push(`UID:timetable-${escapeText(s.id)}@${UID_DOMAIN}`);
    lines.push(`DTSTAMP:${stamp}`);
    lines.push(`DTSTART;TZID=Europe/Dublin:${date}`);
    lines.push(`DTEND;TZID=Europe/Dublin:${endDate}`);
    lines.push(`RRULE:FREQ=WEEKLY;BYDAY=${DAY_CODES[s.day]}`);
    lines.push(`SUMMARY:${escapeText(s.title)}`);
    if (s.venue) lines.push(`LOCATION:${escapeText(s.venue)}`);
    if (s.audience) lines.push(`DESCRIPTION:${escapeText(s.audience)}`);
    lines.push("STATUS:CONFIRMED");
    lines.push("TRANSP:OPAQUE");
    lines.push("END:VEVENT");
  }

  for (const e of events) {
    lines.push("BEGIN:VEVENT");
    lines.push(`UID:${escapeText(e.id)}@${UID_DOMAIN}`);
    lines.push(`DTSTAMP:${stamp}`);
    lines.push(`DTSTART:${compactUtc(e.startUtc)}`);
    if (e.endUtc) lines.push(`DTEND:${compactUtc(e.endUtc)}`);
    lines.push(`SUMMARY:${escapeText(e.title)}`);
    const where = [e.venue, e.address].filter(Boolean).join(", ");
    if (where) lines.push(`LOCATION:${escapeText(where)}`);
    if (e.description) lines.push(`DESCRIPTION:${escapeText(e.description)}`);
    lines.push(`STATUS:${e.cancelled ? "CANCELLED" : "CONFIRMED"}`);
    if (e.source) lines.push(`URL:${e.source}`);
    lines.push("END:VEVENT");
  }

  lines.push("END:VCALENDAR");
  return lines.map(fold).join("\r\n") + "\r\n";
}
