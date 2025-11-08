import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { devLog, devError } from "@/lib/security";

export async function GET(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const bucket = searchParams.get("bucket");
    const path = searchParams.get("path");

    if (!bucket || !path) {
      return NextResponse.json(
        { error: "Bucket and path parameters are required" },
        { status: 400 }
      );
    }

    // Validate bucket name
    const allowedBuckets = ["resources", "images"];
    if (!allowedBuckets.includes(bucket)) {
      return NextResponse.json(
        { error: "Invalid bucket name" },
        { status: 400 }
      );
    }

    // Check if file exists
    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .list(path.split("/").slice(0, -1).join("/") || "", {
        search: path.split("/").pop() || "",
      });

    if (error) {
      devError("Error checking file existence:", error);
      return NextResponse.json(
        { error: "Failed to check file existence" },
        { status: 500 }
      );
    }

    const fileName = path.split("/").pop() || "";
    const fileExists = data?.some((file) => file.name === fileName) || false;

    return NextResponse.json({
      exists: fileExists,
      path,
      bucket,
    });
  } catch (error) {
    devError("Check file exists API error:", error);
    return NextResponse.json(
      {
        error: "Failed to check file existence",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

