import { NextRequest, NextResponse } from "next/server";
import {
  getErrorLogs,
  clearAllErrors,
  getErrorStatistics,
} from "@/lib/analytics";
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

    const { searchParams } = new URL(request.url);
    
    // Validate and parse pagination parameters with bounds checking
    const pageParam = searchParams.get("page");
    const page = Math.max(1, Math.min(1000, parseInt(pageParam || "1", 10) || 1));
    
    const limitParam = searchParams.get("limit");
    const limit = Math.max(1, Math.min(100, parseInt(limitParam || "20", 10) || 20));
    
    // Validate severity parameter (only allow valid values)
    const severityParam = searchParams.get("severity");
    const validSeverities = ["low", "medium", "high", "critical"];
    const severity = severityParam && validSeverities.includes(severityParam.toLowerCase())
      ? severityParam.toLowerCase()
      : undefined;
    
    // Parse resolved boolean parameter
    const resolvedParam = searchParams.get("resolved");
    const resolved =
      resolvedParam === "true"
        ? true
        : resolvedParam === "false"
        ? false
        : undefined;
    
    // Sanitize search parameter to prevent injection
    const searchParam = searchParams.get("search");
    const search = searchParam && searchParam.trim().length > 0
      ? searchParam.trim().substring(0, 100) // Limit length
      : undefined;

    devLog("Fetching error logs for admin:", {
      userId,
      page,
      limit,
      severity,
      resolved,
      search,
    });

    // Get error logs with pagination and filters
    const result = await getErrorLogs(page, limit, {
      severity,
      resolved,
      search,
    });

    // Also get error statistics
    const errorStats = await getErrorStatistics();

    return NextResponse.json({
      success: true,
      data: {
        logs: result.logs,
        pagination: {
          page: result.page,
          totalPages: result.totalPages,
          total: result.total,
          limit,
        },
        filters: {
          severity,
          resolved,
          search,
        },
        statistics: errorStats,
      },
    });
  } catch (error) {
    devError("Error logs API error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch error logs",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
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

    devLog("Clearing all errors for admin:", userId);

    // Clear all errors (mark as resolved)
    const resolvedCount = await clearAllErrors(userId);

    return NextResponse.json({
      success: true,
      message: `Successfully resolved ${resolvedCount} errors`,
      resolvedCount,
    });
  } catch (error) {
    devError("Clear errors API error:", error);
    return NextResponse.json(
      {
        error: "Failed to clear errors",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
