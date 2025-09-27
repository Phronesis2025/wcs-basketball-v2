// src/types/supabase.ts
export type Team = {
  id: string;
  name: string;
  age_group: string;
  gender: string;
  grade_level: string;
  logo_url: string | null;
  season: string;
  team_image: string | null;
  coach_names: string[]; // Changed to array for multiple coaches
};

export type Coach = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  bio: string;
  image_url: string | null;
  quote: string;
};

export type Schedule = {
  id: string;
  team_id: string;
  event_type: "Game" | "Practice" | "Tournament" | "Meeting";
  date_time: string;
  location: string;
  opponent: string | null;
  description: string | null;
  created_by: string;
  created_at: string;
};

export type PracticeDrill = {
  id: string;
  team_id: string;
  title: string;
  skills: string[];
  equipment: string[];
  time: string;
  instructions: string;
  additional_info: string | null;
  benefits: string;
  difficulty: string;
  category: string;
  week_number: number;
  image_url: string | null;
  created_by: string;
  created_at: string;
};

export type TeamUpdate = {
  id: string;
  team_id: string;
  title: string;
  content: string;
  image_url: string | null;
  created_by: string;
  created_at: string;
};

export type SupabaseUser = {
  id: string;
  email?: string;
  user_metadata: {
    first_name?: string;
    last_name?: string;
  };
  created_at: string;
  updated_at?: string;
};
