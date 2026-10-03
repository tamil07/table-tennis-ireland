import { describe, expect, it } from "vitest";
import { demoRelationships } from "./demo";
import {
  canManageClub,
  isAttendanceAllowed,
  needsMembershipFollowUp,
  resolveClubByHost,
  selectClubContext,
} from "./club-context";

describe("club context", () => {
  it("selects only the requested relationship", () => {
    expect(selectClubContext(demoRelationships, demoRelationships[1].club.id)?.club.county).toBe("Dublin");
  });

  it("does not inherit coach permission across clubs", () => {
    expect(canManageClub(demoRelationships[0])).toBe(true);
    expect(canManageClub(demoRelationships[1])).toBe(false);
  });

  it("resolves a known website host", () => {
    expect(resolveClubByHost("www.leesidett.example", demoRelationships)?.club.slug).toBe("leeside");
  });

  it("records attendance while flagging membership follow-up", () => {
    expect(isAttendanceAllowed("expired")).toBe(true);
    expect(needsMembershipFollowUp("expired")).toBe(true);
    expect(needsMembershipFollowUp("active")).toBe(false);
  });
});
