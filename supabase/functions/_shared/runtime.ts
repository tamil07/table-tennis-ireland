import { createClient } from "npm:@supabase/supabase-js@2.109.0";
import { applyClubCommand, clubView } from "./domain/operations.ts";
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
  const after = applyClubCommand(before, actor, command);
  await commit(before, after);
  return clubView(after, actor.id);
}
