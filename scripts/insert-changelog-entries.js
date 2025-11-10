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
    version: '2.10.15',
    release_date: '2025-01-10',
    category: 'added',
    description: 'Implemented global responsive scaling system for fonts and images. Added CSS viewport-based scaling using clamp() that scales from 65% on mobile (375px) to 100% at 1920px+. All fonts and images now scale proportionally based on screen size while preserving layout, functionality, and responsive breakpoints.',
    is_published: true,
  },
  {
    version: '2.10.15',
    release_date: '2025-01-10',
    category: 'changed',
    description: 'Updated payment tab in club management: all collapsible sections (Payment Management, Registrations, Volunteer Submissions, Parent Payment Overview) now default to closed state instead of open.',
    is_published: true,
  },
  {
    version: '2.10.15',
    release_date: '2025-01-10',
    category: 'changed',
    description: 'Changed all section titles on Monitor tab to white font color for better visibility and consistency.',
    is_published: true,
  },
  {
    version: '2.10.15',
    release_date: '2025-01-10',
    category: 'changed',
    description: 'Updated parent login page: changed title from "Parent Login" to "Account login" and updated subtitle from "manage your children\'s registration" to "manage your player\'s registration".',
    is_published: true,
  },
  {
    version: '2.10.15',
    release_date: '2025-01-10',
    category: 'changed',
    description: 'Updated parent profile page: changed "Add Another Child" button text to "Add Another Player" for consistency with player terminology.',
    is_published: true,
  },
  {
    version: '2.10.15',
    release_date: '2025-01-10',
    category: 'changed',
    description: 'Simplified billing tab: removed individual player invoices section. Now only shows combined invoice with "View Full Invoice" and "Email Full Invoice" options. Updated description text to use "players" instead of "children".',
    is_published: true,
  },
  {
    version: '2.10.15',
    release_date: '2025-01-10',
    category: 'changed',
    description: 'Removed Amount column from payment history table on tablet view (hidden on screens up to 1279px, visible only on extra-large desktop screens 1280px+).',
    is_published: true,
  },
  {
    version: '2.10.15',
    release_date: '2025-01-10',
    category: 'added',
    description: 'Created sign-out transition page at /parent/sign-out that displays thank you message for participation and support of WCS Basketball program. Page automatically redirects to home after 4 seconds with manual "Return to Home" button option.',
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

