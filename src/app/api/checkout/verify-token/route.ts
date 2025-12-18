import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { devLog, devError } from "@/lib/security";
import { checkoutTokens } from "@/lib/checkoutTokens";

export async function GET(request: NextRequest) {
  try {
    const requestUrl = new URL(request.url);
    const token = requestUrl.searchParams.get("token");

    if (!token) {
      devError("verify-token: No token provided");
      return NextResponse.redirect(
        new URL("/parent/login?error=token_expired", requestUrl.origin)
      );
    }

    if (!supabaseAdmin) {
      devError("verify-token: Supabase admin client unavailable");
      return NextResponse.redirect(
        new URL("/parent/login?error=server_error", requestUrl.origin)
      );
    }

    // Verify token
    const tokenData = await checkoutTokens.verifyCheckoutToken(token);

    if (!tokenData) {
      devError("verify-token: Invalid or expired token", { token: token.substring(0, 10) + "..." });
      return NextResponse.redirect(
        new URL("/parent/login?error=token_expired", requestUrl.origin)
      );
    }

    const { playerId, parentEmail } = tokenData;

    devLog("verify-token: Token verified", {
      playerId,
      parentEmail,
    });

    // Find parent user in Supabase auth
    // Strategy: Try parents table first, then search auth users directly
    let parentUserId: string | null = null;
    let resolvedEmail = parentEmail;

    // First, try to find parent in parents table
    const { data: parentRecord, error: parentError } = await supabaseAdmin
      .from("parents")
      .select("user_id, email")
      .eq("email", parentEmail)
      .maybeSingle();

    if (!parentError && parentRecord?.user_id) {
      // Found parent record with user_id - use it
      parentUserId = parentRecord.user_id;
      devLog("verify-token: Found parent via parents table", {
        parentId: parentRecord.user_id,
        email: parentEmail,
      });

      // Get the actual auth email (might be Gmail account)
      const { data: userData } = await supabaseAdmin.auth.admin.getUserById(
        parentUserId
      );
      if (userData?.user?.email) {
        resolvedEmail = userData.user.email;
        devLog("verify-token: Resolved to auth email", {
          resolvedEmail,
          originalEmail: parentEmail,
        });
      }
    } else {
      // Not found in parents table, search auth users directly
      devLog("verify-token: Parent not found in parents table, searching auth users", {
        email: parentEmail,
      });

      const { data: authUsers, error: listError } =
        await supabaseAdmin.auth.admin.listUsers();

      if (!listError && authUsers?.users) {
        const matchingUser = authUsers.users.find(
          (u) => u.email?.toLowerCase() === parentEmail.toLowerCase()
        );

        if (matchingUser) {
          parentUserId = matchingUser.id;
          resolvedEmail = matchingUser.email || parentEmail;
          devLog("verify-token: Found parent via auth search", {
            userId: parentUserId,
            email: resolvedEmail,
          });
        }
      }
    }

    if (!parentUserId) {
      devError("verify-token: Parent account not found", {
        email: parentEmail,
        playerId,
      });
      return NextResponse.redirect(
        new URL("/parent/login?error=account_required", requestUrl.origin)
      );
    }

    // Determine base URL
    let baseUrl: string;
    if (process.env.VERCEL) {
      baseUrl = "https://www.wcsbasketball.site";
    } else {
      baseUrl = "http://localhost:3000";
    }

    const checkoutUrl = `${baseUrl}/checkout/${playerId}`;

    // Generate short-lived Supabase magic link
    const { data: linkData, error: linkError } =
      await supabaseAdmin.auth.admin.generateLink({
        type: "magiclink",
        email: resolvedEmail,
        options: {
          redirectTo: checkoutUrl,
        },
      });

    if (linkError || !linkData?.properties?.action_link) {
      devError("verify-token: Failed to generate magic link", linkError);
      // Fallback: redirect to checkout (user will need to log in manually)
      return NextResponse.redirect(new URL(checkoutUrl, requestUrl.origin));
    }

    // Mark token as used (for tracking - token remains valid)
    await checkoutTokens.markTokenUsed(token);

    devLog("verify-token: Magic link generated, redirecting", {
      playerId,
      parentEmail: resolvedEmail,
      checkoutUrl,
    });

    // Redirect to the generated magic link (which will establish session and redirect to checkout)
    return NextResponse.redirect(linkData.properties.action_link);
  } catch (error) {
    devError("verify-token: Unexpected error", error);
    const requestUrl = new URL(request.url);
    return NextResponse.redirect(
      new URL("/parent/login?error=server_error", requestUrl.origin)
    );
  }
}

