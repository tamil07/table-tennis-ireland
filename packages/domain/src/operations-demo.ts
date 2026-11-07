import { emptyClub, localDay, addCalendarMonths } from "./operations.ts";
import { upcomingPracticeSessions } from "./session-booking.ts";
export const pilotClubId = "00000000-0000-4000-8000-000000000001";
export const demoAccounts = [
  { id: "demo-admin", name: "Management owner" },
  { id: "demo-coach", name: "Coach" },
  { id: "demo-player", name: "Player / parent" },
  { id: "demo-opponent", name: "Opponent" },
  { id: "demo-guest", name: "Guest" },
];
export function demoClub(now = Date.now()) {
  const s = emptyClub(pilotClubId, "Leeside Table Tennis Club", "demo-admin");
  s.website = "https://table-tennis-ireland.ttclubsie.workers.dev";
  s.people = demoAccounts.map((a) => ({
    id: a.id,
    name: a.name,
    email: `${a.id}@example.invalid`,
    emailVerified: true,
    mobile: "",
    junior: false,
    guardians: [],
    status: a.id === "demo-guest" ? ("guest" as const) : ("player" as const),
    marketing: false,
  }));
  s.people.push({
    id: "demo-junior",
    name: "Sam · linked child",
    email: "",
    emailVerified: false,
    mobile: "",
    junior: true,
    guardians: ["demo-player"],
    status: "player",
    marketing: false,
  });
  s.grants["demo-coach"] = ["coach", "events", "attendance"];
  s.settings.privacy = "Synthetic privacy contact — no live data";
  s.settings.safeguarding =
    "Synthetic safeguarding example — no real appointment";
  s.settings.policy =
    "Synthetic workspace only. Do not enter real member data.";
  s.plans = [
    {
      id: "full",
      name: "Full membership",
      months: 6,
      price: 19000,
      entitlement: "Five weekly sessions; source snapshot only",
      active: true,
    },
  ];
  s.memberships = [
    {
      id: "demo-membership",
      player: "demo-player",
      plan: "full",
      start: localDay(now),
      end: addCalendarMonths(localDay(now), 6),
      status: "active",
      payment: "paid",
      amount: 19000,
      receivedOn: localDay(now),
      reference: "Synthetic example only",
      snapshot: structuredClone(s.plans[0]),
    },
  ];
  s.sessions = [
    {
      id: "demo-current",
      date: localDay(now),
      label: "Synthetic session happening now",
      start: now - 1800000,
      end: now + 5400000,
      capacity: 12,
      tables: 3,
      cancelled: false,
    },
    ...upcomingPracticeSessions(now).map((p) => ({
      ...p,
      capacity: 48,
      tables: 12,
      cancelled: false,
    })),
  ];
  for (const p of s.sessions)
    s.board.tables[p.id] = Array.from({ length: p.tables }, (_, i) => ({
      id: i + 1,
      use: i < (p.tables === 12 ? 6 : 0) ? "coaching" : "reservable",
    }));
  return s;
}
