// src/lib/errorActions.ts
"use server";

import { supabaseAdmin } from "./supabaseClient";
import { devLog, devError } from "./security";
import { ErrorLogData } from "./errorLogger";

/**
 * Log an error to the database for admin dashboard viewing
 * This is a server action that can be called from client components
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
 * This is a server action that can be called from client components
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
    message:
      error && typeof error === "object" && "message" in error
        ? String(error.message)
        : "Unknown client error",
    stackTrace:
      error && typeof error === "object" && "stack" in error
        ? String(error.stack)
        : null,
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
 * This is a server action that can be called from server components
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
 * This is a server action that can be called from server components
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
 * This is a server action that can be called from server components
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
