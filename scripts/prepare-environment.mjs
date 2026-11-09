import { existsSync, writeFileSync } from "node:fs";
import { randomBytes } from "node:crypto";
import { createInterface } from "node:readline/promises";
const prompt = createInterface({
  input: process.stdin,
  output: process.stdout,
});
const publishable = (
  await prompt.question(
    "Supabase publishable/anon key (never a secret or service-role key): ",
  )
).trim();
prompt.close();
if (!publishable || publishable.startsWith("sb_secret_"))
  throw new Error("Use only the browser-safe publishable/anon key.");
if (!publishable.startsWith("sb_publishable_") && !publishable.startsWith("ey"))
  throw new Error(
    "Unrecognized browser key format; copy the publishable/anon key from Supabase.",
  );
if (publishable.startsWith("ey")) {
  try {
    if (
      JSON.parse(Buffer.from(publishable.split(".")[1], "base64url")).role !==
      "anon"
    )
      throw new Error();
  } catch {
    throw new Error("The legacy key must have the anon role.");
  }
}
const client = `VITE_ENABLE_LIVE=false\nVITE_ENABLE_PHONE_LOGIN=false\nVITE_SUPABASE_URL=https://mkxqrkqwpvjtkjfjjckm.supabase.co\nVITE_SUPABASE_ANON_KEY=${publishable}\n`;
for (const file of ["apps/club-web/.env.local", "apps/platform/.env.local"])
  if (!existsSync(file)) writeFileSync(file, client, { mode: 0o600 });
if (!existsSync(".env.server.local"))
  writeFileSync(
    ".env.server.local",
    `APP_URL=https://ttclubs-app.ttclubsie.workers.dev\nAPP_ORIGINS=https://table-tennis-ireland.ttclubsie.workers.dev,https://ttclubs-app.ttclubsie.workers.dev,http://localhost:4173,http://localhost:4174,http://127.0.0.1:4173,http://127.0.0.1:4174\nCLUB_JOB_TOKEN=${randomBytes(32).toString("hex")}\nEMAIL_REPLY_TO=leesidettie@gmail.com\n# Optional until email-provider setup is ready:\n# RESEND_API_KEY=\n# EMAIL_FROM=TT Clubs <notifications@YOUR_VERIFIED_DOMAIN>\n`,
    { mode: 0o600 },
  );
console.log(
  "Prepared missing ignored environment files. Existing files were preserved. Keep VITE_ENABLE_LIVE=false until migrations/functions/bootstrap are ready.",
);
