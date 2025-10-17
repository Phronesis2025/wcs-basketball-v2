import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { devLog, devError, sanitizeInput } from "@/lib/security";

export async function POST(request: NextRequest) {
  try {
    const { messageId, content, authorId, authorName } = await request.json();

    if (!messageId || !content || !authorId || !authorName) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    const sanitizedContent = sanitizeInput(String(content).trim());
    const sanitizedAuthorName = sanitizeInput(String(authorName));

    devLog("[API] Creating reply", {
      messageId,
      authorId,
      preview: sanitizedContent.slice(0, 50),
    });

    const { data, error } = await supabaseAdmin
      .from("coach_message_replies")
      .insert({
        message_id: messageId,
        author_id: authorId,
        author_name: sanitizedAuthorName,
        content: sanitizedContent,
      })
      .select()
      .single();

    if (error) {
      devError("[API] Create reply failed:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err) {
    devError("[API] Unexpected error creating reply:", err);
    return NextResponse.json(
      { error: "Failed to create reply" },
      { status: 500 }
    );
  }
}
