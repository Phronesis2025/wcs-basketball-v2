import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { devLog, devError } from "@/lib/security";

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
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    // Check if user is admin
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json(
        { error: "User ID required" },
        { status: 401 }
      );
    }

    const adminCheck = await isAdmin(userId);
    if (!adminCheck) {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const logoType = formData.get("logoType") as string; // "team" or "club"
    const teamName = formData.get("teamName") as string | null; // Optional, for team logos
    const overwrite = formData.get("overwrite") === "true"; // Whether to overwrite existing file

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!logoType || !["team", "club"].includes(logoType)) {
      return NextResponse.json(
        { error: "Invalid logo type. Must be 'team' or 'club'" },
        { status: 400 }
      );
    }

    // Validate file type (images only)
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "File must be an image" },
        { status: 400 }
      );
    }

    // Validate file size (5MB limit for images)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size must be less than 5MB" },
        { status: 400 }
      );
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
      return NextResponse.json(
        { error: "Team name required for team logos" },
        { status: 400 }
      );
    }

    // Check if file exists (only for team logos, club logos have timestamps so won't conflict)
    if (logoType === "team" && !overwrite) {
      const { data: existingFiles } = await supabaseAdmin.storage
        .from("images")
        .list("logos");

      const fileExists = existingFiles?.some((f) => f.name === fileName);
      if (fileExists) {
        return NextResponse.json(
          {
            error: "FILE_EXISTS",
            message: `A file named "${fileName}" already exists. Do you want to overwrite it?`,
            fileName,
            path: filePath,
          },
          { status: 409 } // Conflict status
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
      devError("Failed to upload logo:", error);
      devError("Upload error details:", {
        message: error.message,
        statusCode: error.statusCode,
        error: error.error,
        path: filePath,
        fileName,
      });
      return NextResponse.json(
        { 
          error: "Failed to upload logo",
          details: error.message || "Storage upload failed",
        },
        { status: 500 }
      );
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

    return NextResponse.json({
      success: true,
      url: urlData.publicUrl,
      path: filePath,
      fileName: fileName,
      size: file.size,
    });
  } catch (error) {
    devError("Upload logo API error:", error);
    return NextResponse.json(
      {
        error: "Failed to upload logo",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

