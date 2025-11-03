// tests/e2e/helpers/email.ts

/**
 * Email verification helpers
 * 
 * Note: These are manual checkpoints since automated email verification
 * requires access to email APIs or inbox. In E2E tests, we'll mark
 * these as checkpoints that require manual verification.
 */

export interface EmailCheckpoint {
  name: string;
  recipient: string;
  template: string;
  description: string;
  timestamp: string;
}

const emailCheckpoints: EmailCheckpoint[] = [];

/**
 * Record an email checkpoint for manual verification
 */
export function recordEmailCheckpoint(
  name: string,
  recipient: string,
  template: string,
  description: string
): EmailCheckpoint {
  const checkpoint: EmailCheckpoint = {
    name,
    recipient,
    template,
    description,
    timestamp: new Date().toISOString(),
  };

  emailCheckpoints.push(checkpoint);
  console.log(`[Email Checkpoint] ${name}: ${recipient} - ${description}`);
  console.log(`[Email Checkpoint] Template: ${template}`);
  console.log(`[Email Checkpoint] Please verify this email was sent manually`);

  return checkpoint;
}

/**
 * Get all recorded email checkpoints
 */
export function getEmailCheckpoints(): EmailCheckpoint[] {
  return [...emailCheckpoints];
}

/**
 * Clear all email checkpoints
 */
export function clearEmailCheckpoints(): void {
  emailCheckpoints.length = 0;
}

/**
 * Generate email verification report
 */
export function generateEmailReport(): string {
  if (emailCheckpoints.length === 0) {
    return "No email checkpoints recorded.";
  }

  let report = "\n=== Email Verification Checkpoints ===\n\n";
  emailCheckpoints.forEach((checkpoint, index) => {
    report += `${index + 1}. ${checkpoint.name}\n`;
    report += `   Recipient: ${checkpoint.recipient}\n`;
    report += `   Template: ${checkpoint.template}\n`;
    report += `   Description: ${checkpoint.description}\n`;
    report += `   Timestamp: ${checkpoint.timestamp}\n\n`;
  });

  report += "Please verify each email above was received manually.\n";
  return report;
}

/**
 * Verify registration email checkpoint
 */
export function verifyRegistrationEmail(
  recipient: string,
  playerName: string
): EmailCheckpoint {
  return recordEmailCheckpoint(
    "Player Registration Email",
    recipient,
    "getPlayerRegistrationEmail",
    `Confirmation email sent to ${recipient} after ${playerName} registration`
  );
}

/**
 * Verify admin notification email checkpoint
 */
export function verifyAdminNotificationEmail(
  adminEmail: string,
  playerName: string
): EmailCheckpoint {
  return recordEmailCheckpoint(
    "Admin Notification Email",
    adminEmail,
    "getAdminPlayerRegistrationEmail",
    `Notification sent to admin about new registration: ${playerName}`
  );
}

/**
 * Verify approval email checkpoint
 */
export function verifyApprovalEmail(
  recipient: string,
  playerName: string,
  paymentLink: string
): EmailCheckpoint {
  return recordEmailCheckpoint(
    "Player Approval Email",
    recipient,
    "getPlayerApprovalEmail",
    `Approval email sent to ${recipient} with payment link: ${paymentLink}`
  );
}

/**
 * Verify payment confirmation email checkpoint
 */
export function verifyPaymentConfirmationEmail(
  recipient: string,
  playerName: string,
  amount: number
): EmailCheckpoint {
  return recordEmailCheckpoint(
    "Payment Confirmation Email",
    recipient,
    "getPaymentConfirmationEmail",
    `Payment confirmation sent to ${recipient} for ${playerName} - $${amount}`
  );
}

