import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { devError, devLog } from "@/lib/security";

export async function GET() {
  try {
    // Fetch all logos from images/logos folder using admin client
    let allFiles: any[] = [];
    let hasMore = true;
    let offset = 0;
    const limit = 1000;

    while (hasMore) {
      const { data: files, error: listError } = await supabaseAdmin.storage
        .from('images')
        .list('logos', {
          limit: limit,
          offset: offset,
          sortBy: { column: 'name', order: 'asc' }
        });

      if (listError) {
        devError("Error fetching logos from storage:", listError);
        return NextResponse.json(
          { error: "Failed to fetch logos", details: listError.message },
          { status: 500 }
        );
      }

      if (files && files.length > 0) {
        allFiles = [...allFiles, ...files];
        offset += limit;
        hasMore = files.length === limit;
      } else {
        hasMore = false;
      }
    }

    if (allFiles.length === 0) {
      devLog("No logos found in storage bucket images/logos");
      return NextResponse.json({ logos: [] });
    }

    // Filter image files - only include files matching pattern 'logo-*.png' (case-insensitive)
    const imageFiles = allFiles.filter(file => {
      const name = file.name.toLowerCase();
      // Must match pattern: logo-*.png (case-insensitive)
      const logoPattern = /^logo-.*\.png$/i;
      return logoPattern.test(file.name) && !file.name.startsWith('.');
    });

    // Get public URLs for each logo
    const logos: Array<{ id: string; name: string; logo_url: string }> = [];
    const logoUrls = new Set<string>(); // Track URLs to avoid duplicates

    for (const file of imageFiles) {
      const { data } = supabaseAdmin.storage
        .from('images')
        .getPublicUrl(`logos/${file.name}`);
      
      if (data.publicUrl && !logoUrls.has(data.publicUrl)) {
        logoUrls.add(data.publicUrl);
        logos.push({
          id: file.id || `storage-${file.name}`,
          name: file.name.replace(/\.(png|jpg|jpeg|webp|svg)$/i, '').replace(/^logo-?/i, ''),
          logo_url: data.publicUrl,
        });
        devLog(`Added logo: ${file.name} -> ${data.publicUrl}`);
      }
    }
    
    devLog(`Total logos generated: ${logos.length}`);
    
    return NextResponse.json({ logos });
  } catch (error) {
    devError("Error fetching logos:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

