import { createClient } from "npm:@supabase/supabase-js@2.109.0";
import { applyClubCommand, clubView, may } from "./domain/operations.ts";
import type { ClubState, ClubCommand, Principal } from "./domain/operations.ts";
export const service = () =>
  createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
export const allowedOrigins = () =>
  (Deno.env.get("APP_ORIGINS") ?? "")
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
export function headers(request: Request) {
  const origin = request.headers.get("origin") ?? "";
  const allowed = allowedOrigins();
  return {
    "content-type": "application/json",
    "cache-control": "no-store",
    vary: "Origin",
    ...(allowed.includes(origin)
      ? {
          "access-control-allow-origin": origin,
          "access-control-allow-headers":
            "authorization, apikey, content-type, x-client-info",
          "access-control-allow-methods": "POST, OPTIONS",
        }
      : {}),
  };
}
export async function load(club: string): Promise<ClubState> {
  const { data, error } = await service()
    .from("club_runtime")
    .select("state")
    .eq("club_id", club)
    .single();
  if (error)
    throw new Error(
      "Club is not provisioned. Ask the platform owner to complete setup.",
    );
  return data.state as ClubState;
}
export async function commit(before: ClubState, after: ClubState) {
  if (before === after) return;
  const { error } = await service().rpc("commit_club_runtime", {
    p_club: before.club,
    expected_revision: before.version,
    next_state: after,
  });
  if (error)
    throw new Error(
      error.code === "40001"
        ? "Conflict: refresh and retry. Your changes were not applied."
        : "Unable to save this operation.",
    );
}
export async function digest(value: string) {
  return [
    ...new Uint8Array(
      await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)),
    ),
  ]
    .map((x) => x.toString(16).padStart(2, "0"))
    .join("");
}
export async function execute(
  club: string,
  actor: Principal,
  command: ClubCommand,
) {
  const before = await load(club);
  if (!Number.isInteger(command.expectedVersion))
    throw new Error("Refresh club data before submitting.");
  if (before.processed.includes(`${actor.id}:${command.id}`))
    return clubView(before, actor.id);
  if (command.type === "claim_profile") {
    if (!may(before, actor.id, "membership"))
      throw new Error("membership permission is required.");
    const source = before.people.find((p) => p.id === command.data.source);
    const target = before.people.find((p) => p.id === command.data.target);
    if (!source || !target)
      throw new Error("Both profiles must exist in this club.");
    const client = service();
    const [unclaimed, verified] = await Promise.all([
      client.auth.admin.getUserById(source.id),
      client.auth.admin.getUserById(target.id),
    ]);
    if (unclaimed.data?.user || unclaimed.error?.status !== 404)
      throw new Error(
        "Cannot link an independently authenticated source profile or verify that it is unclaimed.",
      );
    const user = verified.data?.user;
    if (
      verified.error ||
      !user ||
      !(user.email_confirmed_at || user.phone_confirmed_at) ||
      (user.banned_until && Date.parse(user.banned_until) > Date.now())
    )
      throw new Error(
        "Target must be a current verified authentication account.",
      );
  }
  const after = applyClubCommand(before, actor, command);
  await commit(before, after);
  return clubView(after, actor.id);
}
