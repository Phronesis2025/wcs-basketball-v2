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

export type ChangelogEntry = {
  id: string;
  version: string;
  release_date: string; // ISO date string (YYYY-MM-DD)
  category: 'added' | 'changed' | 'fixed' | 'removed' | 'security' | 'deprecated';
  description: string;
  created_by: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

export type PracticeDrill = {
  id: string;
  team_id: string | null;
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
  youtube_url: string | null;
  is_global: boolean;
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

export type MessageNotification = {
  id: string;
  message_id: string;
  reply_id: string | null;
  mentioned_user_id: string;
  mentioned_by_user_id: string;
  mentioned_at: string;
  is_read: boolean;
  read_at: string | null;
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
  systemHealth?: {
    uptime: number;
    responseTime: number;
    database: string;
  };
  webVitals?: {
    lcp: number; // Largest Contentful Paint (ms)
    fid: number; // First Input Delay (ms)
    inp: number; // Interaction to Next Paint (ms)
    cls: number; // Cumulative Layout Shift (score)
    fcp: number; // First Contentful Paint (ms)
    ttfb: number; // Time to First Byte (ms)
  };
};

// Player Management Types
export type Player = {
  id: string;
  team_id: string | null;
  parent_id: string | null; // Foreign key to parents table
  name: string;
  jersey_number: number | null;
  grade: string | null;
  date_of_birth: string | null;
  age: number | null;
  gender: string | null;
  // Player detail fields
  shirt_size?: string | null;
  position_preference?: string | null;
  previous_experience?: string | null;
  school_name?: string | null;
  // Legacy parent fields (deprecated - use parent_id relation instead)
  parent_name?: string | null;
  parent_email?: string | null;
  parent_phone?: string | null;
  emergency_contact?: string | null;
  emergency_phone?: string | null;
  // Medical information fields
  medical_allergies?: string | null;
  medical_conditions?: string | null;
  medical_medications?: string | null;
  doctor_name?: string | null;
  doctor_phone?: string | null;
  created_at: string;
  is_active: boolean;
  is_deleted?: boolean;
  // Payment-related fields
  status?: "pending" | "approved" | "active" | "on_hold" | "rejected";
  rejection_reason?: string | null;
  rejected_at?: string | null;
  waiver_signed?: boolean;
  stripe_customer_id?: string | null;
};

// Payment Types
export type Payment = {
  id: string;
  player_id: string;
  stripe_payment_id: string | null;
  amount: number;
  payment_type: "annual" | "monthly" | "custom";
  status: "pending" | "paid" | "failed";
  created_at: string;
  updated_at: string;
  // Related player info (added when joining with players table)
  player_name?: string;
};

// Parent Profile Types
export type Parent = {
  id: string;
  user_id: string | null;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string | null;
  // Detailed fields (Phase 2)
  address_line1?: string | null;
  address_line2?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  emergency_contact?: string | null;
  emergency_phone?: string | null;
  guardian_relationship?: string | null;
  // Medical fields
  medical_allergies?: string | null;
  medical_conditions?: string | null;
  medical_medications?: string | null;
  doctor_name?: string | null;
  doctor_phone?: string | null;
  // Consent checkboxes
  consent_photo_release?: boolean;
  consent_medical_treatment?: boolean;
  consent_participation?: boolean;
  checkout_completed?: boolean;
  created_at?: string;
  updated_at?: string;
};

export type ParentProfile = {
  parent: {
    email: string;
    name: string;
    phone: string | null;
    emergency_contact: string | null;
    emergency_phone: string | null;
    address_line1?: string | null;
    address_line2?: string | null;
    city?: string | null;
    state?: string | null;
    zip?: string | null;
    checkout_completed?: boolean;
  };
  children: Player[];
  payments: Payment[];
  total_paid: number;
  pending_payments: number;
};

// Quote Types
export type Quote = {
  id: string;
  quote_text: string;
  author: string;
  created_at: string;
  display_order: number | null;
};