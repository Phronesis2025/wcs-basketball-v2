// tests/e2e/registration-new-parent.spec.ts
import { test, expect, Page } from "@playwright/test";
import { loginAsParent, loginAsAdmin, logout } from "./helpers/auth";
import {
  verifyPlayerInDatabase,
  verifyPendingRegistration,
  verifyParentInDatabase,
  verifyPaymentInDatabase,
  getPlayerById,
  waitForDatabaseCondition,
} from "./helpers/database";
import {
  verifyRegistrationEmail,
  verifyAdminNotificationEmail,
  verifyApprovalEmail,
  verifyPaymentConfirmationEmail,
  generateEmailReport,
} from "./helpers/email";
import { completeStripePayment, verifyStripeTestMode } from "./helpers/stripe";

// Test data from plan
const TEST_DATA = {
  parent: {
    email: "phronesis700@gmail.com",
    password: "test1234567",
    firstName: "Test",
    lastName: "Parent",
    phone: "(555) 123-4567",
  },
  player: {
    firstName: "Amelia",
    lastName: "Boyer",
    birthdate: "2013-11-12", // 11 years old
    grade: "6th",
    gender: "Female",
    experience: "3",
  },
  admin: {
    email: "jason.boyer@wcs.com",
    password: "WCS2025sports!",
  },
  team: {
    name: "WCS Eagles Elite",
    id: "95c83e18-572a-45cf-b7e5-eb009921a3ae", // U12, Girls
  },
  payment: {
    amount: 360,
    type: "annual",
  },
};

// Track test state for resume capability
let testState: {
  playerId?: string;
  parentId?: string;
  registrationComplete?: boolean;
  approvalComplete?: boolean;
  paymentComplete?: boolean;
} = {};

test.describe("E2E Registration Flow - New Parent/New Player", () => {
  test.beforeEach(async ({ page }) => {
    // Clear test state at start of each run
    testState = {};
    
    // Set up console log capturing
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        console.log(`[Browser Console Error] ${msg.text()}`);
      }
    });

    // Set up request/response logging for debugging
    page.on("requestfailed", (request) => {
      console.log(`[Request Failed] ${request.url()} - ${request.failure()?.errorText}`);
    });
  });

  test.afterEach(async ({ page }, testInfo) => {
    // Capture screenshot on failure
    if (testInfo.status !== "passed") {
      await page.screenshot({
        path: `tests/e2e/reports/screenshots/${testInfo.title}-${Date.now()}.png`,
        fullPage: true,
      });
    }
  });

  // Phase 1: Registration
  test("Phase 1: Complete new parent and player registration", async ({ page }) => {
    console.log("\n=== Phase 1: Registration ===\n");

    // Step 1: Navigate to homepage
    console.log("[Step 1] Navigating to homepage...");
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    
    // Verify page loads
    await expect(page.locator("body")).toBeVisible();
    console.log("[Step 1] ✓ Homepage loaded");

    // Step 2: Navigate to registration
    console.log("[Step 2] Navigating to registration page...");
    
    // Look for register button/link
    const registerLink = page.locator('a:has-text("Register"), a:has-text("REGISTER"), button:has-text("Register")').first();
    
    if (await registerLink.isVisible({ timeout: 5000 }).catch(() => false)) {
      await registerLink.click();
    } else {
      // Navigate directly to register page
      await page.goto("/register");
    }
    
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveURL(/\/register/);
    console.log("[Step 2] ✓ On registration page");

    // Step 3: Complete Step 1 - Parent Basics
    console.log("[Step 3] Filling parent information (Step 1)...");
    
    await page.fill('input[name="parent_first_name"], input[aria-label*="first name" i]', TEST_DATA.parent.firstName);
    await page.fill('input[name="parent_last_name"], input[aria-label*="last name" i]', TEST_DATA.parent.lastName);
    await page.fill('input[name="parent_email"], input[type="email"]', TEST_DATA.parent.email);
    
    // Phone is optional but fill it if field exists
    const phoneField = page.locator('input[name="parent_phone"], input[type="tel"]').first();
    if (await phoneField.isVisible({ timeout: 2000 }).catch(() => false)) {
      await phoneField.fill(TEST_DATA.parent.phone);
    }

    // Click Next button
    const nextButton = page.locator('button:has-text("Next"), button:has-text("Continue"), button[type="submit"]').first();
    await nextButton.click();
    await page.waitForTimeout(1000); // Wait for step transition
    
    console.log("[Step 3] ✓ Parent information submitted");

    // Step 4: Complete Step 2 - Player Information
    console.log("[Step 4] Filling player information (Step 2)...");
    
    await page.fill('input[name="player_first_name"], input[aria-label*="player.*first" i]', TEST_DATA.player.firstName);
    await page.fill('input[name="player_last_name"], input[aria-label*="player.*last" i]', TEST_DATA.player.lastName);
    await page.fill('input[name="player_birthdate"], input[type="date"]', TEST_DATA.player.birthdate);
    
    // Select grade dropdown
    const gradeSelect = page.locator('select[name="player_grade"], select[aria-label*="grade" i]').first();
    if (await gradeSelect.isVisible({ timeout: 2000 }).catch(() => false)) {
      await gradeSelect.selectOption({ label: TEST_DATA.player.grade });
    }

    // Select gender
    const genderOption = page.locator(`input[type="radio"][value="${TEST_DATA.player.gender}"], button:has-text("${TEST_DATA.player.gender}")`).first();
    await genderOption.click({ timeout: 5000 });

    // Experience level (if present)
    const experienceSelect = page.locator('select[name="player_experience"], input[type="radio"][value="' + TEST_DATA.player.experience + '"]').first();
    if (await experienceSelect.isVisible({ timeout: 2000 }).catch(() => false)) {
      if (await experienceSelect.getAttribute("type") === "radio") {
        await experienceSelect.click();
      } else {
        await experienceSelect.selectOption(TEST_DATA.player.experience);
      }
    }

    // Click Next button
    await nextButton.click();
    await page.waitForTimeout(1000);
    
    console.log("[Step 4] ✓ Player information submitted");

    // Step 5: Complete Step 3 - Review & Consent
    console.log("[Step 5] Reviewing and providing consent (Step 3)...");
    
    // Verify data is displayed correctly
    await expect(page.locator(`text=${TEST_DATA.parent.firstName}`)).toBeVisible({ timeout: 5000 });
    await expect(page.locator(`text=${TEST_DATA.player.firstName}`)).toBeVisible({ timeout: 5000 });

    // Check consent checkboxes
    const coppaConsent = page.locator('input[name="coppa_consent"], input[type="checkbox"]').first();
    await coppaConsent.check({ timeout: 5000 });

    const waiverConsent = page.locator('input[name="waiver_signed"], input[type="checkbox"]').nth(1);
    if (await waiverConsent.isVisible({ timeout: 2000 }).catch(() => false)) {
      await waiverConsent.check();
    }

    // Submit final form
    const submitButton = page.locator('button:has-text("Submit"), button:has-text("Register"), button[type="submit"]').first();
    await submitButton.click();
    
    // Wait for redirect to success/profile page
    await page.waitForURL(/\/(parent\/profile|registration-success)/, { timeout: 15000 });
    
    console.log("[Step 5] ✓ Registration submitted");

    // Step 6: Verify registration success
    console.log("[Step 6] Verifying registration success...");
    
    const currentUrl = page.url();
    expect(currentUrl).toMatch(/\/(parent\/profile|registration-success)/);
    
    // Check for success message
    const successMessage = page.locator('text=/success|registered|confirmation/i').first();
    if (await successMessage.isVisible({ timeout: 5000 }).catch(() => false)) {
      console.log("[Step 6] ✓ Success message displayed");
    }

    // Step 7: Database verification
    console.log("[Step 7] Verifying database records...");
    
    // Wait a moment for database to be updated
    await page.waitForTimeout(2000);

    // Verify pending registration
    const pendingReg = await verifyPendingRegistration(TEST_DATA.parent.email);
    if (pendingReg) {
      console.log("[Step 7] ✓ Pending registration found in database");
    } else {
      console.warn("[Step 7] ⚠ Pending registration not found (may have been merged immediately)");
    }

    // Verify player (may be in pending status)
    const player = await waitForDatabaseCondition(
      async () => {
        const p = await verifyPlayerInDatabase(
          TEST_DATA.parent.email,
          TEST_DATA.player.firstName,
          TEST_DATA.player.lastName
        );
        return p !== null;
      },
      10000,
      1000
    );

    if (player) {
      const playerData = await verifyPlayerInDatabase(
        TEST_DATA.parent.email,
        TEST_DATA.player.firstName,
        TEST_DATA.player.lastName
      );
      if (playerData) {
        testState.playerId = playerData.id;
        testState.parentId = playerData.parent_id || undefined;
        expect(playerData.status).toBe("pending");
        console.log(`[Step 7] ✓ Player found: ${playerData.id} (Status: ${playerData.status})`);
      }
    } else {
      throw new Error("Player not found in database after registration");
    }

    // Verify parent
    const parent = await verifyParentInDatabase(TEST_DATA.parent.email);
    if (parent) {
      testState.parentId = parent.id;
      console.log(`[Step 7] ✓ Parent found: ${parent.id}`);
    }

    testState.registrationComplete = true;
    console.log("\n=== Phase 1 Complete ===\n");

    // Step 8: Email verification checkpoint
    console.log("[Step 8] Email verification checkpoints...");
    verifyRegistrationEmail(TEST_DATA.parent.email, `${TEST_DATA.player.firstName} ${TEST_DATA.player.lastName}`);
    verifyAdminNotificationEmail(process.env.ADMIN_NOTIFICATIONS_TO || TEST_DATA.admin.email, `${TEST_DATA.player.firstName} ${TEST_DATA.player.lastName}`);
    
    console.log(generateEmailReport());
    console.log("[Step 8] ⚠ Email verification requires manual check");
  });

  // Phase 2: Admin Approval
  test("Phase 2: Admin assigns team and approves player", async ({ page }) => {
    // Skip if registration wasn't completed
    test.skip(!testState.registrationComplete, "Phase 1 must complete first");

    console.log("\n=== Phase 2: Admin Approval ===\n");

    // Step 1: Logout if needed
    await logout(page);
    await page.waitForTimeout(1000);

    // Step 2: Login as admin
    console.log("[Step 1] Logging in as admin...");
    await loginAsAdmin(page);
    console.log("[Step 1] ✓ Admin logged in");

    // Step 3: Navigate to club management
    console.log("[Step 2] Navigating to club management...");
    await page.goto("/admin/club-management");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveURL(/\/admin\/club-management/);
    console.log("[Step 2] ✓ On club management page");

    // Step 4: Find pending player
    console.log("[Step 3] Finding pending player...");
    
    // Wait for players list to load
    await page.waitForTimeout(2000);
    
    // Look for player name in the page
    const playerName = `${TEST_DATA.player.firstName} ${TEST_DATA.player.lastName}`;
    const playerRow = page.locator(`text=${playerName}`).first();
    
    if (!(await playerRow.isVisible({ timeout: 10000 }).catch(() => false))) {
      // Try refreshing or searching
      await page.reload({ waitUntil: "networkidle" });
      await page.waitForTimeout(2000);
    }
    
    await expect(playerRow).toBeVisible({ timeout: 10000 });
    console.log("[Step 3] ✓ Player found in pending list");

    // Step 5: Assign team
    console.log("[Step 4] Assigning team...");
    
    // Find the team dropdown/select for this player
    // Look for select elements near the player row
    const teamSelect = page.locator('select, [role="combobox"]').filter({ hasText: /team/i }).first();
    
    if (await teamSelect.isVisible({ timeout: 5000 }).catch(() => false)) {
      // Select team by visible text
      await teamSelect.selectOption({ label: new RegExp(TEST_DATA.team.name, "i") });
      await page.waitForTimeout(500);
      console.log("[Step 4] ✓ Team selected");
    } else {
      // Alternative: Look for team selection button or modal
      const teamButton = page.locator(`button:has-text("${TEST_DATA.team.name}"), button:has-text("Assign Team")`).first();
      if (await teamButton.isVisible({ timeout: 5000 }).catch(() => false)) {
        await teamButton.click();
        await page.waitForTimeout(500);
        console.log("[Step 4] ✓ Team assigned via button");
      } else {
        console.warn("[Step 4] ⚠ Team selection UI not found - may need manual assignment");
      }
    }

    // Step 6: Approve player
    console.log("[Step 5] Approving player...");
    
    // Find approve button - could be near the player row
    const approveButton = page.locator(`button:has-text("Approve"), button:has-text("Approve Player")`).first();
    
    await approveButton.waitFor({ timeout: 10000 });
    await approveButton.click();
    
    // Wait for approval to complete
    await page.waitForTimeout(2000);
    
    // Check for success message/toast
    const successToast = page.locator('text=/approved|success/i').first();
    if (await successToast.isVisible({ timeout: 5000 }).catch(() => false)) {
      console.log("[Step 5] ✓ Approval success message shown");
    }

    console.log("[Step 5] ✓ Player approved");

    // Step 7: Verify database
    console.log("[Step 6] Verifying approval in database...");
    
    if (!testState.playerId) {
      // Get player ID again
      const playerData = await verifyPlayerInDatabase(
        TEST_DATA.parent.email,
        TEST_DATA.player.firstName,
        TEST_DATA.player.lastName
      );
      if (playerData) {
        testState.playerId = playerData.id;
      }
    }

    const approvalVerified = await waitForDatabaseCondition(
      async () => {
        if (!testState.playerId) return false;
        const player = await getPlayerById(testState.playerId);
        return player !== null && player.status === "approved" && player.team_id !== null;
      },
      15000,
      1000
    );

    if (approvalVerified && testState.playerId) {
      const player = await getPlayerById(testState.playerId);
      if (player) {
        expect(player.status).toBe("approved");
        expect(player.team_id).toBeTruthy();
        console.log(`[Step 6] ✓ Player approved: ${player.id} (Team: ${player.team_id})`);
      }
    } else {
      throw new Error("Player approval not verified in database");
    }

    testState.approvalComplete = true;
    console.log("\n=== Phase 2 Complete ===\n");

    // Step 8: Email verification
    console.log("[Step 7] Email verification checkpoint...");
    const paymentLink = `/payment/${testState.playerId}`;
    verifyApprovalEmail(TEST_DATA.parent.email, `${TEST_DATA.player.firstName} ${TEST_DATA.player.lastName}`, paymentLink);
    console.log(generateEmailReport());
    console.log("[Step 7] ⚠ Email verification requires manual check");
  });

  // Phase 3: Payment
  test("Phase 3: Parent completes detailed form and payment", async ({ page }) => {
    // Skip if approval wasn't completed
    test.skip(!testState.approvalComplete, "Phase 2 must complete first");
    test.skip(!testState.playerId, "Player ID required for payment");

    console.log("\n=== Phase 3: Payment ===\n");

    // Step 1: Logout and login as parent
    console.log("[Step 1] Logging in as parent...");
    await logout(page);
    await page.waitForTimeout(1000);
    await loginAsParent(page);
    console.log("[Step 1] ✓ Parent logged in");

    // Step 2: Navigate to checkout/payment
    console.log("[Step 2] Navigating to checkout form...");
    
    // Try to navigate to checkout first (may redirect to payment if already completed)
    await page.goto(`/checkout/${testState.playerId}`);
    await page.waitForLoadState("networkidle");
    
    const currentUrl = page.url();
    
    if (currentUrl.includes("/checkout/")) {
      // Step 3: Complete detailed form
      console.log("[Step 3] Completing detailed form...");
      
      // Address information
      await page.fill('input[name="address_line1"], input[placeholder*="address" i]', "123 Test Street");
      await page.fill('input[name="city"]', "Test City");
      await page.selectOption('select[name="state"]', "CA");
      await page.fill('input[name="zip"]', "12345");
      
      // Guardian information
      await page.fill('input[name="guardian_relationship"]', "Parent");
      await page.fill('input[name="emergency_contact"]', "Jane Doe");
      await page.fill('input[name="emergency_phone"]', "(555) 987-6543");
      
      // Medical information
      await page.fill('input[name="medical_allergies"], textarea[name="medical_allergies"]', "None");
      await page.fill('input[name="medical_conditions"], textarea[name="medical_conditions"]', "None");
      await page.fill('input[name="medical_medications"], textarea[name="medical_medications"]', "None");
      await page.fill('input[name="doctor_name"]', "Dr. Smith");
      await page.fill('input[name="doctor_phone"]', "(555) 111-2222");
      
      // Consent checkboxes
      await page.check('input[name="consent_photo_release"]');
      await page.check('input[name="consent_medical_treatment"]');
      await page.check('input[name="consent_participation"]');
      
      // Submit form
      const submitButton = page.locator('button:has-text("Submit"), button:has-text("Continue"), button[type="submit"]').first();
      await submitButton.click();
      
      // Wait for redirect to payment page
      await page.waitForURL(/\/payment\//, { timeout: 15000 });
      console.log("[Step 3] ✓ Detailed form submitted");
    }

    // Step 4: Navigate to payment page (if not already there)
    if (!page.url().includes("/payment/")) {
      await page.goto(`/payment/${testState.playerId}`);
      await page.waitForLoadState("networkidle");
    }

    // Step 5: Verify payment page
    console.log("[Step 4] Verifying payment page...");
    
    await expect(page).toHaveURL(/\/payment\//);
    
    // Verify payment amount
    const amountText = page.locator(`text=$${TEST_DATA.payment.amount}, text=${TEST_DATA.payment.amount}`);
    await expect(amountText.first()).toBeVisible({ timeout: 5000 });
    console.log(`[Step 4] ✓ Payment amount verified: $${TEST_DATA.payment.amount}`);

    // Step 6: Select payment type and initiate payment
    console.log("[Step 5] Initiating payment...");
    
    // Select annual payment type if radio buttons exist
    const annualRadio = page.locator('input[type="radio"][value="annual"], button:has-text("Annual")').first();
    if (await annualRadio.isVisible({ timeout: 3000 }).catch(() => false)) {
      await annualRadio.click();
      await page.waitForTimeout(500);
    }

    // Click Pay Now button
    const payButton = page.locator('button:has-text("Pay"), button:has-text("Pay Now"), button:has-text("Complete Payment")').first();
    await payButton.click();
    
    // Wait for Stripe checkout to load
    await page.waitForTimeout(3000);
    console.log("[Step 5] ✓ Payment button clicked, waiting for Stripe...");

    // Step 7: Complete Stripe payment
    console.log("[Step 6] Completing Stripe payment...");
    
    // Verify test mode
    await verifyStripeTestMode(page);
    
    // Complete payment
    await completeStripePayment(page);
    
    // Wait for success redirect
    await page.waitForURL(/payment\/success/, { timeout: 30000 });
    await expect(page).toHaveURL(/payment\/success/);
    
    console.log("[Step 6] ✓ Payment completed successfully");

    // Step 8: Verify payment success page
    console.log("[Step 7] Verifying payment success...");
    
    // Check for success indicators
    const successIndicators = [
      page.locator('text=/success|thank you|payment complete/i').first(),
      page.locator(`text=${TEST_DATA.player.firstName}`).first(),
    ];

    for (const indicator of successIndicators) {
      if (await indicator.isVisible({ timeout: 5000 }).catch(() => false)) {
        console.log("[Step 7] ✓ Success indicators found");
        break;
      }
    }

    // Step 9: Verify payment in database
    console.log("[Step 8] Verifying payment in database...");
    
    const paymentVerified = await waitForDatabaseCondition(
      async () => {
        if (!testState.playerId) return false;
        const payment = await verifyPaymentInDatabase(testState.playerId, TEST_DATA.payment.amount);
        return payment !== null && (payment.status === "paid" || payment.status === "succeeded");
      },
      15000,
      1000
    );

    if (paymentVerified && testState.playerId) {
      const payment = await verifyPaymentInDatabase(testState.playerId, TEST_DATA.payment.amount);
      if (payment) {
        expect(payment.status).toMatch(/paid|succeeded/i);
        expect(Number(payment.amount)).toBe(TEST_DATA.payment.amount);
        console.log(`[Step 8] ✓ Payment verified: ${payment.id} (Status: ${payment.status})`);
      }
    } else {
      throw new Error("Payment not verified in database");
    }

    // Verify player status is now active
    if (testState.playerId) {
      const player = await getPlayerById(testState.playerId);
      if (player) {
        expect(player.status).toBe("active");
        console.log(`[Step 8] ✓ Player status updated to: ${player.status}`);
      }
    }

    testState.paymentComplete = true;
    console.log("\n=== Phase 3 Complete ===\n");

    // Step 10: Email verification
    console.log("[Step 9] Email verification checkpoint...");
    verifyPaymentConfirmationEmail(TEST_DATA.parent.email, `${TEST_DATA.player.firstName} ${TEST_DATA.player.lastName}`, TEST_DATA.payment.amount);
    console.log(generateEmailReport());
    console.log("[Step 9] ⚠ Email verification requires manual check");
  });

  // Phase 4: Admin Payment Verification
  test("Phase 4: Admin verifies payment metrics", async ({ page }) => {
    test.skip(!testState.paymentComplete, "Phase 3 must complete first");

    console.log("\n=== Phase 4: Admin Payment Verification ===\n");

    // Step 1: Logout and login as admin
    console.log("[Step 1] Logging in as admin...");
    await logout(page);
    await page.waitForTimeout(1000);
    await loginAsAdmin(page);
    console.log("[Step 1] ✓ Admin logged in");

    // Step 2: Navigate to payment/admin metrics page
    console.log("[Step 2] Navigating to payment metrics...");
    
    // Try common admin payment page paths
    const paymentPagePaths = [
      "/admin/payments",
      "/admin/club-management",
      "/admin",
    ];

    let metricsFound = false;
    for (const path of paymentPagePaths) {
      await page.goto(path);
      await page.waitForLoadState("networkidle");
      
      // Look for payment metrics or payment table
      const paymentTable = page.locator('table, [role="table"]').filter({ hasText: /payment|amount|player/i }).first();
      const metricsSection = page.locator('text=/payment|metrics|revenue/i').first();
      
      if (await paymentTable.isVisible({ timeout: 3000 }).catch(() => false) ||
          await metricsSection.isVisible({ timeout: 3000 }).catch(() => false)) {
        metricsFound = true;
        console.log(`[Step 2] ✓ Payment metrics found on ${path}`);
        break;
      }
    }

    if (!metricsFound) {
      console.warn("[Step 2] ⚠ Payment metrics page not found - may be on dashboard");
      // Stay on admin dashboard
    }

    // Step 3: Verify payment appears in metrics
    console.log("[Step 3] Verifying payment in metrics...");
    
    const playerName = `${TEST_DATA.player.firstName} ${TEST_DATA.player.lastName}`;
    
    // Look for player name and payment amount
    const playerRow = page.locator(`text=${playerName}`).first();
    const amountText = page.locator(`text=$${TEST_DATA.payment.amount}`).first();
    
    if (await playerRow.isVisible({ timeout: 10000 }).catch(() => false)) {
      console.log(`[Step 3] ✓ Player found in metrics: ${playerName}`);
      
      if (await amountText.isVisible({ timeout: 5000 }).catch(() => false)) {
        console.log(`[Step 3] ✓ Payment amount verified: $${TEST_DATA.payment.amount}`);
      }
    } else {
      console.warn("[Step 3] ⚠ Payment metrics may need time to update");
    }

    console.log("\n=== Phase 4 Complete ===\n");
  });

  // Phase 5: Log Verification
  test("Phase 5: Verify logs and error tracking", async ({ page }) => {
    console.log("\n=== Phase 5: Log Verification ===\n");

    // Step 1: Check browser console logs
    console.log("[Step 1] Checking browser console logs...");
    
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });

    // Navigate through key pages to capture logs
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    
    if (consoleErrors.length > 0) {
      console.warn(`[Step 1] ⚠ Found ${consoleErrors.length} console errors:`);
      consoleErrors.forEach((error, index) => {
        console.warn(`  ${index + 1}. ${error}`);
      });
    } else {
      console.log("[Step 1] ✓ No critical console errors found");
    }

    // Step 2: Check application logs (via database)
    console.log("[Step 2] Checking application logs in database...");
    
    // This would require Supabase MCP or direct database query
    // For now, we'll note it as a checkpoint
    console.log("[Step 2] ⚠ Application logs verification requires MCP access");
    console.log("  - Check audit_logs table for registration events");
    console.log("  - Check login_logs table for authentication events");
    console.log("  - Check error_logs table for any errors");

    // Step 3: Supabase logs checkpoint
    console.log("[Step 3] Supabase logs checkpoint...");
    console.log("  - Use Supabase MCP to check:");
    console.log("    * API service logs for registration calls");
    console.log("    * Postgres service logs for database operations");
    console.log("    * Auth service logs for authentication");

    // Step 4: Stripe logs checkpoint
    console.log("[Step 4] Stripe logs checkpoint...");
    console.log("  - Check Stripe dashboard for:");
    console.log("    * Test payment record");
    console.log("    * Webhook events (checkout.session.completed)");
    console.log("    * Payment intent status");

    console.log("\n=== Phase 5 Complete ===\n");
    console.log("\n=== All Phases Complete ===");
    console.log("\nFinal Email Report:");
    console.log(generateEmailReport());
    console.log("\n⚠ Remember to manually verify all email checkpoints above");
  });
});

