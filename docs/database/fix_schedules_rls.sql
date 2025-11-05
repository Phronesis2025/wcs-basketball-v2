-- Fix schedules RLS policies to allow proper access
-- Run this in your Supabase SQL Editor

-- Drop ALL existing policies on schedules table
DROP POLICY IF EXISTS "Coaches and admins manage schedules" ON public.schedules;
DROP POLICY IF EXISTS "Admins can manage all schedules" ON public.schedules;
DROP POLICY IF EXISTS "Public view schedules" ON public.schedules;
DROP POLICY IF EXISTS "Coaches manage team schedules" ON public.schedules;
DROP POLICY IF EXISTS "Public can view schedules" ON public.schedules;
DROP POLICY IF EXISTS "schedules_public_read" ON public.schedules;
DROP POLICY IF EXISTS "schedules_authenticated_insert" ON public.schedules;
DROP POLICY IF EXISTS "schedules_authenticated_update" ON public.schedules;
DROP POLICY IF EXISTS "schedules_authenticated_delete" ON public.schedules;
DROP POLICY IF EXISTS "schedules_admin_manage" ON public.schedules;
DROP POLICY IF EXISTS "schedules_coach_manage" ON public.schedules;

-- Create new permissive policies that work with the application
-- Allow all authenticated users to read schedules
CREATE POLICY "schedules_public_read" ON public.schedules
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow all authenticated users to insert schedules (for now, to fix the immediate issue)
CREATE POLICY "schedules_authenticated_insert" ON public.schedules
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow all authenticated users to update schedules
CREATE POLICY "schedules_authenticated_update" ON public.schedules
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow all authenticated users to delete schedules
CREATE POLICY "schedules_authenticated_delete" ON public.schedules
  FOR DELETE
  TO authenticated
  USING (true);

-- Also fix team_updates RLS policies - drop ALL existing policies
DROP POLICY IF EXISTS "Coaches and admins manage team updates" ON public.team_updates;
DROP POLICY IF EXISTS "Public can view team updates" ON public.team_updates;
DROP POLICY IF EXISTS "Admins manage team updates" ON public.team_updates;
DROP POLICY IF EXISTS "team_updates_public_read" ON public.team_updates;
DROP POLICY IF EXISTS "team_updates_authenticated_insert" ON public.team_updates;
DROP POLICY IF EXISTS "team_updates_authenticated_update" ON public.team_updates;
DROP POLICY IF EXISTS "team_updates_authenticated_delete" ON public.team_updates;
DROP POLICY IF EXISTS "team_updates_admin_manage" ON public.team_updates;
DROP POLICY IF EXISTS "team_updates_coach_manage" ON public.team_updates;

-- Create new permissive policies for team_updates
CREATE POLICY "team_updates_public_read" ON public.team_updates
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "team_updates_authenticated_insert" ON public.team_updates
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "team_updates_authenticated_update" ON public.team_updates
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "team_updates_authenticated_delete" ON public.team_updates
  FOR DELETE
  TO authenticated
  USING (true);
