// scripts/verify-storage-paths.mjs
// Script to verify Supabase storage paths for logos and hero images
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables. Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in your .env.local file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
  },
});

async function verifyStoragePaths() {
  console.log('🔍 Verifying Supabase Storage Paths...\n');
  console.log(`Supabase URL: ${supabaseUrl}\n`);

  // Check if 'images' bucket exists
  console.log('📦 Checking storage buckets...');
  const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
  
  if (bucketsError) {
    console.error('❌ Error listing buckets:', bucketsError);
    return;
  }

  const imagesBucket = buckets?.find(b => b.name === 'images');
  if (!imagesBucket) {
    console.error('❌ "images" bucket not found!');
    console.log('Available buckets:', buckets?.map(b => b.name).join(', ') || 'none');
    return;
  }

  console.log('✅ "images" bucket found\n');

  // Check logos folder
  console.log('🖼️  Checking logos folder (images/logos)...');
  const { data: logosFiles, error: logosError } = await supabase.storage
    .from('images')
    .list('logos', {
      limit: 1000,
      sortBy: { column: 'name', order: 'asc' }
    });

  if (logosError) {
    console.error('❌ Error listing logos:', logosError);
    console.log('Error details:', JSON.stringify(logosError, null, 2));
  } else if (logosFiles && logosFiles.length > 0) {
    const imageFiles = logosFiles.filter(file => {
      const name = file.name.toLowerCase();
      return (name.endsWith('.png') || 
              name.endsWith('.jpg') || 
              name.endsWith('.jpeg') || 
              name.endsWith('.webp') ||
              name.endsWith('.svg')) &&
             !file.name.startsWith('.');
    });
    
    console.log(`✅ Found ${imageFiles.length} logo image(s) in images/logos:`);
    imageFiles.slice(0, 10).forEach((file, index) => {
      const { data } = supabase.storage
        .from('images')
        .getPublicUrl(`logos/${file.name}`);
      console.log(`   ${index + 1}. ${file.name}`);
      console.log(`      URL: ${data.publicUrl}`);
    });
    if (imageFiles.length > 10) {
      console.log(`   ... and ${imageFiles.length - 10} more`);
    }
  } else {
    console.log('⚠️  No files found in images/logos folder');
    console.log('   This might be expected if logos haven\'t been uploaded yet.');
  }

  console.log('\n');

  // Check hero folder
  console.log('🎯 Checking hero folder (images/hero)...');
  const { data: heroFiles, error: heroError } = await supabase.storage
    .from('images')
    .list('hero', {
      limit: 1000,
      sortBy: { column: 'name', order: 'asc' }
    });

  if (heroError) {
    console.error('❌ Error listing hero images:', heroError);
    console.log('Error details:', JSON.stringify(heroError, null, 2));
  } else if (heroFiles && heroFiles.length > 0) {
    const imageFiles = heroFiles.filter(file => {
      const name = file.name.toLowerCase();
      return (name.endsWith('.png') || 
              name.endsWith('.jpg') || 
              name.endsWith('.jpeg') || 
              name.endsWith('.webp')) &&
             !file.name.startsWith('.');
    });
    
    console.log(`✅ Found ${imageFiles.length} hero image(s) in images/hero:`);
    imageFiles.slice(0, 10).forEach((file, index) => {
      const { data } = supabase.storage
        .from('images')
        .getPublicUrl(`hero/${file.name}`);
      console.log(`   ${index + 1}. ${file.name}`);
      console.log(`      URL: ${data.publicUrl}`);
    });
    if (imageFiles.length > 10) {
      console.log(`   ... and ${imageFiles.length - 10} more`);
    }
  } else {
    console.log('⚠️  No files found in images/hero folder');
    console.log('   This might be expected if hero images haven\'t been uploaded yet.');
  }

  console.log('\n');

  // Check root of images bucket for any other folders
  console.log('📁 Checking root of images bucket for other folders...');
  const { data: rootFiles, error: rootError } = await supabase.storage
    .from('images')
    .list('', {
      limit: 1000,
      sortBy: { column: 'name', order: 'asc' }
    });

  if (!rootError && rootFiles) {
    const folders = rootFiles.filter(file => !file.name.includes('.'));
    if (folders.length > 0) {
      console.log(`Found ${folders.length} folder(s) in images bucket:`);
      folders.forEach(folder => {
        console.log(`   - ${folder.name}/`);
      });
    } else {
      console.log('   No folders found in root (only files or empty)');
    }
  }

  console.log('\n✅ Verification complete!');
}

verifyStoragePaths().catch(console.error);

