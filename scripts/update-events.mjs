import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Team IDs from database
const teams = {
  eagles: '95c83e18-572a-45cf-b7e5-eb009921a3ae',      // WCS Eagles Elite
  thunder: 'e067bb7f-d8bd-43b4-8f87-31339d59b660',     // WCS Thunder
  lightning: '8c2f4496-1842-426c-95b7-2d55a810f2ae',   // WCS Lightning
  hornets: 'a4c93840-134e-49f4-9602-f597a87c6e15',     // WCS Hornets
  warriors: '30dea75d-61ef-4ce9-a74c-d359b9fbbe78',    // WCS Warriors
  rockets: '75dbd643-4354-4883-b534-d7ff51deb221',     // WCS Rockets
  vipers: 'f337f582-6b0f-4de8-87b7-c77e09401db8',      // WCS Vipers
  cardinals: '6d53f931-5511-4c8e-88da-e7736a7bc42d',   // WCS Cardinals
};

async function updateEvents() {
  console.log('Step 1: Deleting old events...\n');
  
  // Delete all existing events
  const { error: deleteError } = await supabase
    .from('schedules')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

  if (deleteError) {
    console.error('Error deleting events:', deleteError);
  } else {
    console.log('✅ Deleted old events\n');
  }

  console.log('Step 2: Adding new events for today and tomorrow...\n');

  const eventsToAdd = [
    // TODAY - Nov 21, 2025
    {
      team_id: teams.eagles,
      event_type: 'Game',
      date_time: '2025-11-21T18:00:00',
      location: 'WCS Main Court',
      opponent: 'Warriors Elite Academy',
      title: 'Eagles vs Warriors - Championship',
      description: 'Championship quarterfinal game',
      is_global: false,
    },
    {
      team_id: teams.thunder,
      event_type: 'Game',
      date_time: '2025-11-21T20:00:00',
      location: 'Riverside Arena',
      opponent: 'Lakers Youth',
      title: 'Thunder vs Lakers',
      description: 'League rivalry matchup',
      is_global: false,
    },
    {
      team_id: teams.lightning,
      event_type: 'Practice',
      date_time: '2025-11-21T16:00:00',
      location: 'WCS Training Facility',
      opponent: null,
      title: 'Lightning Skills Session',
      description: 'Focus on ball handling and shooting fundamentals',
      is_global: false,
    },
    {
      team_id: teams.hornets,
      event_type: 'Practice',
      date_time: '2025-11-21T19:00:00',
      location: 'WCS Main Court',
      opponent: null,
      title: 'Hornets Team Practice',
      description: 'Full team scrimmage and defensive drills',
      is_global: false,
    },
    {
      team_id: null,
      event_type: 'Tournament',
      date_time: '2025-11-21T17:00:00',
      location: 'Metro Sports Complex',
      opponent: null,
      title: 'Winter Showcase',
      description: 'Day 1 of three-day tournament - Pool play games',
      is_global: true,
    },

    // TOMORROW - Nov 22, 2025
    {
      team_id: teams.warriors,
      event_type: 'Game',
      date_time: '2025-11-22T18:30:00',
      location: 'WCS Main Court',
      opponent: 'Phoenix Rising',
      title: 'Warriors vs Phoenix',
      description: 'Conference semifinal game',
      is_global: false,
    },
    {
      team_id: teams.rockets,
      event_type: 'Game',
      date_time: '2025-11-22T20:00:00',
      location: 'Eastside Sports Arena',
      opponent: 'Bulls Academy',
      title: 'Rockets vs Bulls',
      description: 'Division championship game',
      is_global: false,
    },
    {
      team_id: teams.vipers,
      event_type: 'Practice',
      date_time: '2025-11-22T16:00:00',
      location: 'WCS Training Facility',
      opponent: null,
      title: 'Vipers Advanced Drills',
      description: 'Advanced offensive plays and zone defense',
      is_global: false,
    },
    {
      team_id: teams.cardinals,
      event_type: 'Game',
      date_time: '2025-11-22T19:00:00',
      location: 'South Valley Gym',
      opponent: 'Heat Elite',
      title: 'Cardinals vs Heat',
      description: 'Tournament bracket game',
      is_global: false,
    },
  ];

  const { data, error } = await supabase
    .from('schedules')
    .insert(eventsToAdd)
    .select();

  if (error) {
    console.error('Error adding events:', error);
    process.exit(1);
  }

  console.log('✅ Successfully added', data.length, 'events!\n');
  
  // Group by date
  const today = data.filter(e => e.date_time.startsWith('2025-11-21'));
  const tomorrow = data.filter(e => e.date_time.startsWith('2025-11-22'));

  console.log('📅 TODAY (Nov 21):');
  today.forEach((event) => {
    console.log(`   ${event.event_type} - ${event.title}`);
  });

  console.log('\n📅 TOMORROW (Nov 22):');
  tomorrow.forEach((event) => {
    console.log(`   ${event.event_type} - ${event.title}`);
  });
}

updateEvents();

