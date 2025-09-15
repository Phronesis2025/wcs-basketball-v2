/**
 * Security utility functions for the WCS v2.0 application
 *
 * This file contains security-related helper functions that should be used
 * throughout the application to maintain consistent security practices.
 */

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
