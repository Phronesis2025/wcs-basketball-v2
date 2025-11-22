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
    const overwrite = formData.get("overwrite") === "true"; // Whether to overwrite existing file
    const customFileName = formData.get("fileName") as string | null; // Optional custom filename

    if (!file) {
      throw new ValidationError("No file provided");
    }

    // Validate file type - allow PDF, DOC, DOCX, and other document formats
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/plain",
      "text/csv",
    ];

    const fileExtension = file.name.split(".").pop()?.toLowerCase() || "";
    const allowedExtensions = ["pdf", "doc", "docx", "xls", "xlsx", "txt", "csv"];

    if (
      !allowedTypes.includes(file.type) &&
      !allowedExtensions.includes(fileExtension)
    ) {
      throw new ValidationError(
        "File type not allowed. Allowed types: PDF, DOC, DOCX, XLS, XLSX, TXT, CSV"
      );
    }

    // Validate file size (10MB limit for documents)
    if (file.size > 10 * 1024 * 1024) {
      throw new ValidationError("File size must be less than 10MB");
    }

    // Generate filename
    let fileName: string;
    if (customFileName) {
      // Use custom filename if provided
      const sanitizedFileName = customFileName.replace(/[^a-zA-Z0-9.-]/g, "-");
      fileName = sanitizedFileName;
    } else {
      // Generate unique filename with timestamp
      const timestamp = Date.now();
      const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "-");
      fileName = `${timestamp}-${sanitizedFileName}`;
    }

    // Check if file exists
    if (!overwrite) {
      const { data: existingFiles } = await supabaseAdmin.storage
        .from("resources")
        .list("", {
          search: fileName,
        });

      const fileExists = existingFiles?.some((f) => f.name === fileName);
      if (fileExists) {
        // Return a special error response for file exists (client needs to handle this)
        return NextResponse.json(
          {
            error: "FILE_EXISTS",
            message: `A file named "${fileName}" already exists. Do you want to overwrite it?`,
            fileName,
            path: fileName,
          },
          { status: 409 } // Conflict status
        );
      }
    }

    // Convert file to buffer
    const fileBuffer = await file.arrayBuffer();

    // Upload to resources bucket
    const { data, error } = await supabaseAdmin.storage
      .from("resources")
      .upload(fileName, fileBuffer, {
        contentType: file.type,
        upsert: overwrite,
      });

    if (error) {
      throw new DatabaseError("Failed to upload document", error);
    }

    // Get the public URL
    const { data: urlData } = supabaseAdmin.storage
      .from("resources")
      .getPublicUrl(fileName);

    devLog("Successfully uploaded document:", { fileName, url: urlData.publicUrl });

    return formatSuccessResponse({
      url: urlData.publicUrl,
      path: fileName,
      fileName: fileName,
      size: file.size,
    });
  } catch (error) {
    return handleApiError(error, request);
  }
}

