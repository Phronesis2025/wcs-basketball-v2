-- Migration: Add external_id to players and create imports table
-- Date: 2025-01-XX
-- Purpose: Support Excel import with external system IDs and import logging

-- Add external_id column to players table (optional, for matching with external systems)
ALTER TABLE public.players
ADD COLUMN IF NOT EXISTS external_id text;

-- Create unique index on external_id (allows nulls but enforces uniqueness for non-null values)
CREATE UNIQUE INDEX IF NOT EXISTS players_external_id_unique_idx 
ON public.players(external_id) 
WHERE external_id IS NOT NULL;

-- Create imports table for logging import jobs
CREATE TABLE IF NOT EXISTS public.imports (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  status text NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'partial', 'failed', 'dry_run')),
  created_by uuid NOT NULL,
  summary_json jsonb,
  error_json jsonb,
  started_at timestamp with time zone,
  finished_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT imports_pkey PRIMARY KEY (id),
  CONSTRAINT imports_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id)
);

-- Add index on created_by for faster queries
CREATE INDEX IF NOT EXISTS imports_created_by_idx ON public.imports(created_by);

-- Add index on status for filtering
CREATE INDEX IF NOT EXISTS imports_status_idx ON public.imports(status);

-- Add index on created_at for sorting
CREATE INDEX IF NOT EXISTS imports_created_at_idx ON public.imports(created_at DESC);

-- Enable RLS on imports table
ALTER TABLE public.imports ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Only admins can view imports
CREATE POLICY "Admins can view all imports"
ON public.imports
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

-- RLS Policy: Only admins can create imports
CREATE POLICY "Admins can create imports"
ON public.imports
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

-- RLS Policy: Only admins can update imports
CREATE POLICY "Admins can update imports"
ON public.imports
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

