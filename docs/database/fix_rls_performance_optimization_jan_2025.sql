-- Fix RLS Performance Issues - January 2025
-- Optimizes RLS policies by replacing auth.uid() with (select auth.uid())
-- This prevents re-evaluation for each row and improves query performance at scale

-- Fix imports table policies
DROP POLICY IF EXISTS "Admins can view all imports" ON public.imports;
CREATE POLICY "Admins can view all imports"
ON public.imports
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM users
    WHERE ((users.id = (SELECT auth.uid())) AND (users.role = 'admin'::text))
  )
);

DROP POLICY IF EXISTS "Admins can create imports" ON public.imports;
CREATE POLICY "Admins can create imports"
ON public.imports
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM users
    WHERE ((users.id = (SELECT auth.uid())) AND (users.role = 'admin'::text))
  )
);

DROP POLICY IF EXISTS "Admins can update imports" ON public.imports;
CREATE POLICY "Admins can update imports"
ON public.imports
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM users
    WHERE ((users.id = (SELECT auth.uid())) AND (users.role = 'admin'::text))
  )
);

-- Fix performance_metrics table policy
DROP POLICY IF EXISTS "Admins can read performance metrics" ON public.performance_metrics;
CREATE POLICY "Admins can read performance metrics"
ON public.performance_metrics
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM users
    WHERE ((users.id = (SELECT auth.uid())) AND (users.role = 'admin'::text))
  )
);

-- Fix web_vitals table policy
DROP POLICY IF EXISTS "Admins can read web vitals" ON public.web_vitals;
CREATE POLICY "Admins can read web vitals"
ON public.web_vitals
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM users
    WHERE ((users.id = (SELECT auth.uid())) AND (users.role = 'admin'::text))
  )
);

