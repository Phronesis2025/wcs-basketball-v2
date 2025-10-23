import { NextRequest, NextResponse } from "next/server";
import { getUserRole } from "@/lib/actions";
import { devLog, devError } from "@/lib/security";

export async function GET(request: NextRequest) {
  try {
    // Get user ID from request headers (set by middleware or auth)
    const userId = request.headers.get("x-user-id");

    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Check if user is admin
    const userData = await getUserRole(userId);
    if (!userData || userData.role !== "admin") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    devLog("Fetching traffic data for admin:", userId);

    // For now, return placeholder traffic data
    // In a real implementation, this would integrate with Vercel Analytics API
    // or calculate from database audit logs
    const trafficData = {
      totalPageViews: 1250,
      uniqueVisitors: 340,
      topPages: [
        { page: "/", views: 450, title: "Home" },
        { page: "/teams", views: 320, title: "Teams" },
        { page: "/schedules", views: 280, title: "Schedules" },
        { page: "/coaches/login", views: 200, title: "Coach Login" },
        { page: "/about", views: 150, title: "About" },
      ],
      deviceBreakdown: {
        mobile: 65,
        desktop: 35,
      },
      geographicDistribution: [
        { country: "United States", visitors: 280 },
        { country: "Canada", visitors: 45 },
        { country: "United Kingdom", visitors: 15 },
      ],
      referrers: [
        { source: "Direct", visitors: 180 },
        { source: "Google", visitors: 120 },
        { source: "Facebook", visitors: 25 },
        { source: "Twitter", visitors: 15 },
      ],
      timeRange: {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
        end: new Date().toISOString(),
      },
    };

    return NextResponse.json({
      success: true,
      data: trafficData,
      note: "Traffic data is currently placeholder. For detailed analytics, visit the Vercel Analytics dashboard.",
    });
  } catch (error) {
    devError("Traffic data API error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch traffic data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
