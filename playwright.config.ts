// playwright.config.ts
import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

// Determine base URL from environment or default to localhost
const BASE_URL = process.env.E2E_BASE_URL || process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false, // E2E tests should run sequentially to avoid conflicts
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // Single worker for E2E tests to avoid database conflicts
  reporter: [
    ["html", { outputFolder: "tests/e2e/reports/html" }],
    ["json", { outputFile: "tests/e2e/reports/results.json" }],
    ["list"],
  ],
  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    actionTimeout: 15000,
    navigationTimeout: 30000,
  },
  projects: [
    {
      name: "chromium-desktop",
      use: { 
        ...devices["Desktop Chrome"],
        viewport: { width: 1920, height: 1080 },
      },
    },
    // Add mobile testing later if needed
  ],
  // Global setup and teardown
  globalSetup: require.resolve("./tests/e2e/helpers/global-setup.ts"),
  globalTeardown: require.resolve("./tests/e2e/helpers/global-teardown.ts"),
});
