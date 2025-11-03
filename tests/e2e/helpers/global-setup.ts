// tests/e2e/helpers/global-setup.ts
import { chromium, FullConfig } from "@playwright/test";

async function globalSetup(config: FullConfig) {
  console.log("Running global setup...");
  
  // Verify base URL is accessible
  const baseURL = config.projects[0].use.baseURL;
  if (!baseURL) {
    throw new Error("Base URL not configured in Playwright config");
  }
  
  console.log(`Testing connection to: ${baseURL}`);
  
  // Basic connectivity check
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    const response = await page.goto(baseURL, { timeout: 10000, waitUntil: "domcontentloaded" });
    if (!response || response.status() >= 400) {
      throw new Error(`Failed to connect to ${baseURL}. Status: ${response?.status()}`);
    }
    console.log(`✓ Successfully connected to ${baseURL}`);
  } catch (error: any) {
    console.error(`✗ Failed to connect to ${baseURL}:`, error.message);
    throw error;
  } finally {
    await browser.close();
  }
  
  console.log("Global setup completed successfully");
}

export default globalSetup;

