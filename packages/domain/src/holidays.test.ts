import { describe, expect, it } from "vitest";
import { applyClubCommand, demoClub } from "./index";
import { closureWarnings, dublinMidnight } from "./operations";
import type { ClubState, Principal } from "./operations";

const now = Date.parse("2026-11-16T12:00:00Z");
const owner: Principal = { id: "demo-admin", email: "owner@example.invalid", verified: true };
let sequence = 0;
const run = (s: ClubState, type: string, data: Record<string, unknown>) =>
  applyClubCommand(s, owner, { id: `holiday-test-${++sequence}`, type, data }, now);

describe("public holidays and closures", () => {
  it("imports a year of Irish public holidays as pending, once", () => {
    let s = run(demoClub(now), "import_holidays", { year: 2026 });
    expect(s.publicHolidays).toHaveLength(12);
    expect(s.publicHolidays.every((h) => h.decision === "pending")).toBe(true);
    s = run(s, "import_holidays", { year: 2026 });
    expect(s.publicHolidays).toHaveLength(12);
  });

  it("covers ten years and refuses years outside them", () => {
    const s = run(demoClub(now), "import_holidays", { year: 2035 });
    expect(s.publicHolidays.length).toBe(11);
    expect(() => run(demoClub(now), "import_holidays", { year: 2040 })).toThrow("2026 to 2035");
  });

  it("closes a confirmed holiday as a Dublin day, and reopening removes it", () => {
    let s = run(demoClub(now), "import_holidays", { year: 2026 });
    s = run(s, "decide_holiday", { date: "2026-12-25", decision: "closed" });
    const closure = s.closures.find((c) => c.id === "holiday-2026-12-25");
    expect(closure).toMatchObject({ reason: "Christmas Day", active: true });
    expect(closure?.start).toBe(dublinMidnight("2026-12-25"));
    expect(closure?.end).toBe(dublinMidnight("2026-12-26"));
    s = run(s, "decide_holiday", { date: "2026-12-25", decision: "open" });
    expect(s.closures.some((c) => c.id === "holiday-2026-12-25")).toBe(false);
  });

  it("refuses a decision for a holiday that was not imported", () => {
    expect(() => run(demoClub(now), "decide_holiday", { date: "2026-12-25", decision: "closed" })).toThrow("Import the holiday first");
  });

  it("warns about upcoming holidays without a decision", () => {
    const s = run(demoClub(now), "import_holidays", { year: 2026 });
    const warnings = closureWarnings(s, Date.parse("2026-12-01T09:00:00Z"));
    expect(warnings.some((w) => w.includes("Christmas Day") && w.includes("no decision"))).toBe(true);
  });

  it("handles a Dublin midnight across the spring clock change", () => {
    // Irish clocks change at 01:00 UTC on 29 March 2026, so midnight that day is still 00:00 UTC.
    expect(dublinMidnight("2026-03-29")).toBe(Date.parse("2026-03-29T00:00:00Z"));
    // In summer time, Dublin midnight is 23:00 UTC the day before.
    expect(dublinMidnight("2026-07-01")).toBe(Date.parse("2026-06-30T23:00:00Z"));
    expect(dublinMidnight("2026-01-15")).toBe(Date.parse("2026-01-15T00:00:00Z"));
  });
});
