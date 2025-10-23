// src/lib/errorLogger.ts
import { supabaseAdmin } from "./supabaseClient";
import { devLog, devError } from "./security";

export type ErrorSeverity = "critical" | "error" | "warning" | "info";

export interface ErrorLogData {
  severity: ErrorSeverity;
  message: string;
  stackTrace?: string;
  userId?: string;
  pageUrl?: string;
  userAgent?: string;
  ipAddress?: string;
  errorCode?: string;
}

/**
 * Log an error to the database for admin dashboard viewing
 * This complements Sentry by providing a database view of errors
 */
export async function logErrorToDatabase(
  errorData: ErrorLogData
): Promise<void> {
  try {
    if (!supabaseAdmin) {
      devError("Admin client not available for error logging");
      return;
    }

    // Sanitize error message to prevent XSS
    const sanitizedMessage = errorData.message
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .substring(0, 1000); // Limit message length

    const sanitizedStackTrace = errorData.stackTrace
      ? errorData.stackTrace
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
          .substring(0, 5000) // Limit stack trace length
      : null;

    const { error } = await supabaseAdmin.from("error_logs").insert({
      severity: errorData.severity,
      message: sanitizedMessage,
      stack_trace: sanitizedStackTrace,
      user_id: errorData.userId || null,
      page_url: errorData.pageUrl || null,
      user_agent: errorData.userAgent || null,
      ip_address: errorData.ipAddress || null,
      error_code: errorData.errorCode || null,
    });

    if (error) {
      devError("Failed to log error to database:", error);
    } else {
      devLog(
        `Error logged to database: ${errorData.severity} - ${sanitizedMessage}`
      );
    }
  } catch (err) {
    devError("Error logging to database failed:", err);
  }
}

/**
 * Log a client-side error with context
 */
export async function logClientError(
  error: Error,
  context?: {
    userId?: string;
    pageUrl?: string;
    userAgent?: string;
    additionalInfo?: string;
  }
): Promise<void> {
  const errorData: ErrorLogData = {
    severity: "error",
    message: error.message || "Unknown client error",
    stackTrace: error.stack,
    userId: context?.userId,
    pageUrl:
      context?.pageUrl ||
      (typeof window !== "undefined" ? window.location.href : undefined),
    userAgent:
      context?.userAgent ||
      (typeof window !== "undefined" ? window.navigator.userAgent : undefined),
    errorCode: error.name,
  };

  await logErrorToDatabase(errorData);
}

/**
 * Log a server-side error with context
 */
export async function logServerError(
  error: Error,
  context?: {
    userId?: string;
    requestUrl?: string;
    userAgent?: string;
    ipAddress?: string;
    additionalInfo?: string;
  }
): Promise<void> {
  const errorData: ErrorLogData = {
    severity: "error",
    message: error.message || "Unknown server error",
    stackTrace: error.stack,
    userId: context?.userId,
    pageUrl: context?.requestUrl,
    userAgent: context?.userAgent,
    ipAddress: context?.ipAddress,
    errorCode: error.name,
  };

  await logErrorToDatabase(errorData);
}

/**
 * Log a critical system error
 */
export async function logCriticalError(
  message: string,
  context?: {
    userId?: string;
    pageUrl?: string;
    userAgent?: string;
    ipAddress?: string;
    stackTrace?: string;
    errorCode?: string;
  }
): Promise<void> {
  const errorData: ErrorLogData = {
    severity: "critical",
    message,
    stackTrace: context?.stackTrace,
    userId: context?.userId,
    pageUrl: context?.pageUrl,
    userAgent: context?.userAgent,
    ipAddress: context?.ipAddress,
    errorCode: context?.errorCode,
  };

  await logErrorToDatabase(errorData);
}

/**
 * Log a warning (non-critical issues)
 */
export async function logWarning(
  message: string,
  context?: {
    userId?: string;
    pageUrl?: string;
    userAgent?: string;
    additionalInfo?: string;
  }
): Promise<void> {
  const errorData: ErrorLogData = {
    severity: "warning",
    message,
    userId: context?.userId,
    pageUrl: context?.pageUrl,
    userAgent: context?.userAgent,
  };

  await logErrorToDatabase(errorData);
}

/**
 * Get client IP address from request headers
 */
export function getClientIP(request: Request): string | undefined {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIP = request.headers.get("x-real-ip");

  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  if (realIP) {
    return realIP;
  }

  return undefined;
}

/**
 * Get user agent from request headers
 */
export function getUserAgent(request: Request): string | undefined {
  return request.headers.get("user-agent") || undefined;
}
