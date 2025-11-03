// tests/e2e/helpers/database.ts
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client using service role key for admin operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn(
    "[Database] Warning: Supabase credentials not found. Database verification will be skipped."
  );
}

const supabaseAdmin = supabaseUrl && supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

export interface PlayerRecord {
  id: string;
  name: string;
  status: string;
  team_id: string | null;
  parent_id: string | null;
  date_of_birth: string | null;
  grade: string | null;
  gender: string | null;
  created_at: string;
}

export interface ParentRecord {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  user_id: string | null;
  created_at: string;
}

export interface PendingRegistrationRecord {
  id: string;
  email: string;
  parent_first_name: string;
  parent_last_name: string;
  player_first_name: string;
  player_last_name: string;
  player_birthdate: string;
  player_grade: string | null;
  player_gender: string;
  merged_at: string | null;
  created_at: string;
}

export interface PaymentRecord {
  id: string;
  player_id: string;
  stripe_payment_id: string | null;
  amount: number;
  payment_type: string | null;
  status: string | null;
  created_at: string;
}

/**
 * Verify player exists in database with expected data
 */
export async function verifyPlayerInDatabase(
  playerEmail: string,
  playerFirstName: string,
  playerLastName: string
): Promise<PlayerRecord | null> {
  if (!supabaseAdmin) {
    console.warn("[Database] Supabase admin client not available, skipping verification");
    return null;
  }

  console.log(`[Database] Verifying player: ${playerFirstName} ${playerLastName}`);

  try {
    // First, find the parent by email
    const { data: parentData, error: parentError } = await supabaseAdmin
      .from("parents")
      .select("id, user_id")
      .eq("email", playerEmail)
      .single();

    if (parentError || !parentData) {
      console.warn(`[Database] Parent not found for email: ${playerEmail}`);
      return null;
    }

    // Find player by parent_id and name
    const { data: playerData, error: playerError } = await supabaseAdmin
      .from("players")
      .select("*")
      .eq("parent_id", parentData.id)
      .ilike("name", `%${playerFirstName}%${playerLastName}%`)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (playerError) {
      console.error(`[Database] Error querying player:`, playerError);
      return null;
    }

    if (playerData) {
      console.log(`[Database] ✓ Player found: ${playerData.id} (${playerData.name})`);
      return playerData as PlayerRecord;
    }

    console.warn(`[Database] Player not found for: ${playerFirstName} ${playerLastName}`);
    return null;
  } catch (error: any) {
    console.error(`[Database] Exception verifying player:`, error.message);
    return null;
  }
}

/**
 * Verify pending registration exists
 */
export async function verifyPendingRegistration(
  email: string
): Promise<PendingRegistrationRecord | null> {
  if (!supabaseAdmin) {
    console.warn("[Database] Supabase admin client not available, skipping verification");
    return null;
  }

  console.log(`[Database] Verifying pending registration for: ${email}`);

  try {
    const { data, error } = await supabaseAdmin
      .from("pending_registrations")
      .select("*")
      .eq("email", email)
      .is("merged_at", null) // Not yet merged
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error(`[Database] Error querying pending_registrations:`, error);
      return null;
    }

    if (data) {
      console.log(`[Database] ✓ Pending registration found: ${data.id}`);
      return data as PendingRegistrationRecord;
    }

    console.warn(`[Database] Pending registration not found for: ${email}`);
    return null;
  } catch (error: any) {
    console.error(`[Database] Exception verifying pending registration:`, error.message);
    return null;
  }
}

/**
 * Verify parent exists in database
 */
export async function verifyParentInDatabase(
  email: string
): Promise<ParentRecord | null> {
  if (!supabaseAdmin) {
    console.warn("[Database] Supabase admin client not available, skipping verification");
    return null;
  }

  console.log(`[Database] Verifying parent: ${email}`);

  try {
    const { data, error } = await supabaseAdmin
      .from("parents")
      .select("*")
      .eq("email", email)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // Not found
        console.warn(`[Database] Parent not found: ${email}`);
        return null;
      }
      console.error(`[Database] Error querying parent:`, error);
      return null;
    }

    if (data) {
      console.log(`[Database] ✓ Parent found: ${data.id} (${data.email})`);
      return data as ParentRecord;
    }

    return null;
  } catch (error: any) {
    console.error(`[Database] Exception verifying parent:`, error.message);
    return null;
  }
}

/**
 * Verify payment exists in database
 */
export async function verifyPaymentInDatabase(
  playerId: string,
  expectedAmount: number
): Promise<PaymentRecord | null> {
  if (!supabaseAdmin) {
    console.warn("[Database] Supabase admin client not available, skipping verification");
    return null;
  }

  console.log(`[Database] Verifying payment for player: ${playerId}, amount: $${expectedAmount}`);

  try {
    const { data, error } = await supabaseAdmin
      .from("payments")
      .select("*")
      .eq("player_id", playerId)
      .eq("amount", expectedAmount.toString())
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error(`[Database] Error querying payment:`, error);
      return null;
    }

    if (data) {
      console.log(`[Database] ✓ Payment found: ${data.id} (Status: ${data.status})`);
      return data as PaymentRecord;
    }

    console.warn(`[Database] Payment not found for player: ${playerId}`);
    return null;
  } catch (error: any) {
    console.error(`[Database] Exception verifying payment:`, error.message);
    return null;
  }
}

/**
 * Get player by ID
 */
export async function getPlayerById(playerId: string): Promise<PlayerRecord | null> {
  if (!supabaseAdmin) {
    return null;
  }

  try {
    const { data, error } = await supabaseAdmin
      .from("players")
      .select("*")
      .eq("id", playerId)
      .single();

    if (error || !data) {
      return null;
    }

    return data as PlayerRecord;
  } catch {
    return null;
  }
}

/**
 * Wait for database condition to be true (polling)
 */
export async function waitForDatabaseCondition(
  condition: () => Promise<boolean>,
  timeout = 10000,
  interval = 1000
): Promise<boolean> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    if (await condition()) {
      return true;
    }
    await new Promise((resolve) => setTimeout(resolve, interval));
  }

  return false;
}

