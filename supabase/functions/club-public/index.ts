import { load, service } from "../_shared/runtime.ts";
const xml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
const ics = (value: string) =>
  value
    .replaceAll("\\", "\\\\")
    .replaceAll("\n", "\\n")
    .replaceAll(",", "\\,")
    .replaceAll(";", "\\;")
    .replaceAll("\r", "");
const stamp = (time: number) =>
  new Date(time)
    .toISOString()
    .replaceAll("-", "")
    .replaceAll(":", "")
    .replace(/\.\d{3}/, "");
export const server = Deno.serve({ port: Number(Deno.env.get('TTI_FUNCTION_PORT') ?? 8000) }, async (request) => {
  const headers = {
    "access-control-allow-origin": "*",
    "cache-control": "public, max-age=60",
    "content-type": "application/json",
  };
  if (request.method !== "GET")
    return new Response("Method not allowed", { status: 405, headers });
  try {
    const url = new URL(request.url);
    const join = url.searchParams.get("join");
    if (join) {
      if (!/^[a-zA-Z0-9-]{1,30}$/.test(join))
        throw new Error("Invalid join code");
      const { data, error } = await service().rpc("club_for_join", {
        p_code: join,
      });
      if (error || !data) throw new Error("Unknown club");
      return Response.json(data, { headers });
    }
    const club = url.searchParams.get("club") ?? "";
    if (!/^[a-f0-9-]{36}$/.test(club)) throw new Error("Invalid club");
    const state = await load(club);
    const base =
      Deno.env.get("APP_URL") ??
      "https://table-tennis-ireland.ttclubsie.workers.dev";
    const pages = state.pages
      .filter((p) => p.published)
      .slice(-100)
      .map((p) => ({
        id: p.id,
        title: p.title,
        body: p.body,
        kind: p.kind,
        event: p.event,
      }));
    const sessions = state.sessions
      .filter((s) => !s.cancelled && s.end > Date.now())
      .map((s) => ({ id: s.id, title: s.label, start: s.start, end: s.end }));
    const events = state.events
      .filter((e) =>
        ["published", "in_progress", "completed", "cancelled"].includes(
          e.state,
        ),
      )
      .map((e) => ({
        id: e.id,
        title: e.name,
        date: e.date,
        source: e.source,
        status: e.state,
      }));
    if (url.searchParams.get("format") === "rss")
      return new Response(
        `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>${xml(state.name)}</title><link>${xml(base)}</link><description>Published club news and event invitations; RSS does not send email.</description>${pages.map((p) => `<item><guid isPermaLink="false">${xml(club + ":" + p.id)}</guid><title>${xml(p.title)}</title><description>${xml(p.body)}</description><link>${xml(base + "/#club-portal")}</link></item>`).join("")}</channel></rss>`,
        {
          headers: {
            ...headers,
            "content-type": "application/rss+xml; charset=utf-8",
          },
        },
      );
    if (url.searchParams.get("format") === "ics") {
      const lines = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//TT Clubs Ireland//Club calendar//EN",
        ...sessions.flatMap((s) => [
          "BEGIN:VEVENT",
          `UID:${s.id}@${club}`,
          `DTSTAMP:${stamp(Date.now())}`,
          `DTSTART:${stamp(s.start)}`,
          `DTEND:${stamp(s.end)}`,
          `SUMMARY:${ics(s.title)}`,
          "END:VEVENT",
        ]),
        ...events.map(
          (e) =>
            `BEGIN:VEVENT\r\nUID:${e.id}@${club}\r\nDTSTAMP:${stamp(Date.now())}\r\nDTSTART;VALUE=DATE:${e.date.replaceAll("-", "")}\r\nSUMMARY:${ics(e.title)}\r\nSTATUS:${e.status === "cancelled" ? "CANCELLED" : "CONFIRMED"}\r\nEND:VEVENT`,
        ),
        "END:VCALENDAR",
      ];
      return new Response(lines.join("\r\n"), {
        headers: { ...headers, "content-type": "text/calendar; charset=utf-8" },
      });
    }
    return Response.json(
      {
        name: state.name,
        appUrl: base,
        plans: state.plans.filter((p) => p.active),
        pages,
        sessions,
        events,
        privacy: state.settings.privacy,
        safeguarding: state.settings.safeguarding,
        policy: state.settings.policy,
      },
      { headers },
    );
  } catch {
    return Response.json(
      { error: "Published club content is not available." },
      { status: 404, headers },
    );
  }
});
