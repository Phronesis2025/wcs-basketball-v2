// tests/e2e/route_smoke.spec.ts
// Task-scoped page smoke: visits E2E_SMOKE_PAGE (default /) and asserts load.
// Used by run_one_task_full_cycle when task scope maps to a non-home route.
import { test, expect } from "@playwright/test";

const path = process.env.E2E_SMOKE_PAGE || "/";

test.describe(`Route smoke: ${path}`, () => {
  test(`${path} loads and body is visible`, async ({ page }) => {
    await page.goto(path);
    await expect(page.locator("body")).toBeVisible();
  });
});
