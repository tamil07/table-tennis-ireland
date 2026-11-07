import { createClient } from "@supabase/supabase-js";
import { applyClubCommand, clubView, demoClub, personalExport } from "@tti/domain";
import type { ClubState, ClubCommand } from "@tti/domain";
const env = (import.meta as ImportMeta & { env: Record<string, string> }).env;
export const liveMode = env.VITE_ENABLE_LIVE === "true";
export const phoneEnabled = env.VITE_ENABLE_PHONE_LOGIN === "true";
export const authClient =
  liveMode && env.VITE_SUPABASE_URL && env.VITE_SUPABASE_ANON_KEY
    ? createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY)
    : null;
const key = "tti-operations-synthetic-v1";
function localState() {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) ?? "null");
    if (
      parsed?.schema === 1 &&
      Array.isArray(parsed.people) &&
      Array.isArray(parsed.challenges) &&
      Array.isArray(parsed.closures) &&
      Array.isArray(parsed.payments) &&
      Array.isArray(parsed.eventDrafts)
    )
      return parsed as ClubState;
  } catch {
    /* Blocked storage falls back to memory. */
  }
  return memory;
}
let memory = demoClub();
const snapshots = new Map<string, ClubState>();
export const hashCode = async (value: string) =>
  [
    ...new Uint8Array(
      await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)),
    ),
  ]
    .map((x) => x.toString(16).padStart(2, "0"))
    .join("");
export async function readClub(
  club: string,
  actor: string,
): Promise<ClubState> {
  if (!liveMode) return clubView(localState(), actor);
  if (!authClient) throw new Error("Live environment variables are missing.");
  const cached = snapshots.get(`${club}:${actor}`);
  const { data, error } = await authClient.functions.invoke("club-api", {
    body: { club, version: cached?.version },
  });
  if (error)
    throw new Error(
      "Cannot load club data. Check sign-in, function deployment and APP_ORIGINS.",
    );
  if (data.error) throw new Error(data.error);
  if (data.unchanged && cached) return cached;
  snapshots.set(`${club}:${actor}`, data.state);
  return data.state;
}
export async function readClubs(): Promise<{ id: string; name: string; status?: string }[]> {
  if (!authClient) return [];
  const { data, error } = await authClient.functions.invoke("club-api", {
    body: { list: true },
  });
  if (error || data?.error) throw new Error("Cannot load your club list.");
  return data.clubs;
}
export async function resolveClubCode(
  code: string,
): Promise<{ id: string; name: string }> {
  const response = await fetch(
    `${env.VITE_SUPABASE_URL}/functions/v1/club-public?join=${encodeURIComponent(code.trim())}`,
  );
  if (!response.ok) throw new Error("Club code not found.");
  return response.json();
}
export async function sendClub(
  club: string,
  actor: string,
  command: ClubCommand,
): Promise<{ state: ClubState; qr?: string }> {
  if (liveMode) {
    if (!authClient) throw new Error("Live environment variables are missing.");
    const { data, error } = await authClient.functions.invoke("club-api", {
      body: { club, command },
    });
    if (error) {
      let message =
        "Request outcome is unknown. Refresh before retrying with the same request identifier.";
      try {
        const body = await error.context?.json();
        message = body?.error ?? message;
      } catch {
        /* Preserve safe fallback. */
      }
      throw new Error(message);
    }
    if (data.error) throw new Error(data.error);
    snapshots.set(`${club}:${actor}`, data.state);
    return data;
  }
  const before = localState();
  let qr: string | undefined;
  if (command.type === "issue_qr") {
    qr = crypto.randomUUID() + crypto.randomUUID();
    command.data.challengeHash = await hashCode(qr);
  }
  if (
    command.type === "checkin" &&
    typeof command.data.code === "string" &&
    command.data.code
  ) {
    command.data.challengeHash = await hashCode(command.data.code);
    delete command.data.code;
  }
  const after = applyClubCommand(
    before,
    { id: actor, email: `${actor}@example.invalid`, verified: true },
    command,
  );
  memory = after;
  try {
    localStorage.setItem(key, JSON.stringify(after));
  } catch {
    /* Memory-only mode. */
  }
  window.dispatchEvent(new Event("tti-local-change"));
  return { state: clubView(after, actor), qr };
}
export function resetClub() {
  memory = demoClub();
  try {
    localStorage.removeItem(key);
  } catch {
    /* Memory-only. */
  }
}
export async function exportPerson(club: string, actor: string, player: string) {
  if (!liveMode) { const before = localState(); const result = personalExport(before, actor, player); await sendClub(club, actor, { id: crypto.randomUUID(), type: "data_export", expectedVersion: before.version, data: { player } }); return result; }
  if (!authClient) throw new Error("Live environment is not configured.");
  const { data, error } = await authClient.functions.invoke("club-api", { body: { club, exportSubject: player } });
  if (error || data?.error) throw new Error("Export failed. Check current permissions and refresh before retrying."); return data.export;
}
