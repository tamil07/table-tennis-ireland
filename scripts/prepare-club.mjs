import { parseArgs } from "node:util";
import { writeFileSync } from "node:fs";
import { emptyClub } from "../packages/domain/src/operations.ts";
const { values } = parseArgs({
  options: {
    owner: { type: "string" },
    email: { type: "string" },
    name: { type: "string", default: "Platform owner" },
  },
});
if (
  !/^[a-f0-9-]{36}$/.test(values.owner ?? "") ||
  !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email ?? "")
) {
  console.error(
    'Usage: npm run setup:bootstrap -- --owner AUTH_USER_UUID --email OWNER_EMAIL --name "Your name"',
  );
  process.exit(1);
}
const club = "00000000-0000-4000-8000-000000000001",
  state = emptyClub(club, "Leeside Table Tennis Club", values.owner);
state.website = "https://table-tennis-ireland.ttclubsie.workers.dev";
state.people.push({
  id: values.owner,
  name: values.name,
  email: values.email,
  emailVerified: true,
  mobile: "",
  junior: false,
  guardians: [],
  status: "player",
  marketing: false,
});
const quoted = JSON.stringify(state).replaceAll("'", "''");
const sql = `-- Run once as project owner after verifying the Auth user ID/email. No secrets here.\nbegin;\ninsert into public.clubs(id,slug,name,county,public_join_code,is_active) values ('${club}','leeside','Leeside Table Tennis Club','Cork','LEESIDE',true) on conflict (id) do nothing;\ninsert into public.club_runtime(club_id,state) values ('${club}','${quoted}'::jsonb) on conflict (club_id) do nothing;\ncommit;\n`;
writeFileSync("supabase/bootstrap.local.sql", sql, { mode: 0o600 });
console.log(
  "Created ignored supabase/bootstrap.local.sql. Review it and run it once in Supabase SQL Editor. Existing runtime data is never overwritten.",
);
