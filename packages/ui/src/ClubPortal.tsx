import { useEffect, useState } from "react";
import QRCode from "qrcode";
import {
  attendanceReport,
  coachingSummary,
  demoAccounts,
  localDay,
  may,
  membershipAt,
  matchStatistics,
  occupiesPlace,
  permissions,
  pilotClubId,
  represents,
  standings,
} from "@tti/domain";
import type { ClubState, ClubCommand, Permission } from "@tti/domain";
import { ClubAuth } from "./ClubAuth";
import {
  liveMode,
  readClub,
  readClubs,
  resolveClubCode,
  resetClub,
  sendClub,
  exportPerson,
} from "./club-client";
import "./operations.css";

type Field = {
  key: string;
  label: string;
  type?: string;
  step?: string;
  options?: [string, string][];
  value?: unknown;
  multiple?: boolean;
  optional?: boolean;
};
const opt = (values: { id: string; name: string }[]): [string, string][] =>
  values.map((v) => [v.id, v.name]);
const choice = (values: string[]): [string, string][] =>
  values.map((v) => [v, v.replaceAll("_", " ")]);
function OperationForm({
  title,
  fields,
  submit,
  label = "Save",
  busy,
}: {
  title: string;
  fields: Field[];
  submit: (data: Record<string, unknown>) => Promise<boolean>;
  label?: string;
  busy: boolean;
}) {
  return (
    <form
      className="ops-form"
      aria-label={title}
      onSubmit={(event) => {
        event.preventDefault();
        const form = event.currentTarget,
          source = new FormData(form),
          data: Record<string, unknown> = {};
        for (const f of fields)
          data[f.key] = f.multiple
            ? source.getAll(f.key)
            : f.type === "checkbox"
              ? source.has(f.key)
              : f.type === "number"
                ? Number(source.get(f.key))
                : String(source.get(f.key) ?? "");
        void submit(data);
      }}
    >
      <h4>{title}</h4>
      {fields.map((f) => (
        <label key={f.key}>
          {f.label}
          {f.options ? (
            <select
              aria-label={f.label}
              name={f.key}
              required={!f.optional}
              multiple={f.multiple}
              defaultValue={
                f.multiple
                  ? ((f.value as string[]) ?? [])
                  : String(f.value ?? "")
              }
            >
              {!f.multiple && <option value="">Select…</option>}
              {f.options.map(([value, name]) => (
                <option key={value} value={value}>
                  {name}
                </option>
              ))}
            </select>
          ) : f.type === "textarea" ? (
            <textarea
              aria-label={f.label}
              name={f.key}
              required={!f.optional}
              maxLength={f.key === "body" || f.key === "policy" ? 10000 : 2000}
              defaultValue={String(f.value ?? "")}
            />
          ) : f.type === "checkbox" ? (
            <input
              aria-label={f.label}
              type="checkbox"
              name={f.key}
              defaultChecked={f.value === true}
            />
          ) : (
            <input
              aria-label={f.label}
              name={f.key}
              type={f.type ?? "text"}
              required={!f.optional}
              defaultValue={String(f.value ?? "")}
              step={f.type === "number" ? (f.step ?? "1") : undefined}
            />
          )}
        </label>
      ))}
      <button disabled={busy}>{busy ? "Saving…" : label}</button>
    </form>
  );
}
function exportJson(value: unknown, file: string) {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(value, null, 2)], { type: "application/json" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = file;
  a.click();
  URL.revokeObjectURL(url);
}
function inDublin(value: string) {
  const day = value.slice(0, 10);
  const noon = new Date(`${day}T12:00:00Z`);
  const offset = new Intl.DateTimeFormat("en", {
    timeZone: "Europe/Dublin",
    timeZoneName: "shortOffset",
  })
    .formatToParts(noon)
    .find((x) => x.type === "timeZoneName")!.value;
  return new Date(
    Date.parse(`${value}:00Z`) -
      Number(offset.replace("GMT", "") || 0) * 3600000,
  ).toISOString();
}
const scan = new URLSearchParams(
  typeof location === "undefined" ? "" : location.hash.slice(1),
);
const scannedCode = scan.get("code") ?? "",
  scannedSession = scan.get("session") ?? "";
if (scannedCode) history.replaceState(null, "", location.pathname);

export function ClubPortal({
  club: initialClub = pilotClubId,
}: {
  club?: string;
}) {
  const [club, setClub] = useState(scan.get("club") ?? initialClub),
    [clubs, setClubs] = useState<
      { id: string; name: string; status?: string }[]
    >([]);
  const [actor, setActor] = useState<string | null>(
    liveMode ? null : "demo-admin",
  );
  const [state, setState] = useState<ClubState | null>(null),
    [tab, setTab] = useState(
      [
        "booking",
        "people",
        "attendance",
        "sessions",
        "matches",
        "tournaments",
        "coaching",
        "communications",
        "management",
      ].includes(scan.get("view") ?? "")
        ? scan.get("view")!
        : "booking",
    ),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false);
  const [last, setLast] = useState<ClubCommand | null>(null),
    [editing, setEditing] = useState(""),
    [qrImage, setQrImage] = useState(""),
    [qrUntil, setQrUntil] = useState(0);
  const [sessionId, setSessionId] = useState(scannedSession),
    [dateFrom, setDateFrom] = useState(localDay(Date.now() - 30 * 86400000)),
    [dateTo, setDateTo] = useState(localDay(Date.now())),
    [eventFilter, setEventFilter] = useState(scan.get("event") ?? "");
  const [attendanceCode, setAttendanceCode] = useState(scannedCode);
  const [now, setNow] = useState(Date.now());
  const [reportPeriod, setReportPeriod] = useState<
    "daily" | "weekly" | "monthly"
  >("daily");
  const [coachingPlayers, setCoachingPlayers] = useState<string[]>([]);
  useEffect(() => {
    const consume = () => {
      const params = new URLSearchParams(location.hash.slice(1));
      const view = params.get("view");
      if (
        view &&
        [
          "booking",
          "people",
          "attendance",
          "sessions",
          "matches",
          "tournaments",
          "coaching",
          "communications",
          "management",
        ].includes(view)
      )
        setTab(view);
      if (params.get("event")) setEventFilter(params.get("event")!);
      if (params.get("club")) setClub(params.get("club")!);
      if (!params.get("code")) return;
      setAttendanceCode(params.get("code")!);
      setSessionId(params.get("session") ?? "");
      if (params.get("club")) setClub(params.get("club")!);
      setTab("attendance");
      history.replaceState(null, "", location.pathname);
    };
    if (scannedCode) setTab("attendance");
    window.addEventListener("hashchange", consume);
    return () => window.removeEventListener("hashchange", consume);
  }, []);
  const [online, setOnline] = useState(navigator.onLine);
  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);
  useEffect(() => {
    if (liveMode && actor)
      void readClubs()
        .then(setClubs)
        .catch(() => setMessage("Unable to load My clubs."));
    else setClubs([]);
  }, [actor]);
  async function refresh() {
    if (!actor) return;
    try {
      const value = await readClub(club, actor);
      setState(value);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Unable to load.");
    }
  }
  useEffect(() => {
    setState(null);
    setEditing("");
    setLast(null);
    setQrImage("");
    if (!actor) return;
    let alive = true;
    const reload = async () => {
      try {
        const value = await readClub(club, actor);
        if (alive) setState(value);
      } catch (e) {
        if (alive)
          setMessage(
            e instanceof Error ? e.message : "Connection unavailable.",
          );
      }
    };
    void reload();
    const timer = setInterval(() => {
      setNow(Date.now());
      void reload();
    }, 15000);
    const listener = () => {
      void reload();
    };
    window.addEventListener("storage", listener);
    window.addEventListener("tti-local-change", listener);
    return () => {
      alive = false;
      clearInterval(timer);
      window.removeEventListener("storage", listener);
      window.removeEventListener("tti-local-change", listener);
    };
  }, [actor, club]);
  async function act(
    type: string,
    data: Record<string, unknown>,
    retry?: ClubCommand,
  ) {
    if (!actor || busy) return false;
    setBusy(true);
    const command = retry ?? {
      id: crypto.randomUUID(),
      type,
      data,
      expectedVersion: state?.version,
    };
    setLast(command);
    try {
      const result = await sendClub(club, actor, command);
      setState(result.state);
      setMessage(
        liveMode
          ? "Saved to the club service."
          : "Saved in this synthetic browser workspace. No real email or reservation was created.",
      );
      setLast(null);
      if (result.qr) {
        const url = `${location.origin}${location.pathname}#club=${club}&session=${data.session}&code=${result.qr}`;
        setQrImage(await QRCode.toDataURL(url, { width: 320, margin: 2 }));
        setQrUntil(
          Math.min(
            Date.now() + 90000,
            result.state.sessions.find((s) => s.id === data.session)?.end ??
              Infinity,
          ),
        );
      }
      return true;
    } catch (e) {
      setMessage(
        e instanceof Error
          ? e.message
          : "Unable to save. Refresh before retrying.",
      );
      return false;
    } finally {
      setBusy(false);
    }
  }
  const can = (permission: Permission) =>
    Boolean(state && actor && may(state, actor, permission));
  const title = (id: string) =>
    state?.people.find((p) => p.id === id)?.name ?? "Reserved player";
  const family =
    state?.people.filter((p) => actor && represents(state, actor, p.id)) ?? [];
  const playerOptions = opt(state?.people ?? []),
    familyOptions = opt(family);
  const session =
    state?.sessions.find((s) => s.id === sessionId) ??
    state?.sessions.find((s) => s.start > now) ??
    state?.sessions[0];
  useEffect(() => {
    if (!qrImage || !session || !can("attendance") || busy) return;
    const timer = setInterval(() => {
      void act("issue_qr", { session: session.id });
    }, 60000);
    return () => clearInterval(timer);
  }, [qrImage, session?.id, actor, busy]);
  const sessions = (state?.sessions ?? [])
    .filter((s) => !s.cancelled)
    .map(
      (s) =>
        [
          s.id,
          `${s.label} · ${new Date(s.start).toLocaleString("en-IE", { timeZone: "Europe/Dublin" })}`,
        ] as [string, string],
    );
  const selectedPerson = state?.people.find((p) => p.id === editing),
    selectedPlan = state?.plans.find((p) => p.id === editing),
    selectedMembership = state?.memberships.find((m) => m.id === editing);
  function form(
    title: string,
    type: string,
    fields: Field[],
    transform?: (data: Record<string, unknown>) => Record<string, unknown>,
  ) {
    return (
      <OperationForm
        key={`${tab}:${title}:${editing}`}
        title={title}
        fields={fields}
        busy={busy}
        submit={(d) => act(type, transform ? transform(d) : d)}
      />
    );
  }
  const dateField = (
    key: string,
    label: string,
    value = localDay(Date.now()),
  ): Field => ({ key, label, type: "date", value });
  const playerField = (all = false): Field => ({
    key: "player",
    label: "Player",
    options: all ? playerOptions : familyOptions,
    value: selectedPerson?.id ?? selectedMembership?.player ?? family[0]?.id,
  });
  const eventOptions: [string, string][] =
    state?.events.map((e) => [e.id, e.name]) ?? [];
  const nav = [
    ["booking", "Table booking"],
    ["people", "People & memberships"],
    ["attendance", "Attendance"],
    ["sessions", "Sessions & hall"],
    ["matches", "Matches"],
    ["tournaments", "Tournaments"],
    ["coaching", "Coaching"],
    ["communications", "Messages"],
    ["management", "Management"],
  ];
  const report = state ? attendanceReport(state, dateFrom, dateTo) : null;
  const summary = state
    ? coachingSummary(state, eventFilter, dateFrom, dateTo, coachingPlayers)
    : null;
  return (
    <section
      className="club-ops"
      id="club-portal"
      aria-labelledby="portal-title"
    >
      <span id="booking" aria-hidden="true" />
      <header>
        <p className="ops-kicker">
          {liveMode ? "Club service" : "Interactive workspace · synthetic data"}
        </p>
        <h2 id="portal-title">Your club, together.</h2>
        <p>Bookings, membership, attendance and play in one place.</p>
      </header>
      {!liveMode && (
        <div className="ops-notice">
          <strong>
            Synthetic workspace — no real accounts, shared bookings or email
            delivery.
          </strong>
          <p>
            Try management, coach, parent and opponent roles. Changes stay in
            this browser. Do not enter real personal data.
          </p>
          <label>
            Preview role
            <select
              value={actor ?? ""}
              onChange={(e) => {
                setActor(e.target.value);
                setMessage("");
              }}
            >
              {demoAccounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </label>
          <button
            onClick={() => {
              resetClub();
              void refresh();
            }}
          >
            Reset synthetic workspace
          </button>
        </div>
      )}
      <ClubAuth
        onUser={setActor}
        returnTo={`#club=${club}&view=${tab}${eventFilter ? `&event=${encodeURIComponent(eventFilter)}` : ""}`}
      />
      {liveMode && (
        <form
          className="ops-form"
          aria-label="Find a club"
          onSubmit={(e) => {
            e.preventDefault();
            const code = String(new FormData(e.currentTarget).get("join"));
            void resolveClubCode(code)
              .then((result) => {
                setClub(result.id);
                setMessage(
                  `Selected ${result.name}. Sign in to apply; a join code does not activate membership.`,
                );
              })
              .catch((e) => setMessage(e.message));
          }}
        >
          <label>
            Club join code
            <input name="join" maxLength={30} required placeholder="LEESIDE" />
          </label>
          <button>Find club</button>
        </form>
      )}
      {liveMode && !online && (
        <p role="alert">
          Offline. Displayed records may be stale; changes are not confirmed
          until saved by the club service. Reconnect and refresh before
          continuing.
        </p>
      )}
      {liveMode && actor && (
        <label>
          My clubs
          <select
            value={club}
            onChange={(e) => {
              setClub(e.target.value);
              setSessionId("");
            }}
          >
            {!clubs.some((c) => c.id === club) && (
              <option value={club}>Leeside — join or open</option>
            )}
            {clubs.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ·{" "}
                {state?.club === c.id
                  ? membershipAt(state, actor, localDay(now))
                  : (c.status ?? "none")}
              </option>
            ))}
          </select>
        </label>
      )}
      <p className="ops-feedback" role="status" aria-live="polite">
        {busy ? "Saving…" : message}
      </p>
      {last && !busy && (
        <button onClick={() => void act(last.type, last.data, last)}>
          Retry same request
        </button>
      )}
      {actor && (
        <button className="ops-refresh" onClick={() => void refresh()}>
          Refresh club data
        </button>
      )}
      {state && actor && (
        <>
          {state.website && (
            <a href={state.website} target="_blank" rel="noopener noreferrer">
              Open {state.name} website ↗
            </a>
          )}
          <details>
            <summary>Club privacy and safeguarding information</summary>
            <p>Privacy: {state.settings.privacy || "Not configured"}</p>
            <p>
              Safeguarding: {state.settings.safeguarding || "Not configured"}
            </p>
            <p style={{ whiteSpace: "pre-wrap" }}>
              {state.settings.policy ||
                "Policy not configured. Contact the club before applying."}
            </p>
          </details>
          <nav aria-label="Club workspace">
            {nav.map(([id, label]) => (
              <button
                key={id}
                aria-pressed={tab === id}
                onClick={() => {
                  setTab(id);
                  setEditing("");
                }}
              >
                {label}
              </button>
            ))}
          </nav>
          {["matches", "tournaments"].includes(tab) &&
            state.events.length > 0 && (
              <label>
                Event filter
                <select
                  value={eventFilter}
                  onChange={(e) => setEventFilter(e.target.value)}
                >
                  <option value="">All events</option>
                  {eventOptions.map(([id, name]) => (
                    <option key={id} value={id}>
                      {name}
                    </option>
                  ))}
                </select>
              </label>
            )}
          {(!state.people.some((p) => p.id === actor) ||
            state.people.find((p) => p.id === actor)?.status ===
              "subscriber") &&
            form("Apply to join the club", "join", [
              { key: "name", label: "Your name" },
              {
                key: "mobile",
                label: "Mobile contact (optional)",
                optional: true,
              },
              {
                key: "marketing",
                label: "Receive optional event invitations",
                type: "checkbox",
              },
              {
                key: "consent",
                label: "I accept the published club application/privacy policy",
                type: "checkbox",
              },
            ])}
          {tab === "people" && (
            <div className="ops-grid">
              <article>
                <h3>Club people</h3>
                {state.people.map((p) => (
                  <div className="ops-row" key={p.id}>
                    <div>
                      <strong>{p.name}</strong>
                      <small>
                        {p.junior ? "Junior" : p.status} ·{" "}
                        {membershipAt(state, p.id, localDay(now))}
                      </small>
                      {p.email && (
                        <small>
                          {p.email}
                          {p.emailVerified ? " · verified" : " · unverified"}
                        </small>
                      )}
                    </div>
                    {can("membership") && (
                      <button onClick={() => setEditing(p.id)}>
                        Edit person
                      </button>
                    )}
                  </div>
                ))}
                {form("Add your child", "child", [
                  { key: "name", label: "Child’s name" },
                  {
                    key: "consent",
                    label:
                      "I am the responsible guardian and accept the published club policy",
                    type: "checkbox",
                  },
                ])}
                {form("Update your contact profile", "profile", [
                  {
                    key: "player",
                    label: "Your account",
                    options: [[actor, title(actor)]],
                    value: actor,
                  },
                  {
                    key: "name",
                    label: "Display name",
                    value: state.people.find((p) => p.id === actor)?.name,
                  },
                  {
                    key: "mobile",
                    label: "Mobile contact (not SMS login)",
                    optional: true,
                    value: state.people.find((p) => p.id === actor)?.mobile,
                  },
                  {
                    key: "marketing",
                    label: "Optional event invitation consent",
                    type: "checkbox",
                    value: state.people.find((p) => p.id === actor)?.marketing,
                  },
                ])}
                {form("Register a trial", "trial", [playerField()])}
              </article>
              <article>
                <h3>Membership periods</h3>
                {state.memberships.map((m) => (
                  <div className="ops-row" key={m.id}>
                    <div>
                      <strong>{title(m.player)}</strong>
                      <small>
                        {m.snapshot?.name ?? "Trial"} · {m.start}–{m.end}
                      </small>
                      <small>
                        {m.status} · {m.payment} · €
                        {(m.amount / 100).toFixed(2)}
                      </small>
                    </div>
                    {can("membership") && (
                      <button onClick={() => setEditing(m.id)}>
                        Correct / renew
                      </button>
                    )}
                  </div>
                ))}
                {can("membership") &&
                  form(
                    "Assign or correct membership",
                    "membership",
                    [
                      playerField(true),
                      {
                        key: "plan",
                        label: "Membership type",
                        options: state.plans
                          .filter((p) => p.active)
                          .map((p) => [p.id, p.name]),
                        value: selectedMembership?.plan,
                      },
                      dateField(
                        "start",
                        "Start (inclusive)",
                        selectedMembership?.start,
                      ),
                      dateField(
                        "end",
                        "End (inclusive)",
                        selectedMembership?.end,
                      ),
                      {
                        key: "status",
                        label: "Status",
                        options: choice(["active", "trial", "cancelled"]),
                        value: selectedMembership?.status ?? "active",
                      },
                      {
                        key: "payment",
                        label: "Payment status",
                        options: choice([
                          "unpaid",
                          "partial",
                          "paid",
                          "waived",
                        ]),
                        value: selectedMembership?.payment ?? "unpaid",
                      },
                      {
                        key: "amount",
                        label: "Total amount received (€)",
                        type: "number",
                        step: "0.01",
                        value: (selectedMembership?.amount ?? 0) / 100,
                      },
                      dateField(
                        "receivedOn",
                        "Payment recorded date",
                        selectedMembership?.receivedOn,
                      ),
                      {
                        key: "reference",
                        label:
                          "External payment reference / correction reason (no bank credentials)",
                        optional: true,
                        value: selectedMembership?.reference,
                      },
                      {
                        key: "acknowledge",
                        label: "Queue informal email acknowledgement",
                        type: "checkbox",
                      },
                    ],
                    (d) => ({
                      ...d,
                      amount: Math.round(Number(d.amount) * 100),
                      membership: selectedMembership?.id ?? "",
                    }),
                  )}
              </article>
              {can("membership") && (
                <article>
                  <h3>Membership team</h3>
                  {form(
                    "Add or edit a player",
                    "person",
                    [
                      {
                        key: "name",
                        label: "Name",
                        value: selectedPerson?.name,
                      },
                      {
                        key: "mobile",
                        label: "Contact number",
                        optional: true,
                        value: selectedPerson?.mobile,
                      },
                      {
                        key: "junior",
                        label: "Junior player",
                        type: "checkbox",
                        value: selectedPerson?.junior,
                      },
                      {
                        key: "guest",
                        label: "Guest (no membership implied)",
                        type: "checkbox",
                        value: selectedPerson?.status === "guest",
                      },
                      {
                        key: "guardians",
                        label: "Linked adult guardians",
                        options: opt(state.people.filter((p) => !p.junior)),
                        multiple: true,
                        value: selectedPerson?.guardians,
                      },
                    ],
                    (d) => ({ ...d, player: selectedPerson?.id ?? "" }),
                  )}
                </article>
              )}
              {can("membership") && (
                <article>
                  <h3>Membership catalogue</h3>
                  {!state.plans.length && (
                    <p>No types yet. Add your first type below.</p>
                  )}
                  {state.plans.map((p) => (
                    <div className="ops-row" key={p.id}>
                      <div>
                        <strong>{p.name}</strong>
                        <small>
                          {p.months} months · €{(p.price / 100).toFixed(2)} ·{" "}
                          {p.active ? "available" : "retired"}
                        </small>
                      </div>
                      <button onClick={() => setEditing(p.id)}>
                        Edit type
                      </button>
                      <button
                        onClick={() =>
                          void act("plan", {
                            ...p,
                            plan: p.id,
                            active: !p.active,
                          })
                        }
                      >
                        {p.active ? "Retire" : "Reactivate"}
                      </button>
                    </div>
                  ))}
                  {form(
                    "Create or edit membership type",
                    "plan",
                    [
                      { key: "name", label: "Name", value: selectedPlan?.name },
                      {
                        key: "months",
                        label: "Duration in calendar months",
                        type: "number",
                        value: selectedPlan?.months ?? 6,
                      },
                      {
                        key: "price",
                        label: "Price (€)",
                        type: "number",
                        step: "0.01",
                        value: (selectedPlan?.price ?? 0) / 100,
                      },
                      {
                        key: "entitlement",
                        label: "Attendance entitlements",
                        value: selectedPlan?.entitlement,
                        optional: true,
                      },
                    ],
                    (d) => ({
                      ...d,
                      price: Math.round(Number(d.price) * 100),
                      plan: selectedPlan?.id ?? "",
                      active: true,
                    }),
                  )}
                </article>
              )}
            </div>
          )}
          {(tab === "booking" || tab === "attendance") && (
            <label className="ops-session-picker">
              Session
              <select
                aria-label="Session"
                value={session?.id ?? ""}
                onChange={(e) => setSessionId(e.target.value)}
              >
                {sessions.map(([id, label]) => (
                  <option key={id} value={id}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
          )}
          {tab === "attendance" && attendanceCode && (
            <p>
              Using a scanned venue code.{" "}
              <button onClick={() => setAttendanceCode("")}>
                Use direct self-declared app check-in instead
              </button>
            </p>
          )}
          {tab === "booking" && (
            <>
              <h3>One place. The whole session.</h3>
              <p>
                Four player places per table, one active place per
                player/session. Approval is required. A place does not guarantee
                a partner, coaching or attendance.
              </p>
              {session && (
                <>
                  <div className="ops-tables">
                    {(state.board.tables[session.id] ?? []).map((t) => (
                      <article key={t.id}>
                        <h4>Table {t.id}</h4>
                        <span>{t.use.replaceAll("_", " ")}</span>
                        <div className="ops-places">
                          {[0, 1, 2, 3].map((place) => {
                            const r = state.board.requests.find(
                              (r) =>
                                r.sessionId === session.id &&
                                r.tableId === t.id &&
                                r.place === place &&
                                occupiesPlace(r, now),
                            );
                            return (
                              <div
                                className={
                                  r ? `ops-place ops-${r.status}` : "ops-place"
                                }
                                key={place}
                              >
                                Place {place + 1}
                                <strong>
                                  {r?.status ??
                                    (t.use === "reservable"
                                      ? "Free"
                                      : "Reserved")}
                                </strong>
                              </div>
                            );
                          })}
                        </div>
                        {can("booking") && (
                          <label>
                            Allocation
                            <select
                              value={t.use}
                              onChange={(e) =>
                                void act("booking", {
                                  session: session.id,
                                  action: {
                                    type: "table",
                                    tableId: t.id,
                                    use: e.target.value,
                                  },
                                })
                              }
                            >
                              {choice([
                                "reservable",
                                "coaching",
                                "walk_in",
                                "closed",
                              ]).map(([v, label]) => (
                                <option key={v} value={v}>
                                  {label}
                                </option>
                              ))}
                            </select>
                          </label>
                        )}
                      </article>
                    ))}
                  </div>
                  {form(
                    "Request a player place",
                    "booking",
                    [
                      playerField(),
                      {
                        key: "table",
                        label: "Available table and place",
                        options: (state.board.tables[session.id] ?? [])
                          .filter((t) => t.use === "reservable")
                          .flatMap((t) =>
                            [0, 1, 2, 3]
                              .filter(
                                (place) =>
                                  !state.board.requests.some(
                                    (r) =>
                                      r.sessionId === session.id &&
                                      r.tableId === t.id &&
                                      r.place === place &&
                                      occupiesPlace(r, now),
                                  ),
                              )
                              .map(
                                (place) =>
                                  [
                                    `${t.id}:${place}`,
                                    `Table ${t.id} · place ${place + 1}`,
                                  ] as [string, string],
                              ),
                          ),
                      },
                    ],
                    (d) => {
                      const [tableId, place] = String(d.table)
                        .split(":")
                        .map(Number);
                      return {
                        session: session.id,
                        action: {
                          type: "request",
                          playerId: d.player,
                          tableId,
                          place,
                        },
                      };
                    },
                  )}
                  <h3>
                    {can("booking")
                      ? "Maintainer queue and allocations"
                      : "Your requests"}
                  </h3>
                  {state.board.requests
                    .filter(
                      (r) =>
                        r.sessionId === session.id &&
                        (can("booking") ||
                          family.some((p) => p.id === r.playerId)),
                    )
                    .map((r) => (
                      <article className="ops-row" key={r.id}>
                        <div>
                          <strong>{title(r.playerId)}</strong>
                          <small>
                            Table {r.tableId} · Place {r.place + 1} ·{" "}
                            {r.status === "pending" && !occupiesPlace(r, now)
                              ? "expired"
                              : r.status}
                          </small>
                        </div>
                        {can("booking") &&
                          r.status === "pending" &&
                          occupiesPlace(r, now) && (
                            <>
                              <button
                                disabled={busy}
                                onClick={() =>
                                  void act("booking", {
                                    session: session.id,
                                    action: { type: "approve", id: r.id },
                                  })
                                }
                              >
                                Approve place
                              </button>
                              <button
                                disabled={busy}
                                onClick={() =>
                                  void act("booking", {
                                    session: session.id,
                                    action: { type: "reject", id: r.id },
                                  })
                                }
                              >
                                Decline
                              </button>
                            </>
                          )}
                        {occupiesPlace(r, now) && (
                          <>
                            <button
                              disabled={busy}
                              onClick={() =>
                                void act("booking", {
                                  session: session.id,
                                  action: { type: "cancel", id: r.id },
                                })
                              }
                            >
                              Cancel place
                            </button>
                            <button
                              disabled={busy}
                              onClick={() =>
                                void act("booking", {
                                  session: session.id,
                                  action: { type: "release", id: r.id },
                                })
                              }
                            >
                              Release place
                            </button>
                          </>
                        )}
                        {can("booking") && occupiesPlace(r, now) && (
                          <select
                            aria-label={`Move ${title(r.playerId)}`}
                            value=""
                            onChange={(e) => {
                              const [tableId, place] = e.target.value
                                .split(":")
                                .map(Number);
                              void act("booking", {
                                session: session.id,
                                action: {
                                  type: "move",
                                  id: r.id,
                                  tableId,
                                  place,
                                },
                              });
                            }}
                          >
                            <option value="">Move to…</option>
                            {(state.board.tables[session.id] ?? [])
                              .filter((t) => t.use === "reservable")
                              .flatMap((t) =>
                                [0, 1, 2, 3]
                                  .filter(
                                    (p) =>
                                      !state.board.requests.some(
                                        (b) =>
                                          b.sessionId === session.id &&
                                          b.tableId === t.id &&
                                          b.place === p &&
                                          occupiesPlace(b, now),
                                      ),
                                  )
                                  .map((p) => (
                                    <option
                                      key={`${t.id}:${p}`}
                                      value={`${t.id}:${p}`}
                                    >
                                      Table {t.id}, place {p + 1}
                                    </option>
                                  )),
                              )}
                          </select>
                        )}
                      </article>
                    ))}
                </>
              )}
            </>
          )}
          {tab === "attendance" && (
            <>
              <div className="ops-grid">
                <article>
                  <h3>Who is here?</h3>
                  <p>
                    Confirm physical presence. Expired/no-membership visits
                    still count and create management follow-up. Direct app
                    attendance is self-declared.
                  </p>
                  {session &&
                    form(
                      "Mark attendance",
                      "checkin",
                      [
                        playerField(
                          can("attendance") ||
                            can("events") ||
                            state.events.some((e) =>
                              e.delegates.includes(actor),
                            ),
                        ),
                        {
                          key: "event",
                          label: "Tournament delegation (optional)",
                          options: eventOptions,
                          optional: true,
                        },
                        {
                          key: "present",
                          label: "This person is physically at the club",
                          type: "checkbox",
                        },
                      ],
                      (d) => ({
                        ...d,
                        session: session.id,
                        code: attendanceCode,
                      }),
                    )}
                  {session &&
                    form(
                      "Not attending (from home)",
                      "absence",
                      [playerField()],
                      (d) => ({ ...d, session: session.id }),
                    )}
                  {can("attendance") && session && (
                    <button
                      disabled={busy}
                      onClick={() =>
                        void act("issue_qr", { session: session.id })
                      }
                    >
                      Display venue QR (90 seconds)
                    </button>
                  )}
                  {qrImage && qrUntil > now && (
                    <>
                      <img
                        src={qrImage}
                        alt="Venue attendance QR; expires within 90 seconds"
                      />
                      <p>
                        Refresh after expiry. This QR is not a membership or
                        payment credential.
                      </p>
                    </>
                  )}
                </article>
                <article>
                  <h3>Attendance register</h3>
                  {state.attendance
                    .filter((a) => !session || a.session === session.id)
                    .map((a) => (
                      <div className="ops-row" key={a.id}>
                        <div>
                          <strong>{title(a.player)}</strong>
                          <small>
                            {a.source} · {a.membership} ·{" "}
                            {a.corrected ? "corrected / excluded" : "present"}
                          </small>
                        </div>
                        {can("attendance") && !a.corrected && (
                          <button
                            onClick={() => {
                              const reason = prompt(
                                "Reason for attendance correction",
                              );
                              if (reason)
                                void act("correct_attendance", {
                                  attendance: a.id,
                                  reason,
                                });
                            }}
                          >
                            Correct mistaken check-in
                          </button>
                        )}
                      </div>
                    ))}
                  {state.absences
                    .filter((a) => a.session === session?.id)
                    .map((a) => (
                      <p key={a.player}>
                        {title(a.player)} · Not attending (not counted)
                      </p>
                    ))}
                </article>
              </div>
              <h3>Participation report</h3>
              <label>
                Attendance chart grouping
                <select
                  value={reportPeriod}
                  onChange={(e) =>
                    setReportPeriod(
                      e.target.value as "daily" | "weekly" | "monthly",
                    )
                  }
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly (Monday start)</option>
                  <option value="monthly">Monthly</option>
                </select>
              </label>
              <div className="ops-filters">
                <label>
                  From
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                  />
                </label>
                <label>
                  To
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                  />
                </label>
                {[7, 30, 90].map((days) => (
                  <button
                    key={days}
                    onClick={() => {
                      setDateFrom(localDay(now - (days - 1) * 86400000));
                      setDateTo(localDay(now));
                    }}
                  >
                    Last {days} days
                  </button>
                ))}
              </div>
              {report && (
                <div className="ops-grid">
                  <article>
                    <h4>
                      {report.total} visits · {report.unique} players
                    </h4>
                    {report[reportPeriod].map(([date, count]) => (
                      <p className="ops-bar" key={date}>
                        <span>{date}</span>
                        <meter
                          min={0}
                          max={Math.max(
                            ...report[reportPeriod].map((x) => x[1]),
                            1,
                          )}
                          value={count}
                        />
                        <strong>{count}</strong>
                      </p>
                    ))}
                  </article>
                  <article>
                    <h4>Membership at check-in</h4>
                    {report.segments.map(([kind, count]) => (
                      <p key={kind}>
                        {kind}: {count}
                      </p>
                    ))}
                    <h4>Top attendees in this view</h4>
                    {report.top.slice(0, 10).map(([id, count]) => (
                      <p key={id}>
                        {title(id)}: {count}
                      </p>
                    ))}
                    <button
                      onClick={() =>
                        exportJson(report, "attendance-report.json")
                      }
                    >
                      Export report
                    </button>
                  </article>
                </div>
              )}
            </>
          )}
          {tab === "sessions" && (
            <div className="ops-grid">
              <article>
                <h3>Sessions and hall</h3>
                {state.sessions.map((s) => (
                  <div className="ops-row" key={s.id}>
                    <div>
                      <strong>{s.label}</strong>
                      <small>
                        {s.date} · {s.tables} tables · {s.capacity} places ·{" "}
                        {s.cancelled ? "cancelled" : "scheduled"}
                      </small>
                    </div>
                    {can("events") && !s.cancelled && (
                      <button
                        onClick={() => {
                          const reason = prompt(
                            "Reason for cancellation / hall closure",
                          );
                          if (reason)
                            void act("cancel_session", {
                              session: s.id,
                              reason,
                            });
                        }}
                      >
                        Cancel / close hall
                      </button>
                    )}
                  </div>
                ))}
              </article>
              {can("events") && (
                <article>
                  {form(
                    "Publish sessions or camp",
                    "programme",
                    [
                      { key: "name", label: "Programme / session name" },
                      {
                        key: "start",
                        label: "First start (Ireland local time)",
                        type: "datetime-local",
                      },
                      {
                        key: "end",
                        label: "First end (Ireland local time)",
                        type: "datetime-local",
                      },
                      {
                        key: "copies",
                        label: "Number of occurrences (1–60)",
                        type: "number",
                        value: 1,
                      },
                      {
                        key: "spacing",
                        label:
                          "Days between sessions (1 for camp, 7 for weekly)",
                        type: "number",
                        value: 7,
                      },
                      {
                        key: "tables",
                        label: "Number of tables",
                        type: "number",
                        value: 3,
                      },
                      {
                        key: "tableIds",
                        label: "Specific table IDs (optional, e.g. 1,2,3)",
                        optional: true,
                      },
                      {
                        key: "capacity",
                        label: "Session capacity",
                        type: "number",
                        value: 12,
                      },
                    ],
                    (d) => {
                      const count = Number(d.copies),
                        spacing = Number(d.spacing);
                      if (
                        count < 1 ||
                        count > 60 ||
                        spacing < 1 ||
                        spacing > 365
                      )
                        return { occurrences: [] };
                      const shift = (value: string, days: number) =>
                        new Date(
                          Date.parse(value.slice(0, 10)) + days * 86400000,
                        )
                          .toISOString()
                          .slice(0, 10) + value.slice(10);
                      return {
                        occurrences: Array.from({ length: count }, (_, i) => ({
                          ...d,
                          tableIds: String(d.tableIds).trim()
                            ? String(d.tableIds).split(",").map(Number)
                            : [],
                          start: inDublin(shift(String(d.start), i * spacing)),
                          end: inDublin(shift(String(d.end), i * spacing)),
                        })),
                      };
                    },
                  )}
                </article>
              )}
            </div>
          )}
          {tab === "tournaments" && (
            <>
              <div className="ops-grid">
                <article>
                  <h3>Competitions and events</h3>
                  {state.events
                    .filter((e) => !eventFilter || e.id === eventFilter)
                    .map((e) => (
                      <div className="ops-event" key={e.id}>
                        <h4>{e.name}</h4>
                        <p>
                          {e.date} · {e.external ? "External" : e.format} ·{" "}
                          {e.state}
                        </p>
                        {(can("events") ||
                          can("coach") ||
                          e.delegates.includes(actor)) && (
                          <div className="ops-actions">
                            {[
                              "published",
                              "in_progress",
                              "completed",
                              "cancelled",
                            ].map((next) => (
                              <button
                                key={next}
                                onClick={() => {
                                  const reason =
                                    next === "completed" || next === "cancelled"
                                      ? (prompt(
                                          "Reason (required if matches are unresolved)",
                                        ) ?? "")
                                      : "";
                                  void act("event_state", {
                                    event: e.id,
                                    state: next,
                                    reason,
                                    present:
                                      next === "in_progress"
                                        ? confirm(
                                            "Confirm all selected participants are physically here. Missing check-ins will be recorded.",
                                          )
                                        : false,
                                  });
                                }}
                              >
                                {next.replaceAll("_", " ")}
                              </button>
                            ))}
                          </div>
                        )}
                        {can("events") &&
                          form(
                            `Delegates for ${e.name}`,
                            "delegate",
                            [
                              {
                                key: "players",
                                label: "Nominated player organizers",
                                options: opt(
                                  state.people.filter(
                                    (p) => p.status === "player",
                                  ),
                                ),
                                multiple: true,
                                value: e.delegates,
                              },
                            ],
                            (d) => ({ ...d, event: e.id }),
                          )}
                        {!e.external && e.format === "round_robin" && (
                          <table>
                            <thead>
                              <tr>
                                <th>Team</th>
                                <th>P</th>
                                <th>W</th>
                                <th>Pts</th>
                                <th>Game diff</th>
                              </tr>
                            </thead>
                            <tbody>
                              {standings(state, e).map((r) => (
                                <tr key={r.team.join()}>
                                  <td>{r.team.map(title).join(" / ")}</td>
                                  <td>{r.played}</td>
                                  <td>{r.won}</td>
                                  <td>{r.points}</td>
                                  <td>{r.games}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                        <p>
                          Only confirmed/auto-approved completed results affect
                          standings. Configured tie-break order:{" "}
                          {e.tieBreaks?.join(" → ") ??
                            "game_difference → point_difference"}
                          . Exact remaining ties use a stable display order; no
                          additional win is assigned.
                        </p>
                      </div>
                    ))}
                </article>
                {can("events") && (
                  <article>
                    {form(
                      "Create tournament or external event",
                      "event",
                      [
                        { key: "name", label: "Event name" },
                        dateField("date", "Event date"),
                        {
                          key: "external",
                          label:
                            "External event (no local fixtures/check-in required)",
                          type: "checkbox",
                        },
                        {
                          key: "session",
                          label: "Internal session",
                          options: sessions,
                          optional: true,
                          value:
                            state.sessions.find(
                              (x) =>
                                x.start <= now && x.end > now && !x.cancelled,
                            )?.id ?? "",
                        },
                        {
                          key: "format",
                          label: "Format",
                          options: choice([
                            "round_robin",
                            "single_elimination",
                          ]),
                          value: "round_robin",
                        },
                        {
                          key: "mode",
                          label: "Teams",
                          options: choice(["singles", "doubles"]),
                          value: "singles",
                        },
                        {
                          key: "players",
                          label:
                            "Players (doubles pairs follow the roster order shown)",
                          options: playerOptions,
                          multiple: true,
                          value: [
                            ...new Set(
                              state.attendance
                                .filter(
                                  (a) =>
                                    !a.corrected &&
                                    localDay(Date.parse(a.at)) ===
                                      localDay(now),
                                )
                                .map((a) => a.player),
                            ),
                          ],
                          optional: true,
                        },
                        {
                          key: "present",
                          label:
                            "Ad hoc: selected participants are physically here — also check them in",
                          type: "checkbox",
                        },
                        {
                          key: "bestOf",
                          label: "Best of",
                          type: "number",
                          value: 5,
                        },
                        {
                          key: "winPoints",
                          label: "League points for a win",
                          type: "number",
                          value: 2,
                        },
                        {
                          key: "lossPoints",
                          label: "League points for a loss",
                          type: "number",
                          value: 1,
                        },
                        {
                          key: "tieBreaks",
                          label:
                            "Tie-break order (comma-separated: game_difference, point_difference, head_to_head)",
                          value: "game_difference,point_difference",
                        },
                        {
                          key: "source",
                          label: "Official HTTPS source (optional)",
                          optional: true,
                        },
                      ],
                      (d) => {
                        const players = d.players as string[];
                        const width = d.mode === "doubles" ? 2 : 1;
                        return {
                          ...d,
                          teams: Array.from(
                            { length: Math.ceil(players.length / width) },
                            (_, i) =>
                              players.slice(i * width, i * width + width),
                          ),
                        };
                      },
                    )}
                  </article>
                )}
              </div>
              <p>
                Pick checked-in participants from the Attendance register.
                Delegated organizers can mark physically present participants
                through the match/session workflow; no membership permission is
                implied.
              </p>
            </>
          )}
          {tab === "matches" && (
            <>
              <div className="ops-grid">
                <article>
                  {form(
                    "Start or log a match",
                    "match",
                    [
                      {
                        key: "event",
                        label: "Tournament/event",
                        options: eventOptions,
                        optional: true,
                        value: eventFilter,
                      },
                      {
                        key: "session",
                        label: "Club session (optional for external event)",
                        options: sessions,
                        optional: true,
                      },
                      {
                        key: "draftEvent",
                        label: "Your unlisted external event proposal",
                        options: state.eventDrafts
                          .filter((e) => e.author === actor && !e.linkedEvent)
                          .map((e) => [e.id, e.name]),
                        optional: true,
                      },
                      {
                        key: "date",
                        label: "Played on (optional; otherwise event date)",
                        type: "date",
                        optional: true,
                      },
                      {
                        key: "allowDuplicate",
                        label: "This is a separate repeat match",
                        type: "checkbox",
                      },
                      {
                        key: "duplicateReason",
                        label: "Reason for separate repeat match",
                        optional: true,
                      },
                      {
                        key: "one",
                        label:
                          "Side one (one singles player or two doubles players)",
                        options: playerOptions,
                        multiple: true,
                      },
                      {
                        key: "two",
                        label: "Side two",
                        options: playerOptions,
                        multiple: true,
                      },
                      {
                        key: "bestOf",
                        label: "Best of 1/3/5/7",
                        type: "number",
                        value: 5,
                      },
                      {
                        key: "table",
                        label: "Table number (optional)",
                        optional: true,
                      },
                    ],
                    (d) => ({ ...d, sides: [d.one, d.two] }),
                  )}
                </article>
              </div>
              <div className="ops-grid">
                {state.matches
                  .filter((m) => !eventFilter || m.event === eventFilter)
                  .map((m) => (
                    <article key={m.id}>
                      <h3>
                        {m.sides
                          .map(
                            (team) =>
                              team.map(title).join(" / ") ||
                              "Awaiting qualifier",
                          )
                          .join(" vs ")}
                      </h3>
                      <p>
                        {state.events.find((e) => e.id === m.event)?.name ??
                          "Club match"}{" "}
                        · Round {m.round} · {m.status.replaceAll("_", " ")}
                      </p>
                      <p>
                        {m.games.map((g) => g.join("–")).join(", ")}
                        {m.aggregate && ` · Aggregate ${m.aggregate.join("–")}`}
                      </p>
                      {m.reason && <p>Result review note: {m.reason}</p>}
                      {m.status === "awaiting_review" && (
                        <p>
                          Review by{" "}
                          {new Date(m.deadline).toLocaleString("en-IE", {
                            timeZone: "Europe/Dublin",
                          })}
                        </p>
                      )}
                      {(can("coach") ||
                        m.sides
                          .flat()
                          .some((p) => represents(state, actor, p)) ||
                        state.events
                          .find((e) => e.id === m.event)
                          ?.delegates.includes(actor)) &&
                        form(
                          `Score match ${m.id}`,
                          "score",
                          [
                            {
                              key: "games",
                              label:
                                "Game scores: 11-7, 9-11, 12-10 (drafts may be partial)",
                              optional: true,
                              value: m.games.map((g) => g.join("-")).join(", "),
                            },
                            {
                              key: "aggregate",
                              label: "External aggregate only: 3-1 (optional)",
                              optional: true,
                              value: m.aggregate?.join("-") ?? "",
                            },
                            {
                              key: "draft",
                              label: "Save draft / pause",
                              type: "checkbox",
                            },
                            {
                              key: "reason",
                              label:
                                "Coach correction reason (required for confirmed results)",
                              optional: true,
                            },
                            {
                              key: "incomplete",
                              label:
                                "Incomplete / retired (excluded from results statistics)",
                              type: "checkbox",
                            },
                          ],
                          (d) => ({
                            ...d,
                            match: m.id,
                            games: String(d.games).trim()
                              ? String(d.games)
                                  .split(",")
                                  .map((g) => g.trim().split("-").map(Number))
                              : [],
                            aggregate: String(d.aggregate).trim()
                              ? String(d.aggregate).split("-").map(Number)
                              : null,
                          }),
                        )}
                      {(can("coach") ||
                        m.reviewEligible.some((p) =>
                          represents(state, actor, p),
                        )) && (
                        <div className="ops-actions">
                          <button
                            onClick={() => {
                              const reason = can("coach")
                                ? (prompt("Coach resolution reason") ?? "")
                                : "";
                              void act("review", {
                                match: m.id,
                                approve: true,
                                reason,
                              });
                            }}
                          >
                            Approve result
                          </button>
                          <button
                            onClick={() => {
                              const reason = prompt("What needs changing?");
                              if (reason)
                                void act("review", {
                                  match: m.id,
                                  approve: false,
                                  reason,
                                });
                            }}
                          >
                            Request edit
                          </button>
                        </div>
                      )}
                      {family
                        .filter((p) => m.sides.flat().includes(p.id))
                        .map((p) => {
                          const r = state.reflections.find(
                            (r) => r.match === m.id && r.player === p.id,
                          );
                          return (
                            <div key={p.id}>
                              {form(
                                `Private reflection · ${p.name}`,
                                "reflection",
                                [
                                  {
                                    key: "good",
                                    label: "Worked well",
                                    options: state.tags
                                      .filter(
                                        (t) =>
                                          t.active || r?.good.includes(t.id),
                                      )
                                      .map((t) => [t.id, t.label]),
                                    multiple: true,
                                    optional: true,
                                    value: r?.good,
                                  },
                                  {
                                    key: "improve",
                                    label: "Needs work",
                                    options: state.tags
                                      .filter(
                                        (t) =>
                                          t.active || r?.improve.includes(t.id),
                                      )
                                      .map((t) => [t.id, t.label]),
                                    multiple: true,
                                    optional: true,
                                    value: r?.improve,
                                  },
                                  {
                                    key: "note",
                                    label:
                                      "Personal observation (up to 2000 characters)",
                                    type: "textarea",
                                    optional: true,
                                    value: r?.note,
                                  },
                                ],
                                (d) => ({ ...d, player: p.id, match: m.id }),
                              )}
                              {r && (
                                <button
                                  onClick={() =>
                                    void act("reflection", {
                                      player: p.id,
                                      match: m.id,
                                      good: [],
                                      improve: [],
                                      note: "",
                                      remove: true,
                                    })
                                  }
                                >
                                  Remove reflection
                                </button>
                              )}
                            </div>
                          );
                        })}
                    </article>
                  ))}
              </div>
            </>
          )}
          {tab === "coaching" && (
            <>
              <p>
                Player observations are self-reported. They are not diagnoses,
                ratings or coach assessments.
              </p>
              {can("coach") && summary && (
                <>
                  <div className="ops-filters">
                    <label>
                      Event
                      <select
                        value={eventFilter}
                        onChange={(e) => setEventFilter(e.target.value)}
                      >
                        <option value="">All events</option>
                        {eventOptions.map(([id, name]) => (
                          <option key={id} value={id}>
                            {name}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      From
                      <input
                        type="date"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                      />
                    </label>
                    <label>
                      To
                      <input
                        type="date"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                      />
                    </label>
                  </div>
                  <h3>
                    {summary.reportingPlayers} reporting players ·{" "}
                    {summary.reflections} match reflections
                  </h3>
                  <table>
                    <thead>
                      <tr>
                        <th>Observation</th>
                        <th>Worked well reports</th>
                        <th>Needs work reports</th>
                        <th>Players needing work</th>
                      </tr>
                    </thead>
                    <tbody>
                      {summary.tags.map((t) => (
                        <tr key={t.id}>
                          <td>{t.label}</td>
                          <td>{t.good}</td>
                          <td>{t.improve}</td>
                          <td>
                            {t.improvePlayers}/{summary.reportingPlayers}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <details>
                    <summary>
                      Permitted contributing observations (including incomplete
                      matches)
                    </summary>
                    {summary.contributions.map((r) => (
                      <p key={r.id}>
                        {title(r.player)} · {r.note} · Needs work:{" "}
                        {r.improve.join(", ")}
                      </p>
                    ))}
                  </details>
                </>
              )}
              <div className="ops-grid">
                {can("coach") && (
                  <>
                    <article>
                      {form("Private coach working note", "note", [
                        playerField(true),
                        {
                          key: "body",
                          label: "Private note",
                          type: "textarea",
                        },
                      ])}
                      {state.notes.map((n) => (
                        <p key={n.id}>
                          <strong>{title(n.player)}</strong>: {n.body}
                        </p>
                      ))}
                    </article>
                    <article>
                      {form("Propose development summary", "assessment", [
                        playerField(true),
                        {
                          key: "strengths",
                          label: "Strengths",
                          type: "textarea",
                        },
                        {
                          key: "improvements",
                          label: "Improvement areas",
                          type: "textarea",
                        },
                        {
                          key: "goals",
                          label: "Future goals",
                          type: "textarea",
                        },
                      ])}
                      {form("Add coaching tag", "tag", [
                        { key: "name", label: "Tag label" },
                      ])}
                      {state.tags.map((t) => (
                        <button
                          key={t.id}
                          onClick={() =>
                            void act("tag", { tag: t.id, active: !t.active })
                          }
                        >
                          {t.label}: {t.active ? "retire" : "reactivate"}
                        </button>
                      ))}
                    </article>
                  </>
                )}
                {state.assessments.map((a) => (
                  <article key={a.id}>
                    <h3>
                      {title(a.player)} ·{" "}
                      {a.published
                        ? "Published"
                        : "Awaiting two-person sign-off"}
                    </h3>
                    <p>Strengths: {a.strengths}</p>
                    <p>Needs work: {a.improvements}</p>
                    <p>Goals: {a.goals}</p>
                    <p>
                      Player/guardian: {a.family ? "signed" : "pending"} ·
                      Coach: {a.coach ? "signed" : "pending"}
                    </p>
                    {represents(state, actor, a.player) && (
                      <button
                        onClick={() =>
                          void act("signoff", {
                            assessment: a.id,
                            side: "family",
                          })
                        }
                      >
                        Player / guardian sign-off
                      </button>
                    )}
                    {can("coach") && (
                      <button
                        onClick={() =>
                          void act("signoff", {
                            assessment: a.id,
                            side: "coach",
                          })
                        }
                      >
                        Coach sign-off
                      </button>
                    )}
                  </article>
                ))}
              </div>
            </>
          )}
          {tab === "communications" && (
            <div className="ops-grid">
              <article>
                <h3>Your notifications</h3>
                {state.notices.map((n) => (
                  <div className="ops-row" key={n.id}>
                    <div>
                      <strong>{n.subject}</strong>
                      <small>
                        {n.kind} · email:{" "}
                        {liveMode
                          ? n.email
                          : `${n.email} (delivery disabled in synthetic mode)`}
                      </small>
                    </div>
                  </div>
                ))}
              </article>
              {can("communications") && (
                <article>
                  {form("Invite subscribed adults to an event", "invite", [
                    {
                      key: "event",
                      label: "Published event",
                      options: eventOptions,
                    },
                  ])}
                  <button onClick={() => void act("jobs", {})}>
                    Process due reminders and result reviews
                  </button>
                  <p>
                    Processing queues notices; email sending requires the
                    configured server worker. No email is marked sent by this
                    button.
                  </p>
                </article>
              )}
            </div>
          )}
          {tab === "people" && can("membership") && (
            <article>
              {form(
                "Link offline history to a verified account",
                "claim_profile",
                [
                  {
                    key: "source",
                    label: "Unclaimed offline profile",
                    options: opt(state.people.filter((p) => !p.emailVerified)),
                  },
                  {
                    key: "target",
                    label: "Verified account",
                    options: opt(state.people.filter((p) => p.emailVerified)),
                  },
                  {
                    key: "reason",
                    label: "Identity verification / linking reason",
                  },
                ],
              )}
              {form("Record departure or reject an application", "leave", [
                playerField(true),
                { key: "reason", label: "Reason" },
              ])}
            </article>
          )}
          {tab === "booking" && can("booking") && (
            <article>
              {form("Move a booking to another session", "reschedule_booking", [
                {
                  key: "booking",
                  label: "Original reservation",
                  options: state.board.requests
                    .filter((r) => occupiesPlace(r, now))
                    .map((r) => [
                      r.id,
                      `${title(r.playerId)} · ${state.sessions.find((s) => s.id === r.sessionId)?.label} · Table ${r.tableId}`,
                    ]),
                },
                { key: "session", label: "New session", options: sessions },
                {
                  key: "table",
                  label: "New table number",
                  type: "number",
                  value: 1,
                },
                {
                  key: "place",
                  label: "New player place (1–4)",
                  type: "number",
                  value: 1,
                },
                { key: "reason", label: "Rescheduling reason" },
              ])}
              <p>
                The original place is retained if the new allocation cannot be
                acquired.
              </p>
            </article>
          )}
          {tab === "management" && (
            <article>
              <h3>Personal-data requests</h3>
              {form(
                "Request a correction, export or deletion review",
                "data_request",
                [
                  playerField(can("privacy")),
                  {
                    key: "reason",
                    label:
                      "Request details (management will verify identity and retention obligations)",
                    type: "textarea",
                  },
                ],
              )}
              {family.map((p) => (
                <button
                  key={p.id}
                  onClick={() =>
                    void exportPerson(club, actor, p.id)
                      .then((value) =>
                        exportJson(value, "personal-club-data.json"),
                      )
                      .catch((e) => setMessage(e.message))
                  }
                >
                  Export {p.name}’s personal records
                </button>
              ))}
              {can("privacy") && (
                <label>
                  Export a verified request subject
                  <select
                    aria-label="Export subject"
                    value=""
                    onChange={(e) => {
                      const id = e.target.value;
                      if (id)
                        void exportPerson(club, actor, id)
                          .then((value) =>
                            exportJson(
                              value,
                              "reviewed-personal-club-data.json",
                            ),
                          )
                          .catch((e) => setMessage(e.message));
                    }}
                  >
                    <option value="">Choose verified request subject…</option>
                    {playerOptions.map(([id, name]) => (
                      <option key={id} value={id}>
                        {name}
                      </option>
                    ))}
                  </select>
                </label>
              )}
              <p>
                Restricted coach records require a separate human review. Export
                access does not grant general coaching permissions.
              </p>
            </article>
          )}
          {tab === "management" && state.work.length > 0 && (
            <article>
              {form("Assign or comment on shared work", "work", [
                {
                  key: "work",
                  label: "Work item",
                  options: state.work.map((w) => [w.id, w.title]),
                },
                {
                  key: "assignee",
                  label:
                    "Assignee (must have the required permission; blank releases)",
                  options: opt(state.people.filter((p) => !p.junior)),
                  optional: true,
                },
                {
                  key: "state",
                  label: "Work status",
                  options: choice(["open", "claimed", "resolved"]),
                  value: "open",
                },
                {
                  key: "comment",
                  label: "Comment / resolution",
                  type: "textarea",
                  optional: true,
                },
              ])}
            </article>
          )}
          {tab === "communications" && (
            <article>
              {form("Event email subscription", "subscribe", [
                {
                  key: "name",
                  label: "Adult subscriber name",
                  value: state.people.find((p) => p.id === actor)?.name ?? "",
                },
                {
                  key: "marketing",
                  label:
                    "Receive optional club event emails (uncheck to unsubscribe)",
                  type: "checkbox",
                  value: state.people.find((p) => p.id === actor)?.marketing,
                },
                {
                  key: "consent",
                  label:
                    "I am an adult and consent to these optional event emails",
                  type: "checkbox",
                },
              ])}
            </article>
          )}
          {tab === "matches" && (
            <article>
              <h3>Personal result statistics</h3>
              {family.map((p) => {
                const stats = matchStatistics(
                  state,
                  p.id,
                  eventFilter,
                  dateFrom,
                  dateTo,
                );
                return (
                  <p key={p.id}>
                    <strong>{p.name}</strong> · Reviewed/auto-approved:{" "}
                    {stats.reviewed.played} played, {stats.reviewed.won} won,{" "}
                    {stats.reviewed.lost} lost. External player-reported:{" "}
                    {stats.reported.played} played, {stats.reported.won} won,{" "}
                    {stats.reported.lost} lost. Awaiting/draft/disputed:{" "}
                    {stats.pending}. Incomplete: {stats.incomplete} (excluded).
                  </p>
                );
              })}
              <p>
                Statistics use the selected event and current reporting date
                range. Reported results are not official ratings.
              </p>
            </article>
          )}
          {tab === "management" && can("content") && (
            <article>
              <h3>Published content and drafts</h3>
              {state.pages.map((p) => (
                <div className="ops-row" key={p.id}>
                  <p>
                    {p.title} · {p.published ? "published" : "draft"}
                  </p>
                  <button
                    onClick={() => {
                      const title = prompt("Updated title", p.title),
                        body = prompt("Updated plain-text content", p.body);
                      if (title && body)
                        void act("page", { ...p, page: p.id, title, body });
                    }}
                  >
                    Edit content
                  </button>
                  <button
                    onClick={() =>
                      void act("page", {
                        ...p,
                        page: p.id,
                        published: !p.published,
                      })
                    }
                  >
                    {p.published ? "Unpublish" : "Publish"}
                  </button>
                </div>
              ))}
            </article>
          )}
          {tab === "attendance" && report && (
            <article>
              <h3>Visits against published session capacity</h3>
              {report.utilization.map((s) => (
                <p key={s.id}>
                  {s.title}: {s.visits} visits / {s.capacity} published places.
                  Visits measure attendance, not simultaneous occupancy.
                </p>
              ))}
            </article>
          )}
          {tab === "management" && can("attendance") && (
            <article>
              {form("Attendance digest policy", "digest_settings", [
                {
                  key: "enabled",
                  label: "Enable optional daily attendance digest",
                  type: "checkbox",
                  value: state.settings.dailyDigest,
                },
                {
                  key: "time",
                  label: "Ireland local delivery time",
                  type: "time",
                  value: state.settings.digestTime ?? "23:00",
                },
              ])}
              <p>
                Default expiry summaries are separate. The attendance digest is
                off unless enabled.
              </p>
            </article>
          )}
          {tab === "coaching" && can("coach") && (
            <article>
              <label>
                Players / training group selection (leave empty for all
                reporting players)
                <select
                  multiple
                  value={coachingPlayers}
                  onChange={(e) =>
                    setCoachingPlayers(
                      [...e.target.selectedOptions].map((o) => o.value),
                    )
                  }
                >
                  {playerOptions.map(([id, name]) => (
                    <option key={id} value={id}>
                      {name}
                    </option>
                  ))}
                </select>
              </label>
              <button onClick={() => setCoachingPlayers([])}>
                All permitted players
              </button>
              {state.events
                .filter((e) => !eventFilter || e.id === eventFilter)
                .flatMap((e) =>
                  e.teams.map((team, i) => (
                    <button
                      key={`${e.id}:${i}`}
                      onClick={() => setCoachingPlayers(team)}
                    >
                      {e.name} · team {i + 1}
                    </button>
                  )),
                )}
              <p>
                The summary and contributing observations above use this
                selected group. Group membership is a view filter, not an
                automatic skill assessment.
              </p>
            </article>
          )}
          {tab === "management" && can("access") && (
            <article>
              {form("Approved club website", "website", [
                {
                  key: "url",
                  label: "HTTPS club website URL",
                  value: state.website ?? "",
                },
                {
                  key: "verified",
                  label: "I have verified this is the approved club website",
                  type: "checkbox",
                },
                { key: "reason", label: "Verification/change evidence" },
              ])}
            </article>
          )}
          {tab === "people" && can("membership") && (
            <article>
              <h3>Manual payments and trial extensions</h3>
              {form(
                "Record an additional external payment",
                "payment",
                [
                  {
                    key: "membership",
                    label: "Membership period",
                    options: state.memberships.map((m) => [
                      m.id,
                      `${title(m.player)} · ${m.start}–${m.end}`,
                    ]),
                  },
                  {
                    key: "amount",
                    label: "Payment received (€)",
                    type: "number",
                    step: "0.01",
                    value: 0,
                  },
                  dateField("date", "Date received"),
                  {
                    key: "method",
                    label: "Method (cash/transfer; no bank credentials)",
                    optional: true,
                  },
                  {
                    key: "reference",
                    label: "Reference or correction note",
                    optional: true,
                  },
                  {
                    key: "status",
                    label: "Updated overall payment status",
                    options: choice(["unpaid", "partial", "paid", "waived"]),
                    value: "partial",
                  },
                  {
                    key: "acknowledge",
                    label: "Queue informal acknowledgement",
                    type: "checkbox",
                  },
                ],
                (d) => ({ ...d, amount: Math.round(Number(d.amount) * 100) }),
              )}
              {state.payments.map((p) => (
                <div className="ops-row" key={p.id}>
                  <p>
                    €{(p.amount / 100).toFixed(2)} · {p.date} · {p.method} ·{" "}
                    {p.reference}
                  </p>
                  <button
                    onClick={() => {
                      const amount = prompt(
                          "Correct received amount in euro",
                          (p.amount / 100).toFixed(2),
                        ),
                        reason = prompt("Correction reason");
                      if (amount !== null && reason)
                        void act("payment", {
                          membership: p.membership,
                          paymentId: p.id,
                          amount: Math.round(Number(amount) * 100),
                          date: p.date,
                          method: p.method,
                          reference: reason,
                          status: state.memberships.find(
                            (m) => m.id === p.membership,
                          )?.payment,
                          acknowledge: false,
                        });
                    }}
                  >
                    Correct payment
                  </button>
                </div>
              ))}
              {form("Extend a trial", "extend_trial", [
                {
                  key: "membership",
                  label: "Trial period",
                  options: state.memberships
                    .filter((m) => m.status === "trial")
                    .map((m) => [m.id, `${title(m.player)} · ends ${m.end}`]),
                },
                dateField("end", "New inclusive end date"),
                { key: "reason", label: "Extension reason" },
              ])}
              <details>
                <summary>Membership change history</summary>
                {state.audit
                  .filter((a) =>
                    ["membership", "payment", "extend_trial"].includes(
                      a.action,
                    ),
                  )
                  .slice(-30)
                  .reverse()
                  .map((a) => (
                    <p key={a.id}>
                      {a.at} · {title(a.actor)} ·{" "}
                      {a.action.replaceAll("_", " ")}
                    </p>
                  ))}
              </details>
            </article>
          )}
          {tab === "sessions" && can("events") && (
            <article>
              {form(
                "Block the whole hall",
                "close_hall",
                [
                  {
                    key: "start",
                    label: "Closure starts (Ireland local time)",
                    type: "datetime-local",
                  },
                  {
                    key: "end",
                    label: "Closure ends (Ireland local time)",
                    type: "datetime-local",
                  },
                  { key: "reason", label: "Closure reason" },
                ],
                (d) => ({
                  ...d,
                  start: inDublin(String(d.start)),
                  end: inDublin(String(d.end)),
                }),
              )}
              {state.closures
                .filter((c) => c.active)
                .map((c) => (
                  <p key={c.id}>
                    {c.reason} ·{" "}
                    {new Date(c.start).toLocaleString("en-IE", {
                      timeZone: "Europe/Dublin",
                    })}{" "}
                    <button
                      onClick={() => {
                        const reason = prompt(
                          "Reason to reopen (cancelled bookings will not be restored)",
                        );
                        if (reason)
                          void act("reopen_hall", { closure: c.id, reason });
                      }}
                    >
                      Reopen hall
                    </button>
                  </p>
                ))}
            </article>
          )}
          {tab === "tournaments" &&
            (can("coach") ||
              can("events") ||
              state.events.some((e) => e.delegates.includes(actor))) && (
              <article>
                {form("Record an adult guest participant", "guest", [
                  { key: "name", label: "Guest name" },
                  {
                    key: "event",
                    label: "Delegated event (if applicable)",
                    options: eventOptions,
                    optional: true,
                  },
                ])}
                <p>
                  Juniors must be registered with an authorized guardian through
                  the membership team.
                </p>
              </article>
            )}
          {tab === "tournaments" && (
            <article>
              {form(
                "Propose an unlisted external event privately",
                "propose_event",
                [
                  { key: "name", label: "Proposed event name" },
                  dateField("date", "Event date"),
                  {
                    key: "source",
                    label: "Official HTTPS source (optional)",
                    optional: true,
                  },
                ],
              )}
              {state.eventDrafts.map((e) => (
                <p key={e.id}>
                  {e.name} · {e.date} ·{" "}
                  {e.linkedEvent ? "Linked by management" : "Private proposal"}
                </p>
              ))}
              {can("events") &&
                form("Link a proposal to an external event", "link_event", [
                  {
                    key: "draft",
                    label: "Proposal",
                    options: state.eventDrafts.map((e) => [e.id, e.name]),
                  },
                  {
                    key: "event",
                    label: "External event",
                    options: state.events
                      .filter((e) => e.external)
                      .map((e) => [e.id, e.name]),
                  },
                ])}
            </article>
          )}
          {tab === "tournaments" &&
            state.events
              .filter(
                (e) =>
                  e.state === "draft" &&
                  !e.external &&
                  (can("events") || e.delegates.includes(actor)),
              )
              .map((e) => (
                <article key={e.id}>
                  {form(
                    `Edit teams and seeding for ${e.name}`,
                    "event_teams",
                    e.teams.map((team, i) => ({
                      key: `team${i}`,
                      label: `Team / seed ${i + 1} (one singles player or two doubles players)`,
                      options: playerOptions,
                      multiple: true,
                      value: team,
                    })),
                    (d) => ({
                      event: e.id,
                      teams: e.teams.map((_, i) => d[`team${i}`]),
                    }),
                  )}
                </article>
              ))}
          {tab === "management" && (
            <>
              <div className="ops-grid">
                {can("access") && (
                  <article>
                    {form("Grant or revoke management permissions", "grant", [
                      {
                        key: "player",
                        label: "Adult account",
                        options: opt(state.people.filter((p) => !p.junior)),
                      },
                      {
                        key: "permissions",
                        label:
                          "Current permissions to grant (empty revokes all)",
                        options: choice([...permissions]),
                        multiple: true,
                        optional: true,
                      },
                    ])}
                    <p>
                      Membership-team access grants membership tasks only.
                      Hosting and platform ownership are separate.
                    </p>
                    {Object.entries(state.grants).map(([id, roles]) => (
                      <p key={id}>
                        {title(id)}:{" "}
                        {roles.join(", ") || "no management access"}
                      </p>
                    ))}
                  </article>
                )}
                {can("membership") && (
                  <article>
                    {form(
                      "Trial and notification policy",
                      "operations_settings",
                      [
                        {
                          key: "trialMonths",
                          label: "Trial calendar months",
                          type: "number",
                          value: state.settings.trialMonths,
                        },
                        {
                          key: "reminders",
                          label: "Optional advance reminders",
                          options: [
                            ["10", "10 days before"],
                            ["3", "3 days before"],
                          ],
                          multiple: true,
                          optional: true,
                          value: state.settings.reminders.map(String),
                        },
                        {
                          key: "holdMinutes",
                          label: "Booking hold minutes",
                          type: "number",
                          value: state.settings.holdMinutes,
                        },
                        {
                          key: "cancelHours",
                          label: "Cancellation cutoff hours",
                          type: "number",
                          value: state.settings.cancelHours,
                        },
                        {
                          key: "dailyDigest",
                          label: "Enable optional attendance digest",
                          type: "checkbox",
                          value: state.settings.dailyDigest,
                        },
                      ],
                      (d) => ({
                        ...d,
                        reminders: (d.reminders as string[]).map(Number),
                      }),
                    )}
                  </article>
                )}
                {can("privacy") && (
                  <article>
                    {form(
                      "Public safeguarding and privacy information",
                      "settings",
                      [
                        {
                          key: "privacy",
                          label: "Privacy contact",
                          value: state.settings.privacy,
                          optional: true,
                        },
                        {
                          key: "safeguarding",
                          label: "Safeguarding contact",
                          value: state.settings.safeguarding,
                          optional: true,
                        },
                        {
                          key: "policy",
                          label: "Approved policy text",
                          type: "textarea",
                          value: state.settings.policy,
                          optional: true,
                        },
                        {
                          key: "retentionApproved",
                          label:
                            "Approve automated retention: operations 24 months, membership/payment 7 years, left-player private notes 12 months",
                          type: "checkbox",
                          value: state.settings.retentionApproved,
                        },
                        {
                          key: "reason",
                          label:
                            "Retention approval reference/reason (required if enabled)",
                          optional: true,
                        },
                      ],
                    )}
                  </article>
                )}
                {can("content") && (
                  <article>
                    {form("Publish club content / event news", "page", [
                      { key: "title", label: "Title" },
                      {
                        key: "kind",
                        label: "Kind",
                        options: choice(["page", "news", "policy", "event"]),
                      },
                      {
                        key: "body",
                        label: "Plain-text content",
                        type: "textarea",
                      },
                      {
                        key: "event",
                        label: "Linked event",
                        options: eventOptions,
                        optional: true,
                      },
                      { key: "published", label: "Publish", type: "checkbox" },
                    ])}
                  </article>
                )}
                {state.work.length > 0 && (
                  <article>
                    <h3>Shared management work</h3>
                    {state.work.map((w) => (
                      <div className="ops-event" key={w.id}>
                        <h4>{w.title}</h4>
                        <p>
                          {w.state} ·{" "}
                          {w.assignee ? title(w.assignee) : "Unassigned"}
                        </p>
                        {w.comments.map((c, i) => (
                          <p key={i}>{c}</p>
                        ))}
                        <button
                          onClick={() =>
                            void act("work", {
                              work: w.id,
                              assignee: actor,
                              state: "claimed",
                              comment: "",
                            })
                          }
                        >
                          Claim
                        </button>
                        <button
                          onClick={() =>
                            void act("work", {
                              work: w.id,
                              assignee: "",
                              state: "open",
                              comment: "",
                            })
                          }
                        >
                          Release
                        </button>
                        <button
                          onClick={() => {
                            const comment = prompt("Resolution / comment");
                            if (comment)
                              void act("work", {
                                work: w.id,
                                assignee: actor,
                                state: "resolved",
                                comment,
                              });
                          }}
                        >
                          Resolve with note
                        </button>
                      </div>
                    ))}
                  </article>
                )}
                <article>
                  <h3>Published club information</h3>
                  <p>Privacy: {state.settings.privacy || "Not configured"}</p>
                  <p>
                    Safeguarding:{" "}
                    {state.settings.safeguarding || "Not configured"}
                  </p>
                  <p>
                    {state.settings.policy ||
                      "Club policy text is not configured."}
                  </p>
                  {state.pages
                    .filter((p) => p.published)
                    .map((p) => (
                      <div key={p.id}>
                        <h4>{p.title}</h4>
                        <p>{p.body}</p>
                      </div>
                    ))}
                  <button
                    onClick={() =>
                      exportJson(state, "permitted-club-data.json")
                    }
                  >
                    Export data visible to your account
                  </button>
                </article>
              </div>
              {can("access") && (
                <details>
                  <summary>Audited changes ({state.audit.length})</summary>
                  {state.audit
                    .slice(-50)
                    .reverse()
                    .map((a) => (
                      <p key={`${a.actor}:${a.id}`}>
                        {a.at} · {title(a.actor)} · {a.action}
                      </p>
                    ))}
                </details>
              )}
            </>
          )}
        </>
      )}
    </section>
  );
}
