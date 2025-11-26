// src/lib/supabaseClient.ts
import { createClient } from "@supabase/supabase-js";
import { devError, devLog } from "@/lib/security";

// Environment variables for Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Security: Enhanced environment variable validation (skip on client to avoid leaks/errors)
if (typeof window === "undefined") {
  if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
    const missingVars = [];
    if (!supabaseUrl) missingVars.push("NEXT_PUBLIC_SUPABASE_URL");
    if (!supabaseAnonKey) missingVars.push("NEXT_PUBLIC_SUPABASE_ANON_KEY");
    if (!supabaseServiceKey) missingVars.push("SUPABASE_SERVICE_ROLE_KEY");

    devError(
      `Missing required environment variables: ${missingVars.join(", ")}. ` +
        "Please check your .env.local file and ensure all required variables are set. " +
        "See docs/ENVIRONMENT_SETUP.md for setup instructions. " +
        "Using placeholder values for development."
    );
  }
}

// Supabase client instance (client/server, anon key)
export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder_key",
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
    realtime: {
      // Configure realtime to handle connection failures gracefully
      params: {
        eventsPerSecond: 10,
      },
    },
  }
);

// Admin Supabase client (server-side only, bypasses RLS)
export const supabaseAdmin =
  typeof window === "undefined"
    ? createClient(
        supabaseUrl || "https://placeholder.supabase.co",
        supabaseServiceKey || "placeholder_service_key",
        {
          auth: {
            persistSession: false,
          },
        }
      )
    : null;

// Debug: Log running context
devLog("Running on:", typeof window === "undefined" ? "server" : "client");
