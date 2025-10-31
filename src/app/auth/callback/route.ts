import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { devLog, devError } from "@/lib/security";

export async function GET(request: NextRequest) {
  try {
    const requestUrl = new URL(request.url);
    const token_hash = requestUrl.searchParams.get("token_hash");
    const type = requestUrl.searchParams.get("type");
    const player = requestUrl.searchParams.get("player");
    
    devLog("Auth callback received", { token_hash: !!token_hash, type, player });
    
    // Supabase automatically handles email confirmation via the confirmation link
    // When the user clicks the link in the email, Supabase verifies and signs them in
    // We just need to handle the redirect to the registration success page
    
    // Extract player name from URL params if provided, or use default
    const playerName = player || "your player";
    
    // Redirect to registration success page
    const redirectUrl = new URL("/registration-success", requestUrl.origin);
    if (player) {
      redirectUrl.searchParams.set("player", player);
    }
    
    devLog("Redirecting to registration success", { url: redirectUrl.toString() });
    
    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    devError("Auth callback error", error);
    // On error, redirect to registration page
    const requestUrl = new URL(request.url);
    return NextResponse.redirect(
      new URL("/register?error=confirmation_failed", requestUrl.origin)
    );
  }
}
