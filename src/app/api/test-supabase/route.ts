import { NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { supabase } from "@/lib/supabaseClient";

// Configure Redis client (use your Upstash URL and token from .env.local)
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || "",
  token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
});

// Rate limit: 5 requests per minute per IP
const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "1 m"),
  analytics: true,
});

export async function GET(request: Request) {
  // Security: Additional validation for production
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "API endpoint not available in production" },
      { status: 403 }
    );
  }

  // Extract IP address from request headers
  const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";

  // Check rate limit for this IP
  const { success, limit, reset, remaining } = await ratelimit.limit(ip);

  // If rate limit exceeded, return 429 status
  if (!success) {
    return NextResponse.json(
      {
        error: "Too many requests",
        limit,
        reset,
        remaining,
      },
      { status: 429 }
    );
  }

  // If within rate limit, proceed with database query
  const { data, error } = await supabase
    .from("teams")
    .select("name, age_group, gender")
    .limit(5);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Return data with rate limit info
  return NextResponse.json({
    teams: data,
    limit,
    reset,
    remaining,
  });
}
