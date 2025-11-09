// Database-backed token store for coach password reset tokens
// Uses Supabase password_reset_tokens table for persistence across serverless instances

import { supabaseAdmin } from "./supabaseClient";
import { devLog, devError } from "./security";

interface TokenData {
  userId: string;
  email: string;
  expiresAt: number;
}

class CoachResetTokenStore {
  /**
   * Store a reset token in the database
   */
  async set(token: string, data: TokenData): Promise<void> {
    try {
      if (!supabaseAdmin) {
        devError("Supabase admin client not available for token storage");
        throw new Error("Server configuration error");
      }

      const { error } = await supabaseAdmin
        .from("password_reset_tokens")
        .insert({
          token,
          user_id: data.userId,
          email: data.email,
          expires_at: new Date(data.expiresAt).toISOString(),
          used: false,
        });

      if (error) {
        devError("Failed to store reset token:", error);
        throw error;
      }

      devLog("Reset token stored successfully for user:", data.userId);
    } catch (err) {
      devError("Error storing reset token:", err);
      throw err;
    }
  }

  /**
   * Retrieve token data from the database
   */
  async get(token: string): Promise<TokenData | undefined> {
    try {
      if (!supabaseAdmin) {
        devError("Supabase admin client not available for token retrieval");
        return undefined;
      }

      const { data, error } = await supabaseAdmin
        .from("password_reset_tokens")
        .select("token, user_id, email, expires_at, used")
        .eq("token", token)
        .eq("used", false)
        .maybeSingle();

      if (error) {
        devError("Failed to retrieve reset token:", error);
        return undefined;
      }

      if (!data) {
        devLog("Token not found or already used");
        return undefined;
      }

      // Check if token is expired
      const expiresAt = new Date(data.expires_at).getTime();
      if (expiresAt < Date.now()) {
        devLog("Token expired, marking as used");
        // Mark as used (cleanup)
        await this.delete(token);
        return undefined;
      }

      return {
        userId: data.user_id,
        email: data.email,
        expiresAt: expiresAt,
      };
    } catch (err) {
      devError("Error retrieving reset token:", err);
      return undefined;
    }
  }

  /**
   * Mark token as used (delete from database)
   */
  async delete(token: string): Promise<void> {
    try {
      if (!supabaseAdmin) {
        devError("Supabase admin client not available for token deletion");
        return;
      }

      const { error } = await supabaseAdmin
        .from("password_reset_tokens")
        .update({ used: true })
        .eq("token", token);

      if (error) {
        devError("Failed to mark token as used:", error);
        // Don't throw, just log the error
      } else {
        devLog("Token marked as used:", token.substring(0, 10) + "...");
      }
    } catch (err) {
      devError("Error deleting reset token:", err);
      // Don't throw, just log the error
    }
  }

  /**
   * Clean up expired tokens (can be called periodically)
   */
  async cleanupExpiredTokens(): Promise<void> {
    try {
      if (!supabaseAdmin) {
        return;
      }

      const now = new Date().toISOString();
      const { error } = await supabaseAdmin
        .from("password_reset_tokens")
        .update({ used: true })
        .lt("expires_at", now)
        .eq("used", false);

      if (error) {
        devError("Failed to cleanup expired tokens:", error);
      } else {
        devLog("Cleaned up expired tokens");
      }
    } catch (err) {
      devError("Error cleaning up expired tokens:", err);
    }
  }
}

// Export singleton instance
export const coachResetTokens = new CoachResetTokenStore();

