import { describe, expect, it } from "vitest";
import { applyClubCommand, clubView, demoClub, represents } from "./index";
import type { ClubState, Principal } from "./operations";

const now = Date.parse("2026-11-16T12:00:00Z");
const owner: Principal = {
  id: "demo-admin",
  email: "owner@example.invalid",
  verified: true,
};
const adult: Principal = {
  id: "demo-player",
  email: "adult@example.invalid",
  verified: true,
};
let sequence = 0;
const run = (
  s: ClubState,
  type: string,
  data: Record<string, unknown>,
  actor = owner,
) =>
  applyClubCommand(
    s,
    actor,
    { id: `integrity-${++sequence}`, type, data },
    now,
  );
const period = (s: ClubState) => ({
  ...s.memberships[0],
  membership: s.memberships[0].id,
  reason: "Correcting a verified record",
});

describe("identity and membership integrity", () => {
  it("refuses reusing an existing player identifier for a new child or offline record", () => {
    const s = demoClub(now);
    expect(() =>
      applyClubCommand(
        s,
        adult,
        {
          id: adult.id,
          type: "child",
          data: { name: "Duplicate child", consent: true },
        },
        now,
      ),
    ).toThrow("identifier already exists");
    expect(() =>
      applyClubCommand(
        s,
        owner,
        {
          id: "demo-opponent",
          type: "person",
          data: {
            name: "Duplicate adult",
            mobile: "",
            junior: false,
            guardians: [],
          },
        },
        now,
      ),
    ).toThrow("identifier already exists");
  });
  it("refuses creating another financial period under an existing period identifier", () => {
    const s = demoClub(now);
    expect(() =>
      applyClubCommand(
        s,
        owner,
        {
          id: s.memberships[0].id,
          type: "membership",
          data: { ...period(s), membership: "", player: "demo-opponent" },
        },
        now,
      ),
    ).toThrow("identifier already exists");
    expect(s.memberships).toHaveLength(1);
  });
  it("creates an offline adult with no guardian and without inventing an Auth account", () => {
    const s = run(demoClub(now), "person", {
      name: "Offline adult",
      mobile: "",
      junior: false,
      guest: false,
      guardians: [],
    });
    expect(s.people.at(-1)).toMatchObject({
      name: "Offline adult",
      junior: false,
      guardians: [],
      emailVerified: false,
      accountLinked: false,
    });
  });
  it("stores first name, second name and nickname, deriving the full name", () => {
    const s = run(demoClub(now), "person", {
      firstName: "Asha",
      lastName: "Kelly",
      nickname: "Ash",
      mobile: "",
      junior: false,
      guest: false,
      guardians: [],
    });
    expect(s.people.at(-1)).toMatchObject({
      name: "Asha Kelly",
      firstName: "Asha",
      lastName: "Kelly",
      nickname: "Ash",
    });
  });
  it("requires both first and second name when either is entered", () => {
    expect(() =>
      run(demoClub(now), "person", {
        firstName: "Asha",
        lastName: "",
        mobile: "",
        junior: false,
        guest: false,
        guardians: [],
      }),
    ).toThrow("First name and second name are both required.");
  });
  it("stores a mobile in international format from a country code and national number", () => {
    const s = run(demoClub(now), "person", {
      name: "Phone adult",
      mobileCountry: "+353",
      mobileNumber: "087 123 4567",
      dateOfBirth: "1990-05-06",
      junior: false,
      guest: false,
      guardians: [],
    });
    expect(s.people.at(-1)).toMatchObject({
      mobile: "+353871234567",
      dateOfBirth: "1990-05-06",
    });
  });
  it("accepts Irish mobile numbers in common forms and stores them in international format", () => {
    const cases: [string, string][] = [
      ["087 123 4567", "+353871234567"],
      ["0871234567", "+353871234567"],
      ["086-123-4567", "+353861234567"],
      ["089 123 4567", "+353891234567"],
      ["+353 83 123 4567", "+353831234567"],
      ["87 123 4567", "+353871234567"],
    ];
    for (const [number, stored] of cases) {
      const s = run(demoClub(now), "person", {
        name: "Irish number",
        mobileCountry: "+353",
        mobileNumber: number,
        junior: false,
        guest: false,
        guardians: [],
      });
      expect(s.people.at(-1)).toMatchObject({ mobile: stored });
    }
  });
  it("refuses Irish numbers with letters, wrong length or a non-mobile prefix", () => {
    for (const number of ["0009ih", "abc", "12", "087 123 456", "081 234 5678", "087 123 4567 999"]) {
      expect(() =>
        run(demoClub(now), "person", {
          name: "Bad number",
          mobileCountry: "+353",
          mobileNumber: number,
          junior: false,
          guest: false,
          guardians: [],
        }),
      ).toThrow("valid mobile number");
    }
  });
  it("refuses an invalid mobile number for the chosen country", () => {
    expect(() =>
      run(demoClub(now), "person", {
        name: "Bad phone",
        mobileCountry: "+353",
        mobileNumber: "12",
        junior: false,
        guest: false,
        guardians: [],
      }),
    ).toThrow("valid mobile number");
  });
  it("refuses a date of birth in the future", () => {
    expect(() =>
      run(demoClub(now), "person", {
        name: "Future",
        dateOfBirth: "2999-01-01",
        junior: false,
        guest: false,
        guardians: [],
      }),
    ).toThrow("cannot be in the future");
  });
  it("requires a date of birth when a guardian registers a junior", () => {
    const s = demoClub(now);
    const guardian = s.people.find((p) => !p.junior && p.status !== "left");
    expect(() =>
      run(s, "child", { name: "No birth date", consent: true, actor: guardian?.id }),
    ).toThrow("date of birth is required");
  });
  it("refuses saving someone under 18 as an adult", () => {
    const tenYearsAgo = new Date(Date.now() - 10 * 365.25 * 86400000).toISOString().slice(0, 10);
    expect(() =>
      run(demoClub(now), "person", {
        name: "Under eighteen",
        dateOfBirth: tenYearsAgo,
        junior: false,
        guest: false,
        guardians: [],
      }),
    ).toThrow("under 18");
  });
  it("accepts an adult of 18 or over with a date of birth", () => {
    const thirtyYearsAgo = new Date(Date.now() - 30 * 365.25 * 86400000).toISOString().slice(0, 10);
    const s = run(demoClub(now), "person", {
      name: "Grown adult",
      dateOfBirth: thirtyYearsAgo,
      junior: false,
      guest: false,
      guardians: [],
    });
    expect(s.people.at(-1)).toMatchObject({ name: "Grown adult", junior: false });
  });
  it("refuses post titles and bodies that contain markup or script links", () => {
    for (const body of ["<script>alert(1)</script>", "click javascript:void(0)", "fine text <b>bold</b>"]) {
      expect(() =>
        run(demoClub(now), "page", { title: "News", body, kind: "news", published: false, event: "" }),
      ).toThrow("plain text");
    }
    expect(() =>
      run(demoClub(now), "page", { title: "<img src=x>", body: "Hello", kind: "news", published: false, event: "" }),
    ).toThrow("plain text");
  });
  it("accepts a plain text post and refuses a title over 120 characters", () => {
    const s = run(demoClub(now), "page", { title: "Club news", body: "Training moves to Friday.", kind: "news", published: true, event: "" });
    expect(s.pages.at(-1)).toMatchObject({ title: "Club news", published: true });
    expect(() =>
      run(demoClub(now), "page", { title: "x".repeat(121), body: "Hello", kind: "news", published: false, event: "" }),
    ).toThrow();
  });
  it("explains a date of birth with a bad year, and checks age before consent for a junior", () => {
    expect(() =>
      run(demoClub(now), "person", { name: "Year twenty-two", dateOfBirth: "0022-03-01", junior: false, guest: false, guardians: [] }),
    ).toThrow("four-digit year");
    expect(() =>
      run(demoClub(now), "child", { firstName: "Old", lastName: "Junior", dateOfBirth: "1989-03-01", consent: false }),
    ).toThrow("under 18");
  });
  it("refuses guardian relationships on adults and prevents self-guardianship", () => {
    const s = demoClub(now);
    expect(() =>
      run(s, "person", {
        player: adult.id,
        name: "Adult",
        mobile: "",
        junior: false,
        guardians: [owner.id],
      }),
    ).toThrow("adult");
    expect(() =>
      run(s, "person", {
        player: adult.id,
        name: "Adult",
        mobile: "",
        junior: true,
        guardians: [adult.id],
      }),
    ).toThrow(/guardian|linked|owner|classification/i);
    expect(s.people.find((p) => p.id === adult.id)?.junior).toBe(false);
  });
  it("never grants family access through an adult or departed guardian link", () => {
    const s = demoClub(now);
    s.people.find((p) => p.id === "demo-opponent")!.guardians = [adult.id];
    expect(represents(s, adult.id, "demo-opponent")).toBe(false);
    s.people.find((p) => p.id === adult.id)!.status = "left";
    expect(represents(s, adult.id, "demo-junior")).toBe(false);
    expect(
      clubView(s, adult.id).people.some((p) => p.id === "demo-junior"),
    ).toBe(false);
  });
  it("prevents converting a linked adult account or responsible guardian into a junior", () => {
    const s = demoClub(now);
    expect(() =>
      run(s, "person", {
        player: owner.id,
        name: "Owner",
        mobile: "",
        junior: true,
        guardians: [adult.id],
      }),
    ).toThrow(/guardian|linked|owner|classification/i);
    expect(() =>
      run(s, "person", {
        player: adult.id,
        name: "Parent",
        mobile: "",
        junior: true,
        guardians: [owner.id],
      }),
    ).toThrow(/guardian|linked|owner|classification/i);
  });
  it("requires an existing profile when correcting a person identifier", () => {
    expect(() =>
      run(demoClub(now), "person", {
        player: "missing",
        name: "Wrong target",
        mobile: "",
        junior: false,
        guardians: [],
      }),
    ).toThrow("not found");
  });
  it("does not rewrite agreed historical terms when correcting a period after a price change", () => {
    let s = demoClub(now);
    s = run(s, "plan", {
      ...s.plans[0],
      plan: "full",
      price: 25000,
      months: 12,
    });
    const corrected = run(s, "membership", period(s));
    expect(corrected.memberships[0].snapshot?.price).toBe(19000);
    expect(corrected.memberships[0].snapshot?.months).toBe(6);
  });
  it("allows correcting/cancelling a period whose existing type is retired", () => {
    const s = demoClub(now);
    s.plans[0].active = false;
    const next = run(s, "membership", { ...period(s), status: "cancelled" });
    expect(next.memberships[0].status).toBe("cancelled");
    expect(next.memberships[0].snapshot?.price).toBe(19000);
    expect(() =>
      run(s, "membership", {
        ...period(s),
        membership: "",
        player: "demo-opponent",
      }),
    ).toThrow("active");
  });
  it("creates a separate renewal period with new terms and retains the original financial period", () => {
    const s = demoClub(now),
      previous = structuredClone(s.memberships[0]);
    const next = run(s, "membership", {
      ...period(s),
      membership: "",
      renewalOf: previous.id,
      start: "2027-05-17",
      end: "2027-11-16",
      amount: 0,
      payment: "unpaid",
      receivedOn: "",
    });
    expect(next.memberships).toHaveLength(2);
    expect(next.memberships[0]).toEqual(previous);
    expect(next.memberships[1]).toMatchObject({
      renewalOf: previous.id,
      amount: 0,
      payment: "unpaid",
      receivedOn: "",
    });
  });
  it("rejects overlapping paid periods, wrong renewal subjects and unknown correction IDs atomically", () => {
    const s = demoClub(now);
    expect(() =>
      run(s, "membership", { ...period(s), membership: "" }),
    ).toThrow("overlap");
    expect(() =>
      run(s, "membership", {
        ...period(s),
        membership: "",
        renewalOf: s.memberships[0].id,
        player: "demo-opponent",
      }),
    ).toThrow("same player");
    expect(() =>
      run(s, "membership", { ...period(s), membership: "missing" }),
    ).toThrow("not found");
    expect(s.memberships).toHaveLength(1);
    expect(s.audit).toHaveLength(0);
  });
  it("does not require a fictional payment date for an unpaid period but requires it when money is recorded", () => {
    const s = demoClub(now);
    const data = {
      ...period(s),
      membership: "",
      player: "demo-opponent",
      amount: 0,
      payment: "unpaid",
      receivedOn: "",
    };
    expect(run(s, "membership", data).memberships.at(-1)?.receivedOn).toBe("");
    expect(() => run(s, "membership", { ...data, amount: 100 })).toThrow(
      "receivedOn",
    );
  });
  it("allows a trial correction without forcing a paid membership type", () => {
    let s = run(demoClub(now), "trial", { player: "demo-junior" }, adult);
    const m = s.memberships.at(-1)!;
    s = run(s, "membership", {
      ...m,
      membership: m.id,
      status: "cancelled",
      reason: "Trial resolved",
    });
    expect(s.memberships.at(-1)).toMatchObject({
      status: "cancelled",
      plan: "",
      snapshot: null,
    });
  });
  it("does not let a paid member or departed player grant themselves a fresh trial", () => {
    const s = demoClub(now);
    expect(() => run(s, "trial", { player: adult.id }, adult)).toThrow("trial");
    s.people.find((p) => p.id === "demo-opponent")!.status = "left";
    expect(() =>
      run(
        s,
        "trial",
        { player: "demo-opponent" },
        { ...adult, id: "demo-opponent" },
      ),
    ).toThrow("trial");
  });
  it("does not reset trial eligibility by cancelling the old trial", () => {
    let s = run(demoClub(now), "trial", { player: "demo-junior" }, adult);
    s.memberships.at(-1)!.status = "cancelled";
    expect(() => run(s, "trial", { player: "demo-junior" }, adult)).toThrow(
      "trial",
    );
  });
  it("clears an old departure date on an authorized reactivation", () => {
    const s = demoClub(now),
      p = s.people.find((p) => p.id === "demo-opponent")!;
    p.status = "left";
    p.leftOn = "2024-01-01";
    const next = run(s, "membership", {
      ...period(s),
      membership: "",
      player: p.id,
    });
    expect(
      next.people.find((p) => p.id === "demo-opponent")?.leftOn,
    ).toBeUndefined();
  });
  it("does not let stale departure metadata purge an active player’s private notes", () => {
    const s = demoClub(now);
    s.settings.retentionApproved = true;
    s.people.find((p) => p.id === adult.id)!.leftOn = "2023-01-01";
    s.notes.push({
      id: "note",
      player: adult.id,
      author: owner.id,
      body: "Current private coaching note",
    });
    const next = applyClubCommand(
      s,
      { id: "scheduler", email: "", verified: true, system: true },
      { id: "retention-check", type: "jobs", data: {} },
      now,
    );
    expect(next.notes).toHaveLength(1);
  });
  it("rejects missing catalogue/payment correction targets rather than adding substitutes", () => {
    const s = demoClub(now);
    expect(() =>
      run(s, "plan", {
        plan: "missing",
        name: "Wrong target",
        months: 6,
        price: 100,
        entitlement: "",
      }),
    ).toThrow("not found");
    expect(() =>
      run(s, "payment", {
        membership: s.memberships[0].id,
        paymentId: "missing",
        amount: 100,
        date: "2026-11-16",
        status: "paid",
        method: "cash",
        reference: "",
      }),
    ).toThrow("not found");
    expect(s.payments).toHaveLength(0);
  });
  it("requires an adult declaration for a new application", () => {
    const s = demoClub(now),
      applicant = {
        id: "applicant",
        email: "applicant@example.invalid",
        verified: true,
      };
    const data = {
      name: "Adult applicant",
      mobile: "",
      consent: true,
      marketing: false,
    };
    expect(() => run(s, "join", data, applicant)).toThrow("adult");
    expect(
      run(s, "join", { ...data, adult: true }, applicant).people.at(-1),
    ).toMatchObject({ status: "pending", accountLinked: true });
  });
  it("does not treat an independently linked phone-only profile as unclaimed", () => {
    const s = demoClub(now);
    s.people.push({
      ...s.people[0],
      id: "phone-only",
      email: "",
      emailVerified: false,
      accountLinked: true,
    });
    expect(() =>
      run(s, "claim_profile", {
        source: "phone-only",
        target: "demo-opponent",
        reason: "Attempted mistaken merge",
      }),
    ).toThrow("unclaimed");
  });
});
