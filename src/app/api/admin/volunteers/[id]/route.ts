import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../../lib/supabaseClient";
import { devError } from "../../../../../lib/security";
import {
  checkRateLimit,
  createSecureResponse,
  createErrorResponse,
} from "../../../../../lib/securityMiddleware";

// Helper function to check admin access
async function checkAdminAccess(userId: string | null): Promise<boolean> {
  if (!userId) return false;

  const { data: userData, error } = await supabaseAdmin!
    .from("users")
    .select("role")
    .eq("id", userId)
    .single();

  if (error || !userData || userData.role !== "admin") {
    return false;
  }

  return true;
}

// PATCH - Update volunteer notes
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> } | { params: { id: string } }
) {
  try {
    // Rate limiting
    const ip = request.headers.get("x-forwarded-for") ?? "127.0.0.1";
    const { success, limit, reset, remaining } = checkRateLimit(ip);

    if (!success) {
      return createErrorResponse(
        "Rate limit exceeded. Please try again later.",
        429,
        {
          "X-RateLimit-Limit": limit.toString(),
          "X-RateLimit-Remaining": remaining.toString(),
          "X-RateLimit-Reset": new Date(reset).toISOString(),
        }
      );
    }

    // Get user ID from request headers
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return createErrorResponse("Authentication required", 401);
    }

    // Check if user is admin
    const isAdmin = await checkAdminAccess(userId);
    if (!isAdmin) {
      return createErrorResponse("Admin access required", 403);
    }

    // Get volunteer ID from params
    const params = await Promise.resolve(context.params);
    const volunteerId = params.id;

    if (!volunteerId) {
      return createErrorResponse("Volunteer ID is required", 400);
    }

    // Parse request body
    const body = await request.json();
    const { notes } = body;

    if (typeof notes !== "string") {
      return createErrorResponse("Notes must be a string", 400);
    }

    // Update volunteer notes
    const { data, error } = await supabaseAdmin!
      .from("coach_volunteer_applications")
      .update({
        notes: notes || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", volunteerId)
      .select()
      .single();

    if (error) {
      devError("Error updating volunteer notes:", error);
      return createErrorResponse("Failed to update volunteer notes", 500);
    }

    return createSecureResponse(data);
  } catch (error) {
    devError("Unexpected error in PATCH /api/admin/volunteers/[id]:", error);
    return createErrorResponse("Failed to update volunteer notes", 500);
  }
}

// DELETE - Soft delete volunteer (set status to rejected)
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> } | { params: { id: string } }
) {
  try {
    // Rate limiting
    const ip = request.headers.get("x-forwarded-for") ?? "127.0.0.1";
    const { success, limit, reset, remaining } = checkRateLimit(ip);

    if (!success) {
      return createErrorResponse(
        "Rate limit exceeded. Please try again later.",
        429,
        {
          "X-RateLimit-Limit": limit.toString(),
          "X-RateLimit-Remaining": remaining.toString(),
          "X-RateLimit-Reset": new Date(reset).toISOString(),
        }
      );
    }

    // Get user ID from request headers
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return createErrorResponse("Authentication required", 401);
    }

    // Check if user is admin
    const isAdmin = await checkAdminAccess(userId);
    if (!isAdmin) {
      return createErrorResponse("Admin access required", 403);
    }

    // Get volunteer ID from params
    const params = await Promise.resolve(context.params);
    const volunteerId = params.id;

    if (!volunteerId) {
      return createErrorResponse("Volunteer ID is required", 400);
    }

    // Soft delete volunteer (set status to rejected)
    const { data, error } = await supabaseAdmin!
      .from("coach_volunteer_applications")
      .update({
        status: "rejected",
        reviewed_at: new Date().toISOString(),
        reviewed_by: userId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", volunteerId)
      .select()
      .single();

    if (error) {
      devError("Error rejecting volunteer:", error);
      return createErrorResponse("Failed to reject volunteer", 500);
    }

    return createSecureResponse(data);
  } catch (error) {
    devError("Unexpected error in DELETE /api/admin/volunteers/[id]:", error);
    return createErrorResponse("Failed to reject volunteer", 500);
  }
}

