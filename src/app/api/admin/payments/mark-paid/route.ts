import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { devLog, devError } from "@/lib/security";
import { getUserRole } from "@/lib/actions";
import { AuthenticationError, AuthorizationError, ValidationError, ApiError, DatabaseError, handleApiError, formatSuccessResponse } from "@/lib/errorHandler";

export async function POST(request: NextRequest) {
  try {
    // Get user ID from request headers
    const userId = request.headers.get("x-user-id");

    if (!userId) {
      throw new AuthenticationError("Authentication required");
    }

    // Check if user is admin
    const userData = await getUserRole(userId);
    if (!userData || userData.role !== "admin") {
      throw new AuthorizationError("Admin access required");
    }

    if (!supabaseAdmin) {
      throw new ApiError("Server configuration error", 500);
    }

    const { paymentIds } = await request.json();

    if (!paymentIds || !Array.isArray(paymentIds) || paymentIds.length === 0) {
      throw new ValidationError("Payment IDs are required");
    }

    devLog("Marking payments as paid:", paymentIds);

    // Update payment status to "paid"
    const { data: updatedPayments, error: updateError } = await supabaseAdmin
      .from("payments")
      .update({ status: "paid", updated_at: new Date().toISOString() })
      .in("id", paymentIds)
      .select();

    if (updateError) {
      throw new DatabaseError("Failed to update payment status", updateError);
    }

    devLog("Successfully marked payments as paid:", updatedPayments?.length);

    return formatSuccessResponse({
      message: "Payments marked as paid successfully",
      updatedCount: updatedPayments?.length || 0,
    });
  } catch (error) {
    return handleApiError(error, request);
  }
}









