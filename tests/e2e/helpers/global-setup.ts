// tests/e2e/helpers/global-setup.ts
import { chromium, FullConfig } from "@playwright/test";

/** Poll until the base URL responds (e.g. dev server is ready). */
async function waitForServerReady(
  baseURL: string,
  options: { totalTimeoutMs?: number; pollIntervalMs?: number } = {}
): Promise<void> {
  const totalTimeoutMs = options.totalTimeoutMs ?? 90_000;
  const pollIntervalMs = options.pollIntervalMs ?? 2_000;
  const start = Date.now();

  while (Date.now() - start < totalTimeoutMs) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5_000);
      const response = await fetch(baseURL, {
        method: "GET",
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (response.ok) {
        return;
      }
    } catch {
      // Connection refused or timeout - server not ready yet
    }
    await new Promise((r) => setTimeout(r, pollIntervalMs));
  }

  throw new Error(
    `Server at ${baseURL} did not become ready within ${totalTimeoutMs / 1000}s. ` +
      "Start the app with 'npm run dev' and ensure it is running, then run Playwright again."
  );
}

async function globalSetup(config: FullConfig) {
  console.log("Running global setup...");

  const baseURL = config.projects[0]?.use?.baseURL;
  if (!baseURL) {
    throw new Error("Base URL not configured in Playwright config");
  }

  console.log(`Waiting for server at ${baseURL} (up to 90s for first compile)...`);
  await waitForServerReady(baseURL);
  console.log(`✓ Server responded at ${baseURL}`);

  console.log("Verifying page load in browser...");
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    const response = await page.goto(baseURL, {
      timeout: 30_000,
      waitUntil: "domcontentloaded",
    });
    if (!response || response.status() >= 400) {
      throw new Error(
        `Page load failed at ${baseURL}. Status: ${response?.status() ?? "unknown"}`
      );
    }
    console.log("✓ Home page loaded successfully");
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`✗ Failed to load ${baseURL}:`, message);
    throw error;
  } finally {
    await browser.close();
  }

  console.log("Global setup completed successfully");
}

export default globalSetup;
