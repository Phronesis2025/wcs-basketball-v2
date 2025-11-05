// src/lib/performance-tracker.ts
"use server";

import { supabaseAdmin } from "./supabaseClient";
import { devLog, devError } from "./security";

export interface PerformanceMetric {
  route_path: string;
  method: string;
  response_time_ms: number;
  status_code?: number;
}

/**
 * Track API route performance by storing response time metrics
 * This is called after API routes complete to log their performance
 */
export async function trackPerformance(metric: PerformanceMetric): Promise<void> {
  try {
    // Don't track in development to avoid cluttering the database
    // Uncomment if you want to test tracking
    // if (process.env.NODE_ENV === "development") {
    //   return;
    // }

    if (!supabaseAdmin) {
      devError("Admin client not available for performance tracking");
      return;
    }

    // Only track if response time is reasonable (less than 30 seconds)
    // This filters out potential errors or extremely slow requests
    if (metric.response_time_ms > 30000) {
      devLog("Skipping performance metric - response time too high:", metric.response_time_ms);
      return;
    }

    // Insert performance metric
    const { error } = await supabaseAdmin
      .from("performance_metrics")
      .insert([
        {
          route_path: metric.route_path,
          method: metric.method,
          response_time_ms: metric.response_time_ms,
          status_code: metric.status_code || null,
        },
      ]);

    if (error) {
      devError("Failed to track performance metric:", error);
    }
  } catch (err) {
    // Silently fail - don't let performance tracking break the app
    devError("Performance tracking error:", err);
  }
}

/**
 * Calculate average response time for a route or all routes
 * @param routePath Optional route path to filter by
 * @param hours Number of hours to look back (default: 24)
 */
export async function getAverageResponseTime(
  routePath?: string,
  hours: number = 24
): Promise<number> {
  try {
    if (!supabaseAdmin) {
      return 120; // Default fallback
    }

    const since = new Date();
    since.setHours(since.getHours() - hours);

    let query = supabaseAdmin
      .from("performance_metrics")
      .select("response_time_ms")
      .gte("created_at", since.toISOString());

    if (routePath) {
      query = query.eq("route_path", routePath);
    }

    const { data, error } = await query;

    if (error || !data || data.length === 0) {
      return 120; // Default fallback
    }

    const total = data.reduce((sum, metric) => sum + (metric.response_time_ms || 0), 0);
    return Math.round(total / data.length);
  } catch (err) {
    devError("Failed to calculate average response time:", err);
    return 120; // Default fallback
  }
}

