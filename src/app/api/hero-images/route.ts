import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { devError, devLog } from "@/lib/security";

export async function GET() {
  try {
    // Fetch all images from images/hero folder using admin client
    let allFiles: any[] = [];
    let hasMore = true;
    let offset = 0;
    const limit = 1000;

    while (hasMore) {
      const { data: files, error: listError } = await supabaseAdmin.storage
        .from('images')
        .list('hero', {
          limit: limit,
          offset: offset,
          sortBy: { column: 'name', order: 'asc' }
        });

      if (listError) {
        devError("Error fetching hero images from storage:", listError);
        return NextResponse.json(
          { error: "Failed to fetch hero images", details: listError.message },
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
      devLog("No hero images found in storage bucket images/hero");
      return NextResponse.json({ images: [] });
    }

    // Filter image files
    const imageFiles = allFiles.filter(file => {
      const name = file.name.toLowerCase();
      return (name.endsWith('.png') || 
              name.endsWith('.jpg') || 
              name.endsWith('.jpeg') || 
              name.endsWith('.webp')) &&
             !file.name.startsWith('.');
    });

    // Get public URLs for each image
    const imageUrls: string[] = [];
    for (const file of imageFiles) {
      const { data } = supabaseAdmin.storage
        .from('images')
        .getPublicUrl(`hero/${file.name}`);
      
      if (data.publicUrl) {
        imageUrls.push(data.publicUrl);
        devLog(`Added hero image: ${file.name} -> ${data.publicUrl}`);
      } else {
        devError(`Failed to get public URL for: ${file.name}`);
      }
    }
    
    devLog(`Total image URLs generated: ${imageUrls.length}`);
    
    // Return response with caching headers
    return NextResponse.json(
      { images: imageUrls },
      {
        headers: {
          // Cache for 1 hour, then revalidate in background
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
        },
      }
    );
  } catch (error) {
    devError("Error fetching hero images:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

