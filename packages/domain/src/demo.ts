import type {
  ClubRelationship,
  DashboardMetric,
  FeatureDefinition,
  SessionSummary,
} from "./types";

export const demoRelationships: ClubRelationship[] = [
  {
    club: {
      id: "00000000-0000-4000-8000-000000000001",
      name: "Leeside Table Tennis Club",
      slug: "leeside",
      county: "Cork",
      websiteUrl: "https://leesidett.example",
      branding: { primary: "#103a2e", accent: "#d7ff55" },
    },
    roles: ["player", "coach"],
    membershipStatus: "active",
    membershipEndsOn: "2027-08-31",
  },
  {
    club: {
      id: "00000000-0000-4000-8000-000000000002",
      name: "Dublin Demo Table Tennis Club",
      slug: "dublin-demo",
      county: "Dublin",
      websiteUrl: "https://dublin-demo.example",
      branding: { primary: "#182b52", accent: "#ffcf5c" },
    },
    roles: ["player"],
    membershipStatus: "approaching_expiry",
    membershipEndsOn: "2026-10-13",
  },
];

export const leesideSessions: SessionSummary[] = [
  { id: "s1", clubId: demoRelationships[0].club.id, title: "Junior coaching", audience: "Juniors", day: "Monday", time: "18:00–19:30", venue: "Leeside hall" },
  { id: "s2", clubId: demoRelationships[0].club.id, title: "Open practice", audience: "All members", day: "Tuesday", time: "19:00–21:00", venue: "Leeside hall" },
  { id: "s3", clubId: demoRelationships[0].club.id, title: "League training", audience: "Adult players", day: "Wednesday", time: "19:30–21:30", venue: "Leeside hall" },
  { id: "s4", clubId: demoRelationships[0].club.id, title: "Development squad", audience: "Invited players", day: "Friday", time: "18:30–20:00", venue: "Leeside hall" },
  { id: "s5", clubId: demoRelationships[0].club.id, title: "Weekend social", audience: "Members & guests", day: "Saturday", time: "10:00–12:00", venue: "Leeside hall" },
];

export const dashboardMetrics: DashboardMetric[] = [
  { label: "Today", value: "28", detail: "24 active · 4 need follow-up" },
  { label: "This week", value: "93", detail: "67 unique players" },
  { label: "Expiring soon", value: "11", detail: "10-day or 3-day window" },
  { label: "Open actions", value: "6", detail: "2 scanner · 4 membership" },
];

export const platformFeatures: FeatureDefinition[] = [
  { title: "Memberships", description: "Applications, trials, manual payments, periods and renewal reminders.", capability: "membership-management", status: "planned" },
  { title: "Attendance", description: "NFC and QR kiosk check-in, offline queue, alerts and trends.", capability: "attendance-tracking", status: "planned" },
  { title: "Matches", description: "Singles and doubles scoring, review, auto-approval and history.", capability: "match-records", status: "planned" },
  { title: "Tournaments", description: "Round-robin leagues, knockouts, guests and delegated organizers.", capability: "tournament-management", status: "planned" },
  { title: "Development", description: "Coach notes and published strengths, improvements and goals.", capability: "player-development", status: "planned" },
  { title: "Club admin", description: "Portfolio, members, shared work, reports and audit history.", capability: "club-administration", status: "foundation" },
];
