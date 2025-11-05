// Shared token store for coach password reset tokens
// In production, this should be replaced with Redis or a database table

interface TokenData {
  userId: string;
  email: string;
  expiresAt: number;
}

class CoachResetTokenStore {
  private tokens = new Map<string, TokenData>();

  constructor() {
    // Clean up expired tokens every 10 minutes
    setInterval(() => {
      this.cleanupExpiredTokens();
    }, 10 * 60 * 1000);
  }

  set(token: string, data: TokenData): void {
    this.tokens.set(token, data);
  }

  get(token: string): TokenData | undefined {
    const data = this.tokens.get(token);
    if (data && data.expiresAt < Date.now()) {
      this.tokens.delete(token);
      return undefined;
    }
    return data;
  }

  delete(token: string): void {
    this.tokens.delete(token);
  }

  private cleanupExpiredTokens(): void {
    const now = Date.now();
    for (const [token, data] of this.tokens.entries()) {
      if (data.expiresAt < now) {
        this.tokens.delete(token);
      }
    }
  }
}

// Export singleton instance
export const coachResetTokens = new CoachResetTokenStore();

