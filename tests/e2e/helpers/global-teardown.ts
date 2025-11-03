// tests/e2e/helpers/global-teardown.ts
import { FullConfig } from "@playwright/test";

async function globalTeardown(config: FullConfig) {
  console.log("Running global teardown...");
  // Add any cleanup logic here if needed
  console.log("Global teardown completed");
}

export default globalTeardown;

