import { expect as baseExpect } from "playwright/test";
const expect = baseExpect.configure({ timeout: 10000 });

// Called only after the parent smoke check has verified synthetic mode.
export async function checkMembershipForms({ page, portal, form, save }) {
  console.log(
    "Browser: adult/junior creation, independent editors and membership periods",
  );
  await expect(
    form("Create or edit membership type").getByLabel("Name", { exact: true }),
  ).toHaveValue("");
  const people = () => form("Add or edit a player");
  let f = people();
  await f.getByLabel("Name", { exact: true }).fill("QA adult one");
  await expect(
    f.getByLabel("Linked adult guardians (juniors only)"),
  ).toHaveCount(0);
  await save(f);
  await expect(portal).toContainText("QA adult one");
  await expect(people().getByLabel("Name", { exact: true })).toHaveValue("");
  await people().getByLabel("Name", { exact: true }).fill("QA adult two");
  await save(people());
  await expect(portal).toContainText("QA adult two");
  const personRow = (name) =>
    portal
      .locator(".ops-row")
      .filter({ hasText: name })
      .filter({
        has: page.getByRole("button", { name: "Edit person", exact: true }),
      });
  await personRow("QA adult one")
    .getByRole("button", { name: "Edit person", exact: true })
    .click();
  await people().getByLabel("Name", { exact: true }).fill("Unsaved draft");
  await personRow("QA adult two")
    .getByRole("button", { name: "Edit person", exact: true })
    .click();
  await expect(people().getByLabel("Name", { exact: true })).toHaveValue(
    "QA adult two",
  );
  await portal
    .getByRole("button", {
      name: "Cancel player editing / add new player",
      exact: true,
    })
    .click();
  await expect(people().getByLabel("Name", { exact: true })).toHaveValue("");
  await expect(personRow("QA adult one")).toHaveCount(1);
  await expect(personRow("QA adult two")).toHaveCount(1);

  f = people();
  await f.getByLabel("Name", { exact: true }).fill("QA junior");
  await f.getByLabel("Junior player", { exact: true }).check();
  await expect(
    f.getByLabel("Linked adult guardians (juniors only)"),
  ).toBeVisible();
  await expect
    .poll(() => f.evaluate((element) => element.checkValidity()))
    .toBe(false);
  await f
    .getByLabel("Linked adult guardians (juniors only)")
    .selectOption(["demo-admin"]);
  await save(f);
  await expect(portal).toContainText("QA junior");
  await expect(
    people().getByLabel("Linked adult guardians (juniors only)"),
  ).toHaveCount(0);

  // A new unpaid period must not require an invented payment date.
  f = form("Create membership period");
  await f
    .getByLabel("Player", { exact: true })
    .selectOption({ label: "QA adult one" });
  await f
    .getByLabel("Membership type", { exact: true })
    .selectOption({ label: "Synthetic QA type" });
  await f.getByLabel("Start (inclusive)", { exact: true }).fill("2026-11-16");
  await f.getByLabel("End (inclusive)", { exact: true }).fill("2027-02-15");
  await expect(
    f.getByLabel("Payment received date (required when amount is above zero)"),
  ).toHaveValue("");
  await save(f);
  const periods = () =>
    portal
      .locator(".ops-row")
      .filter({
        has: page.getByRole("button", {
          name: "Renew membership",
          exact: true,
        }),
      });
  await expect(periods()).toHaveCount(2);
  const original = await periods().first().textContent();
  await periods()
    .first()
    .getByRole("button", { name: "Renew membership", exact: true })
    .click();
  f = form("Renew membership period");
  await expect(
    f.getByLabel("Total amount received (€)", { exact: true }),
  ).toHaveValue("0");
  await expect(
    f.getByLabel("Payment received date (required when amount is above zero)"),
  ).toHaveValue("");
  await f.getByRole("button", { name: "Save", exact: true }).click();
  await expect(periods()).toHaveCount(3);
  await expect(periods().first()).toHaveText(original);
  await expect(form("Create membership period")).toBeVisible();
  await expect(
    form("Create membership period").getByLabel("Player", { exact: true }),
  ).toHaveValue("");
}
