import { describe, it, expect } from "vitest";
import { applyClubCommand as apply } from "./operations";
import type { ClubState, Principal } from "./operations";
import { demoClub } from "./operations-demo";

const now = Date.parse("2026-11-07T13:00:00Z");
const player: Principal = { id: "demo-player", email: "parent@example.invalid", verified: true };
const admin: Principal = { id: "demo-admin", email: "owner@example.invalid", verified: true };
let sequence = 0;
const run = (s: ClubState, actor: Principal, type: string, data: Record<string, unknown>, time = now) =>
  apply(s, actor, { id: `booking-rule-${++sequence}`, type, data }, time);

/** The first upcoming session that is not on a public holiday, so the closure is the only reason for a refusal. */
function sessionFor(s: ClubState) {
  return s.sessions.find((x) => x.start > now && !s.publicHolidays.some((h) => h.date === x.date && h.decision !== "open"))!;
}

describe("club-added closures and public holidays stop table booking", () => {
  it("refuses a booking that falls inside a maintenance closure, and says why", () => {
    const s0 = demoClub(now);
    const session = sessionFor(s0);
    const closed = { ...s0, closures: [...s0.closures, { id: "maint", start: session.start - 3_600_000, end: session.start + 3_600_000, reason: "Floor resurfacing", active: true }] };
    expect(() => run(closed, player, "booking", { session: session.id, action: { type: "request", playerId: player.id, tableId: 7, place: 0 } })).toThrow("Floor resurfacing");
  });

  it("allows booking once the maintenance closure is lifted", () => {
    const s0 = demoClub(now);
    const session = sessionFor(s0);
    const closure = { id: "maint", start: session.start - 3_600_000, end: session.start + 3_600_000, reason: "Floor resurfacing", active: false };
    const open = { ...s0, closures: [...s0.closures, closure] };
    expect(() => run(open, player, "booking", { session: session.id, action: { type: "request", playerId: player.id, tableId: 7, place: 0 } })).not.toThrow();
  });

  it("refuses a booking on a confirmed public holiday", () => {
    const s0 = demoClub(now);
    const session = sessionFor(s0);
    const holiday = { date: session.date, name: "Test holiday", decision: "closed" as const };
    const closed = { ...s0, publicHolidays: [...s0.publicHolidays, holiday] };
    expect(() => run(closed, player, "booking", { session: session.id, action: { type: "request", playerId: player.id, tableId: 7, place: 0 } })).toThrow("public holiday");
  });

  it("keeps the admin-only path to change a holiday decision", () => {
    expect(() => run(demoClub(now), player, "import_holidays", { year: 2027 })).toThrow();
    expect(() => run(demoClub(now), admin, "import_holidays", { year: 2027 })).not.toThrow();
  });
});
