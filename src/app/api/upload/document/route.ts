import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { devLog, devError } from "@/lib/security";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const fileName = formData.get("fileName") as string;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type (PDF, DOC, DOCX)
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "File must be a PDF, DOC, or DOCX document" },
        { status: 400 }
      );
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size must be less than 10MB" },
        { status: 400 }
      );
    }

    // Use provided fileName or generate unique filename
    const finalFileName =
      fileName ||
      `${Date.now()}-${Math.random().toString(36).substring(2)}.${file.name
        .split(".")
        .pop()}`;

    // Upload to the random/test_images bucket as specified
    const filePath = `test_images/${finalFileName}`;

    // Convert file to buffer
    const fileBuffer = await file.arrayBuffer();

    // Upload to Supabase storage using admin client (bypasses RLS)
    const { data, error } = await supabaseAdmin.storage
      .from("random")
      .upload(filePath, fileBuffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      devError("Failed to upload document:", error);
      return NextResponse.json(
        { error: "Failed to upload document" },
        { status: 500 }
      );
    }

    // Get the public URL
    const {
      data: { publicUrl },
    } = supabaseAdmin.storage.from("random").getPublicUrl(filePath);

    devLog("Successfully uploaded modal template document:", publicUrl);

    return NextResponse.json({
      success: true,
      url: publicUrl,
      path: filePath,
    });
  } catch (error) {
    devError("Unexpected error uploading modal template document:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
