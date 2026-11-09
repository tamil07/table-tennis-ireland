// This test is deliberately separate from personal-laptop verification.
// CI supplies an isolated, migrated PostgreSQL database; Auth/PostgREST are local adapters.
import postgres from "npm:postgres@3.4.7";
import { demoClub } from "../../packages/domain/src/operations-demo.ts";
import type { ClubCommand } from "./_shared/domain/operations.ts";

function assert(value: unknown, message: string): asserts value {
  if (!value) throw new Error(message);
}
Deno.test(
  "real PostgreSQL + club API: cross-channel booking, concurrent requests, retry and role revocation",
  async (t) => {
    const value = Deno.env.get("TTI_TEST_DATABASE_URL");
    assert(
      value,
      "Set TTI_TEST_DATABASE_URL for an isolated migrated database (CI); never use the hosted project.",
    );
    const url = new URL(value);
    assert(
      ["127.0.0.1", "localhost", "[::1]"].includes(url.hostname) &&
        url.pathname.startsWith("/tti_test"),
      "Database integration tests require a loopback tti_test database.",
    );
    const sql = postgres(value, { max: 6, onnotice() {} });
    const state = demoClub();
    state.club = crypto.randomUUID();
    const origins = ["http://127.0.0.1:4173", "http://127.0.0.1:4174"];
    const future = state.sessions.find((s) => s.start > Date.now() + 60000)!;
    assert(future, "Synthetic future session missing.");
    let fake: Deno.HttpServer<Deno.NetAddr> | undefined;
    let api: Deno.HttpServer<Deno.NetAddr> | undefined;
    try {
      await sql`insert into public.clubs(id,slug,name,county,public_join_code) values (${state.club},${`test-${state.club}`},'Local integration','Cork',${state.club})`;
      await sql`insert into public.club_runtime(club_id,state) values (${state.club},${sql.json(JSON.parse(JSON.stringify(state)))})`;
      fake = Deno.serve(
        { hostname: "127.0.0.1", port: 0, onListen() {} },
        async (request) => {
          const u = new URL(request.url);
          if (u.pathname === "/auth/v1/user") {
            const actor = request.headers
              .get("authorization")
              ?.replace("Bearer ", "");
            if (
              ![
                "demo-admin",
                "demo-player",
                "demo-opponent",
                "outsider",
              ].includes(actor ?? "")
            )
              return Response.json(
                { message: "Invalid token" },
                { status: 401 },
              );
            return Response.json({
              id: actor,
              email: `${actor}@example.invalid`,
              email_confirmed_at: new Date().toISOString(),
            });
          }
          try {
            const data = await sql.begin(async (tx) => {
              await tx`set local role service_role`;
              if (u.pathname === "/rest/v1/rpc/commit_club_runtime") {
                const input = await request.json();
                const rows =
                  await tx`select public.commit_club_runtime(${input.p_club},${input.expected_revision},${tx.json(input.next_state)}) as revision`;
                return Number(rows[0].revision);
              }
              if (u.pathname === "/rest/v1/club_runtime_members") {
                const actor = u.searchParams.get("user_id")?.slice(3);
                return await tx`select club_id from public.club_runtime_members where user_id=${actor ?? ""}`;
              }
              if (u.pathname === "/rest/v1/club_runtime") {
                const id = u.searchParams.get("club_id")?.slice(3) ?? "";
                const rows =
                  await tx`select state,revision from public.club_runtime where club_id::text=${id}`;
                if (!rows.length)
                  throw Object.assign(new Error("Not found"), {
                    code: "PGRST116",
                  });
                return u.searchParams.get("select") === "revision"
                  ? { revision: Number(rows[0].revision) }
                  : { state: rows[0].state };
              }
              throw new Error("Unexpected test REST route");
            });
            return Response.json(data);
          } catch (error) {
            const e = error as Error & { code?: string };
            return Response.json(
              { code: e.code, message: e.message },
              { status: e.code === "40001" ? 409 : 400 },
            );
          }
        },
      );
      Deno.env.set("SUPABASE_URL", `http://127.0.0.1:${fake.addr.port}`);
      Deno.env.set("SUPABASE_SERVICE_ROLE_KEY", "isolated-local-test-key");
      Deno.env.set("APP_ORIGINS", origins.join(","));
      Deno.env.set("TTI_FUNCTION_PORT", "0");
      api = (await import("./club-api/index.ts")).server;
      const endpoint = `http://127.0.0.1:${api.addr.port}`;
      async function call(
        actor: string,
        command?: ClubCommand,
        origin = origins[0],
        extra: Record<string, unknown> = {},
      ) {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            authorization: `Bearer ${actor}`,
            origin,
            "content-type": "application/json",
          },
          body: JSON.stringify({ club: state.club, command, ...extra }),
        });
        return { status: response.status, body: await response.json() };
      }
      async function stored() {
        return (
          await sql`select state,revision from public.club_runtime where club_id=${state.club}`
        )[0];
      }
      const request = (actor: string): ClubCommand => ({
        id: `race-${actor}`,
        type: "booking",
        expectedVersion: 0,
        data: {
          session: future.id,
          action: { type: "request", playerId: actor, tableId: 7, place: 0 },
        },
      });
      let winner = "",
        accepted: ClubCommand;
      await t.step(
        "two website/app requests for one place yield one commit and one conflict",
        async () => {
          const actors = ["demo-player", "demo-opponent"];
          const results = await Promise.all(
            actors.map((actor, i) => call(actor, request(actor), origins[i])),
          );
          assert(
            results.filter((r) => r.status === 200).length === 1 &&
              results.filter((r) => r.status === 409).length === 1,
            "Race did not have one winner and one conflict.",
          );
          winner = actors[results.findIndex((r) => r.status === 200)];
          accepted = request(winner);
          const row = await stored();
          assert(
            Number(row.revision) === 1 && row.state.board.requests.length === 1,
            "Race duplicated database inventory.",
          );
          assert(
            row.state.attendance.length === 0,
            "Booking fabricated attendance.",
          );
        },
      );
      await t.step(
        "replayed command from another client is idempotent",
        async () => {
          assert(
            (await call(winner, accepted, origins[1])).status === 200,
            "Retry failed.",
          );
          assert(
            Number((await stored()).revision) === 1,
            "Retry committed twice.",
          );
        },
      );
      await t.step(
        "maintainer approval in the app is visible from the website",
        async () => {
          const approved = await call(
            "demo-admin",
            {
              id: "approve",
              type: "booking",
              expectedVersion: 1,
              data: {
                session: future.id,
                action: { type: "approve", id: accepted.id },
              },
            },
            origins[1],
          );
          assert(
            approved.status === 200,
            `Approval failed: ${approved.body.error}`,
          );
          const website = await call(winner);
          assert(
            website.body.state.board.requests[0].status === "confirmed",
            "Website did not see app approval.",
          );
          const poll = await call(winner, undefined, origins[0], {
            version: 2,
          });
          assert(
            poll.body.unchanged === true,
            "Revision polling did not reconcile.",
          );
        },
      );
      await t.step(
        "revoked membership privileges are denied on the next API request",
        async () => {
          const grant = (
            id: string,
            permissions: string[],
            revision: number,
          ): ClubCommand => ({
            id,
            type: "grant",
            expectedVersion: revision,
            data: { player: "demo-player", permissions },
          });
          assert(
            (await call("demo-admin", grant("grant", ["membership"], 2)))
              .status === 200,
            "Grant failed.",
          );
          assert(
            (await call("demo-admin", grant("revoke", [], 3), origins[1]))
              .status === 200,
            "Revoke failed.",
          );
          const denied = await call("demo-player", {
            id: "revoked-plan",
            type: "plan",
            expectedVersion: 4,
            data: { name: "Forbidden", months: 1, price: 0, entitlement: "" },
          });
          assert(
            denied.status === 400 && denied.body.error.includes("permission"),
            "Revoked manager changed membership products.",
          );
          assert(
            Number((await stored()).revision) === 4,
            "Denied command changed the database.",
          );
        },
      );
      await t.step(
        "unrelated users and wrong clubs cannot disclose private membership records",
        async () => {
          const outsider = await call("outsider");
          assert(
            outsider.body.state.people.length === 0 &&
              outsider.body.state.memberships.length === 0,
            "Outsider saw private records.",
          );
          const other = await call("demo-player", undefined, origins[0], {
            club: crypto.randomUUID(),
          });
          assert(
            other.status === 400 && !other.body.state,
            "Wrong club resolved another club state.",
          );
        },
      );
      await t.step(
        "PostgreSQL rejects raw authenticated reads and duplicate place commits",
        async () => {
          let denied = false;
          try {
            await sql.begin(async (tx) => {
              await tx`set local role authenticated`;
              await tx`select state from public.club_runtime`;
            });
          } catch (error) {
            denied = (error as { code: string }).code === "42501";
          }
          assert(denied, "Authenticated client read the raw store.");
          const row = await stored();
          const next = structuredClone(row.state);
          next.version++;
          next.board.requests.push({
            ...next.board.requests[0],
            id: "different-request",
            playerId: "demo-guest",
          });
          let conflict = false;
          try {
            await sql.begin(async (tx) => {
              await tx`set local role service_role`;
              await tx`select public.commit_club_runtime(${state.club},4,${tx.json(next)})`;
            });
          } catch (error) {
            conflict = (error as { code: string }).code === "23514";
          }
          assert(
            conflict && Number((await stored()).revision) === 4,
            "Duplicate place modified inventory.",
          );
        },
      );
    } finally {
      await api?.shutdown();
      await fake?.shutdown();
      await sql`delete from public.club_runtime where club_id=${state.club}`;
      await sql`delete from public.clubs where id=${state.club}`;
      await sql.end();
    }
  },
);
