import { existsSync, readFileSync } from "node:fs";
import { parseEnv } from "node:util";
const apps = process.argv[2] ? [process.argv[2]] : ["club-web", "platform"];
for (const app of apps) {
  let values = {};
  for (const name of [
    ".env",
    ".env.local",
    ".env.production",
    ".env.production.local",
  ]) {
    const file = `apps/${app}/${name}`;
    if (existsSync(file))
      values = { ...values, ...parseEnv(readFileSync(file, "utf8")) };
  }
  values = { ...values, ...process.env };
  const publicNames = new Set([
    "VITE_ENABLE_LIVE",
    "VITE_ENABLE_PHONE_LOGIN",
    "VITE_SUPABASE_URL",
    "VITE_SUPABASE_ANON_KEY",
    "VITE_DEFAULT_CLUB_SLUG",
    "VITE_PLATFORM_NAME",
  ]);
  for (const name of Object.keys(values))
    if (name.startsWith("VITE_") && !publicNames.has(name))
      throw new Error(
        `${app}: unexpected frontend variable ${name}; server credentials must stay outside Vite`,
      );
  const key = values.VITE_SUPABASE_ANON_KEY ?? "";
  let role = "";
  if (key.startsWith("ey")) {
    try {
      role = JSON.parse(Buffer.from(key.split(".")[1], "base64url")).role;
    } catch {
      throw new Error(`${app}: malformed browser key`);
    }
  }
  if (key.startsWith("sb_secret_") || (role && role !== "anon"))
    throw new Error(
      `${app}: a server credential must never enter a frontend build`,
    );
  if (
    key &&
    !key.startsWith("sb_publishable_") &&
    role !== "anon" &&
    !key.startsWith("YOUR_")
  )
    throw new Error(`${app}: unrecognized browser key format`);
  if (
    values.VITE_ENABLE_LIVE === "true" &&
    (!values.VITE_SUPABASE_URL ||
      (!key.startsWith("sb_publishable_") && role !== "anon"))
  )
    throw new Error(
      `${app}: live mode requires the project URL and a browser-safe publishable/anon key`,
    );
}
console.log("Frontend environment checks passed; no secret values printed.");
