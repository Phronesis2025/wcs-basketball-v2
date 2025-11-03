import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { devLog, devError } from "@/lib/security";
import { sendEmail } from "@/lib/email";
import {
  getPlayerApprovalEmail,
  getPlayerOnHoldEmail,
  getPlayerRejectedEmail,
} from "@/lib/emailTemplates";
import twilio from "twilio";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { player_id, team_id, status = "approved", rejection_reason, on_hold_reason } = body || {};
    
    if (!player_id) {
      return NextResponse.json(
        { error: "player_id required" },
        { status: 400 }
      );
    }

    // Get player info before update (include parent_id for email fix)
    const { data: player, error: fetchError } = await supabaseAdmin!
      .from("players")
      .select("id, name, parent_email, team_id, status, parent_id")
      .eq("id", player_id)
      .single();

    if (fetchError || !player) {
      devError("approve-player: Fetch error", fetchError);
      return NextResponse.json(
        { error: "Player not found" },
        { status: 404 }
      );
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
      devError("approve-player update error", error);
      return NextResponse.json(
        { error: "Failed to update player status" },
        { status: 500 }
      );
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

    // Fix: If parent_email is missing, fetch it from parents table
    if (!updated.parent_email && updated.parent_id) {
      const { data: parent } = await supabaseAdmin!
        .from("parents")
        .select("email")
        .eq("id", updated.parent_id)
        .single();
      
      if (parent?.email) {
        // Update player record with parent_email
        await supabaseAdmin!
          .from("players")
          .update({ parent_email: parent.email })
          .eq("id", player_id);
        
        updated.parent_email = parent.email;
        devLog("approve-player: Fixed missing parent_email", { 
          player_id, 
          parent_email: parent.email 
        });
      }
    }

    // Send appropriate email based on status
    if (updated.parent_email) {
      if (status === "approved") {
        // Generate a magic link that redirects to checkout page
        // This ensures the parent is authenticated when they click the link
        let baseUrl: string;
        if (process.env.VERCEL) {
          // Production on Vercel: prioritize NEXT_PUBLIC_BASE_URL, then VERCEL_URL
          if (process.env.NEXT_PUBLIC_BASE_URL) {
            const url = process.env.NEXT_PUBLIC_BASE_URL.trim();
            baseUrl = url.startsWith("http://") || url.startsWith("https://") 
              ? url.replace(/\/+$/, "") 
              : `https://${url.replace(/\/+$/, "")}`;
          } else if (process.env.VERCEL_URL) {
            baseUrl = `https://${process.env.VERCEL_URL}`;
          } else {
            baseUrl = "https://wcs-basketball-v2.vercel.app";
          }
        } else {
          // Development (local)
          baseUrl = 'http://localhost:3000';
        }
        const checkoutUrl = `${baseUrl}/checkout/${updated.id}`;
        
        // Generate magic link with redirect to checkout
        const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
          type: 'magiclink',
          email: updated.parent_email,
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
            updated.parent_email,
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
            updated.parent_email,
            approvalEmailData.subject,
            approvalEmailData.html
          );
          
          devLog("approve-player: Magic link generated and sent", {
            email: updated.parent_email,
            redirectTo: checkoutUrl,
          });
        }
      } else if (status === "on_hold") {
        const onHoldEmailData = getPlayerOnHoldEmail({
          playerName: updated.name,
          reason: on_hold_reason || "Pending review",
        });

        await sendEmail(
          updated.parent_email,
          onHoldEmailData.subject,
          onHoldEmailData.html
        );
      } else if (status === "rejected") {
        const rejectedEmailData = getPlayerRejectedEmail({
          playerName: updated.name,
          reason: updated.rejection_reason || "Not specified",
        });

        await sendEmail(
          updated.parent_email,
          rejectedEmailData.subject,
          rejectedEmailData.html
        );
      }
    }

    // Send SMS notification to admin
    if (
      process.env.TWILIO_SID &&
      process.env.TWILIO_AUTH_TOKEN &&
      process.env.TWILIO_PHONE &&
      process.env.ADMIN_PHONE
    ) {
      try {
        const twilioClient = twilio(
          process.env.TWILIO_SID,
          process.env.TWILIO_AUTH_TOKEN
        );

        const statusMessage =
          status === "approved"
            ? "approved"
            : status === "on_hold"
            ? `on hold: ${on_hold_reason || "pending review"}`
            : status === "rejected"
            ? `rejected: ${rejection_reason || "not specified"}`
            : status;

        await twilioClient.messages.create({
          body: `Player ${statusMessage}: ${updated.name} - ${teamName ? `Team: ${teamName}` : "Action needed"}`,
          from: process.env.TWILIO_PHONE,
          to: process.env.ADMIN_PHONE,
        });

        devLog("approve-player: SMS notification sent", {
          to: process.env.ADMIN_PHONE,
          status,
        });
      } catch (smsError) {
        devError("approve-player: SMS notification failed", smsError);
      }
    }

    devLog("approve-player OK", { player_id, status });
    return NextResponse.json({
      success: true,
      player: updated,
    });
  } catch (e) {
    devError("approve-player exception", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
