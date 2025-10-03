// tests/dummy.spec.ts
import { test, expect } from "@playwright/test";

test("Dummy test to verify Playwright setup", async ({ page }) => {
  await page.goto("/"); // Navigate to homepage

  // Check if page loads (body visible)
  await expect(page.locator("body")).toBeVisible();

  // Check for Hero content (h1 text from Hero.tsx)
  const heroHeading = page.getByText("We are World Class", { exact: false });
  await expect(heroHeading).toBeVisible({ timeout: 5000 });

  // Check for "Our Teams" link in FanZone (use data-testid for robustness)
  const teamsLink = page.getByTestId("fan-zone-teams-link");
  await expect(teamsLink).toBeVisible({ timeout: 5000 });
});
