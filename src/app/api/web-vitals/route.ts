import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { devLog, devError } from "@/lib/security";

/**
 * API endpoint to receive and store Core Web Vitals metrics
 * Called client-side from WebVitalsTracker component
 */
export async function POST(request: NextRequest) {
  try {
    // Check if request has a body
    const contentType = request.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      return NextResponse.json(
        { error: "Invalid content type" },
        { status: 400 }
      );
    }

    // Safely parse JSON body
    let body;
    try {
      const text = await request.text();
      if (!text || text.trim() === "") {
        return NextResponse.json(
          { error: "Empty request body" },
          { status: 400 }
        );
      }
      body = JSON.parse(text);
    } catch (parseError) {
      devError("Web vitals: Failed to parse JSON", parseError);
      return NextResponse.json(
        { error: "Invalid JSON" },
        { status: 400 }
      );
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
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate metric name
    const validMetrics = ["LCP", "FID", "CLS", "FCP", "TTFB", "INP"];
    if (!validMetrics.includes(metric_name)) {
      return NextResponse.json(
        { error: "Invalid metric name" },
        { status: 400 }
      );
    }

    if (!supabaseAdmin) {
      devError("Admin client not available for web vitals storage");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
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
      devError("Failed to store web vital:", error);
      return NextResponse.json(
        { error: "Failed to store metric" },
        { status: 500 }
      );
    }

    devLog(`Web vital stored: ${metric_name} = ${metric_value}ms on ${page}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    devError("Web vitals API error:", error);
    return NextResponse.json(
      {
        error: "Failed to process web vital",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

