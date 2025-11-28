/**
 * Script to insert changelog entries into Supabase
 * Run with: node scripts/insert-changelog-entries.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const entries = [
  {
    version: '2.10.31',
    release_date: '2025-01-11',
    category: 'fixed',
    description: 'Fixed mobile responsiveness issues in message board: increased touch target sizes to minimum 44px for all buttons and icons, improved modal positioning and keyboard handling, disabled auto-focus on textareas for mobile devices, and enhanced button spacing and layout for small screens.',
    is_published: true,
  },
  {
    version: '2.10.31',
    release_date: '2025-01-11',
    category: 'changed',
    description: 'Updated sign-out thank you page (/parent/sign-out) to match new modern design style: changed from navy background to black with gradient effects, updated typography with gradient text for headings, added modern card styling with borders and transparency, and improved overall visual consistency.',
    is_published: true,
  },
  {
    version: '2.10.31',
    release_date: '2025-01-11',
    category: 'fixed',
    description: 'Fixed React key prop warnings in message board: updated renderMessageContent function to wrap all string parts in React.Fragment with unique keys, added optional messageId parameter for unique key generation, and updated all call sites to pass message/reply IDs for proper React reconciliation.',
    is_published: true,
  },
  {
    version: '2.10.31',
    release_date: '2025-01-11',
    category: 'fixed',
    description: 'Improved error handling in message board replies batch loading: added table existence check to handle missing tables gracefully, enhanced error serialization with detailed logging including error message, details, hint, and code, and ensured all message IDs get empty arrays on error to prevent undefined state.',
    is_published: true,
  },
  {
    version: '2.10.31',
    release_date: '2025-01-11',
    category: 'changed',
    description: 'Added sign-out page (/parent/sign-out) to dark navbar pages list to ensure navbar displays with black background matching the page design.',
    is_published: true,
  },
];

async function insertEntries() {
  console.log('Inserting changelog entries...');
  
  for (const entry of entries) {
    const { data, error } = await supabase
      .from('changelog')
      .insert([entry])
      .select()
      .single();

    if (error) {
      console.error(`Error inserting entry: ${entry.description.substring(0, 50)}...`, error);
    } else {
      console.log(`✓ Inserted: ${entry.category} - ${entry.description.substring(0, 50)}...`);
    }
  }
  
  console.log('Done!');
}

insertEntries().catch(console.error);

