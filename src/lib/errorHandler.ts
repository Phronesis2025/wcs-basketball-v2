/**
 * Centralized Error Handler Utility
 * 
 * This module provides standardized error handling across the application.
 * It includes custom error classes, error handling functions, and response formatters
 * for consistent error management in API routes and components.
 */

import { NextResponse } from "next/server";
import { devError } from "./security";
import { logErrorToDatabase, logServerError, ErrorSeverity } from "./errorLogger";

/**
 * Standardized API error response format
 */
export interface ApiErrorResponse {
  error: string;
  message?: string;
  field?: string;
  code?: string;
  details?: unknown;
}

/**
 * Standardized API success response format
 */
export interface ApiSuccessResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
}

/**
 * Custom error classes for different error types
 */

/**
 * Database-related errors
 */
export class DatabaseError extends Error {
  constructor(
    message: string,
    public readonly originalError?: unknown,
    public readonly code?: string
  ) {
    super(message);
    this.name = "DatabaseError";
    Object.setPrototypeOf(this, DatabaseError.prototype);
  }
}

/**
 * Validation errors (user input, data validation)
 */
export class ValidationError extends Error {
  constructor(
    message: string,
    public readonly field?: string,
    public readonly code?: string
  ) {
    super(message);
    this.name = "ValidationError";
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/**
 * API-related errors (external API calls, network issues)
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
    public readonly code?: string,
    public readonly originalError?: unknown
  ) {
    super(message);
    this.name = "ApiError";
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

/**
 * Authentication/Authorization errors
 */
export class AuthenticationError extends Error {
  constructor(
    message: string = "Authentication required",
    public readonly code?: string
  ) {
    super(message);
    this.name = "AuthenticationError";
    Object.setPrototypeOf(this, AuthenticationError.prototype);
  }
}

/**
 * Authorization errors (permission denied)
 */
export class AuthorizationError extends Error {
  constructor(
    message: string = "Permission denied",
    public readonly code?: string
  ) {
    super(message);
    this.name = "AuthorizationError";
    Object.setPrototypeOf(this, AuthorizationError.prototype);
  }
}

/**
 * Not Found errors
 */
export class NotFoundError extends Error {
  constructor(
    message: string = "Resource not found",
    public readonly code?: string
  ) {
    super(message);
    this.name = "NotFoundError";
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

/**
 * Standardized error response format
 */
export interface ErrorResponse {
  success: false;
  error: {
    message: string;
    code?: string;
    type: string;
    field?: string;
    statusCode: number;
  };
  timestamp: string;
}

/**
 * Handle any error and convert it to a standardized error response
 * 
 * @param error - The error to handle (can be any type)
 * @param context - Optional context information for logging
 * @returns Standardized error response
 */
export function handleError(
  error: unknown,
  context?: {
    userId?: string;
    requestUrl?: string;
    userAgent?: string;
    ipAddress?: string;
  }
): ErrorResponse {
  // Log the error for debugging
  devError("Error handled by errorHandler", error);

  // Determine error type and create appropriate response
  if (error instanceof DatabaseError) {
    // Log to database with appropriate severity
    logErrorToDatabase({
      severity: "error" as ErrorSeverity,
      message: error.message,
      stackTrace: error.stack,
      errorCode: error.code || "DATABASE_ERROR",
      userId: context?.userId,
      pageUrl: context?.requestUrl,
      userAgent: context?.userAgent,
      ipAddress: context?.ipAddress,
    }).catch((logErr) => {
      devError("Failed to log database error", logErr);
    });

    return {
      success: false,
      error: {
        message: "A database error occurred. Please try again later.",
        code: error.code || "DATABASE_ERROR",
        type: "DatabaseError",
        statusCode: 500,
      },
      timestamp: new Date().toISOString(),
    };
  }

  if (error instanceof ValidationError) {
    // Log validation errors as warnings (less severe)
    logErrorToDatabase({
      severity: "warning" as ErrorSeverity,
      message: error.message,
      errorCode: error.code || "VALIDATION_ERROR",
      userId: context?.userId,
      pageUrl: context?.requestUrl,
      userAgent: context?.userAgent,
      ipAddress: context?.ipAddress,
    }).catch((logErr) => {
      devError("Failed to log validation error", logErr);
    });

    return {
      success: false,
      error: {
        message: error.message,
        code: error.code || "VALIDATION_ERROR",
        type: "ValidationError",
        field: error.field,
        statusCode: 400,
      },
      timestamp: new Date().toISOString(),
    };
  }

  if (error instanceof ApiError) {
    logErrorToDatabase({
      severity: "error" as ErrorSeverity,
      message: error.message,
      stackTrace: error.stack,
      errorCode: error.code || "API_ERROR",
      userId: context?.userId,
      pageUrl: context?.requestUrl,
      userAgent: context?.userAgent,
      ipAddress: context?.ipAddress,
    }).catch((logErr) => {
      devError("Failed to log API error", logErr);
    });

    return {
      success: false,
      error: {
        message: error.message || "An API error occurred",
        code: error.code || "API_ERROR",
        type: "ApiError",
        statusCode: error.statusCode || 500,
      },
      timestamp: new Date().toISOString(),
    };
  }

  if (error instanceof AuthenticationError) {
    return {
      success: false,
      error: {
        message: error.message,
        code: error.code || "AUTHENTICATION_ERROR",
        type: "AuthenticationError",
        statusCode: 401,
      },
      timestamp: new Date().toISOString(),
    };
  }

  if (error instanceof AuthorizationError) {
    return {
      success: false,
      error: {
        message: error.message,
        code: error.code || "AUTHORIZATION_ERROR",
        type: "AuthorizationError",
        statusCode: 403,
      },
      timestamp: new Date().toISOString(),
    };
  }

  if (error instanceof NotFoundError) {
    return {
      success: false,
      error: {
        message: error.message,
        code: error.code || "NOT_FOUND",
        type: "NotFoundError",
        statusCode: 404,
      },
      timestamp: new Date().toISOString(),
    };
  }

  // Handle standard Error objects
  if (error instanceof Error) {
    // Log unknown errors as critical
    logServerError(error, {
      userId: context?.userId,
      requestUrl: context?.requestUrl,
      userAgent: context?.userAgent,
      ipAddress: context?.ipAddress,
    }).catch((logErr) => {
      devError("Failed to log server error", logErr);
    });

    return {
      success: false,
      error: {
        message: process.env.NODE_ENV === "production"
          ? "An unexpected error occurred. Please try again later."
          : error.message,
        code: "INTERNAL_ERROR",
        type: "Error",
        statusCode: 500,
      },
      timestamp: new Date().toISOString(),
    };
  }

  // Handle unknown error types
  const errorMessage = String(error || "Unknown error");
  logErrorToDatabase({
    severity: "critical" as ErrorSeverity,
    message: `Unknown error type: ${errorMessage}`,
    errorCode: "UNKNOWN_ERROR",
    userId: context?.userId,
    pageUrl: context?.requestUrl,
    userAgent: context?.userAgent,
    ipAddress: context?.ipAddress,
  }).catch((logErr) => {
    devError("Failed to log unknown error", logErr);
  });

  return {
    success: false,
    error: {
      message: "An unexpected error occurred. Please try again later.",
      code: "UNKNOWN_ERROR",
      type: "UnknownError",
      statusCode: 500,
    },
    timestamp: new Date().toISOString(),
  };
}

/**
 * Format an error response as a Next.js NextResponse
 * 
 * @param errorResponse - The standardized error response
 * @returns NextResponse with error details
 */
export function formatErrorResponse(
  errorResponse: ErrorResponse
): NextResponse {
  return NextResponse.json(errorResponse, {
    status: errorResponse.error.statusCode,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

/**
 * Helper function to create a standardized success response
 * 
 * @param data - The data to return
 * @param statusCode - HTTP status code (default: 200)
 * @returns NextResponse with success data
 */
export function formatSuccessResponse<T>(
  data: T,
  statusCode: number = 200
): NextResponse {
  return NextResponse.json(
    {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    },
    {
      status: statusCode,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}

/**
 * Convenience function to handle errors in API routes and return a NextResponse
 * This combines handleError and formatErrorResponse for easier use
 * 
 * @param error - The error to handle
 * @param request - Optional NextRequest for extracting context (userId, userAgent, etc.)
 * @returns NextResponse with error details
 */
export function handleApiError(
  error: unknown,
  request?: { headers: Headers }
): NextResponse {
  const userId = request?.headers.get("x-user-id") || undefined;
  const userAgent = request?.headers.get("user-agent") || undefined;
  const ipAddress =
    request?.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request?.headers.get("x-real-ip") ||
    undefined;

  const errorResponse = handleError(error, {
    userId,
    userAgent,
    ipAddress,
  });

  return formatErrorResponse(errorResponse);
}

/**
 * Extract error message from an API response (for use in components)
 * Handles both standardized error format and legacy formats for backward compatibility
 * 
 * @param response - The Response object from fetch
 * @returns Promise that resolves to the error message string
 * @throws Error if response cannot be parsed
 * 
 * @example
 * ```typescript
 * const response = await fetch('/api/endpoint');
 * if (!response.ok) {
 *   const errorMessage = await extractApiErrorMessage(response);
 *   setErrors({ general: errorMessage });
 * }
 * ```
 */
export async function extractApiErrorMessage(response: Response): Promise<string> {
  try {
    const data = await response.json();
    
    // Handle standardized error format (from formatErrorResponse)
    if (data.error?.message) {
      return data.error.message;
    }
    
    // Handle legacy error format (direct error field)
    if (data.error && typeof data.error === "string") {
      return data.error;
    }
    
    // Handle error field in root
    if (typeof data.error === "string") {
      return data.error;
    }
    
    // Handle message field
    if (data.message && typeof data.message === "string") {
      return data.message;
    }
    
    // Fallback to status text or generic message
    return response.statusText || "An error occurred. Please try again.";
  } catch (parseError) {
    // If JSON parsing fails, return status text or generic message
    devError("Failed to parse error response:", parseError);
    return response.statusText || "An error occurred. Please try again.";
  }
}

/**
 * Extract field-specific error from an API response (for use in components)
 * Useful for validation errors that are tied to specific form fields
 * 
 * @param response - The Response object from fetch
 * @returns Promise that resolves to an object with field name and error message, or null
 * 
 * @example
 * ```typescript
 * const response = await fetch('/api/endpoint');
 * if (!response.ok) {
 *   const fieldError = await extractApiFieldError(response);
 *   if (fieldError) {
 *     setErrors({ [fieldError.field]: fieldError.message });
 *   }
 *   const generalError = await extractApiErrorMessage(response);
 *   setErrors(prev => ({ ...prev, general: generalError }));
 * }
 * ```
 */
export async function extractApiFieldError(
  response: Response
): Promise<{ field: string; message: string } | null> {
  try {
    const data = await response.json();
    
    // Handle standardized error format
    if (data.error?.field && data.error?.message) {
      return {
        field: data.error.field,
        message: data.error.message,
      };
    }
    
    // Handle legacy format with field in root
    if (data.field && data.error) {
      return {
        field: data.field,
        message: typeof data.error === "string" ? data.error : data.error.message || "Validation error",
      };
    }
    
    return null;
  } catch {
    return null;
  }
}

/**
 * Extract data from a successful API response (for use in components)
 * Handles both standardized success format and legacy formats
 * 
 * @param response - The Response object from fetch
 * @returns Promise that resolves to the data payload
 * @throws Error if response is not ok or cannot be parsed
 * 
 * @example
 * ```typescript
 * const response = await fetch('/api/endpoint');
 * if (!response.ok) {
 *   const errorMessage = await extractApiErrorMessage(response);
 *   throw new Error(errorMessage);
 * }
 * const data = await extractApiResponseData(response);
 * ```
 */
export async function extractApiResponseData<T = unknown>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorMessage = await extractApiErrorMessage(response);
    throw new Error(errorMessage);
  }
  
  try {
    const data = await response.json();
    
    // Handle standardized success format (from formatSuccessResponse)
    if (data.success && data.data !== undefined) {
      return data.data as T;
    }
    
    // Handle legacy format (direct data)
    if (data.data !== undefined) {
      return data.data as T;
    }
    
    // Handle direct response (no wrapper)
    return data as T;
  } catch (parseError) {
    devError("Failed to parse API response:", parseError);
    throw new Error("Failed to parse server response");
  }
}

