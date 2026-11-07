import { demoClub } from "../../packages/domain/src/operations-demo.ts";
function assert(value: unknown, message: string) {
  if (!value) throw new Error(message);
}
Deno.test(
  "HTTP authentication, authorization, stale writes and idempotency through the real club handler",
  async () => {
    let state = demoClub();
    const fake = Deno.serve(
      { hostname: "127.0.0.1", port: 0, onListen() {} },
      async (request) => {
        const url = new URL(request.url);
        if (url.pathname === "/auth/v1/user") {
          const actor =
            request.headers.get("authorization")?.replace("Bearer ", "") ?? "";
          if (!["demo-admin", "demo-player", "outsider"].includes(actor))
            return Response.json({ message: "Invalid token" }, { status: 401 });
          return Response.json({
            id: actor,
            email: `${actor}@example.invalid`,
            email_confirmed_at: new Date().toISOString(),
          });
        }
        if (url.pathname === "/rest/v1/club_runtime_members")
          return Response.json([{ club_id: state.club }]);
        if (url.pathname === "/rest/v1/club_runtime")
      return Response.json(
            url.searchParams.get("select") === "revision"
              ? { revision: state.version }
              : url.searchParams.get("club_id")?.startsWith("in.")
                ? [{ club_id: state.club, state }]
                : url.searchParams.has("club_id")
                  ? { state }
                  : [{ state }],
          );
        if (url.pathname === "/rest/v1/rpc/commit_club_runtime") {
          const input = await request.json();
          if (
            input.expected_revision !== state.version ||
            input.p_club !== state.club
          )
            return Response.json(
              { code: "40001", message: "Conflict" },
              { status: 409 },
            );
          state = input.next_state;
          return Response.json(state.version);
        }
        return new Response("Not found", { status: 404 });
      },
    );
    Deno.env.set("SUPABASE_URL", `http://127.0.0.1:${fake.addr.port}`);
    Deno.env.set("SUPABASE_SERVICE_ROLE_KEY", "local-test-key");
    Deno.env.set("APP_ORIGINS", "http://localhost:4173");
    Deno.env.set("TTI_FUNCTION_PORT", "0");
    const { server } = await import("./club-api/index.ts");
    const endpoint = `http://127.0.0.1:${server.addr.port}`;
    const call = async (
      actor: string,
      command?: unknown,
      origin = "http://localhost:4173",
    ) => {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          authorization: `Bearer ${actor}`,
          origin,
          "content-type": "application/json",
        },
        body: JSON.stringify({ club: state.club, command }),
      });
      return { status: response.status, body: await response.json() };
    };
    try {
      assert(
        (await call("invalid")).status === 400,
        "Invalid bearer was accepted",
      );
      assert(
        (await call("demo-admin", undefined, "https://unapproved.invalid"))
          .status === 400,
        "Unknown origin accepted",
      );
      const outsider = await call("outsider");
      assert(
        outsider.body.state.memberships.length === 0,
        "Outsider saw memberships",
      );
      const denied = await call("demo-player", {
        id: "deny",
        type: "plan",
        expectedVersion: 0,
        data: { name: "Forbidden", months: 6, price: 0, entitlement: "" },
      });
      assert(
        denied.status === 400 && denied.body.error.includes("permission"),
        "Player created a membership plan",
      );
      const command = {
        id: "once-http",
        type: "plan",
        expectedVersion: 0,
        data: { name: "New type", months: 6, price: 100, entitlement: "" },
      };
      const saved = await call("demo-admin", command);
      assert(
        saved.status === 200 && state.version === 1,
        "Valid operation did not commit",
      );
      assert(
        (await call("demo-admin", command)).status === 200 &&
          state.plans.length === 2,
        "Retry duplicated the operation",
      );
      assert(
        (await call("demo-admin", { ...command, id: "stale" })).status === 409,
        "Stale operation did not return conflict",
      );
      const list = await fetch(endpoint, {
        method: "POST",
        headers: {
          authorization: "Bearer demo-player",
          "content-type": "application/json",
        },
        body: JSON.stringify({ list: true }),
      });
      assert(
        (await list.json()).clubs.length === 1,
        "My clubs not resolved from identity",
      );
    } finally {
      await server.shutdown();
      await fake.shutdown();
    }
  },
);
