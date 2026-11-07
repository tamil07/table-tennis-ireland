import { service, load, commit, digest } from "../_shared/runtime.ts";
import {
  applyClubCommand,
  notificationEligible,
  notificationText,
} from "../_shared/domain/operations.ts";
import type { ClubState, Notice } from "../_shared/domain/operations.ts";

async function mutate(club: string, change: (state: ClubState) => void) {
  for (let i = 0; i < 5; i++) {
    const before = await load(club);
    const after = structuredClone(before);
    change(after);
    after.version++;
    try {
      await commit(before, after);
      return after;
    } catch (error) {
      if (
        !(error instanceof Error) ||
        !error.message.startsWith("Conflict:") ||
        i === 4
      )
        throw error;
    }
  }
  throw new Error("Unable to update delivery status.");
}
async function deliver(club: string, notice: Notice) {
  const apiKey = Deno.env.get("RESEND_API_KEY"),
    from = Deno.env.get("EMAIL_FROM"),
    app = Deno.env.get("APP_URL");
  if (!apiKey || !from || !app) return; // Leave queued; missing setup is never reported as delivery.
  const now = Date.now();
  const claimed = await mutate(club, (state) => {
    const n = state.notices.find((n) => n.id === notice.id)!;
    if (
      n.email === "sent" ||
      n.email === "suppressed" ||
      n.attempts >= 5 ||
      (n.email === "sending" && (n.leaseUntil ?? 0) > now) ||
      (n.firstAttempt && now - n.firstAttempt >= 23 * 3600000)
    )
      throw new Error("Notice is not retryable.");
    if (!notificationEligible(state, n, now)) {
      n.email = "suppressed";
      const person = state.people.find((p) => p.id === n.to);
      if (
        person &&
        (!person.emailVerified || !person.email) &&
        !state.work.some((w) => w.id === `email:${person.id}`)
      )
        state.work.push({
          id: `email:${person.id}`,
          title: "Verified email required for club communication",
          player: person.id,
          state: "open",
          assignee: "",
          comments: [],
        });
      return;
    }
    n.email = "sending";
    n.leaseUntil = now + 120000;
    n.firstAttempt ??= now;
    n.attempts++;
  });
  const n = claimed.notices.find((n) => n.id === notice.id)!;
  if (n.email !== "sending") return;
  // Recheck current guardian/group/renewal state immediately before external delivery.
  const current = await load(club);
  if (!notificationEligible(current, n, Date.now())) {
    await mutate(club, (s) => {
      s.notices.find((x) => x.id === n.id)!.email = "suppressed";
    });
    return;
  }
  const recipient = current.people.find((p) => p.id === n.to)!;
  const { data: identity, error: identityError } =
    await service().auth.admin.getUserById(recipient.id);
  if (
    identityError ||
    !identity.user?.email_confirmed_at ||
    identity.user.email !== recipient.email
  ) {
    await mutate(club, (s) => {
      s.notices.find((x) => x.id === n.id)!.email = "suppressed";
    });
    return;
  }
  const limit = Number(Deno.env.get("EMAIL_DAILY_LIMIT") ?? 90);
  const { data: reserved, error: budgetError } = await service().rpc(
    "reserve_club_email",
    { p_day: new Date().toISOString().slice(0, 10), p_limit: limit },
  );
  if (budgetError || !reserved) {
    await mutate(club, (s) => {
      const row = s.notices.find((x) => x.id === n.id)!;
      row.email = "pending";
      row.leaseUntil = 0;
      row.attempts--;
      if (!row.attempts) row.firstAttempt = undefined;
    });
    throw new Error("Daily delivery budget reached");
  }
  let errorMessage = "";
  try {
    const link = new URL(app);
    link.hash = new URLSearchParams({
      club,
      view: "communications",
    }).toString();
    const result = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        authorization: `Bearer ${apiKey}`,
        "content-type": "application/json",
        "idempotency-key": await digest(`${club}:${n.key}`),
      },
      body: JSON.stringify({
        from,
        to: [recipient.email],
        reply_to: Deno.env.get("EMAIL_REPLY_TO") ?? undefined,
        subject: n.subject,
        text: notificationText(current, n, app),
      }),
      signal: AbortSignal.timeout(15000),
    });
    await result.text();
    if (!result.ok) throw new Error(`Email provider returned ${result.status}`);
  } catch (error) {
    errorMessage =
      error instanceof Error ? error.message : "Email delivery failed";
  }
  await mutate(club, (s) => {
    const row = s.notices.find((x) => x.id === n.id)!;
    row.email = errorMessage ? "failed" : "sent";
    row.error = errorMessage;
    row.leaseUntil = 0;
  });
}
export const server = Deno.serve(
  { port: Number(Deno.env.get("TTI_FUNCTION_PORT") ?? 8000) },
  async (request) => {
    const secret = Deno.env.get("CLUB_JOB_TOKEN");
    if (
      request.method !== "POST" ||
      !secret ||
      request.headers.get("x-club-job-token") !== secret
    )
      return new Response("Unauthorized", { status: 401 });
    try {
      const { data, error } = await service()
        .from("club_runtime")
        .select("club_id");
      if (error) throw new Error("Cannot load configured clubs.");
      let processed = 0,
        deferred = 0;
      for (const row of data ?? []) {
        let state: ClubState | undefined;
        for (let retry = 0; retry < 5; retry++) {
          const before = await load(row.club_id);
          const after = applyClubCommand(
            before,
            { id: "scheduler", email: "", verified: true, system: true },
            { id: crypto.randomUUID(), type: "jobs", data: {} },
          );
          try {
            await commit(before, after);
            state = after;
            break;
          } catch (error) {
            if (
              !(error instanceof Error) ||
              !error.message.startsWith("Conflict:")
            )
              throw error;
          }
        }
        if (!state) {
          deferred++;
          continue;
        }
        for (const n of state.notices
          .filter(
            (n) =>
              ["pending", "failed", "sending"].includes(n.email) &&
              n.attempts < 5 &&
              (!n.firstAttempt || Date.now() - n.firstAttempt < 23 * 3600000) &&
              !(n.email === "sending" && (n.leaseUntil ?? 0) > Date.now()),
          )
          .slice(0, 50)) {
          try {
            await deliver(row.club_id, n);
          } catch (error) {
            deferred++;
            if (
              error instanceof Error &&
              error.message === "Daily delivery budget reached"
            )
              return Response.json({
                processed,
                deferred,
                budgetReached: true,
              });
          }
        }
        processed++;
      }
      return Response.json({
        processed,
        deferred,
        emailConfigured: Boolean(
          Deno.env.get("RESEND_API_KEY") &&
            Deno.env.get("EMAIL_FROM") &&
            Deno.env.get("APP_URL"),
        ),
      });
    } catch {
      return Response.json(
        { error: "Scheduled work failed. Inspect protected function logs." },
        { status: 500 },
      );
    }
  },
);
