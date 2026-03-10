// tests/e2e/home.spec.ts
// Minimal smoke test for the WCS home page. Use for local QA: npm run dev, then npm run test:e2e:smoke
import { test, expect } from "@playwright/test";

test.describe("Home page smoke", () => {
  test("home page loads and is visible", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("body")).toBeVisible();
    await expect(page).toHaveTitle(/WCS|Basketball|Champions/i);
  });
});
