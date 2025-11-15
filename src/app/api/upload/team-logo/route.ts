import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { devLog, devError } from "@/lib/security";
import { ValidationError, DatabaseError, handleApiError, formatSuccessResponse } from "@/lib/errorHandler";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const teamName = formData.get("teamName") as string;

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

    // Generate filename following the pattern: logo-<team-name>.png
    // Remove "WCS" prefix if present and sanitize the name
    const sanitizedTeamName = teamName
      .toLowerCase()
      .replace(/^wcs\s+/, "") // Remove "WCS " prefix if present
      .replace(/[^a-z0-9\s-]/g, "") // Remove special characters except spaces and hyphens
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
      .trim();

    const fileExt = file.name.split(".").pop()?.toLowerCase() || "png";
    const fileName = `logo-${sanitizedTeamName}.${fileExt}`;
    const filePath = `logos/${fileName}`;

    // Convert file to buffer
    const fileBuffer = await file.arrayBuffer();

    // Upload to Supabase storage using admin client (bypasses RLS)
    const { data, error } = await supabaseAdmin.storage
      .from("images")
      .upload(filePath, fileBuffer, {
        contentType: file.type,
        upsert: true, // Allow overwriting existing files
      });

    if (error) {
      throw new DatabaseError("Failed to upload team logo", error);
    }

    // Get the public URL
    const {
      data: { publicUrl },
    } = supabaseAdmin.storage.from("images").getPublicUrl(filePath);

    devLog("Successfully uploaded team logo:", { fileName, publicUrl });

    return formatSuccessResponse({
      url: publicUrl,
      path: filePath,
      fileName: fileName,
    });
  } catch (error) {
    return handleApiError(error, request);
  }
}
