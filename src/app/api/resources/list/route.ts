import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { devLog, devError } from "@/lib/security";
import { ApiError, handleApiError, formatSuccessResponse } from "@/lib/errorHandler";

export async function GET(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      throw new ApiError("Server configuration error", 500);
    }

    // Get user ID from headers for potential future use
    const userId = request.headers.get("x-user-id");

    const documents: Array<{
      name: string;
      path: string;
      size: number;
      created_at: string;
      url: string;
    }> = [];

    const teamLogos: Array<{
      name: string;
      path: string;
      size: number;
      created_at: string;
      url: string;
      teamName?: string;
    }> = [];

    const clubLogos: Array<{
      name: string;
      path: string;
      size: number;
      created_at: string;
      url: string;
    }> = [];

    // List documents from resources bucket
    try {
      const { data: resourcesData, error: resourcesError } =
        await supabaseAdmin.storage.from("resources").list("", {
          limit: 100,
          sortBy: { column: "created_at", order: "desc" },
        });

      if (!resourcesError && resourcesData) {
        for (const file of resourcesData) {
          if (file.name && !file.name.startsWith(".")) {
            const filePath = file.name;
            const { data: urlData } = supabaseAdmin.storage
              .from("resources")
              .getPublicUrl(filePath);

            documents.push({
              name: file.name,
              path: filePath,
              size: file.metadata?.size || 0,
              created_at: file.created_at || new Date().toISOString(),
              url: urlData.publicUrl,
            });
          }
        }
      } else if (resourcesError) {
        devLog("Resources bucket may not exist yet:", resourcesError.message);
      }
    } catch (error) {
      devLog("Error listing resources bucket:", error);
      // Continue - bucket may not exist yet
    }

    // List logos from images/logos folder
    try {
      const { data: logosData, error: logosError } =
        await supabaseAdmin.storage.from("images").list("logos", {
          limit: 100,
          sortBy: { column: "created_at", order: "desc" },
        });

      if (!logosError && logosData) {
        for (const file of logosData) {
          if (file.name && !file.name.startsWith(".")) {
            const filePath = `logos/${file.name}`;
            const { data: urlData } = supabaseAdmin.storage
              .from("images")
              .getPublicUrl(filePath);

            const fileInfo = {
              name: file.name,
              path: filePath,
              size: file.metadata?.size || 0,
              created_at: file.created_at || new Date().toISOString(),
              url: urlData.publicUrl,
            };

            // Categorize logos based on filename pattern
            // Team logos: logo-{team-name}.*
            // Club logos: club-logo* or other patterns
            if (file.name.toLowerCase().startsWith("logo-")) {
              // Extract team name from filename (logo-{team-name}.ext)
              const teamNameMatch = file.name.match(/^logo-(.+)\./i);
              const teamName = teamNameMatch
                ? teamNameMatch[1]
                    .replace(/-/g, " ")
                    .replace(/\b\w/g, (l) => l.toUpperCase())
                : undefined;

              teamLogos.push({
                ...fileInfo,
                teamName,
              });
            } else if (
              file.name.toLowerCase().startsWith("club-logo") ||
              file.name.toLowerCase().includes("club")
            ) {
              clubLogos.push(fileInfo);
            } else {
              // Default to club logo if it doesn't match team logo pattern
              clubLogos.push(fileInfo);
            }
          }
        }
      } else if (logosError) {
        devError("Error listing logos:", logosError);
      }
    } catch (error) {
      devError("Error listing logos folder:", error);
    }

    devLog("Resources listed successfully", {
      documentsCount: documents.length,
      teamLogosCount: teamLogos.length,
      clubLogosCount: clubLogos.length,
    });

    return formatSuccessResponse({
      documents,
      teamLogos,
      clubLogos,
    });
  } catch (error) {
    return handleApiError(error, request);
  }
}

