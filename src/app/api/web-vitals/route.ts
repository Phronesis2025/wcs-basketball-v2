import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { devLog, devError } from "@/lib/security";
import { ValidationError, ApiError, DatabaseError, handleApiError, formatSuccessResponse } from "@/lib/errorHandler";

/**
 * API endpoint to receive and store Core Web Vitals metrics
 * Called client-side from WebVitalsTracker component
 */
export async function POST(request: NextRequest) {
  try {
    // Check if request has a body
    const contentType = request.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      throw new ValidationError("Invalid content type");
    }

    // Safely parse JSON body
    let body;
    try {
      const text = await request.text();
      if (!text || text.trim() === "") {
        throw new ValidationError("Empty request body");
      }
      body = JSON.parse(text);
    } catch (parseError) {
      if (parseError instanceof ValidationError) {
        throw parseError;
      }
      throw new ValidationError("Invalid JSON");
    }

    const {
      page,
      metric_name,
      metric_value,
      metric_id,
      session_id,
      user_id,
    } = body;

    // Validate required fields
    if (!page || !metric_name || metric_value === undefined) {
      throw new ValidationError("Missing required fields: page, metric_name, metric_value");
    }

    // Validate metric name
    const validMetrics = ["LCP", "FID", "CLS", "FCP", "TTFB", "INP"];
    if (!validMetrics.includes(metric_name)) {
      throw new ValidationError(`Invalid metric name. Must be one of: ${validMetrics.join(", ")}`);
    }

    if (!supabaseAdmin) {
      throw new ApiError("Server configuration error", 500);
    }

    // Try to get user ID from auth if not provided
    const userId = user_id;
    if (!userId) {
      // Check if user is authenticated via headers
      const authHeader = request.headers.get("authorization");
      // Note: In a real implementation, you'd extract user ID from JWT token
      // For now, we'll store without user_id for anonymous users
    }

    // Insert web vital metric
    const { error } = await supabaseAdmin.from("web_vitals").insert([
      {
        page,
        metric_name,
        metric_value: parseFloat(metric_value),
        metric_id: metric_id || null,
        session_id: session_id || null,
        user_id: userId || null,
      },
    ]);

    if (error) {
      throw new DatabaseError("Failed to store web vital", error);
    }

    devLog(`Web vital stored: ${metric_name} = ${metric_value}ms on ${page}`);

    return formatSuccessResponse({ message: "Web vital stored successfully" });
  } catch (error) {
    return handleApiError(error, request);
  }
}

