export type ClubId = string;
export type UserId = string;

export type ClubRole =
  | "player"
  | "guardian"
  | "coach"
  | "admin"
  | "scanner_operator";

export type MembershipStatus =
  | "pending"
  | "trial"
  | "active"
  | "approaching_expiry"
  | "expired"
  | "cancelled"
  | "none";

export interface ClubBranding {
  primary: string;
  accent: string;
  logoUrl?: string;
}

export interface ClubSummary {
  id: ClubId;
  name: string;
  slug: string;
  county: string;
  websiteUrl: string;
  branding: ClubBranding;
}

export interface ClubRelationship {
  club: ClubSummary;
  roles: ClubRole[];
  membershipStatus: MembershipStatus;
  membershipEndsOn?: string;
}

export interface SessionSummary {
  id: string;
  clubId: ClubId;
  title: string;
  audience: string;
  day: string;
  time: string;
  venue: string;
}

export interface DashboardMetric {
  label: string;
  value: string;
  detail: string;
}

export interface FeatureDefinition {
  title: string;
  description: string;
  capability: string;
  status: "foundation" | "planned";
}
