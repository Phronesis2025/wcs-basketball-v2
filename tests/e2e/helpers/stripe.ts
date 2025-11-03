// tests/e2e/helpers/stripe.ts
import { Page, expect } from "@playwright/test";

/**
 * Stripe test card helpers
 */

export const STRIPE_TEST_CARDS = {
  success: "4242 4242 4242 4242",
  decline: "4000 0000 0000 0002",
  requiresAuth: "4000 0025 0000 3155",
};

export const STRIPE_TEST_DETAILS = {
  expiry: "12/34",
  cvc: "123",
  zip: "12345",
};

/**
 * Fill Stripe checkout form with test card
 */
export async function fillStripeCheckout(
  page: Page,
  cardNumber: string = STRIPE_TEST_CARDS.success,
  expiry: string = STRIPE_TEST_DETAILS.expiry,
  cvc: string = STRIPE_TEST_DETAILS.cvc,
  zip: string = STRIPE_TEST_DETAILS.zip
): Promise<void> {
  console.log("[Stripe] Filling Stripe checkout form...");

  // Stripe Checkout is typically in an iframe
  // Wait for Stripe Elements to load
  await page.waitForTimeout(2000);

  // Try to find Stripe iframe - it may have different names/ids
  const stripeIframe = page.frameLocator('iframe[name*="stripe"], iframe[id*="stripe"], iframe[title*="Stripe"], iframe[src*="stripe"]').first();

  // Wait for card number field
  const cardNumberField = stripeIframe.locator('input[name="cardnumber"], input[placeholder*="Card number"], input[id*="cardnumber"]');
  await cardNumberField.waitFor({ timeout: 10000 });
  
  // Fill card number (may need to be split)
  await cardNumberField.fill(cardNumber);

  // Fill expiry
  const expiryField = stripeIframe.locator('input[name="exp-date"], input[placeholder*="MM"], input[placeholder*="MM / YY"], input[id*="exp"]');
  if (await expiryField.count() > 0) {
    await expiryField.fill(expiry);
  }

  // Fill CVC
  const cvcField = stripeIframe.locator('input[name="cvc"], input[placeholder*="CVC"], input[id*="cvc"]');
  if (await cvcField.count() > 0) {
    await cvcField.fill(cvc);
  }

  // Fill ZIP (if present)
  const zipField = stripeIframe.locator('input[name="postal"], input[placeholder*="ZIP"], input[id*="postal"]');
  if (await zipField.count() > 0) {
    await zipField.fill(zip);
  }

  console.log("[Stripe] ✓ Filled Stripe checkout form");
}

/**
 * Alternative: Fill Stripe form if fields are directly in page (not iframe)
 */
export async function fillStripeFormDirect(
  page: Page,
  cardNumber: string = STRIPE_TEST_CARDS.success,
  expiry: string = STRIPE_TEST_DETAILS.expiry,
  cvc: string = STRIPE_TEST_DETAILS.cvc,
  zip: string = STRIPE_TEST_DETAILS.zip
): Promise<void> {
  console.log("[Stripe] Filling Stripe form (direct mode)...");

  // Wait for Stripe Elements to be ready
  await page.waitForTimeout(2000);

  // Look for Stripe Elements fields (they have data-testid or specific classes)
  const cardNumberField = page.locator('input[name="cardnumber"], input[placeholder*="Card"], input[data-testid*="card-number"]').first();
  
  if (await cardNumberField.count() > 0) {
    await cardNumberField.fill(cardNumber);

    const expiryField = page.locator('input[name="exp-date"], input[placeholder*="MM"]').first();
    if (await expiryField.count() > 0) {
      await expiryField.fill(expiry);
    }

    const cvcField = page.locator('input[name="cvc"], input[placeholder*="CVC"]').first();
    if (await cvcField.count() > 0) {
      await cvcField.fill(cvc);
    }

    const zipField = page.locator('input[name="postal"], input[placeholder*="ZIP"]').first();
    if (await zipField.count() > 0) {
      await zipField.fill(zip);
    }
  } else {
    // Fallback: Try filling by tabbing through fields
    await page.keyboard.type(cardNumber);
    await page.keyboard.press("Tab");
    await page.keyboard.type(expiry);
    await page.keyboard.press("Tab");
    await page.keyboard.type(cvc);
    await page.keyboard.press("Tab");
    await page.keyboard.type(zip);
  }

  console.log("[Stripe] ✓ Filled Stripe form");
}

/**
 * Submit Stripe checkout
 */
export async function submitStripeCheckout(page: Page): Promise<void> {
  console.log("[Stripe] Submitting Stripe checkout...");

  // Look for submit button (could be in iframe or page)
  const submitButton = page.locator(
    'button:has-text("Pay"), button:has-text("Complete"), button:has-text("Submit"), button[type="submit"]'
  ).first();

  await submitButton.waitFor({ timeout: 10000 });
  await submitButton.click();

  console.log("[Stripe] ✓ Submitted Stripe checkout");
}

/**
 * Complete Stripe payment flow
 */
export async function completeStripePayment(
  page: Page,
  cardNumber: string = STRIPE_TEST_CARDS.success
): Promise<void> {
  console.log("[Stripe] Completing Stripe payment flow...");

  // Try iframe method first
  try {
    await fillStripeCheckout(page, cardNumber);
    await submitStripeCheckout(page);
  } catch (error) {
    // Fallback to direct method
    console.log("[Stripe] Iframe method failed, trying direct method...");
    await fillStripeFormDirect(page, cardNumber);
    await submitStripeCheckout(page);
  }

  // Wait for redirect after payment
  await page.waitForURL(/payment\/success|checkout\/success/, { timeout: 30000 });
  
  console.log("[Stripe] ✓ Payment completed successfully");
}

/**
 * Verify Stripe test mode indicator
 */
export async function verifyStripeTestMode(page: Page): Promise<void> {
  console.log("[Stripe] Verifying Stripe test mode...");
  
  // Look for test mode indicators
  const testModeIndicators = [
    'text="Test mode"',
    'text="TEST MODE"',
    '[data-testid*="test-mode"]',
  ];

  let found = false;
  for (const selector of testModeIndicators) {
    const element = page.locator(selector).first();
    if (await element.isVisible().catch(() => false)) {
      found = true;
      break;
    }
  }

  if (found) {
    console.log("[Stripe] ✓ Test mode verified");
  } else {
    console.warn("[Stripe] ⚠ Test mode indicator not found (may be using production)");
  }
}

