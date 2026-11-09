import { test } from "node:test";
import assert from "node:assert/strict";
import {
  mkdtempSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
  existsSync,
  cpSync,
  rmSync,
  statSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const root = resolve(import.meta.dirname, "..");
function workspace(t) {
  const cwd = mkdtempSync(join(tmpdir(), "tti-setup-test-"));
  t.after(() => rmSync(cwd, { recursive: true, force: true }));
  for (const dir of ["scripts", "packages/domain/src", "supabase/migrations"])
    cpSync(join(root, dir), join(cwd, dir), { recursive: true });
  for (const app of ["club-web", "platform"])
    mkdirSync(join(cwd, "apps", app), { recursive: true });
  // Do not inherit the developer's provider tokens or frontend configuration.
  const env = {
    PATH: process.env.PATH,
    SystemRoot: process.env.SystemRoot,
    TEMP: tmpdir(),
  };
  function run(file, args = [], extra = {}, input = "") {
    return spawnSync(process.execPath, [join(cwd, "scripts", file), ...args], {
      cwd,
      env: { ...env, ...extra },
      input,
      encoding: "utf8",
      timeout: 15000,
    });
  }
  return { cwd, run, read: (file) => readFileSync(join(cwd, file), "utf8") };
}
const jwt = (role) =>
  `eyTest.${Buffer.from(JSON.stringify({ role })).toString("base64url")}.test`;

test("fresh-laptop environment preparation is private, offline and preserves existing configuration", (t) => {
  const w = workspace(t);
  const key = "sb_publishable_SETUP_TEST_ONLY";
  const first = w.run("prepare-environment.mjs", [], {}, `${key}\n`);
  assert.equal(first.status, 0, first.stderr);
  for (const app of ["club-web", "platform"]) {
    const file = `apps/${app}/.env.local`;
    assert.match(w.read(file), /VITE_ENABLE_LIVE=false/);
    assert.match(w.read(file), /VITE_ENABLE_PHONE_LOGIN=false/);
    assert.ok(w.read(file).includes(key));
    if (process.platform !== "win32")
      assert.equal(statSync(join(w.cwd, file)).mode & 0o777, 0o600);
  }
  const server = w.read(".env.server.local");
  assert.match(server, /CLUB_JOB_TOKEN=[a-f0-9]{64}/);
  for (const origin of [
    "http://localhost:4173",
    "http://127.0.0.1:4173",
    "http://localhost:4174",
    "http://127.0.0.1:4174",
  ])
    assert.ok(
      server.includes(origin),
      `Missing supported local origin ${origin}`,
    );
  writeFileSync(
    join(w.cwd, "apps/club-web/.env.local"),
    "OWNER_EDIT=preserve\n",
  );
  const second = w.run(
    "prepare-environment.mjs",
    [],
    {},
    "sb_publishable_SECOND_TEST\n",
  );
  assert.equal(second.status, 0, second.stderr);
  assert.equal(w.read("apps/club-web/.env.local"), "OWNER_EDIT=preserve\n");
  assert.equal(
    w.read(".env.server.local"),
    server,
    "A rerun rotated the job token",
  );
  assert.ok(
    !first.stdout.includes(key),
    "Configuration value printed to stdout",
  );
});

test("environment preparation rejects secret, service-role and malformed keys before writing files", (t) => {
  const w = workspace(t);
  for (const key of ["sb_secret_TEST_ONLY", jwt("service_role"), "not-a-key"]) {
    assert.notEqual(
      w.run("prepare-environment.mjs", [], {}, `${key}\n`).status,
      0,
    );
    assert.equal(existsSync(join(w.cwd, ".env.server.local")), false);
    assert.equal(existsSync(join(w.cwd, "apps/platform/.env.local")), false);
  }
  assert.equal(
    w.run("prepare-environment.mjs", [], {}, `${jwt("anon")}\n`).status,
    0,
  );
});

test("frontend build guard rejects unsafe configuration even while synthetic mode is selected", (t) => {
  const w = workspace(t);
  for (const extra of [
    { VITE_SUPABASE_ANON_KEY: "sb_secret_TEST_ONLY" },
    { VITE_SUPABASE_ANON_KEY: jwt("service_role") },
    { VITE_PRIVATE_API_KEY: "test-only" },
  ])
    assert.notEqual(w.run("check-client-env.mjs", [], extra).status, 0);
  assert.notEqual(
    w.run("check-client-env.mjs", [], { VITE_ENABLE_LIVE: "true" }).status,
    0,
  );
  assert.equal(
    w.run("check-client-env.mjs", [], {
      VITE_ENABLE_LIVE: "true",
      VITE_SUPABASE_URL: "https://example.supabase.co",
      VITE_SUPABASE_ANON_KEY: "sb_publishable_TEST_ONLY",
    }).status,
    0,
  );
});

test("owner bootstrap refuses malformed identifiers and escapes real-world names without demo members", (t) => {
  const w = workspace(t);
  assert.notEqual(
    w.run("prepare-club.mjs", [
      "--owner",
      "a".repeat(36),
      "--email",
      "owner@example.invalid",
    ]).status,
    0,
  );
  assert.equal(existsSync(join(w.cwd, "supabase/bootstrap.local.sql")), false);
  const valid = w.run("prepare-club.mjs", [
    "--owner",
    "11111111-1111-4111-8111-111111111111",
    "--email",
    "owner@example.invalid",
    "--name",
    "O'Brien",
  ]);
  assert.equal(valid.status, 0, valid.stderr);
  const sql = w.read("supabase/bootstrap.local.sql");
  assert.match(sql, /O''Brien/);
  assert.match(sql, /on conflict \(club_id\) do nothing/);
  assert.ok(!sql.includes("demo-player") && !sql.includes("demo-junior"));
});

test("function packaging in a fresh tree uses current canonical rules on every rerun", (t) => {
  const w = workspace(t);
  assert.equal(w.run("prepare-functions.mjs").status, 0);
  const source = join(w.cwd, "packages/domain/src/operations.ts");
  writeFileSync(
    source,
    readFileSync(source, "utf8") + "\n// packaging regression marker\n",
  );
  assert.equal(w.run("prepare-functions.mjs").status, 0);
  assert.equal(
    w.read("supabase/functions/_shared/domain/operations.ts"),
    readFileSync(source, "utf8"),
  );
});

test("SQL-Editor bundle is deterministic, ordered and excludes seeds and Auth test fixtures", (t) => {
  const w = workspace(t);
  assert.equal(w.run("prepare-migrations.mjs").status, 0);
  const sql = w.read("supabase/migrations.local.sql");
  assert.match(sql, /schema_migrations/);
  assert.match(sql, /pg_advisory_xact_lock/);
  assert.ok(sql.includes("202610030001"));
  assert.ok(sql.indexOf("202610030001") < sql.indexOf("202611080001"));
  assert.ok(
    !sql.includes("ci-test-only") &&
      !sql.includes("create schema if not exists auth"),
  );
  assert.equal(w.run("prepare-migrations.mjs").status, 0);
  assert.equal(w.read("supabase/migrations.local.sql"), sql);
});

test("scheduler SQL requires the private generated token and never prints it", (t) => {
  const w = workspace(t);
  assert.notEqual(w.run("prepare-schedule.mjs").status, 0);
  assert.notEqual(
    w.run("prepare-schedule.mjs", [], { CLUB_JOB_TOKEN: "'; select 1; --" })
      .status,
    0,
  );
  assert.equal(existsSync(join(w.cwd, "supabase/schedule.local.sql")), false);
  const token = "a".repeat(64);
  const result = w.run("prepare-schedule.mjs", [], { CLUB_JOB_TOKEN: token });
  assert.equal(result.status, 0, result.stderr);
  assert.ok(!result.stdout.includes(token));
  assert.match(w.read("supabase/schedule.local.sql"), /x-club-job-token/);
});
