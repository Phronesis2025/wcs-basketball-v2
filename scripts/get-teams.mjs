import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function getTeams() {
  const { data, error } = await supabase
    .from('teams')
    .select('id, name, logo_url')
    .order('name');

  if (error) {
    console.error('Error:', error);
    process.exit(1);
  }

  console.log('Available Teams:\n');
  data.forEach((team, index) => {
    console.log(`${index + 1}. ${team.name}`);
    console.log(`   ID: ${team.id}`);
    console.log(`   Logo: ${team.logo_url || 'No logo'}\n`);
  });
}

getTeams();

