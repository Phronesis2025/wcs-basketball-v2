// batch-create-coaches.js
// Script to batch-create 20 coach accounts in Supabase with unique temp passwords.
// Runs on Node.js, uses service role key for admin access (bypasses RLS).
// Best practices: Async, error handling, crypto for passwords, bulk operations.
// Assumptions: Emails 'coach1@wcs.com' to 'coach20@wcs.com'—replace if needed.
// Pushback: Change emails to real ones; this is placeholder to avoid dups.
// Output: Logs email/password pairs—copy and email securely, then delete.
// Do not run multiple times without cleanup, or dups may occur.

require("dotenv").config({ path: ".env.local" }); // Load .env.local for keys
const { createClient } = require("@supabase/supabase-js");
const crypto = require("crypto");

// Config from env—ensure SUPABASE_SERVICE_ROLE_KEY is set (god-mode for creates).
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
console.log("Env loaded:", { supabaseUrl, serviceKey });

if (!supabaseUrl || !serviceKey) {
  console.error(
    "Missing env vars: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY"
  );
  process.exit(1);
}

// Create admin client with service role (bypasses RLS for inserts).
const supabaseAdmin = createClient(supabaseUrl, serviceKey);

// Generate unique 12-char password (alphanum + symbols).
function generatePassword(length = 12) {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=";
  return Array.from(crypto.randomBytes(length))
    .map((byte) => chars[byte % chars.length])
    .join("");
}

// Batch create function.
async function batchCreateCoaches() {
  const coaches = [];

  for (let i = 1; i <= 20; i++) {
    const email = `coach${i}@wcs.com`; // Placeholder—replace with real emails.
    const password = generatePassword();

    coaches.push({ email, password });
  }

  try {
    // Batch create auth.users (set password directly with service role).
    const authPromises = coaches.map(async ({ email, password }) => {
      const { data: user, error } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // Skip confirmation for temps.
      });

      if (error) throw error;

      return { id: user.user.id, email };
    });

    const authResults = await Promise.all(authPromises);

    // Batch insert public.users with id from auth, role='coach', password_reset=true.
    const usersData = authResults.map(({ id, email }) => ({
      id,
      email,
      role: "coach",
      password_reset: true,
      created_at: new Date().toISOString(),
    }));

    const { error: insertError } = await supabaseAdmin
      .from("users")
      .insert(usersData);

    if (insertError) throw insertError;

    console.log(
      "Batch create success! Email/password pairs (send securely to coaches):"
    );
    coaches.forEach(({ email, password }, index) => {
      console.log(`${index + 1}. Email: ${email}, Temp Password: ${password}`);
    });
  } catch (error) {
    console.error("Batch create error:", error.message);
    // Debug steps if error: Check Supabase logs/dashboard for details, verify keys, ensure users table schema matches.
    process.exit(1);
  }
}

// Run the batch.
batchCreateCoaches();
