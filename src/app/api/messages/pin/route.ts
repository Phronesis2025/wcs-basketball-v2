import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { devLog, devError } from "@/lib/security";

export async function POST(request: NextRequest) {
  try {
    const { messageId, requesterId, isAdmin } = await request.json();

    if (!messageId || !requesterId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!isAdmin) {
      return NextResponse.json(
        { error: "Only admins can pin/unpin messages" },
        { status: 403 }
      );
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    devLog("[API] Pinning/unpinning message", {
      messageId,
      requesterId,
      isAdmin,
    });

    // Get current pin status
    const { data: currentMessages, error: fetchError } = await supabaseAdmin
      .from("coach_messages")
      .select("is_pinned")
      .eq("id", messageId)
      .is("deleted_at", null);

    if (fetchError) {
      devError("[API] Error fetching message for pin:", fetchError);
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    if (!currentMessages || currentMessages.length === 0) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    const currentMessage = currentMessages[0];

    // Update pin status
    const { data, error } = await supabaseAdmin
      .from("coach_messages")
      .update({
        is_pinned: !currentMessage.is_pinned,
      })
      .eq("id", messageId)
      .select();

    if (error) {
      devError("[API] Error pinning/unpinning message:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: "Message not found or update failed" },
        { status: 404 }
      );
    }

    devLog("[API] Successfully toggled pin status for message:", messageId);
    return NextResponse.json(data[0]);
  } catch (err) {
    devError("[API] Unexpected error pinning message:", err);
    return NextResponse.json(
      { error: "Failed to pin/unpin message" },
      { status: 500 }
    );
  }
}
