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
const RATE_LIMIT = 100; // requests per minute
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

// Helper to create secure responses
export function createSecureResponse(
  data: unknown,
  status: number = 200,
  additionalHeaders: Record<string, string> = {}
) {
  return NextResponse.json(data, {
    status,
    headers: {
      ...securityHeaders,
      ...additionalHeaders,
    },
  });
}

// Helper to create error responses with security headers
export function createErrorResponse(
  error: string,
  status: number = 500,
  additionalHeaders: Record<string, string> = {}
) {
  return NextResponse.json(
    { error },
    {
      status,
      headers: {
        ...securityHeaders,
        ...additionalHeaders,
      },
    }
  );
}
