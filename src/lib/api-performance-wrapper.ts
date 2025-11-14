// src/lib/api-performance-wrapper.ts
"use server";

import { NextRequest, NextResponse } from "next/server";
import { trackPerformance } from "./performance-tracker";

/**
 * Wrapper function to track API route performance
 * Usage: Wrap your route handler with this function
 * 
 * Example:
 * export async function GET(request: NextRequest) {
 *   return withPerformanceTracking(request, async () => {
 *     // Your route logic here
 *     return NextResponse.json({ data: "result" });
 *   });
 * }
 */
/**
 * Wrapper function to track API route performance
 * Tracks both successful and failed requests with timing information
 * 
 * @template T - The response data type
 * @param request - The Next.js request object
 * @param handler - The route handler function to wrap
 * @returns Promise resolving to NextResponse
 * @throws Re-throws any error from the handler after tracking
 */
export async function withPerformanceTracking<T>(
  request: NextRequest,
  handler: () => Promise<NextResponse<T>>
): Promise<NextResponse<T>> {
  const startTime = performance.now(); // Use high-resolution timer
  const routePath = request.nextUrl.pathname;
  const method = request.method;

  try {
    const response = await handler();
    const responseTime = Math.round(performance.now() - startTime);

    // Track performance asynchronously (don't await to avoid blocking response)
    trackPerformance({
      route_path: routePath,
      method,
      response_time_ms: responseTime,
      status_code: response.status,
    }).catch((trackError) => {
      // Silently fail - performance tracking should never break the API
      // Log only in development
      if (process.env.NODE_ENV === "development") {
        console.error("Performance tracking failed:", trackError);
      }
    });

    return response;
  } catch (error) {
    const responseTime = Math.round(performance.now() - startTime);

    // Track error performance for monitoring
    trackPerformance({
      route_path: routePath,
      method,
      response_time_ms: responseTime,
      status_code: 500,
    }).catch((trackError) => {
      // Silently fail - performance tracking should never break error handling
      if (process.env.NODE_ENV === "development") {
        console.error("Performance tracking failed on error:", trackError);
      }
    });

    // Re-throw the original error to maintain error handling flow
    throw error;
  }
}

