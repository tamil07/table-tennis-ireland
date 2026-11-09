// Runs only local/synthetic checks. Never logs in, migrates or deploys anything.
import { spawn } from "node:child_process";
import { mkdtemp, rm, access } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve, join } from "node:path";
import { chromium } from "playwright";
import { localPreviewUrl } from "./preview-url.mjs";

const root = resolve(import.meta.dirname, "..");
const npm = process.env.npm_execpath;
if (!npm)
  throw new Error(
    "Run through npm: npm run verify:local or npm run test:browser:local",
  );
const browsersOnly = process.argv.includes("--browsers-only");
const children = new Set();
let temp;
function start(args, options = {}) {
  const child = spawn(process.execPath, args, {
    cwd: root,
    stdio: "inherit",
    ...options,
  });
  children.add(child);
  child.once("exit", () => children.delete(child));
  return child;
}
function complete(child) {
  return new Promise((resolve, reject) => {
    child.once("error", reject);
    child.once("exit", (code, signal) =>
      code === 0
        ? resolve()
        : reject(
            new Error(`Check failed (${signal ?? code}). See the error above.`),
          ),
    );
  });
}
const run = (args, options) => complete(start(args, options));
const npmRun = (name) => run([npm, "run", name]);
async function stop(child) {
  if (child.exitCode !== null || child.signalCode !== null) return;
  const closed = new Promise((resolve) => child.once("exit", resolve));
  child.kill();
  const force = setTimeout(() => child.kill("SIGKILL"), 3000);
  await closed;
  clearTimeout(force);
}
async function preview(app, directory) {
  const child = start(
    [
      join(root, "node_modules/vite/bin/vite.js"),
      "preview",
      "--host",
      "127.0.0.1",
      "--port",
      "0",
      "--outDir",
      directory,
    ],
    {
      cwd: join(root, "apps", app),
      stdio: ["ignore", "pipe", "pipe"],
    },
  );
  const url = await new Promise((resolve, reject) => {
    const timeout = setTimeout(
      () => reject(new Error(`${app} preview did not start`)),
      20000,
    );
    let output = "";
    child.stdout.on("data", (data) => {
      output += String(data);
      const address = localPreviewUrl(output);
      if (address) {
        clearTimeout(timeout);
        resolve(address);
      }
    });
    child.stderr.on("data", (data) => process.stderr.write(data));
    child.once("error", (error) => {
      clearTimeout(timeout);
      reject(error);
    });
    child.once("exit", (code) => {
      clearTimeout(timeout);
      reject(new Error(`${app} preview stopped (${code})`));
    });
  });
  return { child, url };
}
for (const signal of ["SIGINT", "SIGTERM"])
  process.once(signal, () => {
    for (const child of children) child.kill(signal);
    process.exitCode = 130;
  });

try {
  if (!browsersOnly) {
    await npmRun("check");
    await npmRun("test:edge");
  }
  // Download a free test browser on first use, without changing cloud accounts.
  try {
    await access(chromium.executablePath());
  } catch {
    await run([
      join(root, "node_modules/playwright/cli.js"),
      "install",
      "chromium",
    ]);
  }
  temp = await mkdtemp(join(tmpdir(), "tti-browser-verify-"));
  for (const app of ["club-web", "platform"]) {
    const directory = join(temp, app);
    await run([join(root, "scripts/check-client-env.mjs"), app]);
    // Build in a temporary directory; preserve real .env files and deployable dist.
    await run(
      [
        join(root, "node_modules/vite/bin/vite.js"),
        "build",
        "--outDir",
        directory,
        "--emptyOutDir",
      ],
      {
        cwd: join(root, "apps", app),
        env: {
          ...process.env,
          VITE_ENABLE_LIVE: "false",
          VITE_ENABLE_PHONE_LOGIN: "false",
          VITE_SUPABASE_URL: "https://example.supabase.co",
          VITE_SUPABASE_ANON_KEY: "sb_publishable_BROWSER_TEST_ONLY",
        },
      },
    );
    const server = await preview(app, directory);
    try {
      console.log(`Checking ${app} against its temporary synthetic build.`);
      await run([join(root, "scripts/browser-smoke.mjs")], {
        env: {
          ...process.env,
          APP_TEST_URL: server.url,
          BROWSER_TEST_LABEL: app,
        },
      });
    } finally {
      await stop(server.child);
    }
  }
  console.log(
    "PASS: local verification complete. Cloud accounts and hosted databases were not changed.",
  );
  console.log(
    "PostgreSQL integration runs in GitHub CI; hosted acceptance remains in docs/PERSONAL_LAPTOP_LAUNCH.md.",
  );
} catch (error) {
  console.error(error.message);
  if (process.env.GITHUB_ACTIONS)
    console.error(
      `::error::${error.message.replaceAll("%", "%25").replaceAll("\r", "%0D").replaceAll("\n", "%0A")}`,
    );
  console.error(
    "See docs/TESTING.md for prerequisites and the failing verification layer.",
  );
  process.exitCode = 1;
} finally {
  await Promise.all([...children].map(stop));
  if (temp) await rm(temp, { recursive: true, force: true });
}
