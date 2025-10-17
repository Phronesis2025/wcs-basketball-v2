/**
 * Security utility functions for the WCS v2.0 application
 *
 * This file contains security-related helper functions that should be used
 * throughout the application to maintain consistent security practices.
 */

import { validateInputForProfanity } from "./profanityFilter";

/**
 * Check if the application is running in production environment
 * @returns {boolean} True if in production, false otherwise
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

/**
 * Check if the application is running in development environment
 * @returns {boolean} True if in development, false otherwise
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === "development";
}

/**
 * Safely log messages only in development environment
 * @param message - The message to log
 * @param data - Optional additional data to log
 */
export function devLog(message: string, data?: unknown): void {
  if (isDevelopment()) {
    if (data) {
      console.log(`[DEV] ${message}`, data);
    } else {
      console.log(`[DEV] ${message}`);
    }
  }
}

/**
 * Safely log errors only in development environment
 * @param message - The error message to log
 * @param error - Optional error object to log
 */
export function devError(message: string, error?: unknown): void {
  if (isDevelopment()) {
    if (error) {
      console.error(`[DEV ERROR] ${message}`, error);
    } else {
      console.error(`[DEV ERROR] ${message}`);
    }
  }
}

/**
 * Validate that required environment variables are present
 * @param requiredVars - Array of required environment variable names
 * @throws Error if any required variables are missing
 */
export function validateEnvironmentVariables(requiredVars: string[]): void {
  const missingVars: string[] = [];

  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      missingVars.push(varName);
    }
  }

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(", ")}. ` +
        "Please check your .env.local file and ensure all required variables are set. " +
        "See docs/ENVIRONMENT_SETUP.md for setup instructions."
    );
  }
}

/**
 * Sanitize user input to prevent XSS attacks
 * @param input - The input string to sanitize
 * @returns Sanitized string
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== "string") {
    return "";
  }

  return input
    .replace(/[<>]/g, "") // Remove potential HTML tags
    .trim() // Remove leading/trailing whitespace
    .substring(0, 1000); // Limit length to prevent DoS
}

/**
 * Check if a string contains potentially malicious content
 * @param input - The string to check
 * @returns True if potentially malicious, false otherwise
 */
export function containsMaliciousContent(input: string): boolean {
  if (typeof input !== "string") {
    return false;
  }

  const maliciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /<iframe/i,
    /<object/i,
    /<embed/i,
  ];

  return maliciousPatterns.some((pattern) => pattern.test(input));
}

/**
 * Generate a CSRF token for form protection
 * @returns A cryptographically secure random token
 */
export function generateCSRFToken(): string {
  // Use crypto.getRandomValues if available (browser), otherwise fallback to Math.random
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join(
      ""
    );
  } else {
    // Fallback for server-side or environments without crypto.getRandomValues
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15) +
      Date.now().toString(36)
    );
  }
}

/**
 * Validate a CSRF token
 * @param token - The token to validate
 * @param sessionToken - The expected token from session
 * @returns True if tokens match, false otherwise
 */
export function validateCSRFToken(
  token: string,
  sessionToken: string
): boolean {
  if (!token || !sessionToken) {
    return false;
  }

  // Use constant-time comparison to prevent timing attacks
  if (token.length !== sessionToken.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < token.length; i++) {
    result |= token.charCodeAt(i) ^ sessionToken.charCodeAt(i);
  }

  return result === 0;
}

/**
 * Get CSRF token from cookies (client-side)
 * @returns The CSRF token from cookies or null if not found
 */
export function getCSRFTokenFromCookies(): string | null {
  if (typeof document === "undefined") {
    return null; // Server-side
  }

  const cookies = document.cookie.split(";").reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split("=");
    acc[key] = value ? decodeURIComponent(value) : "";
    return acc;
  }, {} as Record<string, string>);

  return cookies["csrf-token"] || null;
}

/**
 * Set CSRF token in cookies (server-side helper)
 * @param token - The CSRF token to set
 * @param options - Cookie options
 * @returns Cookie string
 */
export function createCSRFCookie(
  token: string,
  options: {
    maxAge?: number;
    httpOnly?: boolean;
    secure?: boolean;
    sameSite?: "strict" | "lax" | "none";
  } = {}
): string {
  const {
    maxAge = 3600, // 1 hour
    httpOnly = false,
    secure = process.env.NODE_ENV === "production",
    sameSite = "strict",
  } = options;

  let cookie = `csrf-token=${encodeURIComponent(token)}`;
  cookie += `; Max-Age=${maxAge}`;
  cookie += `; Path=/`;
  cookie += secure ? "; Secure" : "";
  cookie += `; SameSite=${sameSite}`;
  cookie += httpOnly ? "; HttpOnly" : "";

  return cookie;
}

/**
 * Enhanced input sanitization with profanity filtering
 * @param input - The input string to sanitize
 * @param fieldName - Optional field name for validation context
 * @returns Sanitized string with profanity removed
 */
export function sanitizeInputWithProfanity(
  input: string,
  fieldName?: string
): string {
  if (typeof input !== "string") {
    return "";
  }

  // First apply basic sanitization
  const sanitized = sanitizeInput(input);

  // Then check for profanity
  const profanityCheck = validateInputForProfanity(
    fieldName || "input",
    sanitized
  );

  if (!profanityCheck.isValid && profanityCheck.sanitizedValue) {
    return profanityCheck.sanitizedValue;
  }

  return sanitized;
}

/**
 * Validate input for both XSS and profanity
 * @param input - The input to validate
 * @param fieldName - Optional field name for context
 * @returns Validation result
 */
export function validateInput(
  input: string,
  fieldName?: string
): {
  isValid: boolean;
  sanitizedValue: string;
  errors: string[];
} {
  const errors: string[] = [];
  let sanitizedValue = input;

  // Check for malicious content
  if (containsMaliciousContent(input)) {
    errors.push("Input contains potentially malicious content");
    sanitizedValue = sanitizeInput(input);
  }

  // Check for profanity
  const profanityCheck = validateInputForProfanity(
    fieldName || "input",
    sanitizedValue
  );
  if (!profanityCheck.isValid) {
    errors.push(
      profanityCheck.errorMessage || "Inappropriate language detected"
    );
    if (profanityCheck.sanitizedValue) {
      sanitizedValue = profanityCheck.sanitizedValue;
    }
  }

  return {
    isValid: errors.length === 0,
    sanitizedValue,
    errors,
  };
}
