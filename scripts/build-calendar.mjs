// Writes the club calendar as an iCalendar (RFC 5545) feed from apps/club-web/src/content/calendar.json.
// Run after editing calendar.json: node scripts/build-calendar.mjs
import { readFileSync, writeFileSync } from "node:fs";

const source = "apps/club-web/src/content/calendar.json";
const target = "apps/club-web/public/leeside-calendar.ics";

const compact = (utc) => utc.replace(/[-:]/g, ""); // 2025-09-01T17:00:00Z -> 20250901T170000Z

// RFC 5545 section 3.3.11: escape backslash, semicolon, comma and newlines in text values.
const escapeText = (value) =>
  String(value)
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");

// RFC 5545 section 3.1: lines longer than 75 octets are folded with CRLF + space.
function fold(line) {
  const bytes = Buffer.from(line, "utf8");
  if (bytes.length <= 75) return line;
  const parts = [];
  let rest = line;
  let limit = 75;
  while (Buffer.byteLength(rest, "utf8") > limit) {
    let cut = rest.length;
    while (Buffer.byteLength(rest.slice(0, cut), "utf8") > limit) cut--;
    parts.push(rest.slice(0, cut));
    rest = rest.slice(cut);
    limit = 74; // continuation lines start with a space, leaving 74 octets
  }
  parts.push(rest);
  return parts.join("\r\n ");
}

const events = JSON.parse(readFileSync(source, "utf8"));
const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");

const lines = [
  "BEGIN:VCALENDAR",
  "VERSION:2.0",
  "PRODID:-//Leeside Table Tennis Club//Club calendar//EN",
  "CALSCALE:GREGORIAN",
  "METHOD:PUBLISH",
  "X-WR-CALNAME:Leeside Table Tennis Club",
  "X-WR-TIMEZONE:Europe/Dublin",
];

for (const e of events) {
  lines.push("BEGIN:VEVENT");
  lines.push(`UID:${escapeText(e.id)}@leeside-table-tennis`);
  lines.push(`DTSTAMP:${stamp}`);
  lines.push(`DTSTART:${compact(e.startUtc)}`);
  if (e.endUtc) lines.push(`DTEND:${compact(e.endUtc)}`);
  lines.push(`SUMMARY:${escapeText(e.title)}`);
  const where = [e.venue, e.address].filter(Boolean).join(", ");
  if (where) lines.push(`LOCATION:${escapeText(where)}`);
  if (e.description) lines.push(`DESCRIPTION:${escapeText(e.description)}`);
  lines.push(`STATUS:${e.cancelled ? "CANCELLED" : "CONFIRMED"}`);
  if (e.source) lines.push(`URL:${e.source}`);
  lines.push("END:VEVENT");
}
lines.push("END:VCALENDAR");

writeFileSync(target, lines.map(fold).join("\r\n") + "\r\n", "utf8");
console.log(`Wrote ${events.length} events to ${target}`);
