import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { devLog, devError } from "@/lib/security";
import { sendEmail } from "@/lib/email";
import {
  getPlayerApprovalEmail,
  getPlayerOnHoldEmail,
  getPlayerRejectedEmail,
} from "@/lib/emailTemplates";
import { ValidationError, ApiError, DatabaseError, NotFoundError, handleApiError, formatSuccessResponse } from "@/lib/errorHandler";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { player_id, team_id, status = "approved", rejection_reason, on_hold_reason } = body || {};
    
    if (!player_id) {
      throw new ValidationError("player_id required");
    }

    // Get player info before update (include parent_id for email fix)
    const { data: player, error: fetchError } = await supabaseAdmin!
      .from("players")
      .select("id, name, parent_email, team_id, status, parent_id")
      .eq("id", player_id)
      .single();

    if (fetchError || !player) {
      throw new NotFoundError("Player not found");
    }

    // Prepare update object
    const updateData: any = { status };

    if (status === "approved" && team_id) {
      updateData.team_id = team_id;
    }

    if (status === "rejected") {
      updateData.rejection_reason = rejection_reason || "Not specified";
      updateData.rejected_at = new Date().toISOString();
    }

    if (status === "on_hold") {
      // Store reason in a note or extend schema if needed
      // For now, we'll include it in the email
    }

    // Update player status
    const { data: updated, error } = await supabaseAdmin!
      .from("players")
      .update(updateData)
      .eq("id", player_id)
      .select("id, name, parent_email, team_id, status, parent_id, rejection_reason, rejected_at")
      .single();

    if (error || !updated) {
      throw new DatabaseError("Failed to update player status", error);
    }

    // Get team name for emails/notifications
    let teamName = null;
    if (updated.team_id) {
      const { data: team } = await supabaseAdmin!
        .from("teams")
        .select("name")
        .eq("id", updated.team_id)
        .single();
      teamName = team?.name || null;
    }

    // Fix: Get the correct parent email address
    // Priority: 1) users.email (Gmail account), 2) parents.email, 3) players.parent_email
    let parentEmailAddress: string | null = null;
    
    if (updated.parent_id) {
      // Fetch parent record with user_id
      const { data: parent } = await supabaseAdmin!
        .from("parents")
        .select("email, user_id")
        .eq("id", updated.parent_id)
        .single();
      
      if (parent) {
        // If parent has user_id (Gmail sign-up), get email from users table (the actual Gmail account)
        if (parent.user_id) {
          const { data: userData } = await supabaseAdmin!.auth.admin.getUserById(parent.user_id);
          if (userData?.user?.email) {
            parentEmailAddress = userData.user.email;
            devLog("approve-player: Using Gmail account email from users table", {
              player_id,
              parent_email: parentEmailAddress,
              user_id: parent.user_id,
            });
          }
        }
        
        // Fallback to parents.email if user email not available
        if (!parentEmailAddress && parent.email) {
          parentEmailAddress = parent.email;
          devLog("approve-player: Using email from parents table", {
            player_id,
            parent_email: parentEmailAddress,
          });
        }
      }
    }
    
    // Fallback to players.parent_email if still not found
    if (!parentEmailAddress && updated.parent_email) {
      parentEmailAddress = updated.parent_email;
      devLog("approve-player: Using email from players table", {
        player_id,
        parent_email: parentEmailAddress,
      });
    }
    
    // Update player record with the correct parent_email if we found one
    if (parentEmailAddress && parentEmailAddress !== updated.parent_email) {
      await supabaseAdmin!
        .from("players")
        .update({ parent_email: parentEmailAddress })
        .eq("id", player_id);
      
      updated.parent_email = parentEmailAddress;
      devLog("approve-player: Updated player.parent_email", {
        player_id,
        parent_email: parentEmailAddress,
      });
    }

    // Send appropriate email based on status
    // Use the resolved parentEmailAddress (Gmail account email for Gmail sign-ups)
    const emailToUse = parentEmailAddress || updated.parent_email;
    
    if (emailToUse) {
      if (status === "approved") {
        // Generate a magic link that redirects to checkout page
        // This ensures the parent is authenticated when they click the link
        let baseUrl: string;
        if (process.env.VERCEL) {
          // Production on Vercel: Always use new custom domain
          baseUrl = "https://www.wcsbasketball.site";
        } else {
          // Development (local)
          baseUrl = 'http://localhost:3000';
        }
        const checkoutUrl = `${baseUrl}/checkout/${updated.id}`;
        
        // Generate magic link with redirect to checkout
        // Use the resolved email address (Gmail account for Gmail sign-ups)
        const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
          type: 'magiclink',
          email: emailToUse,
          options: {
            redirectTo: checkoutUrl,
          },
        });

        if (linkError || !linkData?.properties?.action_link) {
          devError("approve-player: Failed to generate magic link", linkError);
          // Fallback to direct checkout link (user will need to log in first)
          const payLink = checkoutUrl;
          const approvalEmailData = getPlayerApprovalEmail({
            playerName: updated.name,
            teamName: teamName || undefined,
            paymentLink: payLink,
          });

          await sendEmail(
            emailToUse,
            approvalEmailData.subject,
            approvalEmailData.html
          );
        } else {
          // Use the magic link that redirects to checkout
          const payLink = linkData.properties.action_link;
          
          const approvalEmailData = getPlayerApprovalEmail({
            playerName: updated.name,
            teamName: teamName || undefined,
            paymentLink: payLink,
          });

          await sendEmail(
            emailToUse,
            approvalEmailData.subject,
            approvalEmailData.html
          );
          
          devLog("approve-player: Magic link generated and sent", {
            email: emailToUse,
            redirectTo: checkoutUrl,
          });
        }
      } else if (status === "on_hold") {
        const onHoldEmailData = getPlayerOnHoldEmail({
          playerName: updated.name,
          reason: on_hold_reason || "Pending review",
        });

        await sendEmail(
          emailToUse,
          onHoldEmailData.subject,
          onHoldEmailData.html
        );
      } else if (status === "rejected") {
        const rejectedEmailData = getPlayerRejectedEmail({
          playerName: updated.name,
          reason: updated.rejection_reason || "Not specified",
        });

        await sendEmail(
          emailToUse,
          rejectedEmailData.subject,
          rejectedEmailData.html
        );
      }
    }


    devLog("approve-player OK", { player_id, status });
    return formatSuccessResponse({ player: updated });
  } catch (e) {
    return handleApiError(e);
  }
}
