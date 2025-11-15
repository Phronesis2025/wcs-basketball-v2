import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { devLog, devError } from "@/lib/security";
import { ValidationError, DatabaseError, handleApiError, formatSuccessResponse } from "@/lib/errorHandler";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const fileName = formData.get("fileName") as string;

    if (!file) {
      throw new ValidationError("No file provided");
    }

    // Validate file type (PDF, DOC, DOCX)
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.type)) {
      throw new ValidationError("File must be a PDF, DOC, or DOCX document");
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      throw new ValidationError("File size must be less than 10MB");
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
      throw new DatabaseError("Failed to upload document", error);
    }

    // Get the public URL
    const {
      data: { publicUrl },
    } = supabaseAdmin.storage.from("random").getPublicUrl(filePath);

    devLog("Successfully uploaded modal template document:", publicUrl);

    return formatSuccessResponse({
      url: publicUrl,
      path: filePath,
    });
  } catch (error) {
    return handleApiError(error, request);
  }
}
