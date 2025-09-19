import { createClient } from "@supabase/supabase-js";

/**
 * Supabase client configuration and initialization
 * Provides a singleton instance for database operations throughout the app
 */

// Environment variables for Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Security: Enhanced environment variable validation
if (!supabaseUrl || !supabaseAnonKey) {
  const missingVars = [];
  if (!supabaseUrl) missingVars.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!supabaseAnonKey) missingVars.push("NEXT_PUBLIC_SUPABASE_ANON_KEY");

  throw new Error(
    `Missing required environment variables: ${missingVars.join(", ")}. ` +
      "Please check your .env.local file and ensure all required variables are set. " +
      "See docs/ENVIRONMENT_SETUP.md for setup instructions."
  );
}

/**
 * Supabase client instance
 * Configured with session persistence for user authentication
 * Used throughout the application for database operations
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: true }, // Persist session for user auth across pages
});
