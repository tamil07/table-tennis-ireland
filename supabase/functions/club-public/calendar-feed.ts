// iCalendar (RFC 5545) feed for the live club calendar. Pure functions: no I/O, so it is unit-tested in calendar-feed.test.ts.
// Design: every future session is its own dated event, so a cancelled session is simply left out and a removed
// event disappears from subscribed calendars on their next refresh. Closures are all-day events, so a closure
// from 23 December to 5 January shows as one block.

export type FeedSession = { id: string; title: string; start: number; end: number };
export type FeedClosure = { id: string; start: number; end: number; reason: string; active: boolean };
export type FeedEvent = { id: string; title: string; date: string; status: string };

/** RFC 5545 §3.3.11 text escaping. */
export function escapeText(value: string): string {
  return value
    .replaceAll("\\", "\\\\")
    .replaceAll("\r", "")
    .replaceAll("\n", "\\n")
    .replaceAll(",", "\\,")
    .replaceAll(";", "\;");
}

/** UTC timestamp for DTSTAMP and date-time values: 20261121T120000Z. */
export function utcStamp(time: number): string {
  return new Date(time).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

/** Calendar date (YYYY-MM-DD) in Europe/Dublin for an instant. */
export function dublinDay(time: number): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Dublin",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(time));
  const pick = (type: string) => parts.find((p) => p.type === type)!.value;
  return `${pick("year")}-${pick("month")}-${pick("day")}`;
}

/** Day after a YYYY-MM-DD date, as YYYY-MM-DD. */
export function nextDay(day: string): string {
  const d = new Date(`${day}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

/**
 * All-day closure: the first closed day is the Dublin date of `start`; the last closed day is the Dublin date of
 * `end - 1 ms`, so an end at midnight (exclusive) and an end at 23:59 both work. DTEND is exclusive per RFC 5545.
 */
export function closureDates(closure: FeedClosure): { first: string; endExclusive: string } {
  const first = dublinDay(closure.start);
  const lastClosed = dublinDay(closure.end - 1);
  return { first, endExclusive: nextDay(lastClosed) };
}

const compactDay = (day: string) => day.replaceAll("-", "");

export function buildFeed(input: {
  club: string;
  name: string;
  now: number;
  sessions: FeedSession[];
  closures: FeedClosure[];
  events: FeedEvent[];
}): string {
  const stamp = utcStamp(input.now);
  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//TT Clubs Ireland//Club calendar//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${escapeText(input.name)}`,
    "X-WR-TIMEZONE:Europe/Dublin",
    "REFRESH-INTERVAL;VALUE=DURATION:PT1H", // suggested polling interval; clients may poll less often
    "X-PUBLISHED-TTL:PT1H",
  ];

  for (const s of input.sessions.filter((x) => x.end > input.now)) {
    lines.push(
      "BEGIN:VEVENT",
      `UID:session-${escapeText(s.id)}@${input.club}`,
      `DTSTAMP:${stamp}`,
      `DTSTART:${utcStamp(s.start)}`,
      `DTEND:${utcStamp(s.end)}`,
      `SUMMARY:${escapeText(s.title)}`,
      "STATUS:CONFIRMED",
      "TRANSP:OPAQUE",
      "END:VEVENT",
    );
  }

  for (const c of input.closures.filter((x) => x.active && x.end > input.now)) {
    const { first, endExclusive } = closureDates(c);
    lines.push(
      "BEGIN:VEVENT",
      `UID:closure-${escapeText(c.id)}@${input.club}`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${compactDay(first)}`,
      `DTEND;VALUE=DATE:${compactDay(endExclusive)}`,
      `SUMMARY:${escapeText(`Closed: ${c.reason}`)}`,
      "STATUS:CONFIRMED",
      "TRANSP:TRANSPARENT",
      "END:VEVENT",
    );
  }

  for (const e of input.events.filter((x) =>
    ["published", "in_progress", "completed", "cancelled"].includes(x.status)
  )) {
    lines.push(
      "BEGIN:VEVENT",
      `UID:event-${escapeText(e.id)}@${input.club}`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${compactDay(e.date)}`,
      `SUMMARY:${escapeText(e.title)}`,
      `STATUS:${e.status === "cancelled" ? "CANCELLED" : "CONFIRMED"}`,
      "END:VEVENT",
    );
  }

  lines.push("END:VCALENDAR");
  return lines.join("\r\n") + "\r\n";
}
