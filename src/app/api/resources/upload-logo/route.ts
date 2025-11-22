import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { devLog, devError } from "@/lib/security";
import { ValidationError, ApiError, AuthenticationError, AuthorizationError, DatabaseError, handleApiError, formatSuccessResponse } from "@/lib/errorHandler";

async function isAdmin(userId?: string | null): Promise<boolean> {
  if (!userId || !supabaseAdmin) return false;
  const { data } = await supabaseAdmin
    .from("users")
    .select("role")
    .eq("id", userId)
    .single();
  return data?.role === "admin";
}

export async function POST(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      throw new ApiError("Server configuration error", 500);
    }

    // Check if user is admin
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      throw new AuthenticationError("User ID required");
    }

    const adminCheck = await isAdmin(userId);
    if (!adminCheck) {
      throw new AuthorizationError("Unauthorized - Admin access required");
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const logoType = formData.get("logoType") as string; // "team" or "club"
    const teamName = formData.get("teamName") as string | null; // Optional, for team logos
    const overwrite = formData.get("overwrite") === "true"; // Whether to overwrite existing file

    if (!file) {
      throw new ValidationError("No file provided");
    }

    if (!logoType || !["team", "club"].includes(logoType)) {
      throw new ValidationError("Invalid logo type. Must be 'team' or 'club'");
    }

    // Validate file type (images only)
    if (!file.type.startsWith("image/")) {
      throw new ValidationError("File must be an image");
    }

    // Validate file size (5MB limit for images)
    if (file.size > 5 * 1024 * 1024) {
      throw new ValidationError("File size must be less than 5MB");
    }

    let fileName: string;
    let filePath: string;

    if (logoType === "team" && teamName) {
      // Generate filename following the pattern: logo-<team-name>.png
      const sanitizedTeamName = teamName
        .toLowerCase()
        .replace(/^wcs\s+/, "") // Remove "WCS " prefix if present
        .replace(/[^a-z0-9\s-]/g, "") // Remove special characters except spaces and hyphens
        .replace(/\s+/g, "-") // Replace spaces with hyphens
        .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
        .trim();

      const fileExt = file.name.split(".").pop()?.toLowerCase() || "png";
      fileName = `logo-${sanitizedTeamName}.${fileExt}`;
      filePath = `logos/${fileName}`;
    } else if (logoType === "club") {
      // Generate filename for club logo
      // Use shorter filename to avoid storage path length issues
      const timestamp = Date.now();
      const fileExt = file.name.split(".").pop()?.toLowerCase() || "png";
      // Extract a short identifier from the original filename (max 30 chars)
      const baseName = file.name
        .replace(/\.[^/.]+$/, "") // Remove extension
        .replace(/[^a-zA-Z0-9]/g, "-") // Replace special chars with hyphens
        .toLowerCase()
        .substring(0, 30) // Limit to 30 characters
        .replace(/-+/g, "-") // Replace multiple hyphens with single
        .replace(/^-|-$/g, ""); // Remove leading/trailing hyphens
      
      fileName = baseName 
        ? `club-logo-${timestamp}-${baseName}.${fileExt}`
        : `club-logo-${timestamp}.${fileExt}`;
      filePath = `logos/${fileName}`;
    } else {
      throw new ValidationError("Team name required for team logos");
    }

    // Check if file exists (only for team logos, club logos have timestamps so won't conflict)
    if (logoType === "team" && !overwrite) {
      const { data: existingFiles } = await supabaseAdmin.storage
        .from("images")
        .list("logos");

      const fileExists = existingFiles?.some((f) => f.name === fileName);
      if (fileExists) {
        // Return special error response for file exists (client needs to handle this)
        return NextResponse.json(
          {
            error: "FILE_EXISTS",
            message: `A file named "${fileName}" already exists. Do you want to overwrite it?`,
            fileName,
            path: filePath,
          },
          { status: 409 } // Conflict status - preserve special handling
        );
      }
    }

    // Convert file to buffer (must be Uint8Array for Supabase Storage)
    const fileBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(fileBuffer);

    devLog("Uploading logo:", {
      fileName,
      filePath,
      fileSize: file.size,
      contentType: file.type,
      logoType,
    });

    // Upload to images bucket in logos folder
    const { data, error } = await supabaseAdmin.storage
      .from("images")
      .upload(filePath, uint8Array, {
        contentType: file.type,
        upsert: overwrite || logoType === "club", // Allow overwriting if explicitly requested or for club logos
        cacheControl: "3600",
      });

    if (error) {
      throw new DatabaseError("Failed to upload logo", error);
    }

    // Get the public URL
    const { data: urlData } = supabaseAdmin.storage
      .from("images")
      .getPublicUrl(filePath);

    devLog("Successfully uploaded logo:", {
      fileName,
      logoType,
      url: urlData.publicUrl,
    });

    return formatSuccessResponse({
      url: urlData.publicUrl,
      path: filePath,
      fileName: fileName,
      size: file.size,
    });
  } catch (error) {
    return handleApiError(error, request);
  }
}

