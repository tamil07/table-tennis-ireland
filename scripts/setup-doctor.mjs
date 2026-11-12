// Offline inventory only. Never logs in, deploys, applies SQL or prints credentials.
import { existsSync, readFileSync } from "node:fs";
import { parseArgs, parseEnv } from "node:util";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

const { values } = parseArgs({
  options: { production: { type: "boolean", default: false } },
});
let failures = 0,
  warnings = 0;
function report(level, message) {
  if (level === "FAIL") failures++;
  if (level === "WARN") warnings++;
  console.log(`${level}: ${message}`);
}
function needed(ok, message) {
  report(ok ? "PASS" : values.production ? "FAIL" : "WARN", message);
}
function readEnv(file) {
  if (!existsSync(file)) return null;
  try {
    return parseEnv(readFileSync(file, "utf8"));
  } catch {
    report("FAIL", `Cannot parse ${file}; review it privately.`);
    return null;
  }
}
report(
  Number(process.versions.node.split(".")[0]) >= 22 ? "PASS" : "FAIL",
  "Node 22 or newer; Node 22 is the project default.",
);
for (const file of [
  "package.json",
  "package-lock.json",
  "wrangler.club-web.jsonc",
  "wrangler.platform.jsonc",
  "supabase/config.toml",
])
  report(existsSync(file) ? "PASS" : "FAIL", `Repository file ${file}`);
for (const app of ["club-web", "platform"]) {
  const checked = spawnSync(
    process.execPath,
    [
      resolve("scripts/check-client-env.mjs"),
      app,
      ...(values.production ? ["--require-live"] : []),
    ],
    { encoding: "utf8" },
  );
  if (checked.status !== 0)
    report(
      "FAIL",
      `${app} configuration is invalid/incomplete. Run node scripts/check-client-env.mjs ${app}${values.production ? " --require-live" : ""} for the validation message; no values are printed.`,
    );
  else report("PASS", `${app} frontend configuration passes validation.`);
  const local = readEnv(`apps/${app}/.env.local`);
  if (!local)
    report(
      "WARN",
      `${app} private environment file is absent. For an existing deployment, use npm run setup:env -- --frontend-only if local settings are needed.`,
    );
  if (checked.status === 0 && !values.production) {
    const production = spawnSync(
      process.execPath,
      [resolve("scripts/check-client-env.mjs"), app, "--require-live"],
      { encoding: "utf8" },
    );
    if (production.status !== 0)
      report(
        "WARN",
        `${app} production settings are incomplete or synthetic. Production deployment requires explicit live configuration for the existing project.`,
      );
  }
}
const server = readEnv(".env.server.local");
needed(
  Boolean(server),
  "Local server configuration for backend maintenance; existing deployed secrets are not downloaded by Git.",
);
if (server) {
  needed(
    /^[a-f0-9]{64}$/.test(server.CLUB_JOB_TOKEN ?? ""),
    "Scheduler token has the expected generated format (value hidden).",
  );
  let appUrl = false;
  try {
    const u = new URL(server.APP_URL);
    appUrl =
      u.protocol === "https:" &&
      !u.username &&
      !u.password &&
      !u.search &&
      !u.hash;
  } catch {
    /* Report safely below. */
  }
  needed(appUrl, "APP_URL is an HTTPS app address.");
  const origins = (server.APP_ORIGINS ?? "").split(",").map((x) => x.trim());
  needed(
    [
      "https://table-tennis-ireland.ttclubsie.workers.dev",
      "https://ttclubs-app.ttclubsie.workers.dev",
    ].every((o) => origins.includes(o)),
    "Both current public website/app origins are configured.",
  );
  if (origins.includes("*"))
    report("FAIL", "Wildcard origins are not permitted.");
  for (const origin of [
    "http://localhost:4173",
    "http://localhost:4174",
    "http://127.0.0.1:4173",
    "http://127.0.0.1:4174",
  ])
    if (!origins.includes(origin))
      report(
        "WARN",
        `Add ${origin} only if this is the local origin you use for live API testing.`,
      );
  if (!server.RESEND_API_KEY || !server.EMAIL_FROM)
    report(
      "WARN",
      "Local email-provider settings are incomplete; deployed secrets and actual delivery remain unverified.",
    );
  report(
    "WARN",
    "Local scheduler token presence does not prove it matches deployed function secrets and Vault. Do not overwrite them with a newly generated token.",
  );
}
const git = spawnSync("git", ["ls-files", "-z"], { encoding: "utf8" });
if (git.status === 0) {
  const privateFiles = git.stdout
    .split("\0")
    .filter(
      (file) =>
        (/(^|\/)\.env(?:$|\.)/.test(file) && !file.endsWith(".env.example")) ||
        /\.local\.sql$/.test(file) ||
        file.startsWith("backups/"),
    );
  report(
    privateFiles.length ? "FAIL" : "PASS",
    privateFiles.length
      ? "Private/generated configuration is tracked by Git; review it privately before pushing."
      : "No private environment, local SQL or backup files are tracked by Git.",
  );
  const remote = spawnSync("git", ["remote", "get-url", "origin"], {
    encoding: "utf8",
  });
  let expectedRemote = false;
  const address = remote.stdout?.trim() ?? "";
  if (address === "git@github.com:tamil07/table-tennis-ireland.git")
    expectedRemote = true;
  else {
    try {
      const u = new URL(address);
      expectedRemote =
        u.hostname === "github.com" &&
        u.pathname.replace(/\.git$/, "") === "/tamil07/table-tennis-ireland";
    } catch {
      /* Don't print potentially credential-bearing remotes. */
    }
  }
  report(
    expectedRemote ? "PASS" : "WARN",
    expectedRemote
      ? "Origin matches the expected project repository."
      : "Origin is missing/different; confirm the intended repository privately before pushing.",
  );
} else
  report(
    "WARN",
    "Git metadata is unavailable; use a proper clone to pull and save non-secret setup notes.",
  );
console.log(
  `Local inventory: ${failures} failures, ${warnings} warnings. No network or cloud changes were performed.`,
);
console.log(
  "Cloud login, migrations, owner permissions, Git-build variables, email/cron and backups require provider/owner verification. See docs/START_HERE.md.",
);
process.exitCode = failures ? 1 : 0;
