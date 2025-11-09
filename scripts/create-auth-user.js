// Script to create auth user for damon.boyer@wcs.com
// Run with: node scripts/create-auth-user.js

require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing required environment variables");
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
  },
});

async function createAuthUser() {
  try {
    const email = "damon.boyer@wcs.com";
    const password = "WCS2025sports!";

    // Check if user exists in users table (case-insensitive)
    const { data: allUsers, error: usersError } = await supabaseAdmin
      .from("users")
      .select("id, email, role");

    if (usersError || !allUsers) {
      console.error("Failed to query users table:", usersError);
      process.exit(1);
    }

    const userData = allUsers.find(
      (u) => u.email?.toLowerCase() === email.toLowerCase()
    );

    if (!userData) {
      console.error("User not found in users table with email:", email);
      console.log("Available users:", allUsers.map(u => u.email));
      process.exit(1);
    }

    console.log("Found user in users table:", userData);

    // Check if auth user already exists
    const { data: existingAuthUser } = await supabaseAdmin.auth.admin.getUserById(userData.id);
    
    if (existingAuthUser?.user) {
      console.log("Auth user already exists, updating password...");
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        userData.id,
        { password }
      );

      if (updateError) {
        console.error("Failed to update password:", updateError);
        process.exit(1);
      }

      console.log("✅ Password updated successfully!");
      return;
    }

    // Check by email
    const { data: usersByEmail } = await supabaseAdmin.auth.admin.listUsers();
    const userByEmail = usersByEmail?.users?.find(
      (u) => u.email?.toLowerCase() === email.toLowerCase()
    );

    if (userByEmail) {
      console.log("Found auth user by email, updating password...");
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        userByEmail.id,
        { password }
      );

      if (updateError) {
        console.error("Failed to update password:", updateError);
        process.exit(1);
      }

      // Update users table with correct ID
      await supabaseAdmin
        .from("users")
        .update({ id: userByEmail.id })
        .eq("id", userData.id);

      console.log("✅ Password updated and users table synced!");
      return;
    }

    // Create new auth user
    console.log("Creating new auth user...");
    const { data: newAuthUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      id: userData.id, // Use the same ID from users table
      email: userData.email,
      password: password,
      email_confirm: true,
    });

    if (createError || !newAuthUser?.user) {
      console.error("Failed to create auth user:", createError);
      process.exit(1);
    }

    // Update password_reset flag
    await supabaseAdmin
      .from("users")
      .update({ password_reset: false })
      .eq("id", userData.id);

    console.log("✅ Auth user created successfully!");
    console.log("User ID:", newAuthUser.user.id);
    console.log("Email:", newAuthUser.user.email);
    console.log("Password set to: WCS2025sports!");
  } catch (error) {
    console.error("Unexpected error:", error);
    process.exit(1);
  }
}

createAuthUser();

