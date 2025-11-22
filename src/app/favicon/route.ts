import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";

/**
 * Route handler for /favicon.ico
 * Serves the web-app-manifest-192x192.png as favicon.ico
 * This fixes the 500 error by properly serving the favicon
 */
export async function GET(request: NextRequest) {
  try {
    // Serve the new logo as favicon
    const faviconPath = join(process.cwd(), "public", "web-app-manifest-192x192.png");
    const faviconBuffer = await readFile(faviconPath);

    return new NextResponse(faviconBuffer, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    // Fallback: return 204 No Content if file not found
    return new NextResponse(null, {
      status: 204,
    });
  }
}

