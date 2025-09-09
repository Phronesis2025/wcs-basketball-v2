import type { User } from "@supabase/supabase-js";

export interface Team {
  name: string;
  age_group: string;
  gender: string;
}

export type SupabaseUser = User;
