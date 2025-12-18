import { NextRequest, NextResponse } from "next/server";
import { fetchAnalyticsStats } from "@/lib/analytics";
import { getUserRole } from "@/lib/actions";
import { devLog, devError } from "@/lib/security";
import { withPerformanceTracking } from "@/lib/api-performance-wrapper";
import { AuthenticationError, AuthorizationError, ApiError, handleApiError, formatSuccessResponse } from "@/lib/errorHandler";

export async function GET(request: NextRequest) {
  return withPerformanceTracking(request, async () => {
    try {
      // Get user ID from request headers (set by middleware or auth)
      const userId = request.headers.get("x-user-id");

      if (!userId) {
        throw new AuthenticationError("Authentication required");
      }

      // Check if user is admin
      const userData = await getUserRole(userId);
      if (!userData || userData.role !== "admin") {
        throw new AuthorizationError("Admin access required");
      }

      devLog("Fetching analytics stats for admin:", userId);

      // Fetch comprehensive analytics data
      const stats = await fetchAnalyticsStats();
      
      devLog("Analytics stats fetched:", {
        hasTrafficMetrics: !!stats.trafficMetrics,
        pageViews: stats.trafficMetrics?.totalPageViews,
        uniqueVisitors: stats.trafficMetrics?.uniqueVisitors,
        mobilePercentage: stats.trafficMetrics?.deviceBreakdown?.mobile,
      });

      // formatSuccessResponse already wraps in { success: true, data: ... }
      // So we pass stats directly, not { data: stats }
      return formatSuccessResponse(stats);
    } catch (error) {
      return handleApiError(error, request);
    }
  });
}
