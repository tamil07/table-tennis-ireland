import { describe, it, expect } from "vitest";
import { applyClubCommand as apply } from "./operations";
import type { ClubState, Principal } from "./operations";
import { demoClub } from "./operations-demo";
import { defaultTimetable, dublinInstant, generateSessions } from "./timetable";

const now = Date.parse("2026-11-07T13:00:00Z"); // a Saturday in Dublin
const admin: Principal = { id: "demo-admin", email: "owner@example.invalid", verified: true };
const coach: Principal = { id: "demo-coach", email: "coach@example.invalid", verified: true };
const player: Principal = { id: "demo-player", email: "parent@example.invalid", verified: true };
let sequence = 0;
const run = (s: ClubState, actor: Principal, type: string, data: Record<string, unknown>, time = now) =>
  apply(s, actor, { id: `tt-${++sequence}`, type, data }, time);
const withCoach = (s: ClubState) => ({ ...s, grants: { ...s.grants, [coach.id]: ["coach"] as ClubState["grants"][string] } });
const monday = (s: ClubState, date: string) => s.sessions.find((x) => x.id === `tt-mon-${date}`);
/** Any command brings the dated timetable sessions up to date. This re-saves Monday unchanged. */
const sync = (s: ClubState) =>
  run(s, coach, "timetable_weekly", {
    weekly: "mon", day: 1, start: "18:00", end: "20:00", title: "Monday training", venue: "James Kenneally Sports Hall, Hollyhill Ln, Gurranabraher, Cork",
    audience: "All ages & abilities", capacity: 12, tables: 6, from: "2026-09-01", reason: "Timetable checked",
  });

describe("timetable generation", () => {
  it("keeps the wall-clock time in Dublin across the clock change", () => {
    const summer = dublinInstant("2027-07-05", "18:00");
    const winter = dublinInstant("2026-12-07", "18:00");
    expect(new Date(summer).toISOString()).toBe("2027-07-05T17:00:00.000Z");
    expect(new Date(winter).toISOString()).toBe("2026-12-07T18:00:00.000Z");
  });

  it("generates the weekly sessions and skips closed and cancelled dates", () => {
    const tt = defaultTimetable();
    const mondays = generateSessions(tt, "2026-12-07", "2026-12-14").filter((s) => s.weeklyId === "mon");
    expect(mondays.map((s) => s.date)).toEqual(["2026-12-07", "2026-12-14"]);
    tt.overrides.push({ id: "c", date: "2026-12-07", action: "cancel", weeklyId: "mon", start: null, end: null, title: null, venue: null, reason: "x", active: true });
    const cancelled = generateSessions(tt, "2026-12-07", "2026-12-07").find((s) => s.weeklyId === "mon");
    expect(cancelled?.cancelledByOverride).toBe(true);
  });

  it("applies a one-date time change to that date only", () => {
    const tt = defaultTimetable();
    tt.overrides.push({ id: "r", date: "2026-12-10", action: "retime", weeklyId: "thu", start: "18:00", end: "20:00", title: null, venue: null, reason: "school hall", active: true });
    const thursdays = generateSessions(tt, "2026-12-03", "2026-12-17").filter((s) => s.weeklyId === "thu");
    expect(thursdays.find((s) => s.date === "2026-12-10")!.start).toBe(dublinInstant("2026-12-10", "18:00"));
    expect(thursdays.find((s) => s.date === "2026-12-17")!.start).toBe(dublinInstant("2026-12-17", "17:30"));
  });
});

describe("timetable commands", () => {
  it("lets a coach change the weekly time and the change reaches booking sessions", () => {
    const s = withCoach(demoClub(now));
    const changed = run(s, coach, "timetable_weekly", {
      weekly: "mon",
      day: 1,
      start: "18:30",
      end: "20:30",
      title: "Monday training",
      venue: "James Kenneally Sports Hall",
      audience: "All ages & abilities",
      capacity: 12,
      tables: 6,
      from: "2026-11-09",
      reason: "Later start from December",
    });
    const session = monday(changed, "2026-11-16")!;
    expect(session.start).toBe(dublinInstant("2026-11-16", "18:30"));
    expect(session.source).toBe("timetable");
    expect(changed.timetableLog!.at(-1)!.summary).toContain("Monday 18:30–20:30");
  });

  it("refuses timetable changes from a member", () => {
    expect(() =>
      run(demoClub(now), player, "timetable_weekly", {
        day: 1, start: "18:00", end: "20:00", title: "x", venue: "x", audience: "x", capacity: 12, tables: 6, from: "2026-11-09", reason: "x",
      }),
    ).toThrow("events or coach");
  });

  it("requires a reason and valid times", () => {
    const s = withCoach(demoClub(now));
    expect(() => run(s, coach, "timetable_weekly", { day: 1, start: "20:00", end: "18:00", title: "x", venue: "x", audience: "x", capacity: 12, tables: 6, from: "2026-11-09", reason: "x" })).toThrow("end after");
    expect(() => run(s, coach, "timetable_weekly", { day: 1, start: "18:00", end: "20:00", title: "x", venue: "x", audience: "x", capacity: 12, tables: 6, from: "2026-11-09" })).toThrow("reason");
  });

  it("cancels one date and records the change", () => {
    const s = withCoach(demoClub(now));
    const out = run(s, coach, "timetable_override", { date: "2026-11-16", action: "cancel", weekly: "mon", reason: "Coach away" });
    expect(monday(out, "2026-11-16")!.cancelled).toBe(true);
    expect(monday(out, "2026-11-23")!.cancelled).toBe(false);
    expect(out.timetableLog!.at(-1)!.summary).toBe("2026-11-16: Monday training cancelled.");
  });

  it("adds an extra session on one date", () => {
    const s = withCoach(demoClub(now));
    const out = run(s, coach, "timetable_override", { date: "2026-11-14", action: "extra", start: "10:00", end: "12:00", title: "Junior drills", venue: "James Kenneally Sports Hall", reason: "Extra" });
    expect(out.sessions.some((x) => x.id.startsWith("tt-extra-") && x.label === "Junior drills")).toBe(true);
  });

  it("removes a one-date change and returns the date to the timetable", () => {
    const s = withCoach(demoClub(now));
    const cancelled = run(s, coach, "timetable_override", { date: "2026-11-16", action: "cancel", weekly: "mon", reason: "Coach away" });
    const override = cancelled.timetable!.overrides[0];
    const back = run(cancelled, coach, "timetable_remove_override", { override: override.id, reason: "Coach back" });
    expect(monday(back, "2026-11-16")!.cancelled).toBe(false);
  });
});

describe("reconciliation with bookings, closures and holidays", () => {
  const bookOn = (s: ClubState, date: string) => {
    const session = s.sessions.find((x) => x.id === `tt-mon-${date}`)!;
    return run(s, player, "booking", { session: session.id, action: { type: "request", playerId: player.id, tableId: 7, place: 0 } });
  };

  it("keeps a booking when its session moves, and flags it for staff review", () => {
    let s = bookOn(sync(withCoach(demoClub(now))), "2026-11-16");
    s = run(s, coach, "timetable_override", { date: "2026-11-16", action: "retime", weekly: "mon", start: "19:00", end: "21:00", reason: "Hall change" });
    expect(monday(s, "2026-11-16")!.start).toBe(dublinInstant("2026-11-16", "19:00"));
    expect(monday(s, "2026-11-16")!.changedAt).toBe(now);
    expect(s.board.requests.some((r) => r.status === "confirmed" && r.sessionId === "tt-mon-2026-11-16")).toBe(true);
  });

  it("a closure stops the sessions and keeps the bookings for review, not cancelled", () => {
    let s = bookOn(sync(withCoach(demoClub(now))), "2026-11-16");
    s = run(s, admin, "close_hall", { start: "2026-11-15T00:00", end: "2026-11-18T00:00", reason: "Floor resurfacing" });
    expect(monday(s, "2026-11-16")!.cancelled).toBe(true);
    expect(monday(s, "2026-11-16")!.closedReason).toBe("Floor resurfacing");
    expect(s.board.requests.find((r) => r.sessionId === "tt-mon-2026-11-16")!.status).toBe("confirmed");
    expect(() => bookOn(s, "2026-11-16")).toThrow();
  });

  it("reopening the closure makes the sessions bookable again", () => {
    let s = sync(run(withCoach(demoClub(now)), admin, "close_hall", { start: "2026-11-15T00:00", end: "2026-11-18T00:00", reason: "Maintenance" }));
    s = run(s, admin, "reopen_hall", { closure: s.closures.at(-1)!.id, reason: "Finished" });
    expect(monday(s, "2026-11-16")!.cancelled).toBe(false);
  });

  it("a public holiday closed by decision stops the session and is recorded", () => {
    let s = run(withCoach(demoClub(now)), admin, "import_holidays", { year: 2026 });
    s = run(s, admin, "decide_holiday", { date: "2026-12-28", decision: "closed" });
    const substitute = s.sessions.find((x) => x.id === "tt-mon-2026-12-28");
    expect(substitute?.cancelled).toBe(true);
    expect(s.timetableLog!.at(-1)!.summary).toContain("2026-12-28");
  });

  it("every change is in the history in order", () => {
    let s = withCoach(demoClub(now));
    s = run(s, coach, "timetable_override", { date: "2026-11-16", action: "cancel", weekly: "mon", reason: "A" });
    s = run(s, coach, "timetable_override", { date: "2026-11-23", action: "cancel", weekly: "mon", reason: "B" });
    expect(s.timetableLog!.map((e) => e.reason)).toEqual(["A", "B"]);
  });
});
