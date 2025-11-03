require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
  },
});

async function deleteUser() {
  const email = 'phronesis700@gmail.com';
  
  // First, find the user by email
  const { data: usersData, error: listError } = await supabaseAdmin.auth.admin.listUsers();
  
  if (listError) {
    console.error('Error listing users:', listError);
    process.exit(1);
  }
  
  const user = usersData?.users?.find((u) => u.email === email);
  
  if (!user) {
    console.log(`⚠️  User ${email} not found in auth.users - may already be deleted`);
    return;
  }
  
  console.log(`Deleting user: ${email} (${user.id})...`);
  
  const { data, error } = await supabaseAdmin.auth.admin.deleteUser(user.id);
  
  if (error) {
    console.error('Error deleting user:', error);
    process.exit(1);
  } else {
    console.log('✅ User deleted successfully');
  }
}

deleteUser();

