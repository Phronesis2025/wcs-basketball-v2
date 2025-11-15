import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { devLog, devError } from "@/lib/security";
import { ValidationError, ApiError, DatabaseError, handleApiError, formatSuccessResponse } from "@/lib/errorHandler";

export async function POST(request: NextRequest) {
  try {
    devLog("🖼️ Team Image Upload API - Starting upload process");
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const teamName = formData.get("teamName") as string;

    devLog("🖼️ Team Image Upload API - Received:", {
      fileName: file?.name,
      fileSize: file?.size,
      teamName,
    });

    if (!file) {
      throw new ValidationError("No file provided");
    }

    if (!teamName) {
      throw new ValidationError("Team name is required");
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      throw new ValidationError("File must be an image");
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      throw new ValidationError("File size must be less than 5MB");
    }

    // Generate filename following the pattern: <team-name>.png
    // Remove "WCS" prefix if present and sanitize the name
    const sanitizedTeamName = teamName
      .toLowerCase()
      .replace(/^wcs\s+/, "") // Remove "WCS " prefix if present
      .replace(/[^a-z0-9\s-]/g, "") // Remove special characters except spaces and hyphens
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
      .trim();

    const fileExt = file.name.split(".").pop()?.toLowerCase() || "png";
    const fileName = `${sanitizedTeamName}.${fileExt}`;
    const filePath = `teams/${fileName}`;

    // Convert file to buffer
    const fileBuffer = await file.arrayBuffer();

    // Upload to Supabase storage using admin client (bypasses RLS)
    devLog("🖼️ Team Image Upload API - About to upload to Supabase:", {
      filePath,
      fileSize: fileBuffer.byteLength,
      contentType: file.type,
      upsert: true,
    });

    const { data, error } = await supabaseAdmin.storage
      .from("images")
      .upload(filePath, fileBuffer, {
        contentType: file.type,
        upsert: true, // Allow overwriting existing files
      });

    devLog("🖼️ Team Image Upload API - Supabase upload result:", {
      data,
      error,
    });

    if (error) {
      throw new DatabaseError("Failed to upload team image", error);
    }

    // Get the public URL
    const {
      data: { publicUrl },
    } = supabaseAdmin.storage.from("images").getPublicUrl(filePath);

    devLog("Successfully uploaded team image:", { fileName, publicUrl });
    devLog("🖼️ Team Image Upload API - Upload successful:", {
      fileName,
      publicUrl,
    });

    return formatSuccessResponse({
      url: publicUrl,
      path: filePath,
      fileName: fileName,
    });
  } catch (error) {
    return handleApiError(error, request);
  }
}
