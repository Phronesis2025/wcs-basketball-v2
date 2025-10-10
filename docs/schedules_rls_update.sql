-- Update RLS policies for schedules table to support program-wide schedules
-- Run this in your Supabase SQL Editor

-- Drop the existing policy
DROP POLICY IF EXISTS "Coaches manage team schedules" ON schedules;

-- Create new policy that allows:
-- 1. Coaches to manage schedules for their assigned teams
-- 2. Admins to create program-wide schedules (is_global = true)
CREATE POLICY "Coaches and admins manage schedules" ON schedules
  FOR ALL USING (
    auth.role() = 'authenticated' AND (
      -- Coaches can manage schedules for their assigned teams
      EXISTS (
        SELECT 1 FROM team_coaches tc
        JOIN coaches c ON tc.coach_id = c.id
        WHERE tc.team_id = schedules.team_id
        AND c.user_id = auth.uid()
      )
      OR
      -- Admins can create program-wide schedules
      (
        schedules.is_global = true AND
        EXISTS (
          SELECT 1 FROM users
          WHERE users.id = auth.uid()
          AND users.role = 'admin'
        )
      )
    )
  );

-- Also allow admins to manage all schedules (for full admin control)
CREATE POLICY "Admins can manage all schedules" ON schedules
  FOR ALL USING (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );
