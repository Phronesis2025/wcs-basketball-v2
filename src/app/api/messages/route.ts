import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { devLog, devError, sanitizeInput } from "@/lib/security";

export async function POST(request: NextRequest) {
  try {
    const { content, authorId, authorName } = await request.json();

    if (!content || !authorId || !authorName) {
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

    devLog("[API] Creating message", {
      authorId,
      authorName: sanitizedAuthorName,
      preview: sanitizedContent.slice(0, 50),
    });

    const { data, error } = await supabaseAdmin
      .from("coach_messages")
      .insert({
        author_id: authorId,
        author_name: sanitizedAuthorName,
        content: sanitizedContent,
      })
      .select()
      .single();

    if (error) {
      devError("[API] Create message failed:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err) {
    devError("[API] Unexpected error creating message:", err);
    return NextResponse.json(
      { error: "Failed to create message" },
      { status: 500 }
    );
  }
}
