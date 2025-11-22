import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addTodaysEvents() {
  console.log('Adding events for November 21st, 2025...\n');

  const events = [
    {
      event_type: 'Game',
      date_time: '2025-11-21T18:00:00',
      location: 'WCS Main Court',
      opponent: 'Warriors Elite',
      title: '15U Travel Game',
      description: 'Championship quarterfinal game',
      is_global: false,
    },
    {
      event_type: 'Game',
      date_time: '2025-11-21T20:00:00',
      location: 'Riverside Arena',
      opponent: 'Lakers Youth',
      title: '17U Travel Game',
      description: 'League rivalry matchup',
      is_global: false,
    },
    {
      event_type: 'Practice',
      date_time: '2025-11-21T16:00:00',
      location: 'WCS Training Facility',
      opponent: null,
      title: 'Skills Academy Session',
      description: 'Focus on ball handling and shooting fundamentals',
      is_global: false,
    },
    {
      event_type: 'Practice',
      date_time: '2025-11-21T19:00:00',
      location: 'WCS Main Court',
      opponent: null,
      title: '13U Team Practice',
      description: 'Full team scrimmage and defensive drills',
      is_global: false,
    },
    {
      event_type: 'Tournament',
      date_time: '2025-11-21T17:00:00',
      location: 'Metro Sports Complex',
      opponent: null,
      title: 'Winter Showcase',
      description: 'Day 1 of three-day tournament - Pool play games',
      is_global: true,
    },
  ];

  const { data, error } = await supabase
    .from('schedules')
    .insert(events)
    .select();

  if (error) {
    console.error('Error adding events:', error);
    process.exit(1);
  }

  console.log('✅ Successfully added', data.length, 'events for today!');
  console.log('\nEvents added:');
  data.forEach((event, index) => {
    console.log(`${index + 1}. ${event.event_type} - ${event.title} at ${event.location}`);
  });
}

addTodaysEvents();

