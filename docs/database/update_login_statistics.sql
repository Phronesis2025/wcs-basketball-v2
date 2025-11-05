-- Update get_login_statistics function to include is_active status from coaches table
-- This will make the Activity Monitor tab show "Inactive" for deactivated coaches

CREATE OR REPLACE FUNCTION get_login_statistics()
RETURNS TABLE (
  user_id uuid,
  email text,
  role text,
  total_logins bigint,
  last_login_at timestamp with time zone,
  first_login_at timestamp with time zone,
  is_active boolean
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
    (SELECT MIN(ll.login_at) FROM public.login_logs ll WHERE ll.user_id = u.id AND ll.success = true) as first_login_at,
    CASE 
      WHEN u.role = 'coach' THEN COALESCE(c.is_active, true)
      WHEN u.role = 'admin' THEN true
      ELSE true
    END as is_active
  FROM public.users u
  LEFT JOIN public.coaches c ON c.user_id = u.id
  WHERE u.role IN ('admin', 'coach')
  ORDER BY u.last_login_at DESC NULLS LAST;
$$;

COMMENT ON FUNCTION get_login_statistics() IS 'Returns login statistics for all users with admin/coach roles, including is_active status from coaches table';
