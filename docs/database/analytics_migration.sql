-- Analytics Dashboard Migration
-- Creates tables for error logging, login tracking, and analytics data
-- Run this in your Supabase SQL Editor

-- ===========================================
-- ERROR LOGS TABLE
-- ===========================================

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

-- Index for performance
CREATE INDEX idx_error_logs_created_at ON public.error_logs(created_at DESC);
CREATE INDEX idx_error_logs_severity ON public.error_logs(severity);
CREATE INDEX idx_error_logs_resolved ON public.error_logs(resolved);
CREATE INDEX idx_error_logs_user_id ON public.error_logs(user_id);

-- ===========================================
-- LOGIN LOGS TABLE
-- ===========================================

CREATE TABLE public.login_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  login_at timestamp with time zone DEFAULT now(),
  ip_address inet,
  user_agent text,
  success boolean DEFAULT true,
  failure_reason text,
  session_duration integer, -- in minutes
  CONSTRAINT login_logs_pkey PRIMARY KEY (id),
  CONSTRAINT login_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);

-- Index for performance
CREATE INDEX idx_login_logs_user_id ON public.login_logs(user_id);
CREATE INDEX idx_login_logs_login_at ON public.login_logs(login_at DESC);
CREATE INDEX idx_login_logs_success ON public.login_logs(success);

-- ===========================================
-- UPDATE USERS TABLE
-- ===========================================

-- Add login tracking columns to existing users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS login_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_login_at timestamp with time zone;

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_users_last_login_at ON public.users(last_login_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_login_count ON public.users(login_count DESC);

-- ===========================================
-- ROW LEVEL SECURITY POLICIES
-- ===========================================

-- Enable RLS on new tables
ALTER TABLE public.error_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.login_logs ENABLE ROW LEVEL SECURITY;

-- Error logs policies
-- Only admins can view all error logs
CREATE POLICY "Admins view all error logs" ON public.error_logs
FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.users
  WHERE users.id = auth.uid()
  AND users.role = 'admin'
));

-- Only admins can update error logs (for resolving)
CREATE POLICY "Admins update error logs" ON public.error_logs
FOR UPDATE TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.users
  WHERE users.id = auth.uid()
  AND users.role = 'admin'
));

-- Only admins can insert error logs (for system logging)
CREATE POLICY "Admins insert error logs" ON public.error_logs
FOR INSERT TO authenticated
WITH CHECK (EXISTS (
  SELECT 1 FROM public.users
  WHERE users.id = auth.uid()
  AND users.role = 'admin'
));

-- Login logs policies
-- Only admins can view all login logs
CREATE POLICY "Admins view all login logs" ON public.login_logs
FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.users
  WHERE users.id = auth.uid()
  AND users.role = 'admin'
));

-- System can insert login logs (for tracking)
CREATE POLICY "System insert login logs" ON public.login_logs
FOR INSERT TO authenticated
WITH CHECK (true); -- Allow system to log logins

-- Users can view their own login logs
CREATE POLICY "Users view own login logs" ON public.login_logs
FOR SELECT TO authenticated
USING (user_id = auth.uid());

-- ===========================================
-- FUNCTIONS FOR ANALYTICS
-- ===========================================

-- Function to get login statistics for all users
CREATE OR REPLACE FUNCTION get_login_statistics()
RETURNS TABLE (
  user_id uuid,
  email text,
  role text,
  total_logins bigint,
  last_login_at timestamp with time zone,
  first_login_at timestamp with time zone
) 
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    u.id as user_id,
    u.email,
    u.role,
    u.login_count as total_logins,
    u.last_login_at,
    (SELECT MIN(ll.login_at) FROM public.login_logs ll WHERE ll.user_id = u.id AND ll.success = true) as first_login_at
  FROM public.users u
  WHERE u.role IN ('admin', 'coach')
  ORDER BY u.last_login_at DESC NULLS LAST;
$$;

-- Function to get error statistics
CREATE OR REPLACE FUNCTION get_error_statistics()
RETURNS TABLE (
  total_errors bigint,
  critical_errors bigint,
  error_count bigint,
  warning_count bigint,
  info_count bigint,
  resolved_errors bigint,
  unresolved_errors bigint
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    COUNT(*) as total_errors,
    COUNT(*) FILTER (WHERE severity = 'critical') as critical_errors,
    COUNT(*) FILTER (WHERE severity = 'error') as error_count,
    COUNT(*) FILTER (WHERE severity = 'warning') as warning_count,
    COUNT(*) FILTER (WHERE severity = 'info') as info_count,
    COUNT(*) FILTER (WHERE resolved = true) as resolved_errors,
    COUNT(*) FILTER (WHERE resolved = false) as unresolved_errors
  FROM public.error_logs;
$$;

-- Function to mark all errors as resolved
CREATE OR REPLACE FUNCTION resolve_all_errors(resolved_by_user_id uuid)
RETURNS integer
LANGUAGE sql
SECURITY DEFINER
AS $$
  UPDATE public.error_logs 
  SET 
    resolved = true,
    resolved_at = now(),
    resolved_by = resolved_by_user_id
  WHERE resolved = false;
  
  SELECT COUNT(*)::integer FROM public.error_logs WHERE resolved = true;
$$;

-- ===========================================
-- COMMENTS
-- ===========================================

COMMENT ON TABLE public.error_logs IS 'Stores application errors for admin dashboard viewing';
COMMENT ON TABLE public.login_logs IS 'Tracks user login events for analytics';
COMMENT ON COLUMN public.error_logs.severity IS 'Error severity level: critical, error, warning, info';
COMMENT ON COLUMN public.error_logs.resolved IS 'Whether the error has been resolved by admin';
COMMENT ON COLUMN public.login_logs.session_duration IS 'Session duration in minutes, calculated when user logs out';
COMMENT ON FUNCTION get_login_statistics() IS 'Returns login statistics for all users with admin/coach roles';
COMMENT ON FUNCTION get_error_statistics() IS 'Returns aggregated error statistics';
COMMENT ON FUNCTION resolve_all_errors(uuid) IS 'Marks all unresolved errors as resolved and returns count';
