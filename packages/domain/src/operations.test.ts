import { describe, it, expect } from "vitest";
import {
  applyClubCommand as apply,
  clubView,
  emptyClub,
  membershipAt,
  addCalendarMonths,
  localDay,
  notificationEligible,
  scoreResult,
  standings,
  coachingSummary,
  personalExport,
  matchStatistics,
} from "./operations";
import type { ClubState, ClubCommand, Principal } from "./operations";
import { demoClub } from "./operations-demo";
const now = Date.parse("2026-11-07T13:00:00Z");
const admin: Principal = {
    id: "demo-admin",
    email: "owner@example.invalid",
    verified: true,
  },
  player: Principal = {
    id: "demo-player",
    email: "parent@example.invalid",
    verified: true,
  },
  opponent: Principal = {
    id: "demo-opponent",
    email: "opponent@example.invalid",
    verified: true,
  },
  coach: Principal = {
    id: "demo-coach",
    email: "coach@example.invalid",
    verified: true,
  };
let sequence = 0;
const run = (
  s: ClubState,
  actor: Principal,
  type: string,
  data: Record<string, unknown>,
  time = now,
) => apply(s, actor, { id: `command-${++sequence}`, type, data }, time);
const match = (s = demoClub(now), external = false) => {
  if (external)
    s = run(s, admin, "event", {
      name: "External event",
      date: "2026-11-07",
      session: "",
      external: true,
      format: "round_robin",
      teams: [],
      bestOf: 3,
      winPoints: 2,
      lossPoints: 1,
      source: "",
    });
  return run(s, player, "match", {
    sides: [["demo-player"], [external ? "demo-guest" : "demo-opponent"]],
    event: external ? s.events[0].id : "",
    session: "",
    bestOf: 3,
    table: "",
  });
};
const score = (s: ClubState, actor = player, incomplete = false) =>
  run(s, actor, "score", {
    match: s.matches[0].id,
    games: [
      [11, 5],
      [11, 9],
    ],
    aggregate: null,
    incomplete,
  });
describe("club operations security and workflows", () => {
  it("blocks dependent bracket results during a dispute and resets scores when the qualifier changes", () => {
    let s = run(demoClub(now), admin, "event", {
      name: "Four-player cup",
      date: "2026-11-07",
      session: "demo-current",
      external: false,
      format: "single_elimination",
      teams: [[player.id], [opponent.id], [coach.id], [admin.id]],
      bestOf: 1,
      winPoints: 2,
      lossPoints: 1,
      source: "",
    });
    s = run(s, admin, "event_state", {
      event: s.events[0].id,
      state: "published",
    });
    s = run(s, admin, "event_state", {
      event: s.events[0].id,
      state: "in_progress",
      present: true,
    });
    const first = s.matches.filter((m) => m.round === 1).map((m) => m.id);
    const final = s.matches.find((m) => m.round === 2)!.id;
    for (const id of first) {
      s = run(s, coach, "score", {
        match: id,
        games: [[11, 5]],
        aggregate: null,
      });
      s = run(s, coach, "review", {
        match: id,
        approve: true,
        reason: "Reviewed",
      });
    }
    s = run(s, coach, "score", {
      match: final,
      games: [[11, 5]],
      aggregate: null,
    });
    s = run(s, coach, "review", {
      match: final,
      approve: true,
      reason: "Reviewed final",
    });
    s = run(s, coach, "review", {
      match: first[0],
      approve: false,
      reason: "Wrong winning side",
    });
    expect(s.matches.find((m) => m.id === final)?.status).toBe(
      "changes_requested",
    );
    expect(() =>
      run(s, coach, "review", {
        match: final,
        approve: true,
        reason: "Cannot bypass parent",
      }),
    ).toThrow("Previous bracket");
    s = run(s, coach, "score", {
      match: first[0],
      games: [[5, 11]],
      aggregate: null,
    });
    s = run(s, coach, "review", {
      match: first[0],
      approve: true,
      reason: "Corrected qualifier",
    });
    expect(s.matches.find((m) => m.id === final)?.sides[0]).toEqual([
      opponent.id,
    ]);
    expect(s.matches.find((m) => m.id === final)?.games).toEqual([]);
    expect(s.matches.find((m) => m.id === final)?.status).toBe("draft");
  });
  it("rechecks guardian authority before sending a queued payment receipt", () => {
    const s = demoClub(now);
    s.memberships.push({
      ...s.memberships[0],
      id: "junior-period",
      player: "demo-junior",
    });
    const notice = {
      id: "receipt",
      key: "receipt",
      to: player.id,
      kind: "payment_acknowledgement",
      entity: "junior-period",
      subject: "",
      created: "",
      email: "pending" as const,
      attempts: 0,
    };
    expect(notificationEligible(s, notice, now)).toBe(true);
    s.people.find((p) => p.id === "demo-junior")!.guardians = [admin.id];
    expect(notificationEligible(s, notice, now)).toBe(false);
  });
  it("does not leak privacy-request text through access-management audit", () => {
    let s = run(demoClub(now), admin, "grant", {
      player: opponent.id,
      permissions: ["access"],
    });
    s = run(s, player, "data_request", {
      player: player.id,
      reason: "PRIVATE-REQUEST-TEXT",
    });
    expect(JSON.stringify(clubView(s, opponent.id))).not.toContain(
      "PRIVATE-REQUEST-TEXT",
    );
  });
  it("does not allow coach confirmation of a draft without a winning score", () => {
    const s = match();
    expect(() =>
      run(s, coach, "review", {
        match: s.matches[0].id,
        approve: true,
        reason: "Checked",
      }),
    ).toThrow("winner");
  });
  it("separates reported from reviewed statistics and omits incomplete outcomes", () => {
    const s = score(match(undefined, true));
    const stats = matchStatistics(s, player.id);
    expect(stats.reported.played).toBe(1);
    expect(stats.reviewed.played).toBe(0);
    expect(
      matchStatistics(score(match(), player, true), player.id).incomplete,
    ).toBe(1);
  });
  it("limits personal exports to a permitted subject and excludes private coach notes", () => {
    const s = run(demoClub(now), coach, "note", {
      player: player.id,
      body: "Restricted assessment",
    });
    expect(() => personalExport(s, opponent.id, player.id)).toThrow(
      "permission",
    );
    expect(
      JSON.stringify(personalExport(s, player.id, player.id)),
    ).not.toContain("Restricted assessment");
  });
  it("keeps newsletter consent separate from membership and roster access", () => {
    const subscriber = {
      id: "newsletter",
      email: "newsletter@example.invalid",
      verified: true,
    };
    let s = run(demoClub(now), subscriber, "subscribe", {
      name: "Subscriber",
      marketing: true,
      consent: true,
    });
    expect(s.memberships.some((m) => m.player === subscriber.id)).toBe(false);
    expect(clubView(s, subscriber.id).people).toHaveLength(1);
    s = run(s, subscriber, "subscribe", { marketing: false, consent: false });
    expect(s.people.find((p) => p.id === subscriber.id)?.marketing).toBe(false);
  });
  it("retains the original allocation when a cross-session reschedule fails", () => {
    let s = demoClub(now);
    const sessions = s.sessions.filter((x) => x.start > now);
    s = run(s, player, "booking", {
      session: sessions[0].id,
      action: { type: "request", playerId: player.id, tableId: 7, place: 0 },
    });
    const original = s.board.requests[0];
    expect(() =>
      run(s, admin, "reschedule_booking", {
        booking: original.id,
        session: sessions[1].id,
        table: 1,
        place: 1,
        reason: "Move",
      }),
    ).toThrow("reservable");
    expect(s.board.requests[0].status).toBe("pending");
    const moved = run(s, admin, "reschedule_booking", {
      booking: original.id,
      session: sessions[1].id,
      table: 7,
      place: 1,
      reason: "New day",
    });
    expect(moved.board.requests[0].status).toBe("cancelled");
    expect(moved.board.requests[1].sessionId).toBe(sessions[1].id);
  });
  it("starts live clubs with an empty editable catalogue", () => {
    expect(emptyClub("c", "Club", "owner").plans).toEqual([]);
  });
  it("rejects unverified commands", () => {
    expect(() =>
      run(demoClub(now), { ...player, verified: false }, "child", {
        name: "Child",
      }),
    ).toThrow("Verify");
  });
  it("uses trusted identity rather than supplied email when joining", () => {
    const s = run(
      demoClub(now),
      { id: "new", email: "verified@example.invalid", verified: true },
      "join",
      {
        name: "New",
        email: "fake",
        mobile: "",
        marketing: false,
        consent: true,
      },
    );
    expect(s.people.at(-1)?.email).toBe("verified@example.invalid");
  });
  it("does not expose club contacts or private notes to ordinary players", () => {
    const s = run(demoClub(now), coach, "note", {
      player: player.id,
      body: "Private working note",
    });
    const view = clubView(s, player.id);
    expect(view.notes).toEqual([]);
    expect(view.people.find((p) => p.id === coach.id)?.email).toBe("");
  });
  it("does not expose private changes through access-manager audit", () => {
    let s = run(demoClub(now), admin, "grant", {
      player: opponent.id,
      permissions: ["access"],
    });
    s = run(s, coach, "note", { player: player.id, body: "Secret assessment" });
    expect(JSON.stringify(clubView(s, opponent.id))).not.toContain(
      "Secret assessment",
    );
  });
  it("does not expose reflections to an opponent or another club", () => {
    let s = match();
    s = run(s, player, "reflection", {
      match: s.matches[0].id,
      player: player.id,
      good: [],
      improve: ["backhand"],
      note: "My private thought",
    });
    expect(clubView(s, opponent.id).reflections).toEqual([]);
    expect(clubView(s, "other-club-user").matches).toEqual([]);
    expect(clubView(s, coach.id).reflections).toHaveLength(1);
  });
  it("checks current permission after revocation", () => {
    let s = run(demoClub(now), admin, "grant", {
      player: player.id,
      permissions: ["membership"],
    });
    s = run(s, admin, "grant", { player: player.id, permissions: [] });
    expect(() =>
      run(s, player, "plan", {
        name: "Unauthorised",
        months: 6,
        price: 0,
        entitlement: "",
      }),
    ).toThrow("membership permission");
  });
  it("does not let membership staff grant roles", () => {
    const s = run(demoClub(now), admin, "grant", {
      player: player.id,
      permissions: ["membership"],
    });
    expect(() =>
      run(s, player, "grant", { player: opponent.id, permissions: ["access"] }),
    ).toThrow("access permission");
  });
  it("refuses stale changes and handles idempotent replay before version check", () => {
    const command: ClubCommand = {
      id: "once",
      type: "trial",
      data: { player: player.id },
      expectedVersion: 0,
    };
    const s = apply(demoClub(now), player, command, now);
    expect(apply(s, player, command, now)).toBe(s);
    expect(() =>
      apply(s, player, { ...command, id: "different" }, now),
    ).toThrow("Conflict");
  });
  it("keeps historical catalogue snapshots after price changes", () => {
    const original = demoClub(now);
    const s = run(original, admin, "plan", {
      plan: "full",
      name: "Full",
      months: 6,
      price: 25000,
      entitlement: "Updated",
      active: true,
    });
    expect(s.memberships[0].snapshot?.price).toBe(19000);
    expect(original.plans[0].price).toBe(19000);
  });
  it("validates membership dates before changing any state", () => {
    const s = demoClub(now);
    expect(() =>
      run(s, admin, "membership", {
        player: player.id,
        plan: "full",
        start: "2026-12-01",
        end: "2026-11-01",
        status: "active",
        payment: "paid",
        amount: 1,
        receivedOn: "2026-11-01",
        reference: "",
      }),
    ).toThrow("End date");
    expect(s.audit).toHaveLength(0);
  });
  it("creates an acknowledgement only when selected", () => {
    const s = demoClub(now),
      data = {
        player: player.id,
        plan: "full",
        start: "2026-11-01",
        end: "2027-04-30",
        status: "active",
        payment: "partial",
        amount: 1000,
        receivedOn: "2026-11-01",
        reference: "cash",
      };
    expect(run(s, admin, "membership", data).notices).toHaveLength(0);
    expect(
      run(s, admin, "membership", { ...data, acknowledge: true }).notices.some(
        (n) => n.kind === "payment_acknowledgement",
      ),
    ).toBe(true);
  });
  it("uses calendar months with an inclusive trial end and guardian routing", () => {
    const start = Date.parse("2026-01-31T12:00Z");
    const s = run(
      demoClub(start),
      player,
      "trial",
      { player: "demo-junior" },
      start,
    );
    expect(s.memberships.at(-1)?.end).toBe("2026-02-27");
    expect(addCalendarMonths("2026-01-31", 1)).toBe("2026-02-28");
  });
  it("refuses trials for an unlinked child", () => {
    expect(() =>
      run(demoClub(now), opponent, "trial", { player: "demo-junior" }),
    ).toThrow("linked child");
  });
  it("records no-membership attendance and a deduplicated work item", () => {
    let s = run(demoClub(now), player, "checkin", {
      player: "demo-junior",
      session: "demo-current",
      present: true,
    });
    s = run(s, player, "checkin", {
      player: "demo-junior",
      session: "demo-current",
      present: true,
    });
    expect(s.attendance).toHaveLength(1);
    expect(s.attendance[0].membership).toBe("none");
    expect(s.work).toHaveLength(1);
  });
  it("prevents attendance outside session hours and false presence", () => {
    expect(() =>
      run(demoClub(now), player, "checkin", {
        player: player.id,
        session: "demo-current",
        present: false,
      }),
    ).toThrow("physically");
    expect(() =>
      run(
        demoClub(now),
        player,
        "checkin",
        { player: player.id, session: "demo-current", present: true },
        now + 86400000,
      ),
    ).toThrow("during the session");
  });
  it("keeps Not attending separate and refuses silent presence overwrite", () => {
    let s = run(demoClub(now), player, "absence", {
      player: player.id,
      session: "demo-current",
    });
    expect(s.attendance).toHaveLength(0);
    s = run(s, player, "checkin", {
      player: player.id,
      session: "demo-current",
      present: true,
    });
    expect(s.absences).toHaveLength(0);
    expect(() =>
      run(s, player, "absence", { player: player.id, session: "demo-current" }),
    ).toThrow("Already checked in");
  });
  it("rejects expired and cross-session venue challenges", () => {
    let s = run(demoClub(now), admin, "issue_qr", {
      session: "demo-current",
      challengeHash: "a".repeat(64),
    });
    expect(() =>
      run(s, player, "checkin", {
        player: player.id,
        session: "demo-current",
        present: true,
        challengeHash: "b".repeat(64),
      }),
    ).toThrow("expired");
    expect(() =>
      run(
        s,
        player,
        "checkin",
        {
          player: player.id,
          session: "demo-current",
          present: true,
          challengeHash: "a".repeat(64),
        },
        now + 91000,
      ),
    ).toThrow("expired");
    expect(clubView(s, admin.id).challenges).toEqual([]);
  });
  it("books individual child places with guardian authorization and capacity rules", () => {
    let s = demoClub(now);
    const session = s.sessions.find((x) => x.start > now)!;
    s = run(s, player, "booking", {
      session: session.id,
      action: {
        type: "request",
        playerId: "demo-junior",
        tableId: 7,
        place: 0,
      },
    });
    expect(s.board.requests).toHaveLength(1);
    expect(() =>
      run(s, player, "booking", {
        session: session.id,
        action: {
          type: "request",
          playerId: "demo-junior",
          tableId: 8,
          place: 1,
        },
      }),
    ).toThrow("already has");
    expect(s.attendance).toHaveLength(0);
  });
  it("fails a conflicting multi-day programme atomically", () => {
    const s = demoClub(now);
    const data = {
      name: "Camp",
      start: new Date(now).toISOString(),
      end: new Date(now + 60000).toISOString(),
      tables: 3,
      capacity: 12,
    };
    expect(() =>
      run(s, admin, "programme", { occurrences: [data, data] }),
    ).toThrow("overlaps");
    expect(s.sessions).toHaveLength(demoClub(now).sessions.length);
  });
  it("validates deuce and rejects games after a winner", () => {
    expect(
      scoreResult({
        bestOf: 3,
        aggregate: null,
        games: [
          [12, 10],
          [11, 9],
        ],
      }).winner,
    ).toBe(0);
    expect(() =>
      scoreResult({
        bestOf: 3,
        aggregate: null,
        games: [
          [12, 9],
          [11, 9],
        ],
      }),
    ).toThrow("Invalid");
    expect(() =>
      scoreResult({
        bestOf: 1,
        aggregate: null,
        games: [
          [11, 0],
          [11, 0],
        ],
      }),
    ).toThrow("Invalid");
  });
  it("requires opposing-side review and prevents author self-approval", () => {
    const s = score(match());
    expect(s.matches[0].status).toBe("awaiting_review");
    expect(() =>
      run(s, player, "review", {
        match: s.matches[0].id,
        approve: true,
        reason: "",
      }),
    ).toThrow("opposing side");
    expect(
      run(s, opponent, "review", {
        match: s.matches[0].id,
        approve: true,
        reason: "",
      }).matches[0].status,
    ).toBe("confirmed");
  });
  it("auto-approves inaction after five days but pauses requested edits", () => {
    const s = score(match());
    const job = { id: "scheduler", email: "", verified: true, system: true };
    expect(run(s, job, "jobs", {}, now + 5 * 86400000).matches[0].status).toBe(
      "auto_approved",
    );
    const disputed = run(s, opponent, "review", {
      match: s.matches[0].id,
      approve: false,
      reason: "Wrong score",
    });
    expect(
      run(disputed, job, "jobs", {}, now + 6 * 86400000).matches[0].status,
    ).toBe("changes_requested");
  });
  it("keeps external results reported without five-day verified promotion", () => {
    const s = score(match(undefined, true));
    expect(s.matches[0].status).toBe("reported");
    expect(
      run(
        s,
        { id: "scheduler", email: "", verified: true, system: true },
        "jobs",
        {},
        now + 6 * 86400000,
      ).matches[0].status,
    ).toBe("reported");
  });
  it("requires review for expired same-club opponents in external events", () => {
    let s = match(undefined, true);
    s.matches[0].sides[1] = [opponent.id];
    s = score(s);
    expect(s.matches[0].status).toBe("awaiting_review");
  });
  it("keeps incomplete matches out of completed standings but allows reflections", () => {
    const s = score(match(), player, true);
    expect(s.matches[0].status).toBe("incomplete");
    const r = run(s, player, "reflection", {
      player: player.id,
      match: s.matches[0].id,
      good: ["serving"],
      improve: [],
      note: "",
    });
    expect(coachingSummary(r).reportingPlayers).toBe(1);
  });
  it("deduplicates reflection tags and preserves the score on revision/removal", () => {
    let s = score(match());
    const data = {
      player: player.id,
      match: s.matches[0].id,
      good: [],
      improve: ["backhand", "backhand"],
      note: "Practice",
    };
    s = run(s, player, "reflection", data);
    expect(
      coachingSummary(s).tags.find((t) => t.id === "backhand")?.improve,
    ).toBe(1);
    const result = s.matches[0].status;
    s = run(s, player, "reflection", { ...data, remove: true });
    expect(s.reflections).toHaveLength(0);
    expect(s.matches[0].status).toBe(result);
    expect(s.audit.at(-1)?.changes.reflections).toBeDefined();
  });
  it("publishes summaries only after distinct coach and family sign-off", () => {
    let s = run(demoClub(now), coach, "assessment", {
      player: player.id,
      strengths: "Serve",
      improvements: "Backhand",
      goals: "Practice",
    });
    s = run(s, coach, "signoff", {
      assessment: s.assessments[0].id,
      side: "coach",
    });
    expect(s.assessments[0].published).toBe(false);
    s = run(s, player, "signoff", {
      assessment: s.assessments[0].id,
      side: "family",
    });
    expect(s.assessments[0].published).toBe(true);
    expect(() =>
      run(s, coach, "signoff", {
        assessment: s.assessments[0].id,
        side: "family",
      }),
    ).toThrow("linked child");
  });
  it("expires only after the inclusive end day and suppresses renewed messages", () => {
    let s = demoClub(now);
    s.memberships[0].end = "2026-11-07";
    const job = { id: "scheduler", email: "", verified: true, system: true };
    s = run(s, job, "jobs", {}, Date.parse("2026-11-07T23:59:59Z"));
    expect(
      s.notices.filter((n) => n.kind === "membership_expired"),
    ).toHaveLength(0);
    s = run(s, job, "jobs", {}, Date.parse("2026-11-08T00:00Z"));
    const n = s.notices.find((n) => n.kind === "membership_expired")!;
    expect(n).toBeDefined();
    s.memberships.push({
      ...s.memberships[0],
      id: "renewed",
      start: "2026-11-08",
      end: "2027-01-01",
    });
    expect(notificationEligible(s, n, Date.parse("2026-11-08T01:00Z"))).toBe(
      false,
    );
  });
  it("suppresses revoked management recipients and does not treat email storage as verification", () => {
    let s = demoClub(now);
    s.grants[player.id] = ["booking"];
    const n = {
      id: "n",
      key: "n",
      to: player.id,
      kind: "role_notice",
      subject: "",
      entity: "",
      created: "",
      email: "pending" as const,
      attempts: 0,
      category: "booking" as const,
    };
    expect(notificationEligible(s, n, now)).toBe(true);
    s.grants[player.id] = [];
    expect(notificationEligible(s, n, now)).toBe(false);
    s.people.find((p) => p.id === admin.id)!.emailVerified = false;
    expect(notificationEligible(s, { ...n, to: admin.id }, now)).toBe(false);
  });
  it("respects Dublin calendar dates across summer time", () => {
    expect(localDay(Date.parse("2026-06-01T23:30Z"))).toBe("2026-06-02");
    expect(membershipAt(demoClub(now), player.id, "2026-11-07")).toBe("active");
  });
  it("generates league pairings once and protects delegation boundaries", () => {
    let s = run(demoClub(now), admin, "event", {
      name: "League",
      date: "2026-11-07",
      session: "demo-current",
      external: false,
      format: "round_robin",
      teams: [[player.id], [opponent.id], [coach.id]],
      bestOf: 3,
      winPoints: 2,
      lossPoints: 1,
      source: "",
    });
    const event = s.events[0];
    s = run(s, admin, "delegate", { event: event.id, players: [player.id] });
    s = run(s, player, "event_state", { event: event.id, state: "published" });
    expect(s.matches).toHaveLength(3);
    expect(standings(s, event).every((r) => r.played === 0)).toBe(true);
    expect(() =>
      run(s, player, "grant", {
        player: opponent.id,
        permissions: ["membership"],
      }),
    ).toThrow("access");
    expect(() =>
      run(s, player, "event_state", { event: event.id, state: "published" }),
    ).toThrow("Only drafts");
  });
  it("generates knockout byes without fabricated results", () => {
    let s = run(demoClub(now), admin, "event", {
      name: "Cup",
      date: "2026-11-07",
      session: "demo-current",
      external: false,
      format: "single_elimination",
      teams: [[player.id], [opponent.id], [coach.id]],
      bestOf: 3,
      winPoints: 2,
      lossPoints: 1,
      source: "",
    });
    s = run(s, admin, "event_state", {
      event: s.events[0].id,
      state: "published",
    });
    expect(s.matches.filter((m) => m.status === "bye")).toHaveLength(1);
    expect(s.matches.find((m) => m.round === 2)?.sides[0]).toEqual([player.id]);
  });
  it("records additional payments and corrections without double counting", () => {
    let s = demoClub(now);
    const data = {
      membership: "demo-membership",
      amount: 1000,
      date: "2026-11-07",
      method: "cash",
      reference: "Top up",
      status: "paid",
      acknowledge: false,
    };
    s = run(s, admin, "payment", data);
    expect(s.memberships[0].amount).toBe(20000);
    const payment = s.payments[0];
    s = run(s, admin, "payment", {
      ...data,
      paymentId: payment.id,
      amount: 500,
    });
    expect(s.memberships[0].amount).toBe(19500);
    expect(s.payments).toHaveLength(1);
    expect(() => run(s, player, "payment", data)).toThrow("permission");
  });
  it("extends trials without requiring a paid catalogue and suppresses stale notices", () => {
    let s = run(demoClub(now), player, "trial", { player: "demo-junior" });
    const trial = s.memberships.at(-1)!;
    s.plans = [];
    const next = run(s, admin, "extend_trial", {
      membership: trial.id,
      end: "2027-03-01",
      reason: "Approved extra time",
    });
    expect(next.memberships.at(-1)?.end).toBe("2027-03-01");
    expect(s.memberships.at(-1)?.end).not.toBe("2027-03-01");
  });
  it("supports overlapping sessions on disjoint tables but refuses resource overlap", () => {
    const data = {
      name: "Extra practice",
      start: "2026-11-10T10:00:00Z",
      end: "2026-11-10T12:00:00Z",
      tables: 2,
      capacity: 8,
    };
    let s = run(demoClub(now), admin, "session", { ...data, tableIds: [1, 2] });
    s = run(s, admin, "session", { ...data, tableIds: [3, 4] });
    expect(() =>
      run(s, admin, "session", { ...data, tableIds: [2, 5] }),
    ).toThrow("overlaps");
  });
  it("persists hall closures, cancels affected places and does not silently restore them", () => {
    let s = demoClub(now);
    const session = s.sessions.find((x) => x.start > now)!;
    s = run(s, player, "booking", {
      session: session.id,
      action: { type: "request", playerId: player.id, tableId: 7, place: 0 },
    });
    s = run(s, admin, "close_hall", {
      start: new Date(session.start).toISOString(),
      end: new Date(session.end).toISOString(),
      reason: "Maintenance",
    });
    expect(s.board.requests[0].status).toBe("cancelled");
    expect(() =>
      run(s, admin, "session", {
        name: "Blocked",
        start: new Date(session.start).toISOString(),
        end: new Date(session.end).toISOString(),
        tables: 1,
        capacity: 4,
      }),
    ).toThrow("closed");
    s = run(s, admin, "reopen_hall", {
      closure: s.closures[0].id,
      reason: "Work completed",
    });
    expect(s.board.requests[0].status).toBe("cancelled");
  });
  it("does not mutate revision or grow audit on an idle scheduler pass", () => {
    const s = demoClub(now);
    const next = run(
      s,
      { id: "scheduler", email: "", verified: true, system: true },
      "jobs",
      {},
    );
    expect(next).toBe(s);
  });
  it("keeps retention disabled until policy approval and does not reintroduce deleted notes through audit", () => {
    let s = run(demoClub(now), coach, "note", {
      player: player.id,
      body: "Expired confidential note",
    });
    s.people.find((p) => p.id === player.id)!.leftOn = "2024-01-01";
    const system = { id: "scheduler", email: "", verified: true, system: true };
    expect(run(s, system, "jobs", {}).notes).toHaveLength(1);
    s.settings.retentionApproved = true;
    const next = run(s, system, "jobs", {});
    expect(next.notes).toHaveLength(0);
    expect(JSON.stringify(next)).not.toContain("Expired confidential note");
  });
  it("keeps private proposed events hidden and allows later authorized linking", () => {
    let s = run(demoClub(now), player, "propose_event", {
      name: "Private event proposal",
      date: "2026-11-01",
      source: "",
    });
    expect(clubView(s, opponent.id).eventDrafts).toHaveLength(0);
    s = run(s, admin, "event", {
      name: "Official event",
      date: "2026-11-01",
      session: "",
      external: true,
      format: "round_robin",
      teams: [],
      bestOf: 3,
      winPoints: 2,
      lossPoints: 1,
      source: "",
    });
    s = run(s, admin, "link_event", {
      draft: s.eventDrafts[0].id,
      event: s.events[0].id,
    });
    expect(s.eventDrafts[0].linkedEvent).toBe(s.events[0].id);
  });
  it("flags likely duplicate matches while allowing an explicitly separate repeat", () => {
    const s = match();
    const data = {
      sides: [[player.id], [opponent.id]],
      bestOf: 3,
      session: "",
      event: "",
      table: "",
    };
    expect(() => run(s, player, "match", data)).toThrow("similar match");
    expect(
      run(s, player, "match", {
        ...data,
        allowDuplicate: true,
        duplicateReason: "Second friendly match",
      }).matches,
    ).toHaveLength(2);
  });
});
