// tests/e2e/route_smoke.spec.ts
// Route-scoped smoke test. Route from E2E_SMOKE_PAGE env (e.g. /about, /schedules, /drills).
// Used by run_one_task_full_cycle for non-home task scope.
import { test, expect } from "@playwright/test";

const route = process.env.E2E_SMOKE_PAGE || "/";
const routePath = route.startsWith("/") ? route : `/${route}`;

test.describe(`Route smoke: ${routePath}`, () => {
  test(`${routePath} loads and body is visible`, async ({ page }) => {
    await page.goto(routePath);
    await expect(page.locator("body")).toBeVisible();
    await expect(page).toHaveTitle(/WCS|Basketball|Champions/i);
  });
});
