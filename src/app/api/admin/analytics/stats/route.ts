import { NextRequest, NextResponse } from "next/server";
import { fetchAnalyticsStats } from "@/lib/analytics";
import { getUserRole } from "@/lib/actions";
import { devLog, devError } from "@/lib/security";
import { withPerformanceTracking } from "@/lib/api-performance-wrapper";

export async function GET(request: NextRequest) {
  return withPerformanceTracking(request, async () => {
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

      devLog("Fetching analytics stats for admin:", userId);

      // Fetch comprehensive analytics data
      const stats = await fetchAnalyticsStats();

      return NextResponse.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      devError("Analytics stats API error:", error);
      return NextResponse.json(
        {
          error: "Failed to fetch analytics statistics",
          details: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 }
      );
    }
  });
}
