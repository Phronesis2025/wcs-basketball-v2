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
  coach_names: string[];
  coaches?: Array<{
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  }>;
  is_active: boolean;
};

export type Coach = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  bio: string;
  image_url: string | null;
  quote: string;
  is_active: boolean;
  role?: string;
};

export type Schedule = {
  id: string;
  team_id: string | null; // Change from string to string | null to allow null
  event_type: "Game" | "Practice" | "Tournament" | "Meeting" | "Update";
  date_time: string;
  end_date_time: string | null; // End date for tournaments and multi-day events
  title: string | null;
  location: string;
  opponent: string | null;
  description: string | null;
  is_global: boolean | null; // Already should be here from your migration
  recurring_group_id: string | null; // For grouping recurring events
  created_by: string;
  created_at: string;
  deleted_at: string | null;
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
  team_id: string | null; // Allow null for global updates
  title: string;
  content: string;
  date_time: string | null;
  image_url: string | null;
  // Program-wide flag (requires DB column team_updates.is_global boolean DEFAULT false)
  is_global?: boolean;
  created_by: string;
  created_at: string;
  deleted_at: string | null;
};

export type News = {
  id: string;
  team_id: string;
  title: string;
  content: string;
  image_url: string | null;
  created_by: string;
  created_at: string;
  deleted_at: string | null;
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

export type CoachMessage = {
  id: string;
  author_id: string;
  author_name: string;
  content: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  is_pinned: boolean;
};

export type CoachMessageReply = {
  id: string;
  message_id: string;
  author_id: string;
  author_name: string;
  content: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

// Analytics Dashboard Types
export type ErrorLog = {
  id: string;
  severity: "critical" | "error" | "warning" | "info";
  message: string;
  stack_trace: string | null;
  user_id: string | null;
  page_url: string | null;
  user_agent: string | null;
  ip_address: string | null;
  error_code: string | null;
  resolved: boolean;
  resolved_at: string | null;
  resolved_by: string | null;
  created_at: string;
};

export type LoginLog = {
  id: string;
  user_id: string;
  login_at: string;
  ip_address: string | null;
  user_agent: string | null;
  success: boolean;
  failure_reason: string | null;
  session_duration: number | null;
};

export type LoginStatistic = {
  user_id: string;
  email: string;
  role: string;
  total_logins: number;
  last_login_at: string | null;
  first_login_at: string | null;
  is_active: boolean;
};

export type ErrorStatistics = {
  total_errors: number;
  critical_errors: number;
  error_count: number;
  warning_count: number;
  info_count: number;
  resolved_errors: number;
  unresolved_errors: number;
};

export type AnalyticsStats = {
  errorStats: ErrorStatistics;
  loginStats: LoginStatistic[];
  performanceMetrics: {
    averagePageLoadTime: number;
    errorRate: number;
    uptime: number;
  };
  trafficMetrics: {
    totalPageViews: number;
    uniqueVisitors: number;
    topPages: Array<{ page: string; views: number }>;
    deviceBreakdown: {
      mobile: number;
      desktop: number;
    };
  };
};

// Player Management Types
export type Player = {
  id: string;
  team_id: string;
  name: string;
  jersey_number: number | null;
  grade: string | null;
  date_of_birth: string | null;
  age: number | null;
  gender: string | null;
  parent_name: string | null;
  parent_email: string | null;
  parent_phone: string | null;
  emergency_contact: string | null;
  emergency_phone: string | null;
  created_at: string;
  is_active: boolean;
};
