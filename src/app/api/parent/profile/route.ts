import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { devLog, devError } from "@/lib/security";
import { ParentProfile } from "@/types/supabase";

export async function GET(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    // Get email from query params or auth
    const email = request.nextUrl.searchParams.get("email");
    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    devLog("Fetching parent profile for:", email);

    // Get all children for this parent email
    const { data: children, error: childrenError } = await supabaseAdmin
      .from("players")
      .select("*")
      .eq("parent_email", email)
      .eq("is_deleted", false);

    if (childrenError) {
      devError("Error fetching children:", childrenError);
      return NextResponse.json(
        { error: "Failed to fetch children" },
        { status: 500 }
      );
    }

    if (!children || children.length === 0) {
      return NextResponse.json({
        parent: {
          email,
          phone: null,
          emergency_contact: null,
          emergency_phone: null,
        },
        children: [],
        payments: [],
        total_paid: 0,
        pending_payments: 0,
      });
    }

    // Get parent contact info from the first child (they should all be the same)
    const firstChild = children[0];
    const parentName =
      firstChild.parent_first_name || firstChild.parent_name
        ? `${firstChild.parent_first_name || ""} ${
            firstChild.parent_last_name || ""
          }`.trim() || firstChild.parent_name
        : email;

    const parentInfo = {
      email,
      name: parentName,
      phone: firstChild.parent_phone,
      emergency_contact: firstChild.emergency_contact,
      emergency_phone: firstChild.emergency_phone,
    };

    // Get all player IDs
    const playerIds = children.map((child: any) => child.id);

    // Get all payments for these players
    const { data: payments, error: paymentsError } = await supabaseAdmin
      .from("payments")
      .select("*")
      .in("player_id", playerIds)
      .order("created_at", { ascending: false });

    if (paymentsError) {
      devError("Error fetching payments:", paymentsError);
      return NextResponse.json(
        { error: "Failed to fetch payments" },
        { status: 500 }
      );
    }

    // Add player names to payments
    const paymentsWithNames = (payments || []).map((payment: any) => {
      const child = children.find((c: any) => c.id === payment.player_id);
      return {
        ...payment,
        player_name: child?.name || "Unknown",
      };
    });

    // Calculate totals
    const totalPaid = (payments || [])
      .filter((p: any) => p.status === "paid")
      .reduce((sum: number, p: any) => sum + (p.amount || 0), 0);

    const pendingCount = (payments || []).filter(
      (p: any) => p.status === "pending"
    ).length;

    const profile: ParentProfile = {
      parent: parentInfo,
      children,
      payments: paymentsWithNames,
      total_paid: totalPaid,
      pending_payments: pendingCount,
    };

    return NextResponse.json(profile);
  } catch (error) {
    devError("Parent profile API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
