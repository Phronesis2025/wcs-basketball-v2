import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";

export const dynamic = "force-dynamic";

/**
 * Custom error class for Sentry testing
 * Properly extends Error with name property
 */
class SentryExampleAPIError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SentryExampleAPIError";
    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, SentryExampleAPIError);
  }
}
}

/**
 * A faulty API route to test Sentry's error monitoring
 * This intentionally throws an error to verify error tracking
 */
export async function GET() {
  // Create and capture the error with Sentry before throwing
  const error = new SentryExampleAPIError(
    "This error is raised on the backend called by the example page."
  );
  Sentry.captureException(error);
  throw error;
}
