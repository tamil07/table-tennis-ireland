import { localDay, may } from "./operations.ts";
import type { ClubState } from "./operations.ts";

// Presentation helpers only: they read already-permitted state and never
// authorise, validate or mutate anything.

const days = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
export type WeeklySlot = { day: string; time: string; title: string };
export type NextSession<T extends WeeklySlot = WeeklySlot> = {
  session: T;
  daysAhead: number;
  inProgress: boolean;
};

function dublinClock(now: number) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Dublin",
    weekday: "long",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const value = (type: string) => parts.find((p) => p.type === type)?.value;
  return {
    day: days.indexOf(value("weekday") ?? ""),
    minutes: Number(value("hour")) * 60 + Number(value("minute")),
  };
}
function range(time: string) {
  const match = /^(\d{1,2}):(\d{2})\s*[–-]\s*(\d{1,2}):(\d{2})$/.exec(time);
  if (!match) return null;
  return [
    Number(match[1]) * 60 + Number(match[2]),
    Number(match[3]) * 60 + Number(match[4]),
  ] as const;
}
/** Next (or current) weekly slot in Europe/Dublin; null if nothing parses. */
export function nextWeeklySession<T extends WeeklySlot>(
  sessions: readonly T[],
  now: number,
): NextSession<T> | null {
  const clock = dublinClock(now);
  if (clock.day < 0) return null;
  let best: (NextSession<T> & { order: number }) | null = null;
  for (const session of sessions) {
    const slot = range(session.time);
    const day = days.indexOf(session.day);
    if (!slot || day < 0 || slot[1] <= slot[0]) continue;
    for (let ahead = 0; ahead <= 7; ahead++) {
      if ((clock.day + ahead) % 7 !== day) continue;
      if (ahead === 0 && slot[1] <= clock.minutes) continue;
      const inProgress = ahead === 0 && slot[0] <= clock.minutes;
      const order = ahead * 1440 + (inProgress ? 0 : slot[0] - clock.minutes);
      const candidate = { session, daysAhead: ahead, inProgress, order };
      if (!best || order < best.order) best = candidate;
      break;
    }
  }
  return best
    ? {
        session: best.session,
        daysAhead: best.daysAhead,
        inProgress: best.inProgress,
      }
    : null;
}

export type OverviewItem = {
  key: string;
  label: string;
  value: number;
  detail: string;
  /** Workspace tab that handles this item. */
  tab: string;
};
export type Overview = {
  items: OverviewItem[];
  setup: { key: string; text: string; tab: string }[];
};
const plusDays = (day: string, n: number) =>
  new Date(Date.parse(day) + n * 86400000).toISOString().slice(0, 10);

/** Counts shown on the management landing tab; each is gated by permission. */
export function clubOverview(
  state: ClubState,
  actor: string,
  now: number,
): Overview {
  const today = localDay(now);
  const horizon = plusDays(today, 14);
  const items: OverviewItem[] = [];
  const upcoming = state.sessions.filter(
    (s) => !s.cancelled && s.end > now && localDay(s.start) <= plusDays(today, 7),
  );
  items.push({
    key: "sessions",
    label: "Sessions in the next 7 days",
    value: upcoming.length,
    detail: upcoming.length
      ? `Next: ${upcoming[0].label}`
      : "No sessions scheduled",
    tab: "sessions",
  });
  if (may(state, actor, "booking")) {
    const pending = state.board.requests.filter(
      (r) => r.status === "pending" && r.holdUntil > now,
    ).length;
    items.push({
      key: "requests",
      label: "Table requests awaiting approval",
      value: pending,
      detail: pending ? "Review and approve or reject" : "Nothing waiting",
      tab: "booking",
    });
  }
  if (may(state, actor, "membership")) {
    const expiring = state.memberships.filter(
      (m) => m.status === "active" && m.end >= today && m.end <= horizon,
    ).length;
    items.push({
      key: "expiring",
      label: "Memberships ending within 14 days",
      value: expiring,
      detail: expiring ? "Consider renewals" : "None due",
      tab: "people",
    });
    items.push({
      key: "applicants",
      label: "Applicants awaiting a decision",
      value: state.people.filter((p) => p.status === "pending").length,
      detail: "Players who applied online",
      tab: "people",
    });
  }
  if (may(state, actor, "attendance")) {
    const present = state.attendance.filter(
      (a) => localDay(Date.parse(a.at)) === today,
    ).length;
    items.push({
      key: "attendance",
      label: "Attendance recorded today",
      value: present,
      detail: "Independent of table bookings",
      tab: "attendance",
    });
  }
  if (may(state, actor, "access")) {
    const open = state.work.filter((w) => w.state !== "resolved").length;
    items.push({
      key: "work",
      label: "Open team work items",
      value: open,
      detail: open ? "Claim or resolve alerts" : "All clear",
      tab: "management",
    });
  }
  const setup: Overview["setup"] = [];
  if (may(state, actor, "membership") && !state.plans.length)
    setup.push({
      key: "plans",
      text: "Add your first membership type.",
      tab: "people",
    });
  if (may(state, actor, "events") && !state.sessions.length)
    setup.push({
      key: "sessions",
      text: "Create the first session.",
      tab: "sessions",
    });
  if (
    may(state, actor, "privacy") &&
    !(state.settings.privacy && state.settings.safeguarding)
  )
    setup.push({
      key: "policy",
      text: "Add privacy and safeguarding contacts before inviting players.",
      tab: "management",
    });
  return { items, setup };
}
