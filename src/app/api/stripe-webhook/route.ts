import { NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { devLog, devError } from "@/lib/security";
import { sendEmail } from "@/lib/email";
import {
  getPaymentConfirmationEmail,
  getAdminPaymentConfirmationEmail,
} from "@/lib/emailTemplates";
import { fetchTeamDataForEmail } from "@/lib/emailHelpers";

export const dynamic = "force-dynamic";

// --- Env + Stripe setup ---
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY!;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!;
const ADMIN_NOTIFICATIONS_TO = (process.env.ADMIN_NOTIFICATIONS_TO || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: "2025-08-27.basil",
});

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

    devLog("webhook: admin notification sent", {
      to: firstAdmin,
      bcc: bcc,
      totalAdmins: ADMIN_NOTIFICATIONS_TO.length,
    });
  } catch (err) {
    devError("notifyAdmins failed", err);
  }
}

export async function POST(req: Request) {
  let event: Stripe.Event;

  // Stripe requires the raw body for signature verification
  const signature = req.headers.get("stripe-signature") as string;
  const rawBody = await req.text();

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    devError("stripe-webhook signature verify error", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      /**
       * One-time payments and initial subscription checkout
       */
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        devLog("webhook: checkout.session.completed received", {
          sessionId: session.id,
          amount: session.amount_total,
          customer: session.customer,
        });

        // Find our pending row by Checkout Session id
        const { data: paymentRow, error: payFetchErr } = await supabaseAdmin!
          .from("payments")
          .select("id, player_id, payment_type")
          .eq("stripe_payment_id", session.id)
          .single();

        if (payFetchErr) {
          devError("webhook: fetch pending payment failed", {
            error: payFetchErr,
            sessionId: session.id,
            code: payFetchErr.code,
            message: payFetchErr.message,
          });
          // Continue anyway - might be edge case where payment row doesn't exist yet
        }

        if (!paymentRow) {
          devLog("webhook: no matching pending payment row found", {
            sessionId: session.id,
            searchedFor: session.id,
          });
          break; // Exit early if no payment row
        }

        devLog("webhook: payment row found", {
          paymentId: paymentRow.id,
          playerId: paymentRow.player_id,
          paymentType: paymentRow.payment_type,
        });

        // Mark paid + activate player
        const amount = (session.amount_total ?? 0) / 100;

        const { error: payUpdErr } = await supabaseAdmin!
          .from("payments")
          .update({ status: "paid" })
          .eq("id", paymentRow.id);
        if (payUpdErr)
          devError("webhook: update payment paid failed", payUpdErr);

        const { error: playerUpdErr } = await supabaseAdmin!
          .from("players")
          .update({ status: "active" })
          .eq("id", paymentRow.player_id);
        if (playerUpdErr)
          devError("webhook: update player active failed", playerUpdErr);

        // Notify both parent and admins
        try {
          const { data: player, error: playerErr } = await supabaseAdmin!
            .from("players")
            .select(
              "id, name, parent_email, parent_first_name, parent_last_name, parent_id, team_id, teams(name)"
            )
            .eq("id", paymentRow.player_id)
            .single();

          if (playerErr) {
            devError("webhook: failed to fetch player", {
              error: playerErr,
              playerId: paymentRow.player_id,
              code: playerErr.code,
              message: playerErr.message,
            });
            break;
          }

          if (!player) {
            devError("webhook: player not found in database", {
              playerId: paymentRow.player_id,
            });
            break;
          }

          // If parent_email is missing, fetch it from the parent record
          let parentEmail = player.parent_email;
          if (!parentEmail && player.parent_id) {
            const { data: parentData, error: parentErr } = await supabaseAdmin!
              .from("parents")
              .select("email")
              .eq("id", player.parent_id)
              .single();
            
            if (!parentErr && parentData?.email) {
              parentEmail = parentData.email;
              devLog("webhook: fetched parent_email from parents table", {
                playerId: paymentRow.player_id,
                parentId: player.parent_id,
                email: parentEmail,
              });
            } else if (parentErr) {
              devError("webhook: failed to fetch parent email", parentErr);
            }
          }

          devLog("webhook: player data fetched", {
            playerId: paymentRow.player_id,
            playerName: player.name || "",
            hasEmail: !!parentEmail,
            hasTeam: !!player.team_id,
          });

          const { firstName: playerFirstName, lastName: playerLastName } =
            splitFullName(player.name);

          if (parentEmail) {
            // Optionally fetch team info for the next 2 weeks
            let teamInfo = null as any;
            try {
              if (player.team_id) {
                teamInfo = await fetchTeamDataForEmail(player.team_id);
              }
            } catch (e) {
              devError("webhook: fetchTeamDataForEmail error", e);
            }

            const parentEmailData = getPaymentConfirmationEmail({
              playerFirstName,
              playerLastName,
              parentFirstName: player.parent_first_name || undefined,
              parentLastName: player.parent_last_name || undefined,
              teamName: player.teams?.name || undefined,
              amount: amount,
              paymentType: paymentRow.payment_type,
              paymentDate: new Date().toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              }),
              teamInfo: teamInfo || undefined,
            });

            try {
              await sendEmail(
                parentEmail,
                parentEmailData.subject,
                parentEmailData.html
              );

              devLog("webhook: parent confirmation email sent", {
                to: parentEmail,
              });
            } catch (emailErr) {
              devError("webhook: failed to send parent email", emailErr);
            }
          } else {
            devError("webhook: no parent email available for payment confirmation", {
              playerId: paymentRow.player_id,
              parentId: player.parent_id,
            });
          }

          // Send admin payment confirmation email
          if (ADMIN_NOTIFICATIONS_TO.length > 0) {
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
                  parentName = `${parent.first_name || ""} ${parent.last_name || ""}`.trim() || player.parent_email || "Parent";
                }
              }
            } catch (e) {
              devError("webhook: error fetching parent name for admin email", e);
              parentName = player.parent_email || "Parent";
            }

            const adminEmailData = getAdminPaymentConfirmationEmail({
              playerFirstName,
              playerLastName,
              parentName: parentName || player.parent_email || "Parent",
              parentEmail: player.parent_email || "",
              teamName: player.teams?.name || undefined,
              amount: amount,
              paymentType: paymentRow.payment_type,
              paymentDate: new Date().toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              }),
              playerId: player.id,
              paymentId: paymentRow.id,
            });

            try {
              await notifyAdmins(
                adminEmailData.subject,
                adminEmailData.html
              );
              devLog("webhook: admin payment confirmation email sent");
            } catch (adminEmailErr) {
              devError("webhook: failed to send admin payment notification", adminEmailErr);
            }
          }
        } catch (e) {
          devError("webhook: notification error", e);
        }

        break;
      }

      /**
       * Recurring subscription invoices (monthly renewals)
       */
      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        const amount = (invoice.amount_paid ?? 0) / 100;
        const customerId = (invoice.customer as string) || null;

        if (!customerId) break;

        if (invoice.billing_reason === "subscription_create") {
          devLog("webhook: skipping invoice.payment_succeeded for subscription create", {
            invoiceId: invoice.id,
          });
          break;
        }

        // Find the player by stored stripe_customer_id
        const { data: player, error: findPlayerErr } = await supabaseAdmin!
          .from("players")
          .select(
            "id, name, parent_email, parent_first_name, parent_last_name, parent_id, team_id"
          )
          .eq("stripe_customer_id", customerId)
          .single();

        if (findPlayerErr || !player) {
          devError("webhook: could not find player for invoice.customer", {
            findPlayerErr,
            customerId,
          });
          break;
        }

        // If parent_email is missing, fetch it from the parent record
        let parentEmail = player.parent_email;
        if (!parentEmail && player.parent_id) {
          const { data: parentData, error: parentErr } = await supabaseAdmin!
            .from("parents")
            .select("email")
            .eq("id", player.parent_id)
            .single();
          
          if (!parentErr && parentData?.email) {
            parentEmail = parentData.email;
            devLog("webhook: fetched parent_email from parents table (renewal)", {
              playerId: player.id,
              parentId: player.parent_id,
              email: parentEmail,
            });
          } else if (parentErr) {
            devError("webhook: failed to fetch parent email (renewal)", parentErr);
          }
        }

        // Insert a new paid payment record for the renewal
        const { error: insErr } = await supabaseAdmin!.from("payments").insert([
          {
            player_id: player.id,
            stripe_payment_id: invoice.id, // store invoice id
            amount,
            payment_type: "monthly",
            status: "paid",
          },
        ]);
        if (insErr) devError("webhook: insert renewal payment failed", insErr);

        // Ensure player remains active
        const { error: updErr } = await supabaseAdmin!
          .from("players")
          .update({ status: "active" })
          .eq("id", player.id);
        if (updErr)
          devError("webhook: set player active on renewal failed", updErr);

        // Get team info for parent email
        const { data: playerWithTeam, error: playerTeamErr } =
          await supabaseAdmin!
            .from("players")
            .select("team_id, teams(name), parent_first_name, parent_last_name")
            .eq("id", player.id)
            .single();

        if (playerTeamErr) {
          devError("webhook: player team lookup failed", {
            error: playerTeamErr,
            playerId: player.id,
          });
        }

        const { firstName: renewalFirstName, lastName: renewalLastName } =
          splitFullName(player.name);

        // Send confirmation email to parent
        if (parentEmail) {
          // Optionally fetch team info
          let teamInfo = null as any;
          try {
            if (playerWithTeam?.team_id) {
              teamInfo = await fetchTeamDataForEmail(playerWithTeam.team_id);
            }
          } catch (e) {
            devError("webhook: fetchTeamDataForEmail (renewal) error", e);
          }

          try {
            const parentEmailData = getPaymentConfirmationEmail({
              playerFirstName: renewalFirstName,
              playerLastName: renewalLastName,
              parentFirstName:
                playerWithTeam?.parent_first_name ||
                player.parent_first_name ||
                undefined,
              parentLastName:
                playerWithTeam?.parent_last_name ||
                player.parent_last_name ||
                undefined,
              teamName: playerWithTeam?.teams?.name || undefined,
              amount: amount,
              paymentType: "monthly",
              paymentDate: new Date().toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              }),
              teamInfo: teamInfo || undefined,
            });

            await sendEmail(
              parentEmail,
              parentEmailData.subject,
              parentEmailData.html
            );

            devLog("webhook: parent subscription renewal email sent", {
              to: parentEmail,
            });
          } catch (emailErr) {
            devError("webhook: parent renewal email error", emailErr);
          }
        } else {
          devError("webhook: no parent email available for payment confirmation (renewal)", {
            playerId: player.id,
            parentId: player.parent_id,
          });
        }

        // Send admin payment confirmation email for renewal
        if (ADMIN_NOTIFICATIONS_TO.length > 0) {
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
                parentName = `${parent.first_name || ""} ${parent.last_name || ""}`.trim() || parentEmail || "Parent";
              }
            }
          } catch (e) {
            devError("webhook: error fetching parent name for admin email (renewal)", e);
            parentName = parentEmail || "Parent";
          }

          const adminEmailData = getAdminPaymentConfirmationEmail({
            playerFirstName: renewalFirstName,
            playerLastName: renewalLastName,
            parentName: parentName || parentEmail || "Parent",
            parentEmail: parentEmail || "",
            teamName: playerWithTeam?.teams?.name || undefined,
            amount: amount,
            paymentType: "monthly",
            paymentDate: new Date().toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            }),
            playerId: player.id,
            paymentId: invoice.id,
          });

          try {
            await notifyAdmins(
              adminEmailData.subject,
              adminEmailData.html
            );
            devLog("webhook: admin subscription renewal email sent");
          } catch (adminEmailErr) {
            devError("webhook: failed to send admin renewal notification", adminEmailErr);
          }
        }

        break;
      }

      // You can add more cases as needed (payment_failed, etc.)
      default: {
        // no-op
        break;
      }
    }

    devLog("stripe-webhook handled", { type: event.type });
    return NextResponse.json({ received: true });
  } catch (e: any) {
    devError("stripe-webhook handler error", e);
    return NextResponse.json(
      { error: "Webhook handler error" },
      { status: 500 }
    );
  }
}
