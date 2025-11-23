import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { config } from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
config({ path: path.join(__dirname, '..', '.env.local') });

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Create hero directory if it doesn't exist
const heroDir = path.join(__dirname, '..', 'public', 'hero');
if (!fs.existsSync(heroDir)) {
  fs.mkdirSync(heroDir, { recursive: true });
  console.log('Created /public/hero directory');
}

async function migrateHeroImages() {
  try {
    console.log('Fetching hero images from Supabase storage...');
    
    // List all files in hero folder
    let allFiles = [];
    let hasMore = true;
    let offset = 0;
    const limit = 1000;

    while (hasMore) {
      const { data: files, error: listError } = await supabase.storage
        .from('images')
        .list('hero', {
          limit: limit,
          offset: offset,
          sortBy: { column: 'name', order: 'asc' }
        });

      if (listError) {
        console.error('Error listing files:', listError);
        process.exit(1);
      }

      if (files && files.length > 0) {
        allFiles = [...allFiles, ...files];
        offset += limit;
        hasMore = files.length === limit;
      } else {
        hasMore = false;
      }
    }

    console.log(`Found ${allFiles.length} files in hero folder`);

    // Filter image files
    const imageFiles = allFiles.filter(file => {
      const name = file.name.toLowerCase();
      return (name.endsWith('.png') || 
              name.endsWith('.jpg') || 
              name.endsWith('.jpeg') || 
              name.endsWith('.webp')) &&
             !file.name.startsWith('.');
    });

    console.log(`Found ${imageFiles.length} image files to migrate`);

    // Download each image
    let successCount = 0;
    let errorCount = 0;

    for (const file of imageFiles) {
      try {
        const filePath = `hero/${file.name}`;
        
        // Download the file
        const { data, error } = await supabase.storage
          .from('images')
          .download(filePath);

        if (error) {
          console.error(`Error downloading ${file.name}:`, error.message);
          errorCount++;
          continue;
        }

        // Convert blob to buffer
        const arrayBuffer = await data.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Sanitize filename (handle spaces and special characters)
        const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const localPath = path.join(heroDir, sanitizedFilename);

        // Save to local file
        fs.writeFileSync(localPath, buffer);
        console.log(`✓ Downloaded: ${file.name} -> ${sanitizedFilename}`);
        successCount++;

      } catch (err) {
        console.error(`Error processing ${file.name}:`, err.message);
        errorCount++;
      }
    }

    console.log('\n=== Migration Complete ===');
    console.log(`Successfully migrated: ${successCount} images`);
    console.log(`Errors: ${errorCount} images`);
    console.log(`Images saved to: ${heroDir}`);

  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

migrateHeroImages();

