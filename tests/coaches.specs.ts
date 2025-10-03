// tests/coaches.e2e.ts
import { test, expect } from "@playwright/test";
import { chromium } from "playwright";

test.describe("Coaches Dashboard @smoke", () => {
  test("Login, add team update, and view team page", async ({
    page,
    context,
  }) => {
    // Login
    await page.goto("/coaches/login");
    await page.fill("input#email", "jason.boyer@wcs.com");
    await page.fill("input#password", "your-password"); // From env or fixture
    await page.click('button:has-text("Login")');
    await expect(page).toHaveURL(/dashboard/, { timeout: 10000 });
    await expect(page.locator("text=Logged in successfully!")).toBeVisible();

    // Select team
    await page.selectOption(
      'select[name="team"]',
      "201968c2-0eee-4084-8fde-e02326f376aa"
    );
    await expect(page.locator("text=WCS Sharks")).toBeVisible();

    // Add update with image
    const imagePath = "tests/fixtures/test-image.png"; // Add sample PNG
    await page.fill("#update-title", "Test Update");
    await page.fill("#update-content", "Test content with image.");
    await page.setInputFiles("#update-image", imagePath);
    await expect(page.locator('img[alt="Preview"]')).toBeVisible();

    await page.click('button:has-text("Add Team Update")');
    await expect(page.locator("text=Team update added!")).toBeVisible({
      timeout: 5000,
    });

    // Assert in dashboard list
    await expect(page.locator("text=Test Update")).toBeVisible();
    const imgSrc = await page
      .locator('img[src*="supabase.co/storage"]')
      .getAttribute("src");
    expect(imgSrc).toMatch(/team-updates\/team_updates\/.*\.png/);

    // Test team page
    await page.goto("/teams/201968c2-0eee-4084-8fde-e02326f376aa");
    await expect(page.locator('h1:has-text("WCS Sharks")')).toBeVisible();
    // Check logo image
    await expect(page.locator('img[src*="images/logos"]')).toBeVisible();
    // Check team update cards (2 on mobile, 3 on desktop)
    const updateCards = page.locator('[aria-label*="View details for"]');
    await expect(updateCards).toHaveCount(3);
    // Check image size
    const updateImg = page.locator('img[src*="team-updates"]');
    await expect(updateImg).toBeVisible();
    expect(await updateImg.getAttribute("class")).toContain("max-h-32");
    // Click card to open modal
    await updateCards.first().click();
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    await expect(
      page.locator('#modal-title:has-text("Test Update")')
    ).toBeVisible();
    await expect(
      page.locator('[role="dialog"] img[src*="team-updates"]')
    ).toBeVisible();
    await page.locator('button[aria-label="Close modal"]').click();
    await expect(page.locator('[role="dialog"]')).not.toBeVisible();

    // Mobile viewport
    const mobileContext = await chromium.launchPersistentContext("", {
      viewport: { width: 390, height: 844 },
    });
    const mobilePage = await mobileContext.newPage();
    await mobilePage.goto("/coaches/login");
    await mobilePage.fill("input#email", "jason.boyer@wcs.com");
    await mobilePage.fill("input#password", "your-password");
    await mobilePage.click('button:has-text("Login")');
    await expect(mobilePage).toHaveURL(/dashboard/);
    await mobilePage.goto("/teams/201968c2-0eee-4084-8fde-e02326f376aa");
    await expect(mobilePage.locator('img[src*="images/logos"]')).toBeVisible();
    const mobileUpdateCards = mobilePage.locator(
      '[aria-label*="View details for"]'
    );
    await expect(mobileUpdateCards).toHaveCount(2);
    expect(await mobileUpdateCards.first().getAttribute("class")).toContain(
      "grid-cols-2"
    );
    await mobileUpdateCards.first().click();
    await expect(mobilePage.locator('[role="dialog"]')).toBeVisible();
    expect(
      await mobilePage.locator('img[src*="team-updates"]').getAttribute("class")
    ).toContain("max-h-64");
    await mobilePage.locator('button[aria-label="Close modal"]').click();
    await mobilePage.close();
  });

  test("Homepage loads without errors", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("text=Hero")).toBeVisible();
    await expect(page.locator("[data-error]")).not.toBeVisible();
    const logs: string[] = [];
    page.on("console", (msg) => logs.push(msg.text()));
    await page.waitForTimeout(2000);
    expect(logs.filter((log) => log.includes("addUpdate"))).toHaveLength(0);
  });
});
