// Low-level smoke check; test:browser:local starts both clients automatically.
import { chromium } from "playwright";
import assert from "node:assert/strict";
import { expect as baseExpect } from "playwright/test";
const expect = baseExpect.configure({ timeout: 10000 });
import { mkdirSync } from "node:fs";
let browser;
const label = (process.env.BROWSER_TEST_LABEL ?? "operations").replace(
  /[^a-z0-9-]/gi,
  "-",
);
let page;
let syntheticVerified = false;
let phase = "load synthetic portal";
try {
  browser = await chromium.launch({ headless: true, args: ["--no-sandbox"] });
  page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
  });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(process.env.APP_TEST_URL ?? "http://127.0.0.1:4173");
  const portal = page.locator("#club-portal");
  await expect(portal).toContainText(/Synthetic workspace/);
  syntheticVerified = true;
  await portal
    .getByRole("button", { name: "Reset synthetic workspace", exact: true })
    .click();
  const tab = async (name) => {
    phase = name;
    console.log(`Browser ${label}: ${phase}`);
    await portal
      .getByRole("navigation", { name: "Club workspace" })
      .getByRole("button", { name, exact: true })
      .click();
  };
  const form = (name) => portal.getByRole("form", { name, exact: true });
  const save = async (target) => {
    await target.getByRole("button", { name: "Save", exact: true }).click();
    await expect(
      target.getByRole("button", { name: "Save", exact: true }),
    ).toBeEnabled();
  };
  const role = async (id) => {
    await portal.getByLabel("Preview role").selectOption(id);
    await expect(portal.getByLabel("Preview role")).toHaveValue(id);
  };
  await tab("People & memberships");
  let f = form("Create or edit membership type");
  await f.getByLabel("Name", { exact: true }).fill("Synthetic QA type");
  await f.getByLabel("Duration in calendar months").fill("3");
  await f.getByLabel("Price (€)").fill("90");
  await save(f);
  await expect(portal).toContainText(/Synthetic QA type/);
  await role("demo-player");
  await tab("Table booking");
  f = form("Request a player place");
  await f.getByLabel("Player", { exact: true }).selectOption("demo-junior");
  await f.getByLabel("Available table and place").selectOption("7:0");
  await save(f);
  await expect(portal).toContainText(/pending/);
  await role("demo-admin");
  await portal
    .getByRole("button", { name: "Approve place", exact: true })
    .click();
  await expect(portal).toContainText(/confirmed/);
  await role("demo-player");
  await tab("Attendance");
  await portal
    .getByLabel("Session", { exact: true })
    .selectOption("demo-current");
  f = form("Mark attendance");
  await f.getByLabel("Player", { exact: true }).selectOption("demo-junior");
  await f.getByLabel("This person is physically at the club").check();
  await save(f);
  await expect(portal).toContainText(/1 visits/);
  await tab("Matches");
  f = form("Start or log a match");
  await f
    .getByLabel("Side one (one singles player or two doubles players)")
    .selectOption(["demo-player"]);
  await f
    .getByLabel("Side two", { exact: true })
    .selectOption(["demo-opponent"]);
  await f.getByLabel("Best of 1/3/5/7").fill("3");
  await save(f);
  f = portal.locator("form").filter({ hasText: "Game scores:" }).first();
  await f
    .getByLabel("Game scores: 11-7, 9-11, 12-10 (drafts may be partial)")
    .fill("11-6, 11-8");
  await save(f);
  await expect(portal).toContainText(/awaiting review/);
  f = form("Private reflection · Player / parent");
  await f.getByLabel("Needs work", { exact: true }).selectOption(["backhand"]);
  await f
    .getByLabel("Personal observation (up to 2000 characters)")
    .fill("Synthetic private reflection");
  await save(f);
  await role("demo-opponent");
  await expect(
    portal.getByText("Synthetic private reflection", { exact: true }),
  ).toHaveCount(0);
  await portal
    .getByRole("button", { name: "Approve result", exact: true })
    .click();
  await expect(portal).toContainText(/confirmed/);
  await role("demo-coach");
  await tab("Coaching");
  await expect(portal).toContainText(/1 reporting players/);
  phase = "desktop/mobile layout";
  mkdirSync("test-results", { recursive: true });
  await portal.screenshot({ path: `test-results/${label}-desktop.png` });
  for (const width of [390, 320]) {
    await page.setViewportSize({ width, height: 844 });
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
      false,
    );
    if (width === 390)
      await page.screenshot({ path: `test-results/${label}-mobile.png` });
  }
  assert.deepEqual(errors, []);
  console.log(
    "PASS: catalogue, guardian booking, maintainer approval, attendance/report, scoring, reflection privacy, opponent review, coaching aggregate and mobile layout.",
  );
} catch (error) {
  if (syntheticVerified && page) {
    mkdirSync("test-results", { recursive: true });
    await page
      .screenshot({ path: `test-results/${label}-failure.png`, fullPage: true })
      .catch(() => {});
  }
  const message = `${label} / ${phase}: ${error.message}`;
  if (process.env.GITHUB_ACTIONS)
    console.error(
      `::error::${message.slice(0, 3500).replaceAll("%", "%25").replaceAll("\r", "%0D").replaceAll("\n", "%0A")}`,
    );
  throw error;
} finally {
  await browser?.close();
}
