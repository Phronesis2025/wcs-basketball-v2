import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { devLog, devError } from "@/lib/security";
import { getUserRole } from "@/lib/actions";

export async function POST(request: NextRequest) {
  try {
    // Get user ID from request headers
    const userId = request.headers.get("x-user-id");

    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Check if user is admin
    const userData = await getUserRole(userId);
    if (!userData || userData.role !== "admin") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    const { paymentIds } = await request.json();

    if (!paymentIds || !Array.isArray(paymentIds) || paymentIds.length === 0) {
      return NextResponse.json(
        { error: "Payment IDs are required" },
        { status: 400 }
      );
    }

    devLog("Marking payments as paid:", paymentIds);

    // Update payment status to "paid"
    const { data: updatedPayments, error: updateError } = await supabaseAdmin
      .from("payments")
      .update({ status: "paid", updated_at: new Date().toISOString() })
      .in("id", paymentIds)
      .select();

    if (updateError) {
      devError("Error updating payments:", updateError);
      return NextResponse.json(
        { error: "Failed to update payment status" },
        { status: 500 }
      );
    }

    devLog("Successfully marked payments as paid:", updatedPayments?.length);

    return NextResponse.json({
      success: true,
      message: "Payments marked as paid successfully",
      updatedCount: updatedPayments?.length || 0,
    });
  } catch (error) {
    devError("Mark as paid API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}





