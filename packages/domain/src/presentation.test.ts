import { describe, expect, it } from "vitest";
import {
  clubOverview,
  demoClub,
  leesideSessions,
  nextWeeklySession,
} from "./index";

// Dublin is UTC+0 in winter, UTC+1 in summer (BST).
describe("nextWeeklySession", () => {
  it("finds a session later the same day", () => {
    const r = nextWeeklySession(leesideSessions, Date.parse("2026-11-16T12:00:00Z")); // Monday noon
    expect(r?.session.day).toBe("Monday");
    expect(r?.daysAhead).toBe(0);
    expect(r?.inProgress).toBe(false);
  });
  it("reports a session in progress", () => {
    const r = nextWeeklySession(leesideSessions, Date.parse("2026-11-16T18:30:00Z"));
    expect(r).toMatchObject({ daysAhead: 0, inProgress: true });
    expect(r?.session.day).toBe("Monday");
  });
  it("moves to the next training day after the last one finished", () => {
    const r = nextWeeklySession(leesideSessions, Date.parse("2026-11-16T20:00:00Z"));
    expect(r?.session.day).toBe("Wednesday");
    expect(r?.daysAhead).toBe(2);
  });
  it("wraps from Sunday evening to Monday", () => {
    const r = nextWeeklySession(leesideSessions, Date.parse("2026-11-15T16:00:00Z"));
    expect(r?.session.day).toBe("Monday");
    expect(r?.daysAhead).toBe(1);
  });
  it("uses Dublin summer time rather than UTC", () => {
    // 17:30 UTC in July is 18:30 Dublin: Friday 18:00-20:00 is in progress.
    const r = nextWeeklySession(leesideSessions, Date.parse("2026-07-17T17:30:00Z"));
    expect(r).toMatchObject({ daysAhead: 0, inProgress: true });
    expect(r?.session.day).toBe("Friday");
  });
  it("returns null when nothing can be parsed", () => {
    expect(nextWeeklySession([{ day: "Mon", time: "soon", title: "x" }], 0)).toBeNull();
    expect(nextWeeklySession([], 0)).toBeNull();
  });
});

describe("clubOverview", () => {
  const now = Date.parse("2026-11-16T12:00:00Z");
  it("shows management counts to the owner", () => {
    const keys = clubOverview(demoClub(now), "demo-admin", now).items.map((i) => i.key);
    expect(keys).toEqual(
      expect.arrayContaining(["sessions", "requests", "expiring", "attendance", "work"]),
    );
  });
  it("hides permission-gated counts from a plain player", () => {
    const keys = clubOverview(demoClub(now), "demo-player", now).items.map((i) => i.key);
    expect(keys).toEqual(["sessions"]);
  });
  it("suggests setup steps for an empty club", () => {
    const empty = { ...demoClub(now), plans: [], sessions: [] };
    const o = clubOverview(empty, "demo-admin", now);
    expect(o.setup.map((s) => s.key)).toEqual(
      expect.arrayContaining(["plans", "sessions"]),
    );
  });
});
