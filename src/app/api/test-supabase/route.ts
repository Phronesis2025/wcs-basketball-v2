import { NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { supabase } from "@/lib/supabaseClient";
import { ApiError, DatabaseError, handleApiError, formatSuccessResponse } from "@/lib/errorHandler";

export async function GET(request: Request) {
  try {
    // Security: Additional validation for production
    if (process.env.NODE_ENV === "production") {
      throw new ApiError("API endpoint not available in production", 403);
    }

  // Extract IP address from request headers
  const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";

  // Initialize rate limiter only when Upstash env vars are present
  let success = true;
  let limit: number | undefined = undefined;
  let reset: number | undefined = undefined;
  let remaining: number | undefined = undefined;

  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
  const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (upstashUrl && upstashToken) {
    const redis = new Redis({ url: upstashUrl, token: upstashToken });
    const ratelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "1 m"),
      analytics: true,
    });
    const result = await ratelimit.limit(ip);
    success = result.success;
    limit = result.limit;
    reset = result.reset;
    remaining = result.remaining;
  }

  // If rate limit exceeded, return 429 status
  if (!success) {
    return NextResponse.json(
      {
        error: "Too many requests",
        limit,
        reset,
        remaining,
      },
      { status: 429 } // Preserve rate limit response format
    );
  }

  // If within rate limit, proceed with database query
  const { data, error } = await supabase
    .from("teams")
    .select("name, age_group, gender")
    .limit(5);

  if (error) {
    throw new DatabaseError("Failed to fetch teams", error);
  }

    // Return data with rate limit info
    return formatSuccessResponse({
      teams: data,
      limit,
      reset,
      remaining,
    });
  } catch (error) {
    return handleApiError(error, request);
  }
}
