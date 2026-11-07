// Shared application rules: used by the browser's synthetic adapter and the server.
// Only the server supplies the authenticated principal and commits authoritative state.
import { bookingUpdate, occupiesPlace } from "./session-booking.ts";
import type {
  BookingBoard,
  PracticeSession,
  TableUse,
} from "./session-booking.ts";

export const permissions = [
  "access",
  "membership",
  "booking",
  "attendance",
  "events",
  "coach",
  "content",
  "communications",
  "privacy",
] as const;
export type Permission = (typeof permissions)[number];
export type Person = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  mobile: string;
  junior: boolean;
  guardians: string[];
  status: "pending" | "player" | "guest" | "left" | "subscriber";
  marketing: boolean;
  leftOn?: string;
  consentAt?: string;
  consentBy?: string;
};
export type Plan = {
  id: string;
  name: string;
  months: number;
  price: number;
  entitlement: string;
  active: boolean;
};
export type Membership = {
  id: string;
  player: string;
  plan: string;
  start: string;
  end: string;
  status: "active" | "trial" | "cancelled";
  payment: "unpaid" | "partial" | "paid" | "waived";
  amount: number;
  receivedOn: string;
  reference: string;
  snapshot: Plan | null;
};
export type ClubSession = PracticeSession & {
  capacity: number;
  cancelled: boolean;
  tables: number;
};
export type AttendanceRecord = {
  id: string;
  session: string;
  player: string;
  at: string;
  source: "app" | "manual" | "venue_qr";
  membership: string;
  corrected: boolean;
  reason?: string;
};
export type MatchStatus =
  | "draft"
  | "awaiting_review"
  | "changes_requested"
  | "confirmed"
  | "auto_approved"
  | "reported"
  | "incomplete"
  | "bye";
export type ClubMatch = {
  id: string;
  event: string;
  session: string;
  sides: string[][];
  bestOf: number;
  games: number[][];
  aggregate: number[] | null;
  author: string;
  status: MatchStatus;
  submitted: number;
  deadline: number;
  reviewEligible: string[];
  reason: string;
  table: string;
  round: number;
  next: string;
  nextSlot: number;
  playedOn: string;
  draftEvent?: string;
};
export type Competition = {
  id: string;
  name: string;
  date: string;
  session: string;
  external: boolean;
  format: "round_robin" | "single_elimination";
  teams: string[][];
  delegates: string[];
  state: "draft" | "published" | "in_progress" | "completed" | "cancelled";
  bestOf: number;
  winPoints: number;
  lossPoints: number;
  source: string;
  tieBreaks?: string[];
};
export type Reflection = {
  id: string;
  match: string;
  player: string;
  good: string[];
  improve: string[];
  note: string;
  updatedBy: string;
};
export type Notice = {
  id: string;
  to: string;
  kind: string;
  subject: string;
  entity: string;
  created: string;
  email: "pending" | "sending" | "sent" | "suppressed" | "failed";
  attempts: number;
  key: string;
  category?: Permission;
  membershipEnd?: string;
  error?: string;
  leaseUntil?: number;
  firstAttempt?: number;
};
export type Work = {
  id: string;
  title: string;
  player: string;
  state: "open" | "claimed" | "resolved";
  assignee: string;
  comments: string[];
  permission?: Permission;
};
export type Assessment = {
  id: string;
  player: string;
  strengths: string;
  improvements: string;
  goals: string;
  family: string;
  coach: string;
  published: boolean;
};
export interface ClubState {
  schema: 1;
  club: string;
  name: string;
  owner: string;
  version: number;
  people: Person[];
  grants: Record<string, Permission[]>;
  plans: Plan[];
  memberships: Membership[];
  payments: {
    id: string;
    membership: string;
    amount: number;
    date: string;
    method: string;
    reference: string;
    recordedBy: string;
  }[];
  sessions: ClubSession[];
  board: BookingBoard;
  attendance: AttendanceRecord[];
  absences: { session: string; player: string }[];
  events: Competition[];
  matches: ClubMatch[];
  reflections: Reflection[];
  notes: { id: string; player: string; body: string; author: string }[];
  assessments: Assessment[];
  notices: Notice[];
  work: Work[];
  pages: {
    id: string;
    title: string;
    body: string;
    kind: string;
    published: boolean;
    event: string;
  }[];
  settings: {
    trialMonths: number;
    holdMinutes: number;
    cancelHours: number;
    reminders: number[];
    privacy: string;
    safeguarding: string;
    policy: string;
    dailyDigest: boolean;
    digestTime?: string;
    retentionApproved?: boolean;
  };
  tags: { id: string; label: string; active: boolean }[];
  audit: {
    id: string;
    actor: string;
    action: string;
    at: string;
    reason?: string;
    changes: Record<string, unknown>;
    acknowledgementSelected?: boolean;
  }[];
  processed: string[];
  challenges: { hash: string; session: string; expires: number }[];
  closures: {
    id: string;
    start: number;
    end: number;
    reason: string;
    active: boolean;
  }[];
  eventDrafts: {
    id: string;
    author: string;
    name: string;
    date: string;
    source: string;
    linkedEvent: string;
  }[];
  website?: string;
}
export type Principal = {
  id: string;
  email: string;
  verified: boolean;
  emailVerified?: boolean;
  name?: string;
  system?: boolean;
};
export type ClubCommand = {
  id: string;
  type: string;
  data: Record<string, unknown>;
  expectedVersion?: number;
};
const defaultTags = [
  "forehand",
  "backhand",
  "serving",
  "serve receive",
  "chopping",
  "blocking",
  "footwork",
  "spin reading",
  "placement",
  "tactics",
];
export function emptyClub(
  club: string,
  name: string,
  owner: string,
): ClubState {
  return {
    schema: 1,
    club,
    name,
    owner,
    version: 0,
    people: [],
    grants: {},
    plans: [],
    memberships: [],
    payments: [],
    sessions: [],
    board: { tables: {}, requests: [] },
    attendance: [],
    absences: [],
    events: [],
    matches: [],
    reflections: [],
    notes: [],
    assessments: [],
    notices: [],
    work: [],
    pages: [],
    settings: {
      trialMonths: 1,
      holdMinutes: 30,
      cancelHours: 2,
      reminders: [],
      privacy: "",
      safeguarding: "",
      policy: "",
      dailyDigest: false,
    },
    tags: defaultTags.map((id) => ({ id, label: id, active: true })),
    audit: [],
    processed: [],
    challenges: [],
    closures: [],
    eventDrafts: [],
  };
}
export function may(state: ClubState, actor: string, permission: Permission) {
  return (
    actor === state.owner || Boolean(state.grants[actor]?.includes(permission))
  );
}
export function represents(state: ClubState, actor: string, player: string) {
  return (
    actor === player ||
    Boolean(
      state.people.find((p) => p.id === player)?.guardians.includes(actor),
    )
  );
}
export function localDay(now: number) {
  const parts = new Intl.DateTimeFormat("en", {
    timeZone: "Europe/Dublin",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const value = (type: string) => parts.find((p) => p.type === type)!.value;
  return `${value("year")}-${value("month")}-${value("day")}`;
}
export function addCalendarMonths(day: string, months: number) {
  const [y, m, d] = day.split("-").map(Number);
  const end = new Date(Date.UTC(y, m - 1 + months + 1, 0)).getUTCDate();
  return new Date(Date.UTC(y, m - 1 + months, Math.min(d, end)))
    .toISOString()
    .slice(0, 10);
}
export function membershipAt(
  s: ClubState,
  player: string,
  day: string,
): string {
  const records = s.memberships.filter(
    (m) => m.player === player && m.status !== "cancelled",
  );
  if (
    records.some((m) => m.status === "active" && m.start <= day && m.end >= day)
  )
    return "active";
  if (
    records.some((m) => m.status === "trial" && m.start <= day && m.end >= day)
  )
    return "trial";
  return records.some((m) => m.end < day) ? "expired" : "none";
}
export function scoreResult(
  match: Pick<ClubMatch, "games" | "aggregate" | "bestOf">,
) {
  const needed = Math.ceil(match.bestOf / 2);
  let wins = [0, 0];
  let points = [0, 0];
  for (const game of match.games) {
    const [a, b] = game;
    if (
      game.length !== 2 ||
      !Number.isInteger(a) ||
      !Number.isInteger(b) ||
      Math.min(a, b) < 0 ||
      Math.max(a, b) > 200 ||
      wins.includes(needed) ||
      Math.max(a, b) < 11 ||
      Math.abs(a - b) < 2 ||
      (Math.max(a, b) > 11 && Math.abs(a - b) !== 2)
    )
      throw new Error("Invalid game score or games after the match was won.");
    wins[a > b ? 0 : 1]++;
    points[0] += a;
    points[1] += b;
  }
  if (match.aggregate) {
    if (
      match.aggregate.length !== 2 ||
      match.aggregate.some((x) => !Number.isInteger(x) || x < 0) ||
      Math.max(...match.aggregate) !== needed ||
      Math.min(...match.aggregate) >= needed ||
      (match.games.length > 0 && match.aggregate.some((x, i) => x !== wins[i]))
    )
      throw new Error(
        "Aggregate score is inconsistent with the match format/games.",
      );
    wins = match.aggregate;
  }
  if (!wins.includes(needed))
    throw new Error(
      "A completed match must have a winner. Mark unfinished games incomplete.",
    );
  return { wins, points, winner: wins[0] > wins[1] ? 0 : 1 };
}
function requireValue(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}
function text(data: Record<string, unknown>, key: string, max = 2000) {
  const v = data[key];
  requireValue(
    typeof v === "string" && v.trim().length <= max,
    `Invalid ${key}.`,
  );
  return v.trim();
}
function nonempty(data: Record<string, unknown>, key: string, max = 120) {
  const v = text(data, key, max);
  requireValue(v.length > 0, `${key} is required.`);
  return v;
}
function number(
  data: Record<string, unknown>,
  key: string,
  min: number,
  max: number,
) {
  const v = Number(data[key]);
  requireValue(Number.isInteger(v) && v >= min && v <= max, `Invalid ${key}.`);
  return v;
}
function list(data: Record<string, unknown>, key: string) {
  requireValue(
    Array.isArray(data[key]) &&
      (data[key] as unknown[]).every((x) => typeof x === "string") &&
      (data[key] as string[]).length <= 200,
    `Invalid ${key}.`,
  );
  return [...new Set(data[key] as string[])];
}
function date(data: Record<string, unknown>, key: string) {
  const v = text(data, key, 10);
  requireValue(
    /^\d{4}-\d{2}-\d{2}$/.test(v) &&
      !isNaN(Date.parse(v)) &&
      new Date(v).toISOString().slice(0, 10) === v,
    `Invalid ${key}.`,
  );
  return v;
}
function person(s: ClubState, id: string) {
  const p = s.people.find((x) => x.id === id);
  requireValue(p, "Player not found in this club.");
  return p;
}
function recipients(s: ClubState, player: string) {
  const p = person(s, player);
  return p.junior ? p.guardians : [p.id];
}
function notice(
  s: ClubState,
  to: string,
  kind: string,
  subject: string,
  entity: string,
  now: number,
  key: string,
  category?: Permission,
  membershipEnd?: string,
) {
  if (s.notices.some((n) => n.key === key)) return;
  s.notices.push({
    id: key,
    to,
    kind,
    subject,
    entity,
    created: new Date(now).toISOString(),
    email: "pending",
    attempts: 0,
    key,
    category,
    membershipEnd,
  });
  const contact = s.people.find((p) => p.id === to);
  if (
    contact &&
    (!contact.emailVerified || !contact.email) &&
    !s.work.some((w) => w.id === `email:${to}`)
  )
    s.work.push({
      id: `email:${to}`,
      title: "Verified email required for club communication",
      permission: "communications",
      player: to,
      state: "open",
      assignee: "",
      comments: [],
    });
}
function notify(
  s: ClubState,
  player: string,
  kind: string,
  entity: string,
  now: number,
  key: string,
  subject = "Your club record has been updated",
) {
  for (const to of recipients(s, player))
    notice(s, to, kind, subject, entity, now, `${key}:${to}`);
}
function staffNotice(
  s: ClubState,
  permission: Permission,
  kind: string,
  entity: string,
  now: number,
  key: string,
) {
  for (const p of s.people.filter((p) => may(s, p.id, permission)))
    notice(
      s,
      p.id,
      kind,
      "A club item needs your attention. Sign in to view it.",
      entity,
      now,
      `${key}:${p.id}`,
      permission,
    );
}
function checkIn(
  s: ClubState,
  player: string,
  occurrence: string,
  source: AttendanceRecord["source"],
  now: number,
  id: string,
) {
  const session = s.sessions.find((x) => x.id === occurrence);
  requireValue(
    session && !session.cancelled && now >= session.start && now < session.end,
    "Attendance is available only during the session.",
  );
  person(s, player);
  if (
    s.attendance.some(
      (x) => x.session === occurrence && x.player === player && !x.corrected,
    )
  )
    return;
  let membership = membershipAt(s, player, localDay(now));
  if (membership === "active") {
    const end = s.memberships
      .filter(
        (m) =>
          m.player === player &&
          m.status === "active" &&
          m.start <= localDay(now) &&
          m.end >= localDay(now),
      )
      .map((m) => m.end)
      .sort()
      .at(-1);
    if (end && Date.parse(end) - Date.parse(localDay(now)) <= 10 * 86400000)
      membership = "approaching_expiry";
  }
  s.attendance.push({
    id,
    session: occurrence,
    player,
    at: new Date(now).toISOString(),
    source,
    membership,
    corrected: false,
  });
  s.absences = s.absences.filter(
    (x) => x.player !== player || x.session !== occurrence,
  );
  if (!["active", "approaching_expiry", "trial"].includes(membership)) {
    const key = `attendance:${occurrence}:${player}`;
    if (!s.work.some((w) => w.id === key))
      s.work.push({
        id: key,
        title: `Attendance: ${membership} membership`,
        player,
        state: "open",
        assignee: "",
        comments: [],
      });
    staffNotice(s, "membership", "membership_follow_up", key, now, key);
  }
}
function matchFor(s: ClubState, id: string) {
  const m = s.matches.find((x) => x.id === id);
  requireValue(m, "Match not found.");
  return m;
}
function eventFor(s: ClubState, id: string) {
  const e = s.events.find((x) => x.id === id);
  requireValue(e, "Tournament not found.");
  return e;
}
function organizer(s: ClubState, actor: string, event: Competition) {
  return (
    may(s, actor, "events") ||
    may(s, actor, "coach") ||
    event.delegates.includes(actor)
  );
}
function newMatch(
  id: string,
  author: string,
  sides: string[][],
  bestOf: number,
  event = "",
  session = "",
  now = Date.now(),
): ClubMatch {
  return {
    id,
    event,
    session,
    sides,
    bestOf,
    games: [],
    aggregate: null,
    author,
    status: "draft",
    submitted: 0,
    deadline: 0,
    reviewEligible: [],
    reason: "",
    table: "",
    round: 1,
    next: "",
    nextSlot: 0,
    playedOn: localDay(now),
  };
}
function advanceBracket(s: ClubState, match: ClubMatch) {
  if (!match.next || !["confirmed", "auto_approved"].includes(match.status))
    return;
  const next = matchFor(s, match.next);
  const team = match.sides[scoreResult(match).winner];
  if (
    next.sides[match.nextSlot].length &&
    next.sides[match.nextSlot].join("|") !== team.join("|")
  ) {
    invalidateDependents(s, next);
    next.games = [];
    next.aggregate = null;
    next.status = "draft";
    next.reviewEligible = [];
    next.reason =
      "Upstream participant changed; previous score retained in audit. A fresh result is required.";
  }
  next.sides[match.nextSlot] = team;
}
function bracketReady(s: ClubState, match: ClubMatch) {
  if (match.round <= 1) return true;
  const parents = s.matches.filter((m) => m.next === match.id);
  if (parents.length !== 2) return false;
  return parents.every((parent) => {
    if (!["confirmed", "auto_approved", "bye"].includes(parent.status))
      return false;
    const team =
      parent.status === "bye"
        ? parent.sides.find((t) => t.length)!
        : parent.sides[scoreResult(parent).winner];
    return team.join("|") === match.sides[parent.nextSlot].join("|");
  });
}
function invalidateDependents(
  s: ClubState,
  match: ClubMatch,
  seen = new Set<string>(),
) {
  if (!match.next || seen.has(match.id)) return;
  seen.add(match.id);
  const next = matchFor(s, match.next);
  if (next.games.length || next.aggregate) next.status = "changes_requested";
  else {
    next.status = "draft";
    next.sides[match.nextSlot] = [];
  }
  next.reason =
    "An upstream result changed. Resolve the earlier round before confirming this match.";
  invalidateDependents(s, next, seen);
}
export function standings(s: ClubState, event: Competition) {
  const rows = event.teams.map((team) => ({
    team,
    played: 0,
    won: 0,
    lost: 0,
    games: 0,
    pointsDifference: 0,
    points: 0,
    headToHead: 0,
  }));
  for (const m of s.matches.filter(
    (m) =>
      m.event === event.id && ["confirmed", "auto_approved"].includes(m.status),
  )) {
    const result = scoreResult(m);
    m.sides.forEach((team, side) => {
      const row = rows.find((r) => r.team.join("|") === team.join("|"));
      if (!row) return;
      row.played++;
      row.won += result.winner === side ? 1 : 0;
      row.lost += result.winner !== side ? 1 : 0;
      row.games += result.wins[side] - result.wins[1 - side];
      row.pointsDifference += result.points[side] - result.points[1 - side];
      row.points += result.winner === side ? event.winPoints : event.lossPoints;
    });
  }
  for (const m of s.matches.filter(
    (m) =>
      m.event === event.id && ["confirmed", "auto_approved"].includes(m.status),
  )) {
    const a = rows.find((r) => r.team.join() === m.sides[0].join()),
      b = rows.find((r) => r.team.join() === m.sides[1].join());
    if (a && b && a.points === b.points) {
      const winner = scoreResult(m).winner;
      a.headToHead += winner === 0 ? event.winPoints : event.lossPoints;
      b.headToHead += winner === 1 ? event.winPoints : event.lossPoints;
    }
  }
  const order = event.tieBreaks ?? ["game_difference", "point_difference"];
  const value = (r: (typeof rows)[number], rule: string) =>
    rule === "head_to_head"
      ? r.headToHead
      : rule === "game_difference"
        ? r.games
        : r.pointsDifference;
  return rows.sort(
    (a, b) =>
      b.points - a.points ||
      order
        .map((rule) => value(b, rule) - value(a, rule))
        .find((diff) => diff !== 0) ||
      a.team.join().localeCompare(b.team.join()),
  );
}
export function coachingSummary(
  s: ClubState,
  event = "",
  from = "",
  to = "",
  selectedPlayers: string[] = [],
) {
  const matches = s.matches.filter(
    (m) =>
      (!event || m.event === event) &&
      (!from || m.playedOn >= from) &&
      (!to || m.playedOn <= to),
  );
  const refs = s.reflections.filter(
    (r) =>
      matches.some((m) => m.id === r.match) &&
      (!selectedPlayers.length || selectedPlayers.includes(r.player)),
  );
  const players = new Set(refs.map((r) => r.player));
  return {
    reportingPlayers: players.size,
    reflections: refs.length,
    contributions: refs,
    tags: s.tags.map((tag) => ({
      ...tag,
      good: new Set(
        refs
          .filter((r) => r.good.includes(tag.id))
          .map((r) => `${r.player}:${r.match}`),
      ).size,
      improve: new Set(
        refs
          .filter((r) => r.improve.includes(tag.id))
          .map((r) => `${r.player}:${r.match}`),
      ).size,
      improvePlayers: new Set(
        refs.filter((r) => r.improve.includes(tag.id)).map((r) => r.player),
      ).size,
    })),
  };
}
export function notificationEligible(s: ClubState, n: Notice, now: number) {
  const p = s.people.find((p) => p.id === n.to);
  if (
    !p ||
    !p.emailVerified ||
    !p.email ||
    (n.category && !may(s, p.id, n.category))
  )
    return false;
  if (n.kind === "event_invitation" && !p.marketing) return false;
  if (
    [
      "payment_acknowledgement",
      "membership_expired",
      "trial_expired",
      "renewal_reminder",
    ].includes(n.kind)
  ) {
    const m = s.memberships.find((m) => m.id === n.entity);
    if (!m || !recipients(s, m.player).includes(n.to)) return false;
  }
  if (n.kind === "booking_request") {
    const r = s.board.requests.find((r) => r.id === n.entity);
    if (!r || r.status !== "pending" || r.holdUntil <= now) return false;
  }
  if (n.kind === "event_invitation") {
    const e = s.events.find((e) => e.id === n.entity);
    if (
      !e ||
      !["published", "in_progress"].includes(e.state) ||
      e.date < localDay(now)
    )
      return false;
  }
  if (n.kind === "result_resolved") {
    const m = s.matches.find((m) => m.id === n.entity);
    if (!m || !m.sides.flat().some((player) => represents(s, n.to, player)))
      return false;
  }
  if (n.kind.startsWith("booking_") && !n.category) {
    const r = s.board.requests.find((r) => r.id === n.entity);
    if (!r || !represents(s, n.to, r.playerId)) return false;
  }
  if (n.kind === "match_review") {
    const m = s.matches.find((m) => m.id === n.entity);
    if (
      !m ||
      m.status !== "awaiting_review" ||
      !m.reviewEligible.some((p) => represents(s, n.to, p))
    )
      return false;
  }
  if (
    n.kind === "expiry_digest" &&
    !s.memberships.some(
      (m) =>
        m.end === n.entity &&
        m.status !== "cancelled" &&
        !s.memberships.some(
          (other) =>
            other.player === m.player &&
            other.status === "active" &&
            other.end > m.end &&
            other.start <= localDay(now),
        ),
    )
  )
    return false;
  if (n.membershipEnd) {
    const m = s.memberships.find((m) => m.id === n.entity);
    if (
      !m ||
      !recipients(s, m.player).includes(n.to) ||
      m.status === "cancelled" ||
      m.end !== n.membershipEnd ||
      s.memberships.some(
        (other) =>
          other.player === m.player &&
          other.status === "active" &&
          other.start <= localDay(now) &&
          other.end > m.end,
      )
    )
      return false;
  }
  return true;
}
export function notificationText(s: ClubState, n: Notice, appUrl: string) {
  const link = new URL(appUrl);
  link.hash = "club-portal";
  const details: string[] = [s.name, n.subject];
  if (n.kind === "attendance_digest") {
    const report = attendanceReport(s, n.entity, n.entity);
    details.push(
      `${n.entity}: ${report.total} attendance visits, ${report.unique} unique players.`,
      report.segments
        .map(([status, count]) => `${status}: ${count}`)
        .join("; "),
    );
  }
  if (n.kind === "expiry_digest") {
    const count = s.memberships.filter(
      (m) =>
        m.end === n.entity &&
        m.status !== "cancelled" &&
        !s.memberships.some(
          (other) =>
            other.player === m.player &&
            other.status === "active" &&
            other.start <= localDay(Date.now()) &&
            other.end > m.end,
        ),
    ).length;
    details.push(
      `${n.entity}: ${count} expired membership periods need review. Member details stay in the protected workspace.`,
    );
  }
  const m = s.memberships.find((m) => m.id === n.entity);
  if (
    m &&
    [
      "payment_acknowledgement",
      "membership_expired",
      "trial_expired",
      "renewal_reminder",
    ].includes(n.kind)
  )
    details.push(
      `Player: ${person(s, m.player).name}`,
      `Period: ${m.start} to ${m.end} inclusive`,
      `Type: ${m.snapshot?.name ?? "Trial"}`,
      `Payment status: ${m.payment}`,
      ...(n.kind === "payment_acknowledgement"
        ? [
            `Recorded amount: EUR ${(m.amount / 100).toFixed(2)}. Informal acknowledgement only; not a tax receipt.`,
          ]
        : []),
    );
  const booking = s.board.requests.find((r) => r.id === n.entity);
  const session = s.sessions.find((x) => x.id === booking?.sessionId);
  if (booking && session && !n.category)
    details.push(
      `Player: ${person(s, booking.playerId).name}`,
      `Table ${booking.tableId}, player place ${booking.place + 1}`,
      `${new Date(session.start).toLocaleString("en-IE", { timeZone: "Europe/Dublin" })} to ${new Date(session.end).toLocaleTimeString("en-IE", { timeZone: "Europe/Dublin" })} (Ireland time)`,
      `Status: ${booking.status}. This is one shared-table place for the whole session. Contact the club about any manually collected fee. Cancellation policy: ${s.settings.cancelHours} hours before the session; otherwise ask a maintainer.`,
    );
  const event = s.events.find((e) => e.id === n.entity);
  if (n.kind === "event_invitation" && event)
    details.push(
      `${event.name} · ${event.date}`,
      ...(event.source ? [event.source] : []),
      "You opted in to event invitations. Change optional event consent in your profile to unsubscribe.",
    );
  details.push(
    `Open your protected club workspace: ${link}`,
    "Payments are handled directly by the club.",
  );
  return details.join("\n\n");
}
function applyRetention(s: ClubState, today: string) {
  if (!s.settings.retentionApproved) return;
  const operational = addCalendarMonths(today, -24),
    financial = addCalendarMonths(today, -84),
    notes = addCalendarMonths(today, -12);
  s.attendance = s.attendance.filter(
    (a) => localDay(Date.parse(a.at)) >= operational,
  );
  const oldSessions = s.sessions
    .filter((x) => x.date < operational)
    .map((x) => x.id);
  s.board.requests = s.board.requests.filter(
    (r) => !oldSessions.includes(r.sessionId),
  );
  for (const id of oldSessions) delete s.board.tables[id];
  s.notices = s.notices.filter(
    (n) =>
      n.created.slice(0, 10) >= operational ||
      ["pending", "sending", "failed"].includes(n.email),
  );
  const periodEnds = new Map(s.memberships.map((m) => [m.id, m.end]));
  const deletedMemberships = s.memberships
    .filter((m) => m.end < financial)
    .map((m) => m.id);
  s.memberships = s.memberships.filter(
    (m) => !deletedMemberships.includes(m.id),
  );
  s.notices = s.notices.filter((n) => !deletedMemberships.includes(n.entity));
  s.payments = s.payments.filter(
    (p) => !deletedMemberships.includes(p.membership),
  );
  const leftPlayers = s.people
    .filter((p) => p.leftOn && p.leftOn < notes)
    .map((p) => p.id);
  s.notes = s.notes.filter((n) => !leftPlayers.includes(n.player));
  s.audit = s.audit
    .filter((a) => {
      if (
        !a.changes.memberships &&
        !a.changes.payments &&
        !["membership", "payment"].includes(a.action)
      )
        return a.at.slice(0, 10) >= operational;
      const periods = a.changes.memberships as
        | { before?: Membership[]; after?: Membership[] }
        | undefined;
      const payments = a.changes.payments as
        | {
            before?: { membership: string }[];
            after?: { membership: string }[];
          }
        | undefined;
      const ends = [...(periods?.before ?? []), ...(periods?.after ?? [])].map(
        (m) => m.end,
      );
      for (const payment of [
        ...(payments?.before ?? []),
        ...(payments?.after ?? []),
      ]) {
        const end = periodEnds.get(payment.membership);
        if (end) ends.push(end);
      }
      return (ends.sort().at(-1) ?? a.at.slice(0, 10)) >= financial;
    })
    .map((a) => {
      if (leftPlayers.length && a.changes.notes) {
        const changes = { ...a.changes };
        const delta = changes.notes as {
          before?: { player: string }[];
          after?: { player: string }[];
        };
        changes.notes = {
          before: (delta.before ?? []).filter(
            (n) => !leftPlayers.includes(n.player),
          ),
          after: (delta.after ?? []).filter(
            (n) => !leftPlayers.includes(n.player),
          ),
        };
        return { ...a, changes };
      }
      return a;
    });
  // Published match history, photos and reflections have separate purposes. Do not
  // silently inherit operational retention or delete an identifiable player still referenced.
}
function runJobs(s: ClubState, now: number) {
  const today = localDay(now);
  const expiring = s.board.requests.filter(
    (r) => r.status === "pending" && r.holdUntil <= now,
  );
  for (const session of s.sessions)
    s.board = bookingUpdate(
      s.board,
      session,
      { id: "scheduler", players: [], maintainer: false },
      { type: "expire" },
      now,
    );
  for (const r of expiring)
    notify(s, r.playerId, "booking_expired", r.id, now, `hold-expired:${r.id}`);
  for (const m of s.matches)
    if (
      m.status === "awaiting_review" &&
      now >= m.deadline &&
      bracketReady(s, m)
    ) {
      m.status = "auto_approved";
      advanceBracket(s, m);
      for (const player of m.sides.flat())
        notify(
          s,
          player,
          "result_resolved",
          m.id,
          now,
          `auto:${m.id}:${m.submitted}`,
        );
    }
  const expired: string[] = [];
  for (const m of s.memberships.filter((m) => m.status !== "cancelled")) {
    const days = Math.round((Date.parse(m.end) - Date.parse(today)) / 86400000);
    if (
      s.memberships.some(
        (other) =>
          other.player === m.player &&
          other.status === "active" &&
          other.start <= today &&
          other.end > m.end,
      )
    )
      continue;
    if (days < 0) {
      expired.push(m.id);
      const kind =
        m.status === "trial" ? "trial_expired" : "membership_expired";
      for (const to of recipients(s, m.player))
        notice(
          s,
          to,
          kind,
          "Your club membership or trial has ended. Sign in for details.",
          m.id,
          now,
          `${kind}:${m.id}:${m.end}:${to}`,
          undefined,
          m.end,
        );
      if (m.status === "trial")
        staffNotice(
          s,
          "membership",
          "trial_follow_up",
          m.id,
          now,
          `trial:${m.id}:${m.end}`,
        );
    } else if (s.settings.reminders.includes(days) && m.start <= today)
      for (const to of recipients(s, m.player))
        notice(
          s,
          to,
          "renewal_reminder",
          "Your club membership is approaching its end date.",
          m.id,
          now,
          `renewal:${m.id}:${m.end}:${days}:${to}`,
          undefined,
          m.end,
        );
  }
  // One summary per expired date/recipient. Each period remains linked for delivery revalidation.
  for (const end of new Set(
    expired.map((id) => s.memberships.find((m) => m.id === id)!.end),
  ))
    staffNotice(
      s,
      "membership",
      "expiry_digest",
      end,
      now,
      `expiry-digest:${end}`,
    );
  const localClock = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Dublin",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(now);
  if (
    s.settings.dailyDigest &&
    localClock >= (s.settings.digestTime ?? "23:00")
  )
    staffNotice(
      s,
      "attendance",
      "attendance_digest",
      today,
      now,
      `attendance-digest:${today}`,
    );
  for (const n of s.notices.filter(
    (n) =>
      n.email === "failed" &&
      (n.attempts >= 5 ||
        (n.firstAttempt && now - n.firstAttempt >= 23 * 3600000)),
  ))
    if (!s.work.some((w) => w.id === `delivery:${n.id}`))
      s.work.push({
        id: `delivery:${n.id}`,
        title: "Email delivery needs manual provider review",
        permission: "communications",
        player: n.to,
        state: "open",
        assignee: "",
        comments: [],
      });
  s.challenges = s.challenges.filter((c) => c.expires > now);
  applyRetention(s, today);
}

export function applyClubCommand(
  original: ClubState,
  actor: Principal,
  command: ClubCommand,
  now = Date.now(),
): ClubState {
  requireValue(
    /^[a-zA-Z0-9:_-]{1,128}$/.test(command.id),
    "A safe request identifier is required.",
  );
  if (original.processed.includes(`${actor.id}:${command.id}`)) return original;
  if (!actor.system) {
    const recent = original.audit.filter(
      (a) => a.actor === actor.id && Date.parse(a.at) > now - 600000,
    );
    const limit =
      actor.id === original.owner ||
      (original.grants[actor.id]?.length ?? 0) > 0
        ? 600
        : 100;
    requireValue(
      recent.length < limit,
      "Too many recent changes. Wait before retrying.",
    );
    if (command.type === "child")
      requireValue(
        original.audit.filter(
          (a) =>
            a.actor === actor.id &&
            a.action === "child" &&
            a.at.slice(0, 10) === localDay(now),
        ).length < 10,
        "Ask management before registering more children today.",
      );
  }
  requireValue(
    command.expectedVersion === undefined ||
      command.expectedVersion === original.version,
    "Conflict: refresh before submitting this change.",
  );
  requireValue(
    actor.verified || actor.system,
    "Verify your sign-in email first.",
  );
  const s: ClubState = structuredClone(original);
  const d = command.data;
  const id = command.id;
  const permit = (permission: Permission) =>
    requireValue(
      may(s, actor.id, permission),
      `${permission} permission is required.`,
    );
  const own = (player: string) =>
    requireValue(
      represents(s, actor.id, player),
      "Select yourself or an actively linked child.",
    );
  const auditBefore = structuredClone(s);
  if (!["join", "subscribe", "jobs"].includes(command.type))
    person(s, actor.id);
  switch (command.type) {
    case "join": {
      const existing = s.people.find((p) => p.id === actor.id);
      requireValue(
        !existing || existing.status === "subscriber",
        "You already have a club profile.",
      );
      requireValue(
        d.consent === true && s.settings.privacy && s.settings.policy,
        "The club must publish privacy information and you must accept the application policy.",
      );
      const application: Person = {
        id: actor.id,
        name: nonempty(d, "name"),
        email: actor.email,
        emailVerified:
          actor.emailVerified ?? (actor.verified && Boolean(actor.email)),
        mobile: text(d, "mobile", 30),
        junior: false,
        guardians: [],
        status: "pending",
        marketing: d.marketing === true,
        consentAt: new Date(now).toISOString(),
        consentBy: actor.id,
      };
      if (existing) Object.assign(existing, application);
      else s.people.push(application);
      s.work.push({
        id,
        player: actor.id,
        title: "New club application",
        state: "open",
        assignee: "",
        comments: [],
      });
      break;
    }
    case "subscribe": {
      const subscribed = d.marketing === true;
      if (subscribed)
        requireValue(
          d.consent === true &&
            s.settings.privacy &&
            s.settings.policy &&
            (actor.emailVerified ?? (actor.verified && Boolean(actor.email))),
          "Published privacy information, verified email and explicit event consent are required.",
        );
      const existing = s.people.find((p) => p.id === actor.id);
      if (existing) {
        requireValue(
          !existing.junior,
          "Event subscriptions are adult-managed.",
        );
        existing.marketing = subscribed;
      } else {
        requireValue(subscribed, "No event subscription exists.");
        s.people.push({
          id: actor.id,
          name: nonempty(d, "name"),
          email: actor.email,
          emailVerified: true,
          mobile: "",
          junior: false,
          guardians: [],
          status: "subscriber",
          marketing: true,
        });
      }
      break;
    }
    case "profile": {
      const p = person(s, text(d, "player"));
      if (!may(s, actor.id, "membership")) own(p.id);
      p.name = nonempty(d, "name");
      p.mobile = text(d, "mobile", 30);
      if (p.id === actor.id) {
        p.email = actor.email;
        p.emailVerified =
          actor.emailVerified ?? (actor.verified && Boolean(actor.email));
        p.marketing = d.marketing === true;
      }
      break;
    }
    case "person": {
      permit("membership");
      const existing = s.people.find((p) => p.id === d.player);
      const junior = d.junior === true;
      const guardians = list(d, "guardians");
      for (const g of guardians)
        requireValue(!person(s, g).junior, "A guardian must be an adult.");
      requireValue(
        !junior || guardians.length > 0,
        "A junior requires a responsible guardian.",
      );
      const record: Person = {
        id: existing?.id ?? id,
        name: nonempty(d, "name"),
        email: existing?.email ?? "",
        emailVerified: existing?.emailVerified ?? false,
        mobile: text(d, "mobile", 30),
        junior,
        guardians,
        status: d.guest === true ? "guest" : "player",
        marketing: existing?.marketing ?? false,
      };
      if (existing) Object.assign(existing, record);
      else s.people.push(record);
      break;
    }
    case "guest": {
      const event =
        typeof d.event === "string" && d.event ? eventFor(s, d.event) : null;
      requireValue(
        may(s, actor.id, "coach") ||
          may(s, actor.id, "events") ||
          (event && organizer(s, actor.id, event)),
        "Organizer access required.",
      );
      s.people.push({
        id,
        name: nonempty(d, "name"),
        email: "",
        emailVerified: false,
        mobile: "",
        junior: false,
        guardians: [],
        status: "guest",
        marketing: false,
      });
      break;
    }
    case "child": {
      const parent = person(s, actor.id);
      requireValue(
        !parent.junior,
        "A responsible adult must register a junior.",
      );
      requireValue(
        d.consent === true && s.settings.safeguarding && s.settings.policy,
        "Guardian consent and configured club safeguarding information are required.",
      );
      s.people.push({
        id,
        name: nonempty(d, "name"),
        email: "",
        emailVerified: false,
        mobile: "",
        junior: true,
        guardians: [actor.id],
        status: "pending",
        marketing: false,
        consentAt: new Date(now).toISOString(),
        consentBy: actor.id,
      });
      break;
    }
    case "claim_profile": {
      permit("membership");
      const source = person(s, text(d, "source")),
        target = person(s, text(d, "target"));
      nonempty(d, "reason", 500);
      requireValue(
        source.id !== target.id &&
          source.junior === target.junior &&
          !source.emailVerified &&
          source.id !== s.owner &&
          !s.grants[source.id]?.length &&
          target.emailVerified,
        "Select an unclaimed offline profile and a verified account with the same junior/adult classification.",
      );
      for (const session of s.sessions)
        requireValue(
          s.board.requests.filter(
            (r) =>
              r.sessionId === session.id &&
              [source.id, target.id].includes(r.playerId) &&
              occupiesPlace(r, now),
          ).length <= 1,
          "Resolve duplicate session places before linking profiles.",
        );
      for (const e of s.events)
        requireValue(
          !(
            e.teams.flat().includes(source.id) &&
            e.teams.flat().includes(target.id)
          ),
          "Resolve duplicate tournament entries before linking profiles.",
        );
      requireValue(
        !s.matches.some(
          (m) =>
            m.sides.flat().includes(source.id) &&
            m.sides.flat().includes(target.id),
        ),
        "Resolve matches containing both profiles before linking identities.",
      );
      const replace = (id: string) => (id === source.id ? target.id : id);
      target.name = source.name;
      target.status = source.status;
      target.guardians = [
        ...new Set([...source.guardians, ...target.guardians]),
      ].map(replace);
      s.people.forEach(
        (p) => (p.guardians = [...new Set(p.guardians.map(replace))]),
      );
      s.memberships.forEach((m) => (m.player = replace(m.player)));
      s.board.requests.forEach((r) => {
        r.playerId = replace(r.playerId);
        r.requesterId = replace(r.requesterId);
      });
      s.attendance.forEach((a) => (a.player = replace(a.player)));
      const attended = new Set<string>();
      for (const a of s.attendance)
        if (!a.corrected) {
          const key = `${a.session}:${a.player}`;
          if (attended.has(key)) {
            a.corrected = true;
            a.reason =
              "Duplicate attendance resolved during verified profile linking";
          } else attended.add(key);
        }
      s.absences.forEach((a) => (a.player = replace(a.player)));
      s.events.forEach((e) => {
        e.teams = e.teams.map((t) => t.map(replace));
        e.delegates = e.delegates.map(replace);
      });
      s.matches.forEach((m) => {
        m.sides = m.sides.map((t) => t.map(replace));
        m.reviewEligible = m.reviewEligible.map(replace);
      });
      s.reflections.forEach((r) => (r.player = replace(r.player)));
      s.notes.forEach((n) => (n.player = replace(n.player)));
      s.assessments.forEach((a) => (a.player = replace(a.player)));
      s.notices.forEach((n) => (n.to = replace(n.to)));
      s.work.forEach((w) => (w.player = replace(w.player)));
      s.people = s.people.filter((p) => p.id !== source.id);
      break;
    }
    case "grant": {
      permit("access");
      const target = person(s, text(d, "player"));
      requireValue(
        target.id !== s.owner,
        "The platform owner cannot be changed here.",
      );
      const grants = list(d, "permissions");
      requireValue(
        grants.every((p) => permissions.includes(p as Permission)),
        "Unknown permission.",
      );
      requireValue(
        !target.junior,
        "Management access requires an adult account.",
      );
      s.grants[target.id] = grants as Permission[];
      break;
    }
    case "leave": {
      permit("membership");
      const target = person(s, text(d, "player"));
      requireValue(target.id !== s.owner, "Owner cannot be removed here.");
      nonempty(d, "reason", 500);
      target.status = "left";
      target.leftOn = localDay(now);
      s.grants[target.id] = [];
      break;
    }
    case "plan": {
      permit("membership");
      const plan: Plan = {
        id: typeof d.plan === "string" && d.plan ? d.plan : id,
        name: nonempty(d, "name"),
        months: number(d, "months", 1, 120),
        price: number(d, "price", 0, 10000000),
        entitlement: text(d, "entitlement"),
        active: d.active !== false,
      };
      const old = s.plans.find((p) => p.id === plan.id);
      if (old) Object.assign(old, plan);
      else s.plans.push(plan);
      break;
    }
    case "membership": {
      permit("membership");
      const player = text(d, "player");
      person(s, player);
      const plan = s.plans.find((p) => p.id === d.plan && p.active);
      requireValue(plan, "Choose an active membership type.");
      const start = date(d, "start"),
        end = date(d, "end");
      requireValue(end >= start, "End date must follow start date.");
      requireValue(
        ["active", "trial", "cancelled"].includes(String(d.status)) &&
          ["unpaid", "partial", "paid", "waived"].includes(String(d.payment)),
        "Invalid membership/payment status.",
      );
      const record: Membership = {
        id:
          typeof d.membership === "string" && d.membership ? d.membership : id,
        player,
        plan: plan.id,
        snapshot: structuredClone(plan),
        start,
        end,
        status: d.status as Membership["status"],
        payment: d.payment as Membership["payment"],
        amount: number(d, "amount", 0, 10000000),
        receivedOn: date(d, "receivedOn"),
        reference: text(d, "reference", 500),
      };
      const old = s.memberships.find((m) => m.id === record.id);
      requireValue(
        record.amount >=
          s.payments
            .filter((p) => p.membership === record.id)
            .reduce((sum, p) => sum + p.amount, 0),
        "Correct the individual payment records before reducing the received total below them.",
      );
      if (old) {
        requireValue(
          old.player === player,
          "Cannot transfer a membership to another player.",
        );
        Object.assign(old, record);
      } else s.memberships.push(record);
      if (record.status !== "cancelled") person(s, player).status = "player";
      if (d.acknowledge === true)
        notify(
          s,
          player,
          "payment_acknowledgement",
          record.id,
          now,
          `receipt:${id}`,
          "Membership updated — informal acknowledgement, not a tax receipt.",
        );
      break;
    }
    case "trial": {
      const player = text(d, "player");
      own(player);
      requireValue(
        !s.memberships.some((m) => m.player === player && m.status === "trial"),
        "A trial already exists. Ask management for an extension.",
      );
      const start = localDay(now);
      person(s, player).status = "player";
      const end = new Date(
        Date.parse(addCalendarMonths(start, s.settings.trialMonths)) - 86400000,
      )
        .toISOString()
        .slice(0, 10);
      s.memberships.push({
        id,
        player,
        plan: "",
        snapshot: null,
        start,
        end,
        status: "trial",
        payment: "unpaid",
        amount: 0,
        receivedOn: start,
        reference: "Self-registered trial",
      });
      break;
    }
    case "extend_trial": {
      permit("membership");
      const trial = s.memberships.find(
        (m) => m.id === d.membership && m.status === "trial",
      );
      requireValue(trial, "Trial not found.");
      const end = date(d, "end");
      requireValue(
        end > trial.end,
        "An extension must end after the current trial.",
      );
      nonempty(d, "reason", 500);
      trial.end = end;
      break;
    }
    case "payment": {
      permit("membership");
      const membership = s.memberships.find((m) => m.id === d.membership);
      requireValue(membership, "Membership not found.");
      const previous = s.payments.find((p) => p.id === d.paymentId);
      requireValue(
        !previous || previous.membership === membership.id,
        "Cannot transfer a payment to another membership.",
      );
      const amount = number(d, "amount", 0, 10000000);
      requireValue(
        ["unpaid", "partial", "paid", "waived"].includes(String(d.status)),
        "Choose payment status.",
      );
      const value = {
        id: previous?.id ?? id,
        membership: membership.id,
        amount,
        date: date(d, "date"),
        method: text(d, "method", 60),
        reference: text(d, "reference", 500),
        recordedBy: actor.id,
      };
      membership.amount += amount - (previous?.amount ?? 0);
      requireValue(
        membership.amount >= 0,
        "Payment correction would make the received total negative.",
      );
      membership.payment = d.status as Membership["payment"];
      membership.receivedOn = value.date;
      if (previous) Object.assign(previous, value);
      else s.payments.push(value);
      if (d.acknowledge === true)
        notify(
          s,
          membership.player,
          "payment_acknowledgement",
          membership.id,
          now,
          `payment:${id}`,
          "External payment recorded — informal acknowledgement only.",
        );
      break;
    }
    case "programme": {
      permit("events");
      const occurrences = d.occurrences as Record<string, unknown>[];
      requireValue(
        Array.isArray(occurrences) &&
          occurrences.length > 0 &&
          occurrences.length <= 60,
        "Use one to sixty dated occurrences.",
      );
      for (const [i, occurrence] of occurrences.entries())
        Object.assign(
          s,
          applyClubCommand(
            s,
            actor,
            { id: `${id}:${i}`, type: "session", data: occurrence },
            now,
          ),
        );
      break;
    }
    case "session": {
      permit("events");
      const start = Date.parse(text(d, "start", 40)),
        end = Date.parse(text(d, "end", 40));
      requireValue(
        Number.isFinite(start) && end > start && end - start <= 86400000,
        "Use valid session times within one day.",
      );
      const sessionId =
        typeof d.session === "string" && d.session ? d.session : id;
      const existing = s.sessions.find((x) => x.id === sessionId);
      requireValue(
        !existing ||
          !s.board.requests.some(
            (r) => r.sessionId === sessionId && occupiesPlace(r, now),
          ),
        "Resolve existing bookings before changing a session.",
      );
      const value: ClubSession = {
        id: sessionId,
        date: localDay(start),
        start,
        end,
        label: nonempty(d, "name"),
        capacity: number(d, "capacity", 1, 1000),
        tables: number(d, "tables", 1, 100),
        cancelled: false,
      };
      const tableIds =
        Array.isArray(d.tableIds) && d.tableIds.length
          ? [...new Set(d.tableIds as number[])]
          : Array.from({ length: value.tables }, (_, i) => i + 1);
      requireValue(
        tableIds.every((t) => Number.isInteger(t) && t >= 1 && t <= 100) &&
          value.capacity <= tableIds.length * 4,
        "Use valid table IDs and no more than four players per table.",
      );
      value.tables = tableIds.length;
      requireValue(
        !s.closures.some((c) => c.active && c.start < end && c.end > start),
        "The hall is closed during these times.",
      );
      requireValue(
        !s.sessions.some(
          (x) =>
            x.id !== sessionId &&
            !x.cancelled &&
            x.start < end &&
            x.end > start &&
            s.board.tables[x.id]?.some((t) => tableIds.includes(t.id)),
        ),
        "Session overlaps an existing table allocation. Resolve the resource conflict first.",
      );
      if (existing) Object.assign(existing, value);
      else s.sessions.push(value);
      s.board.tables[sessionId] = tableIds.map((id) => ({
        id,
        use: "reservable" as TableUse,
      }));
      break;
    }
    case "close_hall": {
      permit("events");
      const start = Date.parse(text(d, "start", 40)),
        end = Date.parse(text(d, "end", 40));
      requireValue(
        Number.isFinite(start) && end > start,
        "Use valid closure dates.",
      );
      const reason = nonempty(d, "reason", 500);
      s.closures.push({ id, start, end, reason, active: true });
      for (const session of s.sessions.filter(
        (x) => !x.cancelled && x.start < end && x.end > start,
      )) {
        session.cancelled = true;
        for (const r of s.board.requests.filter(
          (r) => r.sessionId === session.id && occupiesPlace(r, now),
        )) {
          r.status = "cancelled";
          notify(
            s,
            r.playerId,
            "booking_cancelled",
            r.id,
            now,
            `closure:${id}:${r.id}`,
          );
        }
      }
      break;
    }
    case "reopen_hall": {
      permit("events");
      const closure = s.closures.find((c) => c.id === d.closure);
      requireValue(closure, "Closure not found.");
      nonempty(d, "reason", 500);
      closure.active = false;
      break;
    }
    case "cancel_session": {
      permit("events");
      const session = s.sessions.find((x) => x.id === d.session);
      requireValue(session, "Session not found.");
      nonempty(d, "reason", 500);
      session.cancelled = true;
      for (const r of s.board.requests.filter(
        (r) => r.sessionId === session.id && occupiesPlace(r, now),
      )) {
        r.status = "cancelled";
        notify(
          s,
          r.playerId,
          "booking_cancelled",
          r.id,
          now,
          `cancel-session:${id}:${r.id}`,
        );
      }
      break;
    }
    case "booking": {
      const session = s.sessions.find((x) => x.id === d.session);
      requireValue(session && !session.cancelled, "Session unavailable.");
      const action = d.action as Parameters<typeof bookingUpdate>[3];
      requireValue(
        action &&
          typeof action.type === "string" &&
          [
            "request",
            "approve",
            "reject",
            "cancel",
            "release",
            "table",
            "move",
          ].includes(action.type),
        "Invalid booking action.",
      );
      if (action.type === "request") {
        action.id = id;
        person(s, action.playerId);
        requireValue(
          s.board.requests.filter(
            (r) => r.sessionId === session.id && occupiesPlace(r, now),
          ).length < session.capacity,
          "Session capacity reached.",
        );
      }
      const before = s.board.requests.find(
        (r) => "id" in action && r.id === action.id,
      );
      s.board = bookingUpdate(
        s.board,
        session,
        {
          id: actor.id,
          players: s.people
            .filter((p) => represents(s, actor.id, p.id))
            .map((p) => p.id),
          maintainer: may(s, actor.id, "booking"),
        },
        action,
        now,
        s.settings,
      );
      const after = s.board.requests.find(
        (r) => r.id === ("id" in action ? action.id : ""),
      );
      if (after) {
        notify(
          s,
          after.playerId,
          `booking_${after.status}`,
          after.id,
          now,
          `booking:${id}`,
        );
        if (!before)
          staffNotice(
            s,
            "booking",
            "booking_request",
            after.id,
            now,
            `booking-request:${id}`,
          );
      }
      break;
    }
    case "reschedule_booking": {
      permit("booking");
      const original = s.board.requests.find((r) => r.id === d.booking);
      requireValue(
        original && occupiesPlace(original, now),
        "Choose an active booking.",
      );
      const target = s.sessions.find((x) => x.id === d.session && !x.cancelled);
      requireValue(target, "New session unavailable.");
      requireValue(
        target.id !== original.sessionId,
        "Use Move for another place in the same session.",
      );
      nonempty(d, "reason", 500);
      requireValue(
        s.board.requests.filter(
          (r) => r.sessionId === target.id && occupiesPlace(r, now),
        ).length < target.capacity,
        "New session is full.",
      );
      const oldStatus = original.status;
      s.board = bookingUpdate(
        s.board,
        target,
        { id: actor.id, players: [original.playerId], maintainer: true },
        {
          type: "request",
          id,
          playerId: original.playerId,
          tableId: number(d, "table", 1, 100),
          place: number(d, "place", 1, 4) - 1,
        },
        now,
        s.settings,
      );
      if (oldStatus === "confirmed")
        s.board = bookingUpdate(
          s.board,
          target,
          { id: actor.id, players: [], maintainer: true },
          { type: "approve", id },
          now,
          s.settings,
        );
      s.board.requests.find((r) => r.id === original.id)!.status = "cancelled";
      notify(
        s,
        original.playerId,
        "booking_rescheduled",
        id,
        now,
        `reschedule:${id}`,
      );
      break;
    }
    case "checkin": {
      const player = text(d, "player");
      const event =
        typeof d.event === "string" && d.event ? eventFor(s, d.event) : null;
      const delegated = Boolean(event && organizer(s, actor.id, event));
      const manual = may(s, actor.id, "attendance") || delegated;
      if (delegated && !may(s, actor.id, "attendance"))
        requireValue(
          event!.session === d.session && event!.teams.flat().includes(player),
          "Organizer check-in is limited to this tournament and its participants.",
        );
      if (!manual) own(player);
      const hash = typeof d.challengeHash === "string" ? d.challengeHash : "";
      if (hash)
        requireValue(
          s.challenges.some(
            (c) =>
              c.hash === hash && c.session === d.session && c.expires > now,
          ),
          "Venue QR expired. Scan the current display.",
        );
      requireValue(
        d.present === true,
        "Confirm the player is physically present.",
      );
      checkIn(
        s,
        player,
        text(d, "session"),
        hash ? "venue_qr" : manual ? "manual" : "app",
        now,
        id,
      );
      break;
    }
    case "issue_qr": {
      permit("attendance");
      const session = s.sessions.find((x) => x.id === d.session);
      requireValue(
        session &&
          !session.cancelled &&
          now >= session.start &&
          now < session.end,
        "Choose a session currently in progress.",
      );
      const hash = nonempty(d, "challengeHash", 64);
      requireValue(/^[a-f0-9]{64}$/.test(hash), "Invalid challenge.");
      s.challenges = s.challenges.filter((c) => c.expires > now);
      s.challenges.push({
        hash,
        session: session.id,
        expires: Math.min(session.end, now + 90000),
      });
      break;
    }
    case "absence": {
      const player = text(d, "player");
      own(player);
      const session = s.sessions.find((x) => x.id === d.session);
      requireValue(
        session && !session.cancelled && now < session.end,
        "Session unavailable.",
      );
      requireValue(
        !s.attendance.some(
          (x) => x.player === player && x.session === d.session && !x.corrected,
        ),
        "Already checked in; ask staff to correct presence.",
      );
      if (
        !s.absences.some((x) => x.session === d.session && x.player === player)
      )
        s.absences.push({ session: session.id, player });
      break;
    }
    case "correct_attendance": {
      permit("attendance");
      const record = s.attendance.find((x) => x.id === d.attendance);
      requireValue(record, "Attendance not found.");
      record.reason = nonempty(d, "reason", 500);
      record.corrected = true;
      break;
    }
    case "event": {
      permit("events");
      const external = d.external === true;
      const teams = d.teams as string[][];
      requireValue(
        Array.isArray(teams) &&
          teams.length <= 128 &&
          teams.every(
            (t) =>
              Array.isArray(t) &&
              [1, 2].includes(t.length) &&
              t.every((x) => typeof x === "string"),
          ),
        "Use singles players or pairs.",
      );
      requireValue(
        external ||
          (teams.length >= 2 &&
            teams.every((t) => t.length === teams[0].length)),
        "Select at least two singles players or complete doubles teams.",
      );
      const ids = teams.flat();
      requireValue(
        new Set(ids).size === ids.length,
        "A player cannot appear twice.",
      );
      for (const p of ids) person(s, p);
      requireValue(
        ["round_robin", "single_elimination"].includes(String(d.format)),
        "Invalid tournament format.",
      );
      const bestOf = number(d, "bestOf", 1, 7);
      requireValue(bestOf % 2 === 1, "Best-of must be odd.");
      const source = text(d, "source", 500);
      requireValue(
        !source || /^https:\/\//.test(source),
        "Source must use HTTPS.",
      );
      const event: Competition = {
        id,
        name: nonempty(d, "name"),
        date: date(d, "date"),
        session: text(d, "session"),
        external,
        format: d.format as Competition["format"],
        teams,
        delegates: [],
        state: "draft",
        bestOf,
        winPoints: number(d, "winPoints", 0, 10),
        lossPoints: number(d, "lossPoints", 0, 10),
        source,
      };
      if (typeof d.tieBreaks === "string") {
        const rules = d.tieBreaks
          .split(",")
          .map((r) => r.trim())
          .filter(Boolean);
        requireValue(
          rules.every((r) =>
            ["game_difference", "point_difference", "head_to_head"].includes(r),
          ) && new Set(rules).size === rules.length,
          "Use distinct supported tie-break rules.",
        );
        event.tieBreaks = rules;
      }
      if (!external)
        requireValue(
          s.sessions.some((x) => x.id === event.session && !x.cancelled),
          "Select the internal tournament session.",
        );
      if (!external && d.present === true)
        for (const player of ids)
          checkIn(
            s,
            player,
            event.session,
            "manual",
            now,
            `${id}:presence:${player}`,
          );
      s.events.push(event);
      break;
    }
    case "propose_event": {
      const source = text(d, "source", 500);
      requireValue(
        !source || source.startsWith("https://"),
        "Source must use HTTPS.",
      );
      s.eventDrafts.push({
        id,
        author: actor.id,
        name: nonempty(d, "name"),
        date: date(d, "date"),
        source,
        linkedEvent: "",
      });
      break;
    }
    case "link_event": {
      permit("events");
      const draft = s.eventDrafts.find((e) => e.id === d.draft);
      requireValue(draft, "Proposed event not found.");
      const event = eventFor(s, text(d, "event"));
      requireValue(event.external, "Link to an external event.");
      draft.linkedEvent = event.id;
      for (const m of s.matches.filter((m) => m.draftEvent === draft.id)) {
        m.event = event.id;
        m.draftEvent = undefined;
      }
      break;
    }
    case "event_teams": {
      const event = eventFor(s, text(d, "event"));
      requireValue(
        organizer(s, actor.id, event) && event.state === "draft",
        "Edit teams before publication.",
      );
      const teams = d.teams as string[][];
      requireValue(
        Array.isArray(teams) &&
          teams.length >= 2 &&
          teams.length <= 128 &&
          teams.every(
            (t) =>
              Array.isArray(t) &&
              [1, 2].includes(t.length) &&
              t.length === teams[0].length,
          ) &&
          new Set(teams.flat()).size === teams.flat().length,
        "Use distinct singles players or complete doubles teams.",
      );
      teams.flat().forEach((id) => person(s, id));
      event.teams = teams;
      break;
    }
    case "delegate": {
      const event = eventFor(s, text(d, "event"));
      requireValue(
        may(s, actor.id, "coach") || may(s, actor.id, "events"),
        "Coach or event-manager access is required.",
      );
      const delegates = list(d, "players");
      delegates.forEach((p) =>
        requireValue(
          person(s, p).status === "player",
          "Delegate must be a club player.",
        ),
      );
      event.delegates = delegates;
      break;
    }
    case "event_state": {
      const event = eventFor(s, text(d, "event"));
      requireValue(
        organizer(s, actor.id, event),
        "Tournament organizer access required.",
      );
      const next = text(d, "state");
      if (next === "published") {
        requireValue(event.state === "draft", "Only drafts can be published.");
        if (!event.external) generateFixtures(s, event, actor.id, now);
      } else if (next === "in_progress") {
        requireValue(
          event.state === "published" && event.date === localDay(now),
          "Publish the tournament and start on its date.",
        );
        if (!event.external) {
          if (d.present === true)
            for (const player of event.teams.flat())
              checkIn(
                s,
                player,
                event.session,
                "manual",
                now,
                `${id}:presence:${player}`,
              );
          requireValue(
            event.teams
              .flat()
              .every((p) =>
                s.attendance.some(
                  (a) =>
                    a.player === p &&
                    a.session === event.session &&
                    !a.corrected,
                ),
              ),
            "Confirm/check in all physically present participants before starting.",
          );
        }
      } else if (next === "cancelled") nonempty(d, "reason", 500);
      else if (next === "completed") {
        requireValue(
          may(s, actor.id, "coach") || may(s, actor.id, "events"),
          "Staff must complete tournaments.",
        );
        requireValue(
          event.state === "in_progress",
          "Start the tournament first.",
        );
        const unfinished = s.matches.filter(
          (m) =>
            m.event === event.id &&
            !["confirmed", "auto_approved", "bye"].includes(m.status),
        );
        if (unfinished.length) {
          nonempty(d, "reason", 500);
          unfinished.forEach((m) => (m.status = "incomplete"));
        }
      } else throw new Error("Invalid tournament transition.");
      event.state = next;
      for (const player of event.teams.flat())
        notify(
          s,
          player,
          "event_update",
          event.id,
          now,
          `event-state:${id}:${player}`,
        );
      break;
    }
    case "match": {
      const sides = d.sides as string[][];
      requireValue(
        Array.isArray(sides) &&
          sides.length === 2 &&
          sides.every((t) => Array.isArray(t) && [1, 2].includes(t.length)) &&
          sides[0].length === sides[1].length &&
          new Set(sides.flat()).size === sides.flat().length,
        "Select two distinct singles players or doubles teams.",
      );
      sides.flat().forEach((p) => person(s, p));
      const event = d.event ? eventFor(s, text(d, "event")) : null;
      const staff =
        may(s, actor.id, "coach") || (event && organizer(s, actor.id, event));
      requireValue(
        staff || sides.flat().some((p) => represents(s, actor.id, p)),
        "Only a participant/guardian or organizer can create this match.",
      );
      if (
        event &&
        !event.external &&
        s.matches.some(
          (m) =>
            m.event === event.id &&
            m.sides
              .map((t) => [...t].sort().join())
              .sort()
              .join("|") ===
              sides
                .map((t) => [...t].sort().join())
                .sort()
                .join("|"),
        )
      )
        break; // Reuse the existing fixture; never double count.
      const draft =
        typeof d.draftEvent === "string" && d.draftEvent
          ? s.eventDrafts.find(
              (e) => e.id === d.draftEvent && e.author === actor.id,
            )
          : null;
      requireValue(
        !d.draftEvent || draft,
        "Choose your own private event proposal.",
      );
      requireValue(
        !(event && draft),
        "Choose a listed event or an unlisted proposal.",
      );
      const bestOf = number(d, "bestOf", 1, 7);
      requireValue(bestOf % 2 === 1, "Best-of must be odd.");
      const m = newMatch(
        id,
        actor.id,
        sides,
        bestOf,
        event?.id ?? "",
        text(d, "session"),
        now,
      );
      m.table = text(d, "table", 20);
      m.playedOn =
        typeof d.date === "string" && d.date
          ? date(d, "date")
          : (event?.date ?? draft?.date ?? localDay(now));
      m.draftEvent = draft?.id;
      const sameSides = (teams: string[][]) =>
        teams
          .map((t) => [...t].sort().join())
          .sort()
          .join("|");
      if (
        s.matches.some(
          (other) =>
            other.event === m.event &&
            other.draftEvent === m.draftEvent &&
            other.session === m.session &&
            other.playedOn === m.playedOn &&
            sameSides(other.sides) === sameSides(m.sides),
        )
      ) {
        requireValue(
          d.allowDuplicate === true,
          "A similar match already exists. Open it or confirm a separate repeat match.",
        );
        m.reason = nonempty(d, "duplicateReason", 500);
      }
      s.matches.push(m);
      break;
    }
    case "score": {
      const match = matchFor(s, text(d, "match"));
      const event = match.event ? eventFor(s, match.event) : null;
      const staff =
        may(s, actor.id, "coach") || (event && organizer(s, actor.id, event));
      requireValue(
        staff || match.sides.flat().some((p) => represents(s, actor.id, p)),
        "Participant or organizer access required.",
      );
      requireValue(
        !["confirmed", "auto_approved"].includes(match.status) ||
          may(s, actor.id, "coach"),
        "Only a coach can correct confirmed results.",
      );
      requireValue(
        bracketReady(s, match),
        "Previous bracket results are not confirmed.",
      );
      if (["confirmed", "auto_approved"].includes(match.status)) {
        match.reason = nonempty(d, "reason", 500);
        invalidateDependents(s, match);
      }
      requireValue(
        match.sides.every((t) => t.length > 0),
        "Wait for the previous bracket round.",
      );
      requireValue(
        !event || event.external || event.state === "in_progress",
        "Start the internal tournament before scoring.",
      );
      const games = d.games as number[][];
      requireValue(
        Array.isArray(games) &&
          games.length <= match.bestOf &&
          games.every(
            (g) =>
              Array.isArray(g) &&
              g.length === 2 &&
              g.every((n) => Number.isInteger(n) && n >= 0 && n <= 200),
          ),
        "Invalid game scores.",
      );
      match.games = games;
      match.aggregate = d.aggregate as number[] | null;
      if (d.incomplete === true) {
        match.status = "incomplete";
        break;
      }
      if (d.draft === true) {
        match.status = "draft";
        break;
      }
      scoreResult(match);
      requireValue(
        !match.aggregate || Boolean(event?.external || match.draftEvent),
        "Aggregate-only scores are for external event logs.",
      );
      const ownSide = match.sides.findIndex((t) =>
        t.some((p) => represents(s, actor.id, p)),
      );
      const opposing = ownSide >= 0 ? match.sides[1 - ownSide] : match.sides[1];
      match.reviewEligible = opposing.filter(
        (p) => person(s, p).status === "player",
      );
      match.submitted = now;
      match.deadline = now + 5 * 86400000;
      match.author = actor.id;
      match.status =
        (event?.external || match.draftEvent) &&
        match.reviewEligible.length === 0
          ? "reported"
          : "awaiting_review";
      for (const player of match.reviewEligible)
        notify(s, player, "match_review", match.id, now, `review:${id}`);
      if (
        match.reviewEligible.some(
          (p) => person(s, p).junior && !person(s, p).guardians.length,
        )
      )
        s.work.push({
          id,
          player: "",
          title: "Assisted match review required",
          permission: "coach",
          state: "open",
          assignee: "",
          comments: [],
        });
      break;
    }
    case "review": {
      const match = matchFor(s, text(d, "match"));
      const coach = may(s, actor.id, "coach");
      requireValue(
        coach ||
          (match.status === "awaiting_review" &&
            actor.id !== match.author &&
            match.reviewEligible.some((p) => represents(s, actor.id, p))),
        "Only the opposing side or an authorized coach can review.",
      );
      const approve = d.approve === true;
      if (approve)
        requireValue(
          bracketReady(s, match),
          "Previous bracket results are not confirmed.",
        );
      if (approve) scoreResult(match);
      if (!approve || coach) match.reason = nonempty(d, "reason", 500);
      match.status = approve ? "confirmed" : "changes_requested";
      if (approve) advanceBracket(s, match);
      else invalidateDependents(s, match);
      break;
    }
    case "reflection": {
      const player = text(d, "player");
      own(player);
      const match = matchFor(s, text(d, "match"));
      requireValue(
        match.sides.flat().includes(player),
        "Only participants can record personal reflections.",
      );
      const existing = s.reflections.find(
        (r) => r.match === match.id && r.player === player,
      );
      const good = list(d, "good"),
        improve = list(d, "improve");
      for (const tag of [...good, ...improve])
        requireValue(
          s.tags.some(
            (t) =>
              t.id === tag &&
              (t.active ||
                existing?.good.includes(tag) ||
                existing?.improve.includes(tag)),
          ),
          "Unknown or retired tag.",
        );
      const r: Reflection = {
        id: existing?.id ?? id,
        match: match.id,
        player,
        good,
        improve,
        note: text(d, "note"),
        updatedBy: actor.id,
      };
      if (d.remove === true)
        s.reflections = s.reflections.filter((x) => x.id !== existing?.id);
      else if (existing) Object.assign(existing, r);
      else s.reflections.push(r);
      break;
    }
    case "tag": {
      permit("coach");
      const existing = s.tags.find((t) => t.id === d.tag);
      if (existing) existing.active = d.active === true;
      else s.tags.push({ id, label: nonempty(d, "name", 60), active: true });
      break;
    }
    case "note": {
      permit("coach");
      const player = text(d, "player");
      person(s, player);
      s.notes.push({ id, player, body: nonempty(d, "body"), author: actor.id });
      break;
    }
    case "assessment": {
      permit("coach");
      const player = text(d, "player");
      person(s, player);
      s.assessments.push({
        id,
        player,
        strengths: nonempty(d, "strengths"),
        improvements: nonempty(d, "improvements"),
        goals: nonempty(d, "goals"),
        family: "",
        coach: "",
        published: false,
      });
      break;
    }
    case "signoff": {
      const a = s.assessments.find((a) => a.id === d.assessment);
      requireValue(a, "Summary not found.");
      if (d.side === "family") {
        own(a.player);
        requireValue(actor.id !== a.coach, "Two distinct people must sign.");
        a.family = actor.id;
      } else {
        permit("coach");
        requireValue(actor.id !== a.family, "Two distinct people must sign.");
        a.coach = actor.id;
      }
      a.published = Boolean(a.family && a.coach);
      break;
    }
    case "page": {
      permit("content");
      const event = text(d, "event");
      if (event) eventFor(s, event);
      const page = {
        id: typeof d.page === "string" && d.page ? d.page : id,
        title: nonempty(d, "title"),
        body: nonempty(d, "body", 10000),
        kind: nonempty(d, "kind", 30),
        published: d.published === true,
        event,
      };
      const old = s.pages.find((p) => p.id === page.id);
      if (old) Object.assign(old, page);
      else s.pages.push(page);
      break;
    }
    case "website": {
      permit("access");
      const website = new URL(nonempty(d, "url", 500));
      requireValue(
        website.protocol === "https:" &&
          !website.username &&
          !website.password &&
          d.verified === true,
        "Confirm an approved HTTPS website without embedded credentials.",
      );
      nonempty(d, "reason", 500);
      s.website = website.href;
      break;
    }
    case "invite": {
      permit("communications");
      const event = eventFor(s, text(d, "event"));
      requireValue(
        event.state !== "draft" && event.state !== "cancelled",
        "Publish the event first.",
      );
      for (const p of s.people.filter((p) => !p.junior && p.marketing))
        notice(
          s,
          p.id,
          "event_invitation",
          `Club event: ${event.name}`,
          event.id,
          now,
          `event:${event.id}:${p.id}`,
        );
      break;
    }
    case "settings": {
      permit("privacy");
      s.settings.privacy = text(d, "privacy");
      s.settings.safeguarding = text(d, "safeguarding");
      s.settings.policy = text(d, "policy", 10000);
      if (d.retentionApproved === true) {
        requireValue(
          s.settings.privacy && s.settings.policy,
          "Publish privacy contact and approved policy before enabling retention.",
        );
        nonempty(d, "reason", 500);
      }
      s.settings.retentionApproved = d.retentionApproved === true;
      break;
    }
    case "operations_settings": {
      permit("membership");
      s.settings.trialMonths = number(d, "trialMonths", 1, 24);
      requireValue(
        Array.isArray(d.reminders) &&
          (d.reminders as unknown[]).every((n) => n === 3 || n === 10),
        "Reminders must be 3 or 10 days.",
      );
      s.settings.reminders = [...new Set(d.reminders as number[])];
      if (may(s, actor.id, "booking")) {
        s.settings.holdMinutes = number(d, "holdMinutes", 1, 1440);
        s.settings.cancelHours = number(d, "cancelHours", 0, 168);
      }
      if (may(s, actor.id, "attendance"))
        s.settings.dailyDigest = d.dailyDigest === true;
      break;
    }
    case "digest_settings": {
      permit("attendance");
      const time = text(d, "time", 5);
      requireValue(
        /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(time),
        "Use a valid Ireland local digest time.",
      );
      s.settings.dailyDigest = d.enabled === true;
      s.settings.digestTime = time;
      break;
    }
    case "data_export": {
      const subject = text(d, "player");
      requireValue(
        represents(s, actor.id, subject) || may(s, actor.id, "privacy"),
        "Own/guardian or privacy permission required.",
      );
      person(s, subject);
      d.reason = `Permitted personal-data export for ${subject}`;
      break;
    }
    case "data_request": {
      const subject = text(d, "player");
      requireValue(
        represents(s, actor.id, subject) || may(s, actor.id, "privacy"),
        "Own/guardian or privacy permission required.",
      );
      person(s, subject);
      const reason = nonempty(d, "reason", 500);
      s.work.push({
        id,
        player: subject,
        title:
          "Personal-data request: human verification and retention review required",
        state: "open",
        assignee: "",
        comments: [reason],
        permission: "privacy",
      });
      break;
    }
    case "work": {
      const w = s.work.find((w) => w.id === d.work);
      requireValue(w, "Work item not found.");
      const permission = w.permission ?? "membership";
      permit(permission);
      const target = text(d, "assignee");
      requireValue(
        !target || may(s, target, permission),
        "Assignee must retain the required management permission.",
      );
      const state = text(d, "state");
      requireValue(
        ["open", "claimed", "resolved"].includes(state),
        "Invalid work state.",
      );
      w.assignee = target;
      w.state = state as Work["state"];
      const comment = text(d, "comment", 500);
      if (comment)
        w.comments.push(
          `${new Date(now).toISOString()} · ${person(s, actor.id).name}: ${comment}`,
        );
      break;
    }
    case "jobs": {
      requireValue(
        actor.system || may(s, actor.id, "communications"),
        "Scheduler access required.",
      );
      runJobs(s, now);
      break;
    }
    default:
      throw new Error("Unknown club operation.");
  }
  const changes: Record<string, unknown> = {};
  for (const key of Object.keys(s) as (keyof ClubState)[])
    if (
      !["audit", "processed", "version"].includes(key) &&
      JSON.stringify(s[key]) !== JSON.stringify(auditBefore[key])
    ) {
      const before = auditBefore[key],
        after = s[key];
      if (key === "board") {
        const changed = [
          ...new Set(
            [...auditBefore.board.requests, ...s.board.requests].map(
              (r) => r.id,
            ),
          ),
        ].filter(
          (id) =>
            JSON.stringify(
              auditBefore.board.requests.find((r) => r.id === id),
            ) !== JSON.stringify(s.board.requests.find((r) => r.id === id)),
        );
        const tables = [
          ...new Set([
            ...Object.keys(auditBefore.board.tables),
            ...Object.keys(s.board.tables),
          ]),
        ].filter(
          (id) =>
            JSON.stringify(auditBefore.board.tables[id]) !==
            JSON.stringify(s.board.tables[id]),
        );
        changes.board = {
          requests: {
            before: auditBefore.board.requests.filter((r) =>
              changed.includes(r.id),
            ),
            after: s.board.requests.filter((r) => changed.includes(r.id)),
          },
          tables: {
            before: Object.fromEntries(
              tables.map((id) => [id, auditBefore.board.tables[id]]),
            ),
            after: Object.fromEntries(
              tables.map((id) => [id, s.board.tables[id]]),
            ),
          },
        };
        continue;
      }
      if (
        Array.isArray(before) &&
        Array.isArray(after) &&
        after.every((x) => x && typeof x === "object" && "id" in x) &&
        before.every((x) => x && typeof x === "object" && "id" in x)
      ) {
        const oldRows = before as { id: string }[],
          newRows = after as { id: string }[];
        const changed = [
          ...new Set([...oldRows, ...newRows].map((x) => x.id)),
        ].filter(
          (id) =>
            JSON.stringify(oldRows.find((x) => x.id === id)) !==
            JSON.stringify(newRows.find((x) => x.id === id)),
        );
        changes[key] = {
          before: oldRows.filter((x) => changed.includes(x.id)),
          after: newRows.filter((x) => changed.includes(x.id)),
        };
      } else changes[key] = { before, after };
    }
  if (command.type === "jobs" && Object.keys(changes).length === 0)
    return original;
  s.audit.push({
    id,
    actor: actor.id,
    action: command.type,
    at: new Date(now).toISOString(),
    reason:
      [
        "leave",
        "claim_profile",
        "extend_trial",
        "cancel_session",
        "close_hall",
        "reopen_hall",
        "reschedule_booking",
        "review",
        "score",
        "website",
        "event_state",
        "settings",
        "data_request",
        "data_export",
      ].includes(command.type) && typeof d.reason === "string"
        ? d.reason.trim().slice(0, 500)
        : undefined,
    acknowledgementSelected: ["membership", "payment"].includes(command.type)
      ? d.acknowledge === true
      : undefined,
    changes:
      command.type === "jobs" && s.settings.retentionApproved
        ? Object.fromEntries(
            Object.keys(changes).map((key) => [
              key,
              [
                "attendance",
                "board",
                "notices",
                "memberships",
                "payments",
                "notes",
              ].includes(key)
                ? { changed: true }
                : changes[key],
            ]),
          )
        : changes,
  });
  s.processed.push(`${actor.id}:${id}`);
  s.version++;
  return s;
}

function generateFixtures(
  s: ClubState,
  event: Competition,
  actor: string,
  now: number,
) {
  requireValue(
    !s.matches.some((m) => m.event === event.id),
    "Fixtures already generated.",
  );
  if (event.format === "round_robin") {
    event.teams.forEach((a, i) =>
      event.teams.slice(i + 1).forEach((b, j) => {
        const m = newMatch(
          `${event.id}:${i}:${i + j + 1}`,
          actor,
          [a, b],
          event.bestOf,
          event.id,
          event.session,
          now,
        );
        m.playedOn = event.date;
        s.matches.push(m);
      }),
    );
    return;
  }
  const size = 2 ** Math.ceil(Math.log2(event.teams.length));
  const rounds = Math.log2(size);
  // Spread byes across first-round pairs rather than producing empty-v-empty matches.
  const missing = size - event.teams.length;
  const ordered: string[][] = [];
  const teams = [...event.teams];
  for (let i = 0; i < size / 2; i++) {
    ordered.push(teams.shift() ?? []);
    ordered.push(i < missing ? [] : (teams.shift() ?? []));
  }
  for (let round = 1; round <= rounds; round++)
    for (let i = 0; i < size / 2 ** round; i++) {
      const m = newMatch(
        `${event.id}:r${round}:${i}`,
        actor,
        round === 1 ? [ordered[i * 2], ordered[i * 2 + 1]] : [[], []],
        event.bestOf,
        event.id,
        event.session,
      );
      m.round = round;
      m.playedOn = event.date;
      m.next =
        round < rounds ? `${event.id}:r${round + 1}:${Math.floor(i / 2)}` : "";
      m.nextSlot = i % 2;
      s.matches.push(m);
    }
  for (const m of s.matches.filter(
    (m) => m.event === event.id && m.round === 1,
  ))
    if (m.sides.some((t) => !t.length)) {
      m.status = "bye";
      m.reason = "Bye: no match result or statistics created";
      const team = m.sides.find((t) => t.length)!;
      if (m.next) matchFor(s, m.next).sides[m.nextSlot] = team;
    }
}

export function clubView(state: ClubState, actor: string): ClubState {
  const s = structuredClone(state);
  const roster =
    actor === s.owner ||
    s.people.some(
      (p) => p.id === actor && ["player", "guest"].includes(p.status),
    ) ||
    Boolean(s.grants[actor]?.length);
  const family = (id: string) => represents(state, actor, id);
  const membership = may(s, actor, "membership"),
    coach = may(s, actor, "coach"),
    booking = may(s, actor, "booking");
  s.people = s.people
    .filter((p) => roster || family(p.id))
    .map((p) =>
      membership || family(p.id)
        ? p
        : {
            ...p,
            email: "",
            emailVerified: false,
            mobile: "",
            guardians: [],
            marketing: false,
          },
    );
  s.grants = may(s, actor, "access")
    ? s.grants
    : { [actor]: s.grants[actor] ?? [] };
  s.memberships = s.memberships.filter((m) => membership || family(m.player));
  s.payments = s.payments.filter((p) =>
    s.memberships.some((m) => m.id === p.membership),
  );
  s.board.requests = s.board.requests.map((r) =>
    booking || family(r.playerId) ? r : { ...r, playerId: "", requesterId: "" },
  );
  s.attendance = s.attendance.filter(
    (a) =>
      may(s, actor, "attendance") ||
      may(s, actor, "events") ||
      coach ||
      family(a.player),
  );
  s.absences = s.absences.filter(
    (a) => may(s, actor, "attendance") || family(a.player),
  );
  s.reflections = s.reflections.filter((r) => coach || family(r.player));
  s.notes = coach ? s.notes : [];
  s.assessments = s.assessments.filter((a) => coach || family(a.player));
  s.notices = s.notices.filter(
    (n) => n.to === actor || may(s, actor, "communications"),
  );
  s.work = s.work.filter((w) => may(s, actor, w.permission ?? "membership"));
  s.audit = s.audit
    .filter(
      (a) =>
        !(
          ["data_request", "data_export"].includes(a.action) &&
          !may(s, actor, "privacy")
        ),
    )
    .filter(
      (a) =>
        may(s, actor, "access") ||
        (membership &&
          [
            "membership",
            "payment",
            "plan",
            "trial",
            "extend_trial",
            "person",
            "claim_profile",
            "leave",
          ].includes(a.action)) ||
        (coach &&
          [
            "match",
            "score",
            "review",
            "note",
            "assessment",
            "signoff",
            "reflection",
            "event",
            "event_state",
            "event_teams",
          ].includes(a.action)) ||
        (may(s, actor, "privacy") &&
          ["settings", "data_request", "data_export"].includes(a.action)),
    )
    .map((a) => ({
      ...a,
      changes: Object.fromEntries(
        Object.entries(a.changes).filter(
          ([key]) =>
            ![
              "challenges",
              ...(!coach ? ["notes", "reflections", "assessments"] : []),
              ...(!membership ? ["people", "memberships", "payments"] : []),
              ...(!may(s, actor, "booking") ? ["board"] : []),
              ...(!(
                may(s, actor, "attendance") ||
                may(s, actor, "events") ||
                coach
              )
                ? ["attendance", "absences"]
                : []),
              ...(!may(s, actor, "events") ? ["eventDrafts"] : []),
              ...(!may(s, actor, "content") ? ["pages"] : []),
              ...(!may(s, actor, "communications") ? ["notices"] : []),
            ].includes(key),
        ),
      ),
    }));
  s.audit = s.audit.map((a) => {
    const delta = a.changes.work as
      | { before?: Work[]; after?: Work[] }
      | undefined;
    if (!delta) return a;
    return {
      ...a,
      changes: {
        ...a.changes,
        work: {
          before: (delta.before ?? []).filter((w) =>
            may(s, actor, w.permission ?? "membership"),
          ),
          after: (delta.after ?? []).filter((w) =>
            may(s, actor, w.permission ?? "membership"),
          ),
        },
      },
    };
  });
  s.pages = s.pages.filter((p) => p.published || may(s, actor, "content"));
  s.processed = [];
  s.challenges = [];
  s.eventDrafts = s.eventDrafts.filter(
    (e) => e.author === actor || may(s, actor, "events"),
  );
  s.matches = s.matches.filter(
    (m) =>
      !m.draftEvent ||
      may(s, actor, "coach") ||
      may(s, actor, "events") ||
      m.sides.flat().some(family),
  );
  if (!roster && actor !== s.owner) {
    s.people = s.people.filter((p) => family(p.id));
    s.matches = s.matches.filter((m) => m.sides.flat().some(family));
    s.events = s.events
      .filter((e) => e.state === "published")
      .map((e) => ({ ...e, teams: [], delegates: [] }));
    s.assessments = s.assessments.filter((a) => family(a.player));
  }
  return s;
}

export function attendanceReport(s: ClubState, from: string, to: string) {
  const visits = s.attendance.filter(
    (a) =>
      !a.corrected &&
      localDay(Date.parse(a.at)) >= from &&
      localDay(Date.parse(a.at)) <= to,
  );
  const daily = new Map<string, number>(),
    weekly = new Map<string, number>(),
    monthly = new Map<string, number>(),
    players = new Map<string, number>(),
    segments = new Map<string, number>();
  for (const a of visits) {
    const day = localDay(Date.parse(a.at));
    daily.set(day, (daily.get(day) ?? 0) + 1);
    const date = new Date(day + "T12:00:00Z");
    const week = new Date(
      date.getTime() - ((date.getUTCDay() + 6) % 7) * 86400000,
    )
      .toISOString()
      .slice(0, 10);
    weekly.set(week, (weekly.get(week) ?? 0) + 1);
    monthly.set(day.slice(0, 7), (monthly.get(day.slice(0, 7)) ?? 0) + 1);
    players.set(a.player, (players.get(a.player) ?? 0) + 1);
    segments.set(a.membership, (segments.get(a.membership) ?? 0) + 1);
  }
  return {
    total: visits.length,
    unique: players.size,
    daily: [...daily].sort(),
    weekly: [...weekly].sort(),
    monthly: [...monthly].sort(),
    utilization: s.sessions
      .filter((x) => x.date >= from && x.date <= to)
      .map((session) => ({
        id: session.id,
        title: session.label,
        capacity: session.capacity,
        visits: visits.filter((a) => a.session === session.id).length,
      })),
    top: [...players].sort((a, b) => b[1] - a[1]),
    segments: [...segments],
  };
}

export function personalExport(s: ClubState, actor: string, player: string) {
  requireValue(
    represents(s, actor, player) || may(s, actor, "privacy"),
    "Own/guardian or privacy permission required.",
  );
  const profile = person(s, player),
    memberships = s.memberships.filter((m) => m.player === player);
  const matchIds = s.matches
    .filter((m) => m.sides.flat().includes(player))
    .map((m) => m.id);
  return {
    club: s.name,
    profile,
    memberships,
    payments: s.payments.filter((p) =>
      memberships.some((m) => m.id === p.membership),
    ),
    bookings: s.board.requests.filter((r) => r.playerId === player),
    attendance: s.attendance.filter((a) => a.player === player),
    availability: s.absences.filter((a) => a.player === player),
    matches: s.matches.filter((m) => matchIds.includes(m.id)),
    reflections: s.reflections.filter((r) => r.player === player),
    development: s.assessments.filter(
      (a) => a.player === player && a.published,
    ),
    restrictedRecordsRequireHumanReview: true,
  };
}

export function matchStatistics(
  s: ClubState,
  player: string,
  event = "",
  from = "",
  to = "",
) {
  const result = {
    reviewed: { played: 0, won: 0, lost: 0 },
    reported: { played: 0, won: 0, lost: 0 },
    pending: 0,
    incomplete: 0,
  };
  for (const m of s.matches.filter(
    (m) =>
      m.sides.flat().includes(player) &&
      (!event || m.event === event) &&
      (!from || m.playedOn >= from) &&
      (!to || m.playedOn <= to),
  )) {
    if (m.status === "bye") continue;
    if (m.status === "incomplete") {
      result.incomplete++;
      continue;
    }
    if (!["confirmed", "auto_approved", "reported"].includes(m.status)) {
      result.pending++;
      continue;
    }
    const scores = scoreResult(m),
      side = m.sides.findIndex((t) => t.includes(player));
    const group = m.status === "reported" ? result.reported : result.reviewed;
    group.played++;
    if (side === scores.winner) group.won++;
    else group.lost++;
  }
  return result;
}
