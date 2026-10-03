import type { ClubRelationship, ClubRole, MembershipStatus } from "./types";

const adminRoles = new Set<ClubRole>(["admin", "coach"]);

export function canManageClub(relationship: ClubRelationship): boolean {
  return relationship.roles.some((role) => adminRoles.has(role));
}

export function isAttendanceAllowed(status: MembershipStatus): boolean {
  return !["cancelled"].includes(status);
}

export function needsMembershipFollowUp(status: MembershipStatus): boolean {
  return ["expired", "none"].includes(status);
}

export function selectClubContext(
  relationships: ClubRelationship[],
  clubId: string,
): ClubRelationship | undefined {
  return relationships.find((relationship) => relationship.club.id === clubId);
}

export function resolveClubByHost(
  hostname: string,
  relationships: ClubRelationship[],
): ClubRelationship | undefined {
  const normalized = hostname.toLowerCase().replace(/^www\./, "");
  return relationships.find(({ club }) => {
    const clubHost = new URL(club.websiteUrl).hostname
      .toLowerCase()
      .replace(/^www\./, "");
    return clubHost === normalized;
  });
}
