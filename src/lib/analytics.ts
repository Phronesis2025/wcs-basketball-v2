// src/lib/analytics.ts
"use server";

import { supabaseAdmin } from "./supabaseClient";
import { devLog, devError } from "./security";
import {
  ErrorLog,
  LoginLog,
  LoginStatistic,
  ErrorStatistics,
  AnalyticsStats,
} from "../types/supabase";

/**
 * Track a user login event
 */
export async function trackLogin(
  userId: string,
  metadata?: {
    ipAddress?: string;
    userAgent?: string;
    success?: boolean;
    failureReason?: string;
  }
): Promise<void> {
  try {
    if (!supabaseAdmin) {
      devError("Admin client not available for login tracking");
      return;
    }

    // Log the login event
    const { error: logError } = await supabaseAdmin.from("login_logs").insert({
      user_id: userId,
      ip_address: metadata?.ipAddress || null,
      user_agent: metadata?.userAgent || null,
      success: metadata?.success ?? true,
      failure_reason: metadata?.failureReason || null,
    });

    if (logError) {
      devError("Failed to log login event:", logError);
      return;
    }

    // First get current login count
    const { data: userData, error: fetchError } = await supabaseAdmin
      .from("users")
      .select("login_count")
      .eq("id", userId)
      .single();

    if (fetchError) {
      devError("Failed to fetch user data for login count update:", fetchError);
      return;
    }

    // Update user's login count and last login time
    const { error: updateError } = await supabaseAdmin
      .from("users")
      .update({
        login_count: (userData?.login_count || 0) + 1,
        last_login_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (updateError) {
      devError("Failed to update user login stats:", updateError);
    } else {
      devLog(`Login tracked for user: ${userId}`);
    }
  } catch (err) {
    devError("Login tracking failed:", err);
  }
}

/**
 * Fetch recent error logs with filtering
 */
export async function fetchRecentErrors(
  limit: number = 50,
  severity?: string,
  resolved?: boolean
): Promise<ErrorLog[]> {
  try {
    if (!supabaseAdmin) {
      throw new Error("Admin client not available");
    }

    let query = supabaseAdmin
      .from("error_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (severity) {
      query = query.eq("severity", severity);
    }

    if (resolved !== undefined) {
      query = query.eq("resolved", resolved);
    }

    const { data, error } = await query;

    if (error) {
      devError("Failed to fetch error logs:", error);
      throw new Error(error.message);
    }

    return data || [];
  } catch (err) {
    devError("Fetch recent errors failed:", err);
    throw err;
  }
}

/**
 * Get error statistics
 */
export async function getErrorStatistics(): Promise<ErrorStatistics> {
  try {
    if (!supabaseAdmin) {
      throw new Error("Admin client not available");
    }

    const { data, error } = await supabaseAdmin.rpc("get_error_statistics");

    if (error) {
      devError("Failed to get error statistics:", error);
      throw new Error(error.message);
    }

    return (
      data?.[0] || {
        total_errors: 0,
        critical_errors: 0,
        error_count: 0,
        warning_count: 0,
        info_count: 0,
        resolved_errors: 0,
        unresolved_errors: 0,
      }
    );
  } catch (err) {
    devError("Get error statistics failed:", err);
    throw err;
  }
}

/**
 * Get login statistics for all users
 */
export async function getLoginStatistics(): Promise<LoginStatistic[]> {
  try {
    if (!supabaseAdmin) {
      throw new Error("Admin client not available");
    }

    // First try the RPC function
    const { data: rpcData, error: rpcError } = await supabaseAdmin.rpc(
      "get_login_statistics"
    );

    if (rpcError) {
      devError(
        "RPC get_login_statistics failed, trying manual query:",
        rpcError
      );

      // Fallback: manually query users and coaches
      const { data: users, error: usersError } = await supabaseAdmin
        .from("users")
        .select("id, email, role, login_count, last_login_at")
        .in("role", ["admin", "coach"]);

      if (usersError) {
        devError("Failed to fetch users:", usersError);
        throw new Error(usersError.message);
      }

      const { data: coaches, error: coachesError } = await supabaseAdmin
        .from("coaches")
        .select("email, is_active");

      if (coachesError) {
        devError("Failed to fetch coaches:", coachesError);
        // Continue without coaches data
      }

      // Create login statistics manually
      const loginStats: LoginStatistic[] = (users || []).map((user) => {
        const coachData = coaches?.find((c) => c.email === user.email);
        return {
          user_id: user.id,
          email: user.email,
          role: user.role,
          total_logins: user.login_count || 0,
          last_login_at: user.last_login_at,
          first_login_at: null, // Would need to query login_logs for this
          is_active:
            user.role === "admin" ? true : coachData?.is_active ?? true,
        };
      });

      return loginStats;
    }

    return rpcData || [];
  } catch (err) {
    devError("Get login statistics failed:", err);
    throw err;
  }
}

/**
 * Mark all errors as resolved
 */
export async function clearAllErrors(
  resolvedByUserId: string
): Promise<number> {
  try {
    if (!supabaseAdmin) {
      throw new Error("Admin client not available");
    }

    const { data, error } = await supabaseAdmin.rpc("resolve_all_errors", {
      resolved_by_user_id: resolvedByUserId,
    });

    if (error) {
      devError("Failed to clear all errors:", error);
      throw new Error(error.message);
    }

    devLog(`Cleared all errors. Resolved count: ${data}`);
    return data || 0;
  } catch (err) {
    devError("Clear all errors failed:", err);
    throw err;
  }
}

/**
 * Get comprehensive analytics statistics
 */
export async function fetchAnalyticsStats(): Promise<AnalyticsStats> {
  try {
    // Fetch all analytics data in parallel
    const [errorStats, loginStats] = await Promise.all([
      getErrorStatistics(),
      getLoginStatistics(),
    ]);

    // Calculate performance metrics (placeholder - would integrate with Vercel Analytics)
    const performanceMetrics = {
      averagePageLoadTime: 2.1, // Placeholder - would come from Vercel Speed Insights
      errorRate:
        errorStats.total_errors > 0
          ? (errorStats.unresolved_errors / errorStats.total_errors) * 100
          : 0,
      uptime: 99.9, // Placeholder - would come from monitoring service
    };

    // Calculate traffic metrics (placeholder - would integrate with Vercel Analytics)
    const trafficMetrics = {
      totalPageViews: 1250, // Placeholder - would come from Vercel Analytics
      uniqueVisitors: 340, // Placeholder - would come from Vercel Analytics
      topPages: [
        { page: "/", views: 450 },
        { page: "/teams", views: 320 },
        { page: "/schedules", views: 280 },
        { page: "/coaches/login", views: 200 },
      ],
      deviceBreakdown: {
        mobile: 65,
        desktop: 35,
      },
    };

    return {
      errorStats,
      loginStats,
      performanceMetrics,
      trafficMetrics,
    };
  } catch (err) {
    devError("Fetch analytics stats failed:", err);
    throw err;
  }
}

/**
 * Get error logs with pagination
 */
export async function getErrorLogs(
  page: number = 1,
  limit: number = 20,
  filters?: {
    severity?: string;
    resolved?: boolean;
    search?: string;
  }
): Promise<{
  logs: ErrorLog[];
  total: number;
  page: number;
  totalPages: number;
}> {
  try {
    if (!supabaseAdmin) {
      throw new Error("Admin client not available");
    }

    const offset = (page - 1) * limit;

    // Build query
    let query = supabaseAdmin
      .from("error_logs")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (filters?.severity) {
      query = query.eq("severity", filters.severity);
    }

    if (filters?.resolved !== undefined) {
      query = query.eq("resolved", filters.resolved);
    }

    if (filters?.search) {
      query = query.or(
        `message.ilike.%${filters.search}%,error_code.ilike.%${filters.search}%`
      );
    }

    const { data, error, count } = await query;

    if (error) {
      devError("Failed to fetch error logs with pagination:", error);
      throw new Error(error.message);
    }

    const totalPages = Math.ceil((count || 0) / limit);

    return {
      logs: data || [],
      total: count || 0,
      page,
      totalPages,
    };
  } catch (err) {
    devError("Get error logs with pagination failed:", err);
    throw err;
  }
}

/**
 * Get login logs with pagination
 */
export async function getLoginLogs(
  page: number = 1,
  limit: number = 20,
  userId?: string
): Promise<{
  logs: LoginLog[];
  total: number;
  page: number;
  totalPages: number;
}> {
  try {
    if (!supabaseAdmin) {
      throw new Error("Admin client not available");
    }

    const offset = (page - 1) * limit;

    let query = supabaseAdmin
      .from("login_logs")
      .select("*", { count: "exact" })
      .order("login_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (userId) {
      query = query.eq("user_id", userId);
    }

    const { data, error, count } = await query;

    if (error) {
      devError("Failed to fetch login logs with pagination:", error);
      throw new Error(error.message);
    }

    const totalPages = Math.ceil((count || 0) / limit);

    return {
      logs: data || [],
      total: count || 0,
      page,
      totalPages,
    };
  } catch (err) {
    devError("Get login logs with pagination failed:", err);
    throw err;
  }
}
