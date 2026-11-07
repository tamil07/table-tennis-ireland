import {
  service,
  load,
  execute,
  digest,
  headers,
  allowedOrigins,
  commit,
} from "../_shared/runtime.ts";
import {
  clubView,
  personalExport,
  applyClubCommand,
  membershipAt,
  localDay,
} from "../_shared/domain/operations.ts";
import type { ClubCommand } from "../_shared/domain/operations.ts";

export const server = Deno.serve(
  { port: Number(Deno.env.get("TTI_FUNCTION_PORT") ?? 8000) },
  async (request) => {
    const responseHeaders = headers(request);
    if (request.method === "OPTIONS")
      return new Response(null, { status: 204, headers: responseHeaders });
    try {
      if (request.method !== "POST")
        return new Response("Method not allowed", {
          status: 405,
          headers: responseHeaders,
        });
      const origin = request.headers.get("origin");
      if (origin && !allowedOrigins().includes(origin))
        throw new Error("Origin is not configured.");
      const raw = await request.text();
      if (raw.length > 100000) throw new Error("Request is too large.");
      const input = JSON.parse(raw);
      const token = request.headers
        .get("authorization")
        ?.replace(/^Bearer\s+/i, "");
      if (!token) throw new Error("Sign in first.");
      const { data, error } = await service().auth.getUser(token);
      if (
        error ||
        !data.user ||
        !(data.user.email_confirmed_at || data.user.phone_confirmed_at)
      )
        throw new Error("A verified sign-in is required.");
      const actor = {
        id: data.user.id,
        email: data.user.email ?? "",
        verified: true,
        emailVerified: Boolean(data.user.email_confirmed_at),
      };
      if (input.list === true) {
        const { data: memberships, error: directoryError } = await service()
          .from("club_runtime_members")
          .select("club_id")
          .eq("user_id", actor.id);
        if (directoryError) throw new Error("Cannot list clubs.");
        const ids = (memberships ?? []).map((row) => row.club_id);
        if (!ids.length)
          return Response.json({ clubs: [] }, { headers: responseHeaders });
        const { data: rows, error: queryError } = await service()
          .from("club_runtime")
          .select("club_id,state")
          .in("club_id", ids);
        if (queryError) throw new Error("Cannot list clubs.");
        return Response.json(
          {
            clubs: (rows ?? []).map((row) => ({
              id: row.club_id,
              name: row.state.name,
              status: membershipAt(row.state, actor.id, localDay(Date.now())),
            })),
          },
          { headers: responseHeaders },
        );
      }
      if (typeof input.club !== "string" || !/^[a-f0-9-]{36}$/.test(input.club))
        throw new Error("Invalid club identifier.");
      if (typeof input.exportSubject === "string") {
        const before = await load(input.club);
        const exported = personalExport(before, actor.id, input.exportSubject);
        const after = applyClubCommand(before, actor, {
          id: crypto.randomUUID(),
          type: "data_export",
          expectedVersion: before.version,
          data: { player: input.exportSubject },
        });
        await commit(before, after);
        return Response.json(
          { export: exported },
          { headers: responseHeaders },
        );
      }
      if (!input.command) {
        if (Number.isInteger(input.version)) {
          const { data: revision } = await service()
            .from("club_runtime")
            .select("revision")
            .eq("club_id", input.club)
            .single();
          if (revision?.revision === input.version)
            return Response.json(
              { unchanged: true },
              { headers: responseHeaders },
            );
        }
        return Response.json(
          { state: clubView(await load(input.club), actor.id) },
          { headers: responseHeaders },
        );
      }
      const command = input.command as ClubCommand;
      if (
        typeof command.id !== "string" ||
        typeof command.type !== "string" ||
        !command.data ||
        typeof command.data !== "object" ||
        Array.isArray(command.data)
      )
        throw new Error("Invalid operation.");
      let qr: string | undefined;
      if (command.type === "issue_qr") {
        qr = crypto.randomUUID() + crypto.randomUUID();
        command.data.challengeHash = await digest(qr);
      }
      if (command.type === "checkin" && command.data.code) {
        if (typeof command.data.code !== "string")
          throw new Error("Invalid QR.");
        command.data.challengeHash = await digest(command.data.code);
        delete command.data.code;
      } else if (command.type !== "issue_qr") delete command.data.challengeHash;
      const state = await execute(input.club, actor, command);
      return Response.json({ state, qr }, { headers: responseHeaders });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Operation failed.";
      return Response.json(
        { error: message },
        {
          status: message.startsWith("Conflict:") ? 409 : 400,
          headers: responseHeaders,
        },
      );
    }
  },
);
