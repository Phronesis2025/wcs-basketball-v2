import { NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { devLog, devError } from "@/lib/security";
import { sendEmail } from "@/lib/email";
import {
  getAdminPaymentConfirmationEmail,
  getPaymentConfirmationEmail,
} from "@/lib/emailTemplates";
import { fetchTeamDataForEmail } from "@/lib/emailHelpers";
import { generateInvoicePDF } from "@/lib/pdf/invoice";
import { fetchTeamById } from "@/lib/actions";

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const ADMIN_NOTIFICATIONS_TO = (process.env.ADMIN_NOTIFICATIONS_TO || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

if (!STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set");
}

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20",
});

// Helper function to split full name into first and last name
function splitFullName(fullName?: string | null) {
  if (!fullName) {
    return { firstName: "", lastName: "" };
  }

  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 0) {
    return { firstName: "", lastName: "" };
  }
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: "" };
  }

  const firstName = parts.shift()!;
  const lastName = parts.join(" ");
  return { firstName, lastName };
}

// Generate invoice data for a single payment (scoped to this route)
async function generateSinglePaymentInvoiceData(data: {
  payment: {
    id: string;
    amount: number;
    payment_type: string;
    created_at: string;
  };
  player: {
    id: string;
    name: string;
    parent_email?: string | null;
    parent_id?: string | null;
  };
  parent?: {
    first_name?: string | null;
    last_name?: string | null;
    email?: string | null;
    address_line1?: string | null;
    address_line2?: string | null;
    city?: string | null;
    state?: string | null;
    zip?: string | null;
  } | null;
  teamName?: string;
  teamLogoUrl?: string | null;
  quarterlyFee?: number | null;
}) {
  const { payment, player, parent, teamName, teamLogoUrl, quarterlyFee } = data;
  const annualFee = Number(process.env.NEXT_PUBLIC_ANNUAL_FEE_USD || 360);
  const monthlyFee = 30;
  const quarterlyFeeAmount = quarterlyFee || 90;

  // Format parent address
  const parentAddressParts: string[] = [];
  if (parent?.address_line1) parentAddressParts.push(parent.address_line1);
  if (parent?.address_line2) parentAddressParts.push(parent.address_line2);
  if (parent?.city || parent?.state || parent?.zip) {
    parentAddressParts.push(
      [parent?.city, parent?.state, parent?.zip].filter(Boolean).join(", ")
    );
  }
  const parentAddress = parentAddressParts.join(", ") || "";

  // Format invoice date and number
  const invoiceDate = new Date().toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  });
  const invoiceNumber = payment.id.toString().slice(0, 8);

  // Format the single payment item
  const paymentDate = new Date(payment.created_at);
  const paymentType = (payment.payment_type || "annual").toLowerCase();
  const isAnnual = paymentType === "annual";
  const isMonthly = paymentType === "monthly";
  const isQuarterly = paymentType === "quarterly";

  // Format description: "Annual/Monthly/Quarterly - Year/Month" (player name goes in Player column)
  const year = paymentDate.getFullYear();
  const month = paymentDate.toLocaleDateString("en-US", { month: "long" });
  let typeLabel = "Annual";
  let periodLabel = year.toString();
  if (isMonthly) {
    typeLabel = "Monthly";
    periodLabel = `${month} ${year}`;
  } else if (isQuarterly) {
    typeLabel = "Quarterly";
    periodLabel = `${month} ${year}`;
  }
  const description = `${typeLabel} - ${periodLabel}`;

  // Price: show Annual, Monthly, or Quarterly amount with label
  let priceAmount = annualFee;
  let priceLabel = `Annual ($${annualFee.toFixed(2)})`;
  if (isMonthly) {
    priceAmount = monthlyFee;
    priceLabel = `Monthly ($${monthlyFee.toFixed(2)})`;
  } else if (isQuarterly) {
    priceAmount = quarterlyFeeAmount;
    priceLabel = `Quarterly ($${quarterlyFeeAmount.toFixed(2)})`;
  }

  // Qty: 12 for annual, 1 for monthly/quarterly
  const quantity = isAnnual ? 12 : 1;

  // Amount: how much was actually paid
  const amountPaid = Number(payment.amount) || 0;

  const invoiceItem = {
    date: paymentDate.toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    }),
    playerName: player.name || "Player",
    description,
    priceLabel,
    priceAmount,
    quantity,
    amountPaid,
  };

  // For a single payment invoice, subtotal equals the amount paid
  const subtotal = amountPaid;
  // Total is the annual fee (the full amount due for the year)
  const totalAmount = annualFee;
  // Remaining is the difference
  const remaining = Math.max(annualFee - amountPaid, 0);
  const isPaidInFull = amountPaid >= annualFee && amountPaid > 0;

  return {
    invoiceDate,
    invoiceNumber,
    parentName: parent
      ? `${parent.first_name || ""} ${parent.last_name || ""}`.trim() || "N/A"
      : "N/A",
    parentAddress: parentAddress || "N/A",
    playerName: player.name || "—",
    teamName: teamName || "Not Assigned Yet",
    teamLogoUrl: teamLogoUrl || null,
    email: player.parent_email || parent?.email || "—",
    items: [invoiceItem],
    subtotal,
    totalAmount,
    remaining,
    isPaidInFull,
  };
}

// Helper to notify admins using BCC (maintains privacy)
// If only one admin: sends directly to that email
// If multiple admins: sends to first email, BCC to others
async function notifyAdmins(
  subject: string,
  html: string,
  options?: { bcc?: string[] }
) {
  if (ADMIN_NOTIFICATIONS_TO.length === 0) return;
  try {
    const firstAdmin = ADMIN_NOTIFICATIONS_TO[0];
    const otherAdmins =
      ADMIN_NOTIFICATIONS_TO.length > 1
        ? ADMIN_NOTIFICATIONS_TO.slice(1)
        : undefined;

    // Merge any additional BCC from options
    const bcc = options?.bcc
      ? [...(otherAdmins || []), ...options.bcc]
      : otherAdmins;

    await sendEmail(firstAdmin, subject, html, {
      bcc: bcc && bcc.length > 0 ? bcc : undefined,
    });

    devLog("verify-session: admin notification sent", {
      to: firstAdmin,
      bcc: bcc,
      totalAdmins: ADMIN_NOTIFICATIONS_TO.length,
    });
  } catch (err) {
    devError("verify-session: notifyAdmins failed", err);
  }
}

/**
 * Verify Stripe checkout session and update payment status
 * This allows localhost testing where webhooks don't reach the server
 *
 * GET /api/payment/verify-session?session_id=cs_test_xxx&player_id=xxx
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("session_id");
    const playerId = searchParams.get("player_id");

    if (!sessionId && !playerId) {
      return NextResponse.json(
        { error: "Either session_id or player_id is required" },
        { status: 400 }
      );
    }

    let paymentRow;
    let sessionIdToVerify: string;

    // If we have a player_id but no session_id, find the latest payment for that player
    if (playerId && !sessionId) {
      const { data: payment, error: payErr } = await supabaseAdmin!
        .from("payments")
        .select("id, player_id, stripe_payment_id, status, payment_type")
        .eq("player_id", playerId)
        .eq("status", "pending")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (payErr) {
        devError("verify-session: payment lookup error", payErr);
        return NextResponse.json({ error: "Database error" }, { status: 500 });
      }

      if (!payment || !payment.stripe_payment_id) {
        return NextResponse.json(
          { error: "No pending payment found for this player" },
          { status: 404 }
        );
      }

      paymentRow = payment;
      sessionIdToVerify = payment.stripe_payment_id;
    } else if (sessionId) {
      // Find payment by session_id
      const { data: payment, error: payErr } = await supabaseAdmin!
        .from("payments")
        .select("id, player_id, stripe_payment_id, status, payment_type")
        .eq("stripe_payment_id", sessionId)
        .maybeSingle();

      if (payErr) {
        devError("verify-session: payment lookup error", payErr);
        return NextResponse.json({ error: "Database error" }, { status: 500 });
      }

      if (!payment) {
        return NextResponse.json(
          { error: "No payment found with this session ID" },
          { status: 404 }
        );
      }

      paymentRow = payment;
      sessionIdToVerify = sessionId;
    } else {
      return NextResponse.json(
        { error: "Invalid parameters" },
        { status: 400 }
      );
    }

    // If already paid, return success
    if (paymentRow.status === "paid") {
      return NextResponse.json({
        success: true,
        already_updated: true,
        payment_id: paymentRow.id,
        player_id: paymentRow.player_id,
      });
    }

    // Verify session with Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionIdToVerify);

    devLog("verify-session: Stripe session retrieved", {
      sessionId: session.id,
      status: session.payment_status,
      amount: session.amount_total,
    });

    // Check if payment was successful
    if (session.payment_status === "paid" && session.status === "complete") {
      // Update payment status
      const amount = (session.amount_total ?? 0) / 100;

      const { error: payUpdErr } = await supabaseAdmin!
        .from("payments")
        .update({ status: "paid" })
        .eq("id", paymentRow.id);

      if (payUpdErr) {
        devError("verify-session: update payment failed", payUpdErr);
        return NextResponse.json(
          { error: "Failed to update payment status" },
          { status: 500 }
        );
      }

      // Update player status to active
      const { error: playerUpdErr } = await supabaseAdmin!
        .from("players")
        .update({ status: "active" })
        .eq("id", paymentRow.player_id);

      if (playerUpdErr) {
        devError("verify-session: update player failed", playerUpdErr);
        // Don't fail the whole request if player update fails
      }

      devLog("verify-session: Payment and player status updated", {
        payment_id: paymentRow.id,
        player_id: paymentRow.player_id,
      });

      // Send confirmation email to parent (Resend) with single-payment invoice PDF
      try {
        // Fetch player data
        const { data: player, error: playerErr } = await supabaseAdmin!
          .from("players")
          .select(
            "id, name, parent_email, parent_first_name, parent_last_name, parent_id, team_id, teams(name)"
          )
          .eq("id", paymentRow.player_id)
          .single();

        if (playerErr || !player) {
          devError("verify-session: failed to fetch player for parent email", {
            error: playerErr,
            playerId: paymentRow.player_id,
          });
        } else {
          // Resolve parentEmail, fallback to parents table if needed
          let parentEmail = player.parent_email as string | null;
          if (!parentEmail && player.parent_id) {
            const { data: parentData, error: parentLookupErr } =
              await supabaseAdmin!
                .from("parents")
                .select("email")
                .eq("id", player.parent_id)
                .single();
            if (!parentLookupErr && parentData?.email) {
              parentEmail = parentData.email;
              devLog(
                "verify-session: fetched parent_email from parents table",
                {
                  playerId: player.id,
                  parentId: player.parent_id,
                  email: parentEmail,
                }
              );
            } else if (parentLookupErr) {
              devError(
                "verify-session: parent email lookup failed",
                parentLookupErr
              );
            }
          }

          if (parentEmail) {
            // Optional team info
            let teamInfo: any = null;
            try {
              if (player.team_id) {
                teamInfo = await fetchTeamDataForEmail(player.team_id);
              }
            } catch (e) {
              devError("verify-session: fetchTeamDataForEmail error", e);
            }

            const { firstName: playerFirstName, lastName: playerLastName } =
              splitFullName(player.name);

            const parentEmailData = getPaymentConfirmationEmail({
              playerFirstName,
              playerLastName,
              parentFirstName: player.parent_first_name || undefined,
              parentLastName: player.parent_last_name || undefined,
              teamName: player.teams?.name || undefined,
              amount: amount,
              paymentType: paymentRow.payment_type || "annual",
              paymentDate: new Date().toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              }),
              teamInfo: teamInfo || undefined,
            });

            // Generate and attach invoice PDF (best-effort)
            let pdfAttachment: { filename: string; content: string } | null =
              null;
            try {
              // Fetch full parent data for invoice
              let parentDataForInvoice: any = null;
              if (player.parent_id) {
                const { data: parent } = await supabaseAdmin!
                  .from("parents")
                  .select("*")
                  .eq("id", player.parent_id)
                  .single();
                if (parent) parentDataForInvoice = parent;
              }

              // Fetch team data for invoice (name/logo)
              let teamName = "Not Assigned Yet";
              let teamLogoUrl: string | null = null;
              if (player.team_id) {
                try {
                  const team = await fetchTeamById(player.team_id);
                  if (team?.name) teamName = team.name;
                  if (team?.logo_url) teamLogoUrl = team.logo_url;
                } catch (err) {
                  devError(
                    "verify-session: failed to fetch team for invoice",
                    err
                  );
                }
              }

              // Quarterly fee lookup if needed
              let quarterlyFee: number | null = null;
              if (
                (paymentRow.payment_type || "").toLowerCase() === "quarterly"
              ) {
                try {
                  const PRICE_QUARTERLY = process.env.STRIPE_PRICE_QUARTERLY;
                  if (PRICE_QUARTERLY) {
                    const price = await stripe.prices.retrieve(PRICE_QUARTERLY);
                    quarterlyFee = (price.unit_amount || 0) / 100;
                  } else {
                    quarterlyFee = 90;
                  }
                } catch (err) {
                  devError(
                    "verify-session: failed to fetch quarterly price",
                    err
                  );
                  quarterlyFee = 90;
                }
              }

              // Get the updated payment record with created_at
              const { data: updatedPayment } = await supabaseAdmin!
                .from("payments")
                .select("id, amount, payment_type, created_at")
                .eq("id", paymentRow.id)
                .single();

              if (updatedPayment) {
                const invoiceData = await generateSinglePaymentInvoiceData({
                  payment: {
                    id: updatedPayment.id,
                    amount: updatedPayment.amount,
                    payment_type: updatedPayment.payment_type,
                    created_at: updatedPayment.created_at,
                  },
                  player: {
                    id: player.id,
                    name: player.name || "",
                    parent_email: player.parent_email,
                    parent_id: player.parent_id,
                  },
                  parent: parentDataForInvoice,
                  teamName,
                  teamLogoUrl,
                  quarterlyFee,
                });

                const pdfBytes = await generateInvoicePDF(invoiceData);
                const pdfBase64 = Buffer.from(pdfBytes).toString("base64");
                pdfAttachment = {
                  filename: `invoice-${invoiceData.invoiceNumber}.pdf`,
                  content: pdfBase64,
                };

                devLog("verify-session: invoice PDF generated", {
                  playerId: player.id,
                  invoiceNumber: invoiceData.invoiceNumber,
                });
              }
            } catch (pdfErr) {
              // Log error but continue to send email without PDF
              devError(
                "verify-session: failed to generate invoice PDF",
                pdfErr
              );
            }

            // Send parent email
            try {
              devLog(
                "verify-session: attempting to send parent confirmation email",
                {
                  to: parentEmail,
                  hasAttachment: !!pdfAttachment,
                  subject: parentEmailData.subject,
                }
              );

              await sendEmail(
                parentEmail,
                parentEmailData.subject,
                parentEmailData.html,
                {
                  attachments: pdfAttachment ? [pdfAttachment] : undefined,
                }
              );

              devLog(
                "verify-session: parent confirmation email sent successfully",
                {
                  to: parentEmail,
                  hasAttachment: !!pdfAttachment,
                  subject: parentEmailData.subject,
                }
              );
            } catch (emailErr) {
              devError("verify-session: failed to send parent email", {
                error: emailErr,
                to: parentEmail,
                subject: parentEmailData.subject,
                playerId: player.id,
                errorMessage:
                  emailErr instanceof Error
                    ? emailErr.message
                    : String(emailErr),
                errorStack:
                  emailErr instanceof Error ? emailErr.stack : undefined,
              });
              // Do not throw - do not block admin notifications
            }
          } else {
            devError(
              "verify-session: no parent email available for payment confirmation",
              { playerId: playerRow?.player_id || paymentRow.player_id }
            );
          }
        }
      } catch (parentFlowErr) {
        devError("verify-session: parent email flow error", parentFlowErr);
      }

      // Send admin payment confirmation email (same logic as webhook handler)
      if (ADMIN_NOTIFICATIONS_TO.length > 0) {
        try {
          // Fetch player data for admin email
          const { data: player, error: playerErr } = await supabaseAdmin!
            .from("players")
            .select(
              "id, name, parent_email, parent_first_name, parent_last_name, parent_id, team_id, teams(name)"
            )
            .eq("id", paymentRow.player_id)
            .single();

          if (!playerErr && player) {
            const { firstName: playerFirstName, lastName: playerLastName } =
              splitFullName(player.name);

            // Get parent name for admin email
            let parentName = "";
            try {
              if (player.parent_id) {
                const { data: parent } = await supabaseAdmin
                  .from("parents")
                  .select("first_name, last_name")
                  .eq("id", player.parent_id)
                  .single();
                if (parent) {
                  parentName =
                    `${parent.first_name || ""} ${
                      parent.last_name || ""
                    }`.trim() ||
                    player.parent_email ||
                    "Parent";
                }
              }
            } catch (e) {
              devError(
                "verify-session: error fetching parent name for admin email",
                e
              );
              parentName = player.parent_email || "Parent";
            }

            const adminEmailData = getAdminPaymentConfirmationEmail({
              playerFirstName,
              playerLastName,
              parentName: parentName || player.parent_email || "Parent",
              parentEmail: player.parent_email || "",
              teamName: player.teams?.name || undefined,
              amount: amount,
              paymentType: paymentRow.payment_type || "annual",
              paymentDate: new Date().toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              }),
              playerId: player.id,
              paymentId: paymentRow.id,
            });

            await notifyAdmins(adminEmailData.subject, adminEmailData.html);
            devLog("verify-session: admin payment confirmation email sent");
          } else if (playerErr) {
            devError(
              "verify-session: failed to fetch player for admin email",
              playerErr
            );
          }
        } catch (adminEmailErr) {
          devError(
            "verify-session: failed to send admin payment notification",
            adminEmailErr
          );
        }
      }

      return NextResponse.json({
        success: true,
        updated: true,
        payment_id: paymentRow.id,
        player_id: paymentRow.player_id,
        amount,
      });
    } else {
      // Payment not completed yet
      return NextResponse.json({
        success: false,
        payment_status: session.payment_status,
        session_status: session.status,
        message: "Payment not completed yet",
      });
    }
  } catch (error: any) {
    devError("verify-session: exception", error);
    return NextResponse.json(
      { error: "Server error verifying session", details: error.message },
      { status: 500 }
    );
  }
}
