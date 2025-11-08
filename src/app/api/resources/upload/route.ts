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
    const overwrite = formData.get("overwrite") === "true"; // Whether to overwrite existing file
    const customFileName = formData.get("fileName") as string | null; // Optional custom filename

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
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
      return NextResponse.json(
        {
          error:
            "File type not allowed. Allowed types: PDF, DOC, DOCX, XLS, XLSX, TXT, CSV",
        },
        { status: 400 }
      );
    }

    // Validate file size (10MB limit for documents)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size must be less than 10MB" },
        { status: 400 }
      );
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
      devError("Failed to upload document:", error);
      return NextResponse.json(
        { error: "Failed to upload document" },
        { status: 500 }
      );
    }

    // Get the public URL
    const { data: urlData } = supabaseAdmin.storage
      .from("resources")
      .getPublicUrl(fileName);

    devLog("Successfully uploaded document:", { fileName, url: urlData.publicUrl });

    return NextResponse.json({
      success: true,
      url: urlData.publicUrl,
      path: fileName,
      fileName: fileName,
      size: file.size,
    });
  } catch (error) {
    devError("Upload document API error:", error);
    return NextResponse.json(
      {
        error: "Failed to upload document",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

