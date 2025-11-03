require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceKey,
  {
    auth: {
      persistSession: false,
    },
  }
);

async function generateLoginLink() {
  const email = 'phronesis700@gmail.com';
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  
  console.log(`Generating password reset link for ${email}...`);
  
  try {
    // Generate password recovery link
    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email: email,
      options: {
        redirectTo: `${baseUrl}/parent/profile`,
      }
    });
    
    if (error) {
      console.error('Error generating link:', error);
      process.exit(1);
    }
    
    console.log('\n✅ Password reset link generated!\n');
    console.log('Copy and paste this URL in your browser to log in:');
    console.log(data.properties.action_link);
    console.log('\nOr use this link to view the profile directly:');
    console.log(data.properties.action_link.replace('/auth/v1/verify', '/parent/profile'));
    
  } catch (error) {
    console.error('Exception:', error);
    process.exit(1);
  }
}

generateLoginLink();

