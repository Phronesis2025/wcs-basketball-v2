import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { devLog, devError } from "@/lib/security";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const folder = (formData.get("folder") as string) || "team_updates";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    devLog("API route received file:", {
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      fileSizeMB: (file.size / (1024 * 1024)).toFixed(2),
    });

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "File must be an image" },
        { status: 400 }
      );
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size must be less than 5MB" },
        { status: 400 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = file.name.split(".").pop();
    const fileName = `${timestamp}-${file.name.replace(
      /[^a-zA-Z0-9.-]/g,
      "-"
    )}`;
    const filePath = `${folder}/${fileName}`;

    // Convert file to buffer
    const fileBuffer = await file.arrayBuffer();

    devLog("Uploading to Supabase:", {
      filePath,
      fileSize: fileBuffer.byteLength,
    });

    // Upload to Supabase storage
    const { data, error } = await supabaseAdmin.storage
      .from("team-updates")
      .upload(filePath, fileBuffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      devError("Failed to upload to Supabase:", error);
      return NextResponse.json(
        { error: "Failed to upload image" },
        { status: 500 }
      );
    }

    // Get the public URL
    const { data: urlData } = supabaseAdmin.storage
      .from("team-updates")
      .getPublicUrl(filePath);

    devLog("Successfully uploaded image:", {
      fileName,
      publicUrl: urlData.publicUrl,
    });

    return NextResponse.json({
      success: true,
      url: urlData.publicUrl,
      path: filePath,
    });
  } catch (error) {
    devError("Unexpected error uploading image:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
