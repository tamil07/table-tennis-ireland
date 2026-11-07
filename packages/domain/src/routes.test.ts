import { it, expect } from "vitest";
import { safeClubReturn } from "./routes";
it("retains only safe in-app context and never persists QR/auth bearer values", () => {
  expect(
    safeClubReturn(
      "#club=00000000-0000-4000-8000-000000000001&view=matches&event=e-1&code=secret&access_token=secret",
    ),
  ).toBe("#club=00000000-0000-4000-8000-000000000001&view=matches&event=e-1");
});
it("refuses external redirect destinations and unknown routes", () => {
  expect(safeClubReturn("https://attacker.invalid")).toBe("#club-portal");
  expect(
    safeClubReturn(
      "#club=invalid&view=https://attacker.invalid&event=<script>",
    ),
  ).toBe("#club-portal");
});
