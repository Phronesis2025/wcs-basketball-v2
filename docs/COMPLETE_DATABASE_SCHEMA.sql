-- WCS Basketball v2.8.0 Complete Database Schema
-- Generated: January 2025
-- Database: Supabase PostgreSQL
-- Total Tables: 18

-- =====================================================
-- 1. TEAMS TABLE
-- =====================================================
CREATE TABLE public.teams (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name text NOT NULL UNIQUE,
  age_group text CHECK (age_group = ANY (ARRAY['U10'::text, 'U12'::text, 'U14'::text, 'U16'::text, 'U18'::text])),
  gender text CHECK (gender = ANY (ARRAY['Boys'::text, 'Girls'::text])),
  coach_email text NOT NULL,
  grade_level text,
  season text,
  logo_url text,
  team_image text,
  is_active boolean DEFAULT true,
  is_deleted boolean DEFAULT false,
  CONSTRAINT teams_pkey PRIMARY KEY (id)
);

-- =====================================================
-- 2. USERS TABLE
-- =====================================================
CREATE TABLE public.users (
  id uuid NOT NULL,
  email text NOT NULL UNIQUE,
  role text CHECK (role = ANY (ARRAY['coach'::text, 'parent'::text, 'admin'::text])),
  created_at timestamp without time zone DEFAULT now(),
  password_reset boolean DEFAULT true,
  last_password_reset timestamp with time zone,
  login_count integer DEFAULT 0,
  last_login_at timestamp with time zone,
  CONSTRAINT users_pkey PRIMARY KEY (id)
);

-- =====================================================
-- 3. COACHES TABLE
-- =====================================================
CREATE TABLE public.coaches (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL UNIQUE,
  bio text,
  created_at timestamp with time zone DEFAULT now(),
  image_url text,
  quote text,
  user_id uuid,
  is_active boolean DEFAULT true,
  is_deleted boolean DEFAULT false,
  phone varchar,
  CONSTRAINT coaches_pkey PRIMARY KEY (id),
  CONSTRAINT coaches_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);

-- =====================================================
-- 4. TEAM COACHES JUNCTION TABLE
-- =====================================================
CREATE TABLE public.team_coaches (
  team_id uuid NOT NULL,
  coach_id uuid NOT NULL,
  CONSTRAINT team_coaches_pkey PRIMARY KEY (team_id, coach_id),
  CONSTRAINT team_coaches_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id),
  CONSTRAINT team_coaches_coach_id_fkey FOREIGN KEY (coach_id) REFERENCES public.coaches(id)
);

-- =====================================================
-- 5. SCHEDULES TABLE
-- =====================================================
CREATE TABLE public.schedules (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  team_id uuid,
  event_type text CHECK (event_type = ANY (ARRAY['Game'::text, 'Practice'::text, 'Tournament'::text, 'Meeting'::text, 'Update'::text])),
  date_time timestamp without time zone NOT NULL,
  location text,
  opponent text,
  created_at timestamp without time zone DEFAULT now(),
  created_by uuid,
  deleted_at timestamp with time zone,
  description text,
  is_global boolean NOT NULL DEFAULT false,
  title text,
  recurring_group_id text,
  end_date_time timestamp with time zone,
  CONSTRAINT schedules_pkey PRIMARY KEY (id),
  CONSTRAINT schedules_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id),
  CONSTRAINT schedules_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id)
);

-- =====================================================
-- 6. TEAM UPDATES TABLE
-- =====================================================
CREATE TABLE public.team_updates (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  team_id uuid,
  title text NOT NULL,
  content text NOT NULL,
  image_url text,
  is_global boolean NOT NULL DEFAULT false,
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  deleted_at timestamp with time zone,
  date_time timestamp without time zone,
  CONSTRAINT team_updates_pkey PRIMARY KEY (id),
  CONSTRAINT team_updates_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id),
  CONSTRAINT team_updates_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id)
);

-- =====================================================
-- 7. PRACTICE DRILLS TABLE
-- =====================================================
CREATE TABLE public.practice_drills (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  team_id uuid,
  title text NOT NULL,
  skills ARRAY NOT NULL,
  equipment ARRAY NOT NULL,
  time text NOT NULL,
  instructions text NOT NULL,
  additional_info text,
  benefits text NOT NULL,
  difficulty text NOT NULL,
  category text NOT NULL,
  week_number integer NOT NULL,
  image_url text,
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT practice_drills_pkey PRIMARY KEY (id),
  CONSTRAINT practice_drills_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id),
  CONSTRAINT practice_drills_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id)
);

-- =====================================================
-- 8. NEWS TABLE
-- =====================================================
CREATE TABLE public.news (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  image_url text,
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  team_id uuid,
  deleted_at timestamp with time zone,
  CONSTRAINT news_pkey PRIMARY KEY (id),
  CONSTRAINT news_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id),
  CONSTRAINT news_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id)
);

-- =====================================================
-- 9. PRODUCTS TABLE
-- =====================================================
CREATE TABLE public.products (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  description text,
  price numeric NOT NULL,
  printful_id text,
  image_url text,
  CONSTRAINT products_pkey PRIMARY KEY (id)
);

-- =====================================================
-- 10. RESOURCES TABLE
-- =====================================================
CREATE TABLE public.resources (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  description text,
  file_url text,
  coach_email text NOT NULL,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT resources_pkey PRIMARY KEY (id)
);

-- =====================================================
-- 11. PLAYERS TABLE
-- =====================================================
CREATE TABLE public.players (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  team_id uuid,
  name text NOT NULL,
  jersey_number integer,
  grade text,
  parent_name text,
  parent_email text,
  parent_phone text,
  emergency_contact text,
  emergency_phone text,
  created_at timestamp with time zone DEFAULT now(),
  is_active boolean DEFAULT true,
  date_of_birth date,
  age integer,
  gender text,
  is_deleted boolean DEFAULT false,
  CONSTRAINT players_pkey PRIMARY KEY (id),
  CONSTRAINT players_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id)
);

-- =====================================================
-- 12. COACH MESSAGES TABLE
-- =====================================================
CREATE TABLE public.coach_messages (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  author_id uuid NOT NULL,
  author_name text NOT NULL,
  content text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  deleted_at timestamp with time zone,
  is_pinned boolean DEFAULT false,
  CONSTRAINT coach_messages_pkey PRIMARY KEY (id),
  CONSTRAINT coach_messages_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.users(id) ON DELETE CASCADE
);

-- =====================================================
-- 13. COACH MESSAGE REPLIES TABLE
-- =====================================================
CREATE TABLE public.coach_message_replies (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  message_id uuid NOT NULL,
  author_id uuid NOT NULL,
  author_name text NOT NULL,
  content text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  deleted_at timestamp with time zone,
  CONSTRAINT coach_message_replies_pkey PRIMARY KEY (id),
  CONSTRAINT coach_message_replies_message_id_fkey FOREIGN KEY (message_id) REFERENCES public.coach_messages(id) ON DELETE CASCADE,
  CONSTRAINT coach_message_replies_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.users(id) ON DELETE CASCADE
);

-- =====================================================
-- 14. AUDIT LOGS TABLE
-- =====================================================
CREATE TABLE public.audit_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  table_name text NOT NULL,
  operation text NOT NULL,
  user_id uuid,
  old_data jsonb,
  new_data jsonb,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT audit_logs_pkey PRIMARY KEY (id),
  CONSTRAINT audit_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);

-- =====================================================
-- 15. LOGIN LOGS TABLE
-- =====================================================
CREATE TABLE public.login_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  login_at timestamp with time zone DEFAULT now(),
  ip_address inet,
  user_agent text,
  success boolean DEFAULT true,
  failure_reason text,
  session_duration integer,
  CONSTRAINT login_logs_pkey PRIMARY KEY (id),
  CONSTRAINT login_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);

-- =====================================================
-- 16. ERROR LOGS TABLE
-- =====================================================
CREATE TABLE public.error_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  severity text NOT NULL CHECK (severity = ANY (ARRAY['critical'::text, 'error'::text, 'warning'::text, 'info'::text])),
  message text NOT NULL,
  stack_trace text,
  user_id uuid,
  page_url text,
  user_agent text,
  ip_address inet,
  error_code text,
  resolved boolean DEFAULT false,
  resolved_at timestamp with time zone,
  resolved_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT error_logs_pkey PRIMARY KEY (id),
  CONSTRAINT error_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT error_logs_resolved_by_fkey FOREIGN KEY (resolved_by) REFERENCES public.users(id)
);

-- =====================================================
-- END OF SCHEMA
-- =====================================================

-- Schema Version: 2.8.0
-- Last Updated: January 2025
-- Total Tables: 16
