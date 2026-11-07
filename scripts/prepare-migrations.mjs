import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
const files = readdirSync("supabase/migrations")
  .filter((f) => /^\d+_.+\.sql$/.test(f))
  .sort();
const parts = [
  "-- Generated local handover bundle. Review and run in the PERSONAL project SQL Editor.",
  "-- Only repository migrations are included; never the CI auth fixture.",
  "begin;",
  "select pg_advisory_xact_lock(hashtext('ttclubs:migrations'));",
  "create schema if not exists supabase_migrations;",
  "create table if not exists supabase_migrations.schema_migrations(version text primary key, statements text[], name text);",
  "alter table supabase_migrations.schema_migrations add column if not exists name text;",
];
for (const file of files) {
  const source = readFileSync(`supabase/migrations/${file}`, "utf8");
  const version = file.split("_")[0];
  const name = file.slice(version.length + 1, -4).replaceAll("'", "''");
  const delimiter = `$source_${createHash("sha256").update(source).digest("hex").slice(0, 16)}$`;
  parts.push(
    `do $migration_${version}$ begin if not exists(select 1 from supabase_migrations.schema_migrations where version='${version}') then execute ${delimiter}${source}${delimiter}; insert into supabase_migrations.schema_migrations(version,name,statements) values ('${version}','${name}',array[${delimiter}${source}${delimiter}]); end if; end $migration_${version}$;`,
  );
}
parts.push("commit;");
writeFileSync("supabase/migrations.local.sql", parts.join("\n\n"), {
  mode: 0o600,
});
console.log(
  `Generated ignored supabase/migrations.local.sql with ${files.length} ordered migrations and CLI history. Review first; this command does not connect or apply anything.`,
);
