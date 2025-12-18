// Database-backed token store for checkout tokens
// Uses Supabase checkout_tokens table for long-lived checkout links (30-day expiration)
// Tokens are reusable until expiration

import { supabaseAdmin } from "./supabaseClient";
import { devLog, devError } from "./security";
import crypto from "crypto";

interface CheckoutTokenData {
  playerId: string;
  parentEmail: string;
  expiresAt: number;
}

class CheckoutTokenStore {
  /**
   * Generate a secure random token
   */
  generateToken(): string {
    return crypto.randomBytes(32).toString("hex");
  }

  /**
   * Create and store a checkout token with 30-day expiration
   */
  async createCheckoutToken(
    playerId: string,
    parentEmail: string
  ): Promise<string> {
    try {
      if (!supabaseAdmin) {
        devError("Supabase admin client not available for token storage");
        throw new Error("Server configuration error");
      }

      // Generate unique token
      let token: string;
      let isUnique = false;
      let attempts = 0;
      const maxAttempts = 5;

      // Ensure token is unique (retry if collision)
      while (!isUnique && attempts < maxAttempts) {
        token = this.generateToken();
        const { data: existing } = await supabaseAdmin
          .from("checkout_tokens")
          .select("token")
          .eq("token", token)
          .maybeSingle();

        if (!existing) {
          isUnique = true;
        } else {
          attempts++;
          devLog(`Token collision detected, generating new token (attempt ${attempts})`);
        }
      }

      if (!isUnique) {
        throw new Error("Failed to generate unique token after multiple attempts");
      }

      // Calculate expiration (30 days from now)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      // Store token in database
      const { error } = await supabaseAdmin.from("checkout_tokens").insert({
        token: token!,
        player_id: playerId,
        parent_email: parentEmail,
        expires_at: expiresAt.toISOString(),
      });

      if (error) {
        devError("Failed to store checkout token:", error);
        throw error;
      }

      devLog("Checkout token stored successfully", {
        playerId,
        parentEmail,
        expiresAt: expiresAt.toISOString(),
      });

      return token!;
    } catch (err) {
      devError("Error storing checkout token:", err);
      throw err;
    }
  }

  /**
   * Verify token validity and return token data
   */
  async verifyCheckoutToken(
    token: string
  ): Promise<CheckoutTokenData | undefined> {
    try {
      if (!supabaseAdmin) {
        devError("Supabase admin client not available for token retrieval");
        return undefined;
      }

      const { data, error } = await supabaseAdmin
        .from("checkout_tokens")
        .select("token, player_id, parent_email, expires_at")
        .eq("token", token)
        .maybeSingle();

      if (error) {
        devError("Failed to retrieve checkout token:", error);
        return undefined;
      }

      if (!data) {
        devLog("Checkout token not found");
        return undefined;
      }

      // Check if token is expired
      const expiresAt = new Date(data.expires_at).getTime();
      if (expiresAt < Date.now()) {
        devLog("Checkout token expired", {
          token: token.substring(0, 10) + "...",
          expiresAt: new Date(expiresAt).toISOString(),
        });
        return undefined;
      }

      return {
        playerId: data.player_id,
        parentEmail: data.parent_email,
        expiresAt: expiresAt,
      };
    } catch (err) {
      devError("Error retrieving checkout token:", err);
      return undefined;
    }
  }

  /**
   * Mark token as used (update used_at timestamp for tracking)
   * Note: Tokens remain valid after being marked as used (reusable until expiration)
   */
  async markTokenUsed(token: string): Promise<void> {
    try {
      if (!supabaseAdmin) {
        devError("Supabase admin client not available for token update");
        return;
      }

      // Only update if used_at is null (first use)
      const { error } = await supabaseAdmin
        .from("checkout_tokens")
        .update({ used_at: new Date().toISOString() })
        .eq("token", token)
        .is("used_at", null);

      if (error) {
        devError("Failed to mark checkout token as used:", error);
        // Don't throw, just log the error
      } else {
        devLog("Checkout token marked as used", {
          token: token.substring(0, 10) + "...",
        });
      }
    } catch (err) {
      devError("Error marking checkout token as used:", err);
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
        .from("checkout_tokens")
        .delete()
        .lt("expires_at", now);

      if (error) {
        devError("Failed to cleanup expired checkout tokens:", error);
      } else {
        devLog("Cleaned up expired checkout tokens");
      }
    } catch (err) {
      devError("Error cleaning up expired checkout tokens:", err);
    }
  }
}

// Export singleton instance
export const checkoutTokens = new CheckoutTokenStore();

