// Email validation utility
// Validates email format and checks if domain exists via DNS lookup

import { devLog, devError } from "./security";
import dns from "dns";
import { promisify } from "util";

const resolveMx = promisify(dns.resolveMx);
const resolve4 = promisify(dns.resolve4);

export interface EmailValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validates email format (contains @, valid domain structure)
 */
function validateEmailFormat(email: string): { isValid: boolean; error?: string } {
  if (!email || typeof email !== "string") {
    return { isValid: false, error: "Email is required" };
  }

  const trimmedEmail = email.trim().toLowerCase();

  // Basic format check: must contain @
  if (!trimmedEmail.includes("@")) {
    return { isValid: false, error: "Email must contain @ symbol" };
  }

  // Split into local and domain parts
  const parts = trimmedEmail.split("@");
  if (parts.length !== 2) {
    return { isValid: false, error: "Email must contain exactly one @ symbol" };
  }

  const [localPart, domain] = parts;

  // Validate local part (before @)
  if (!localPart || localPart.length === 0) {
    return { isValid: false, error: "Email must have a local part before @ symbol" };
  }

  if (localPart.length > 64) {
    return { isValid: false, error: "Email local part is too long (max 64 characters)" };
  }

  // Validate domain part (after @)
  if (!domain || domain.length === 0) {
    return { isValid: false, error: "Email must have a domain after @ symbol" };
  }

  // Domain must contain at least one dot
  if (!domain.includes(".")) {
    return { isValid: false, error: "Email domain must contain a dot (e.g., example.com)" };
  }

  // Domain must not start or end with dot
  if (domain.startsWith(".") || domain.endsWith(".")) {
    return { isValid: false, error: "Email domain cannot start or end with a dot" };
  }

  // Domain parts validation
  const domainParts = domain.split(".");
  if (domainParts.length < 2) {
    return { isValid: false, error: "Email domain must have at least two parts (e.g., example.com)" };
  }

  // Check for valid TLD (top-level domain)
  const tld = domainParts[domainParts.length - 1];
  if (!tld || tld.length < 2) {
    return { isValid: false, error: "Email domain must have a valid top-level domain (e.g., .com, .org)" };
  }

  // Basic regex for email format (RFC 5322 simplified)
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  if (!emailRegex.test(trimmedEmail)) {
    return { isValid: false, error: "Email format is invalid" };
  }

  // Check for common typos or invalid patterns
  if (domain.includes("..")) {
    return { isValid: false, error: "Email domain cannot contain consecutive dots" };
  }

  if (localPart.includes("..")) {
    return { isValid: false, error: "Email local part cannot contain consecutive dots" };
  }

  return { isValid: true };
}

/**
 * Verifies if the email domain exists by checking DNS records
 * Checks for MX (mail exchange) records first, falls back to A records
 */
async function verifyDomainExists(domain: string): Promise<{ exists: boolean; error?: string }> {
  try {
    // First, try to resolve MX records (mail exchange records)
    // If domain has MX records, it can receive email
    try {
      const mxRecords = await resolveMx(domain);
      if (mxRecords && mxRecords.length > 0) {
        devLog("emailValidation: Domain has MX records", { domain, mxCount: mxRecords.length });
        return { exists: true };
      }
    } catch (mxError: any) {
      // MX lookup failed, try A record as fallback
      devLog("emailValidation: No MX records found, checking A records", { domain });
    }

    // Fallback: Check for A records (domain exists even if no MX records)
    // Some domains might not have MX records but still exist
    try {
      const aRecords = await resolve4(domain);
      if (aRecords && aRecords.length > 0) {
        devLog("emailValidation: Domain has A records", { domain, ipCount: aRecords.length });
        return { exists: true };
      }
    } catch (aError: any) {
      // Both MX and A records failed
      devLog("emailValidation: Domain DNS lookup failed", { domain, error: aError.message });
      return {
        exists: false,
        error: `Domain "${domain}" does not exist or cannot receive email (DNS lookup failed)`,
      };
    }

    // If we get here, domain exists but might not be configured for email
    // This is still considered valid (domain exists)
    return { exists: true };
  } catch (error: any) {
    devError("emailValidation: DNS lookup error", { domain, error: error.message });
    return {
      exists: false,
      error: `Unable to verify domain "${domain}" (DNS lookup error: ${error.message})`,
    };
  }
}

/**
 * Comprehensive email validation
 * Validates format and verifies domain exists
 * 
 * @param email - Email address to validate
 * @param options - Validation options
 * @returns Validation result with isValid flag, errors, and warnings
 */
export async function validateEmail(
  email: string,
  options?: {
    skipDomainCheck?: boolean; // Skip DNS lookup (faster, less reliable)
    timeout?: number; // DNS lookup timeout in milliseconds (default: 5000ms)
  }
): Promise<EmailValidationResult> {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Step 1: Format validation
  const formatResult = validateEmailFormat(email);
  if (!formatResult.isValid) {
    errors.push(formatResult.error || "Invalid email format");
    return {
      isValid: false,
      errors,
      warnings,
    };
  }

  // Extract domain for DNS check
  const domain = email.split("@")[1];

  // Step 2: Domain existence check (if not skipped)
  if (!options?.skipDomainCheck) {
    try {
      // Set timeout for DNS lookup
      const timeout = options?.timeout || 5000;
      const domainCheckPromise = verifyDomainExists(domain);

      // Race between DNS lookup and timeout
      const timeoutPromise = new Promise<{ exists: boolean; error?: string }>((resolve) => {
        setTimeout(() => {
          resolve({
            exists: false,
            error: `Domain verification timed out after ${timeout}ms`,
          });
        }, timeout);
      });

      const domainResult = await Promise.race([domainCheckPromise, timeoutPromise]);

      if (!domainResult.exists) {
        // Domain doesn't exist - this is a warning, not a hard error
        // Some valid domains might have DNS propagation delays
        warnings.push(domainResult.error || `Domain "${domain}" could not be verified`);
        devLog("emailValidation: Domain verification failed (warning)", {
          email,
          domain,
          warning: domainResult.error,
        });
      }
    } catch (error: any) {
      // DNS lookup error - log but don't fail validation
      warnings.push(`Unable to verify domain "${domain}" - ${error.message}`);
      devLog("emailValidation: Domain verification error (warning)", {
        email,
        domain,
        error: error.message,
      });
    }
  }

  return {
    isValid: true,
    errors,
    warnings,
  };
}

/**
 * Quick format-only validation (no DNS lookup)
 * Use this for real-time form validation on the client side
 * This is synchronous and doesn't require server-side DNS lookups
 */
export function validateEmailFormatOnly(email: string): { isValid: boolean; error?: string } {
  return validateEmailFormat(email);
}

/**
 * Client-side email validation (format only, no DNS lookup)
 * Can be used in React components for real-time validation
 * 
 * @example
 * ```tsx
 * const { isValid, error } = validateEmailFormatOnly(email);
 * if (!isValid) {
 *   setError(error);
 * }
 * ```
 */
export function validateEmailClient(email: string): { isValid: boolean; error?: string } {
  return validateEmailFormat(email);
}

/**
 * Validate multiple email addresses
 */
export async function validateEmails(
  emails: string[],
  options?: {
    skipDomainCheck?: boolean;
    timeout?: number;
  }
): Promise<Map<string, EmailValidationResult>> {
  const results = new Map<string, EmailValidationResult>();

  // Validate all emails in parallel
  const validationPromises = emails.map(async (email) => {
    const result = await validateEmail(email, options);
    return { email, result };
  });

  const validationResults = await Promise.all(validationPromises);

  for (const { email, result } of validationResults) {
    results.set(email, result);
  }

  return results;
}

