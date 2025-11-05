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
export async function withPerformanceTracking<T>(
  request: NextRequest,
  handler: () => Promise<NextResponse<T>>
): Promise<NextResponse<T>> {
  const startTime = Date.now();
  const routePath = request.nextUrl.pathname;
  const method = request.method;

  try {
    const response = await handler();
    const responseTime = Date.now() - startTime;

    // Track performance asynchronously (don't await)
    trackPerformance({
      route_path: routePath,
      method,
      response_time_ms: responseTime,
      status_code: response.status,
    }).catch(() => {
      // Silently fail - don't break the response
    });

    return response;
  } catch (error) {
    const responseTime = Date.now() - startTime;

    // Track error performance
    trackPerformance({
      route_path: routePath,
      method,
      response_time_ms: responseTime,
      status_code: 500,
    }).catch(() => {
      // Silently fail
    });

    throw error;
  }
}

