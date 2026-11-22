// Club timetable (decisions 22 November 2026). One editable set of weekly sessions plus one-date changes.
// Pure functions: the club command store applies these and reconciles dated sessions (see operations.ts).
// Times are wall-clock in Europe/Dublin ("HH:MM"); dates are YYYY-MM-DD.

export type WeeklyDefinition = {
  id: string;
  day: number; // 0 = Sunday … 6 = Saturday
  start: string;
  end: string;
  title: string;
  venue: string;
  audience: string;
  capacity: number;
  tables: number;
  from: string; // first date the definition applies
  until: string | null;
  active: boolean;
};

export type DateOverride = {
  id: string;
  date: string;
  action: "retime" | "cancel" | "extra";
  weeklyId: string | null; // retime and cancel refer to a weekly definition
  start: string | null;
  end: string | null;
  title: string | null;
  venue: string | null;
  reason: string;
  active: boolean;
};

export type Timetable = { weekly: WeeklyDefinition[]; overrides: DateOverride[] };

export type DatedSession = {
  id: string;
  date: string;
  title: string;
  venue: string;
  audience: string;
  capacity: number;
  tables: number;
  start: number; // epoch ms
  end: number;
  weeklyId: string | null;
  cancelledByOverride: boolean;
};

export const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const HALL = "James Kenneally Sports Hall, Hollyhill Ln, Gurranabraher, Cork";

/** The five weekly sessions confirmed by the club. Seeded into a club that has no timetable yet. */
export function defaultTimetable(): Timetable {
  const base = { venue: HALL, audience: "All ages & abilities", capacity: 12, tables: 6, from: "2026-09-01", until: null, active: true };
  return {
    weekly: [
      { ...base, id: "mon", day: 1, start: "18:00", end: "20:00", title: "Monday training" },
      { ...base, id: "wed", day: 3, start: "20:15", end: "22:15", title: "Wednesday training" },
      { ...base, id: "thu", day: 4, start: "17:30", end: "19:30", title: "Thursday training" },
      { ...base, id: "fri", day: 5, start: "18:00", end: "20:00", title: "Friday training" },
      { ...base, id: "sun", day: 0, start: "12:45", end: "15:30", title: "Sunday training" },
    ],
    overrides: [],
  };
}

export const isClock = (value: string) => /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
export const isIsoDate = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value + "T00:00:00Z"));

export function addDays(date: string, days: number): string {
  const d = new Date(`${date}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}
export const weekday = (date: string) => new Date(`${date}T12:00:00Z`).getUTCDay();

/** Dublin offset in minutes at an instant (0 in winter, 60 in summer). */
function dublinOffsetMinutes(time: number): number {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Dublin",
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(new Date(time));
  const get = (type: string) => Number(parts.find((p) => p.type === type)!.value);
  const asUtc = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"), get("second"));
  return Math.round((asUtc - time) / 60_000);
}

/** The instant of a Dublin wall-clock time on a date. */
export function dublinInstant(date: string, clock: string): number {
  const [y, m, d] = date.split("-").map(Number);
  const [h, mi] = clock.split(":").map(Number);
  const wall = Date.UTC(y, m - 1, d, h, mi);
  return wall - dublinOffsetMinutes(wall) * 60_000;
}

/** Dated sessions between two dates (inclusive), from the weekly definitions and one-date changes. */
export function generateSessions(timetable: Timetable, from: string, to: string): DatedSession[] {
  const out: DatedSession[] = [];
  for (let date = from; date <= to; date = addDays(date, 1)) {
    for (const w of timetable.weekly) {
      if (!w.active || w.day !== weekday(date) || date < w.from || (w.until && date > w.until)) continue;
      const change = timetable.overrides.find((o) => o.active && o.date === date && o.weeklyId === w.id);
      const retimed = change?.action === "retime";
      out.push({
        id: `tt-${w.id}-${date}`,
        date,
        title: w.title,
        venue: w.venue,
        audience: w.audience,
        capacity: w.capacity,
        tables: w.tables,
        start: dublinInstant(date, retimed ? change!.start! : w.start),
        end: dublinInstant(date, retimed ? change!.end! : w.end),
        weeklyId: w.id,
        cancelledByOverride: change?.action === "cancel",
      });
    }
    for (const o of timetable.overrides) {
      if (!o.active || o.action !== "extra" || o.date !== date) continue;
      out.push({
        id: `tt-extra-${o.id}`,
        date,
        title: o.title!,
        venue: o.venue!,
        audience: "All ages & abilities",
        capacity: 12,
        tables: 6,
        start: dublinInstant(date, o.start!),
        end: dublinInstant(date, o.end!),
        weeklyId: null,
        cancelledByOverride: false,
      });
    }
  }
  return out;
}

/** Plain-language summary of a weekly definition, for the change history. */
export function describeWeekly(w: WeeklyDefinition): string {
  return `${DAY_NAMES[w.day]} ${w.start}–${w.end}, ${w.title}`;
}
