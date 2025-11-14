import { NextResponse } from "next/server";

// Security headers for all API responses
export const securityHeaders = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
};

// Rate limiting for development (in production, use Redis)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 1000; // requests per minute (increased for development)
const WINDOW_MS = 60 * 1000; // 1 minute

export function checkRateLimit(ip: string): {
  success: boolean;
  limit: number;
  reset: number;
  remaining: number;
} {
  const now = Date.now();
  const key = ip;
  const record = rateLimitMap.get(key);

  if (!record || now > record.resetTime) {
    // New window or expired window
    rateLimitMap.set(key, { count: 1, resetTime: now + WINDOW_MS });
    return {
      success: true,
      limit: RATE_LIMIT,
      reset: now + WINDOW_MS,
      remaining: RATE_LIMIT - 1,
    };
  }

  if (record.count >= RATE_LIMIT) {
    return {
      success: false,
      limit: RATE_LIMIT,
      reset: record.resetTime,
      remaining: 0,
    };
  }

  record.count++;
  return {
    success: true,
    limit: RATE_LIMIT,
    reset: record.resetTime,
    remaining: RATE_LIMIT - record.count,
  };
}

/**
 * Helper to create secure responses with security headers
 * @param data - Response data to send
 * @param status - HTTP status code (default: 200)
 * @param additionalHeaders - Additional headers to include
 * @returns NextResponse with security headers
 */
export function createSecureResponse(
  data: unknown,
  status: number = 200,
  additionalHeaders: Record<string, string> = {}
): NextResponse {
  return NextResponse.json(data, {
    status,
    headers: {
      ...securityHeaders,
      ...additionalHeaders,
    },
  });
}

/**
 * Helper to create error responses with security headers
 * Ensures no sensitive information is leaked in error messages
 * @param error - Error message (sanitized, no sensitive data)
 * @param status - HTTP status code (default: 500)
 * @param additionalHeaders - Additional headers to include
 * @returns NextResponse with security headers
 */
export function createErrorResponse(
  error: string,
  status: number = 500,
  additionalHeaders: Record<string, string> = {}
): NextResponse {
  // Ensure error message doesn't contain sensitive information
  // Use word boundaries to avoid partial matches (e.g., "secretary" -> "[REDACTED]ary")
  const sanitizedError = error.replace(
    /\b(password|token|key|secret|email|api[_-]?key|access[_-]?token|session|credential)\b/gi,
    "[REDACTED]"
  );
  
  return NextResponse.json(
    { error: sanitizedError },
    {
      status,
      headers: {
        ...securityHeaders,
        ...additionalHeaders,
      },
    }
  );
}
