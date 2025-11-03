// tests/e2e/helpers/auth.ts
import { Page, expect } from "@playwright/test";

export interface LoginCredentials {
  email: string;
  password: string;
}

export const TEST_PARENT_CREDENTIALS: LoginCredentials = {
  email: "phronesis700@gmail.com",
  password: "test1234567",
};

export const TEST_ADMIN_CREDENTIALS: LoginCredentials = {
  email: "jason.boyer@wcs.com",
  password: "WCS2025sports!",
};

/**
 * Login as a parent user
 */
export async function loginAsParent(page: Page, credentials: LoginCredentials = TEST_PARENT_CREDENTIALS): Promise<void> {
  console.log(`[Auth] Logging in as parent: ${credentials.email}`);
  
  // Navigate to parent login page
  await page.goto("/parent/login");
  await page.waitForLoadState("networkidle");
  
  // Fill login form
  await page.fill('input[type="email"]', credentials.email);
  await page.fill('input[type="password"]', credentials.password);
  
  // Submit form
  await page.click('button[type="submit"]');
  
  // Wait for redirect to profile page
  await page.waitForURL(/\/parent\/profile/, { timeout: 10000 });
  
  // Verify we're on the profile page
  await expect(page).toHaveURL(/\/parent\/profile/);
  
  console.log(`[Auth] ✓ Successfully logged in as parent: ${credentials.email}`);
}

/**
 * Login as an admin user
 */
export async function loginAsAdmin(page: Page, credentials: LoginCredentials = TEST_ADMIN_CREDENTIALS): Promise<void> {
  console.log(`[Auth] Logging in as admin: ${credentials.email}`);
  
  // Navigate to login page (admin can use parent login or admin login)
  await page.goto("/parent/login");
  await page.waitForLoadState("networkidle");
  
  // Fill login form
  await page.fill('input[type="email"]', credentials.email);
  await page.fill('input[type="password"]', credentials.password);
  
  // Submit form
  await page.click('button[type="submit"]');
  
  // Wait for redirect (could be profile or admin dashboard)
  await page.waitForURL(/\/(parent\/profile|admin)/, { timeout: 10000 });
  
  console.log(`[Auth] ✓ Successfully logged in as admin: ${credentials.email}`);
}

/**
 * Logout from current session
 */
export async function logout(page: Page): Promise<void> {
  console.log("[Auth] Logging out...");
  
  // Look for logout button/link - check multiple possible locations
  const logoutSelectors = [
    'button:has-text("Logout")',
    'a:has-text("Logout")',
    '[data-testid="logout-button"]',
    'button[aria-label*="Logout" i]',
  ];
  
  let loggedOut = false;
  for (const selector of logoutSelectors) {
    const element = page.locator(selector).first();
    if (await element.isVisible().catch(() => false)) {
      await element.click();
      loggedOut = true;
      break;
    }
  }
  
  if (!loggedOut) {
    // Fallback: clear localStorage and cookies
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.context().clearCookies();
    console.log("[Auth] Logged out via localStorage/cookies clear");
  } else {
    console.log("[Auth] ✓ Successfully logged out via UI");
  }
  
  // Navigate to homepage to confirm logout
  await page.goto("/");
}

/**
 * Wait for authentication to complete
 */
export async function waitForAuth(page: Page, timeout = 10000): Promise<void> {
  // Wait for auth state to be determined
  await page.waitForFunction(
    () => {
      const authState = localStorage.getItem("auth.authenticated");
      const supabaseToken = localStorage.getItem("supabase.auth.token");
      return authState !== null || supabaseToken !== null;
    },
    { timeout }
  ).catch(() => {
    // Ignore timeout - auth might not be stored in localStorage
  });
}

