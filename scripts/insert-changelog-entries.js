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
    version: '2.10.14',
    release_date: '2025-01-09',
    category: 'added',
    description: 'Added combined invoice feature allowing parents to view and download a single invoice with all payments for all their children. Created new API endpoint /api/send-parent-invoice that generates consolidated invoices. Added "View Full Invoice" and "Email Full Invoice" buttons to billing page. Invoice table now includes Player column showing first names, and displays all payments across multiple children and months.',
    is_published: true,
  },
  {
    version: '2.10.14',
    release_date: '2025-01-09',
    category: 'fixed',
    description: 'Fixed invoice table not displaying payment information on HTML invoice page. Removed overflow-hidden container that was clipping table content. Added explicit display and visibility styles to ensure table is always visible. Updated payment fetching to use server-side API for reliable data access.',
    is_published: true,
  },
  {
    version: '2.10.14',
    release_date: '2025-01-09',
    category: 'changed',
    description: 'Removed team logos from all invoice forms (HTML and PDF). Team logos no longer appear on invoices to simplify invoice design. WCS logo remains in header.',
    is_published: true,
  },
  {
    version: '2.10.14',
    release_date: '2025-01-09',
    category: 'changed',
    description: 'Updated invoice to hide Team line when parent has children on multiple teams. Team information only displays when all children are on the same team.',
    is_published: true,
  },
  {
    version: '2.10.14',
    release_date: '2025-01-09',
    category: 'changed',
    description: 'Changed invoice label from "Children:" to "Players:" and updated display to show only first names (e.g., "7 Players: Teegan, Tatum, Bernie, Amelia, Oakly, Hannah, Stella").',
    is_published: true,
  },
  {
    version: '2.10.14',
    release_date: '2025-01-09',
    category: 'added',
    description: 'Added back button to invoice page positioned between invoice content and checkout section. Button styled as standard gray button matching app design, hidden in print mode.',
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

