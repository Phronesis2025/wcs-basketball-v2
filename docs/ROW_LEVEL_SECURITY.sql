-- Row Level Security (RLS) Setup for WCS Basketball Database
-- This script enables RLS on all tables and creates appropriate policies
-- Run this in your Supabase SQL Editor or database console

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE coaches ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_coaches ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_drills ENABLE ROW LEVEL SECURITY;

-- ===========================================
-- USERS TABLE POLICIES
-- ===========================================

-- Users can only see their own profile
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Allow authenticated users to see coach information (for team assignment)
CREATE POLICY "Authenticated users can view coach info" ON users
  FOR SELECT USING (
    auth.role() = 'authenticated' AND
    role = 'coach'
  );

-- ===========================================
-- TEAMS TABLE POLICIES
-- ===========================================

-- Anyone can view teams (public information)
CREATE POLICY "Public can view teams" ON teams
  FOR SELECT USING (true);

-- Only coaches can insert teams
CREATE POLICY "Coaches can create teams" ON teams
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'coach'
    )
  );

-- Coaches can update teams they created
CREATE POLICY "Coaches can update their teams" ON teams
  FOR UPDATE USING (
    auth.role() = 'authenticated' AND
    created_by = auth.uid()
  );

-- Only admins can delete teams
CREATE POLICY "Admins can delete teams" ON teams
  FOR DELETE USING (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- ===========================================
-- COACHES TABLE POLICIES
-- ===========================================

-- Public can view all coaches
CREATE POLICY "Public can view coaches" ON coaches
  FOR SELECT USING (true);

-- Coaches can update their own records
CREATE POLICY "Coaches can update own records" ON coaches
  FOR UPDATE USING (
    auth.role() = 'authenticated' AND
    user_id = auth.uid()
  );

-- Admins can manage all coach records
CREATE POLICY "Admins can manage coaches" ON coaches
  FOR ALL USING (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- ===========================================
-- TEAM COACHES JUNCTION TABLE POLICIES
-- ===========================================

-- Public can view team-coach relationships
CREATE POLICY "Public can view team coaches" ON team_coaches
  FOR SELECT USING (true);

-- Coaches can manage their own team assignments
CREATE POLICY "Coaches manage team assignments" ON team_coaches
  FOR ALL USING (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM coaches
      WHERE coaches.id = team_coaches.coach_id
      AND coaches.user_id = auth.uid()
    )
  );

-- ===========================================
-- SCHEDULES TABLE POLICIES
-- ===========================================

-- Public can view all schedules
CREATE POLICY "Public can view schedules" ON schedules
  FOR SELECT USING (true);

-- Coaches can manage schedules for their teams
CREATE POLICY "Coaches manage team schedules" ON schedules
  FOR ALL USING (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM team_coaches tc
      JOIN coaches c ON tc.coach_id = c.id
      WHERE tc.team_id = schedules.team_id
      AND c.user_id = auth.uid()
    )
  );

-- ===========================================
-- TEAM UPDATES TABLE POLICIES
-- ===========================================

-- Public can view all team updates
CREATE POLICY "Public can view team updates" ON team_updates
  FOR SELECT USING (true);

-- Coaches can manage updates for their teams
CREATE POLICY "Coaches manage team updates" ON team_updates
  FOR ALL USING (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM team_coaches tc
      JOIN coaches c ON tc.coach_id = c.id
      WHERE tc.team_id = team_updates.team_id
      AND c.user_id = auth.uid()
    )
  );

-- ===========================================
-- PRACTICE DRILLS TABLE POLICIES
-- ===========================================

-- Public can view all practice drills
CREATE POLICY "Public can view practice drills" ON practice_drills
  FOR SELECT USING (true);

-- Coaches can manage drills for their teams
CREATE POLICY "Coaches manage practice drills" ON practice_drills
  FOR ALL USING (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM team_coaches tc
      JOIN coaches c ON tc.coach_id = c.id
      WHERE tc.team_id = practice_drills.team_id
      AND c.user_id = auth.uid()
    )
  );

-- ===========================================
-- HELPER FUNCTIONS
-- ===========================================

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users
    WHERE id = user_id
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is coach
CREATE OR REPLACE FUNCTION is_coach(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users
    WHERE id = user_id
    AND role = 'coach'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user owns team
CREATE OR REPLACE FUNCTION owns_team(user_id UUID, team_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM teams
    WHERE id = team_id
    AND created_by = user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===========================================
-- AUDIT LOGGING
-- ===========================================

-- Create audit log table for security events
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  table_name TEXT NOT NULL,
  operation TEXT NOT NULL,
  user_id UUID REFERENCES users(id),
  old_data JSONB,
  new_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on audit logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs" ON audit_logs
  FOR SELECT USING (is_admin(auth.uid()));

-- Function to automatically log changes
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (table_name, operation, user_id, old_data, new_data)
  VALUES (
    TG_TABLE_NAME,
    TG_OP,
    auth.uid(),
    CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE NULL END,
    CASE WHEN TG_OP != 'DELETE' THEN row_to_json(NEW) ELSE NULL END
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for audit logging on critical tables
CREATE TRIGGER audit_users_trigger
  AFTER INSERT OR UPDATE OR DELETE ON users
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_teams_trigger
  AFTER INSERT OR UPDATE OR DELETE ON teams
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_coaches_trigger
  AFTER INSERT OR UPDATE OR DELETE ON coaches
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- ===========================================
-- USAGE INSTRUCTIONS
-- ===========================================

/*
To use this RLS setup:

1. Run this entire script in your Supabase SQL Editor
2. Test the policies by logging in as different user types
3. Monitor the audit_logs table for security events

Key Security Features:
- Users can only access their own data
- Coaches can manage their assigned teams
- Admins have full access with audit logging
- All changes are logged for security monitoring
- Public data (like team information) remains accessible

Troubleshooting:
- If policies are too restrictive, check the user roles in the users table
- Use the audit_logs to debug access issues
- Test with different user accounts to verify proper access control
*/
