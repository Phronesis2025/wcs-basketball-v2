// src/app/api/admin/import/template/route.ts
// API endpoint to download Excel template

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { devError } from "@/lib/security";
import { generateExcelTemplate } from "@/lib/excel-template";
import * as XLSX from "xlsx";
import { AuthenticationError, AuthorizationError, ApiError, handleApiError } from "@/lib/errorHandler";

async function isAdmin(userId?: string | null): Promise<boolean> {
  if (!userId || !supabaseAdmin) return false;
  const { data } = await supabaseAdmin
    .from("users")
    .select("role")
    .eq("id", userId)
    .single();
  return data?.role === "admin";
}

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      throw new AuthenticationError("Authentication required");
    }

    // Check admin role
    if (!(await isAdmin(userId))) {
      throw new AuthorizationError("Admin access required");
    }

    // Generate template using the shared function
    const excelBuffer = generateExcelTemplate();

    // Return file as response
    return new NextResponse(excelBuffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": 'attachment; filename="player-import-template.xlsx"',
      },
    });
  } catch (error) {
    return handleApiError(error, request);
  }
}

