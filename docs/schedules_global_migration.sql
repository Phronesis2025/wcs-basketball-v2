-- Add is_global column to schedules table for program-wide schedules
-- Run this in your Supabase SQL editor

-- Add the is_global column to schedules table
ALTER TABLE IF EXISTS public.schedules 
ADD COLUMN IF NOT EXISTS is_global BOOLEAN DEFAULT false NOT NULL;

-- Create index for better performance on global schedules
CREATE INDEX IF NOT EXISTS schedules_is_global_idx ON public.schedules(is_global);

-- Create index for combined team_id and is_global queries
CREATE INDEX IF NOT EXISTS schedules_team_global_idx ON public.schedules(team_id, is_global);

-- Update existing schedules to ensure they are not global (should already be false due to default)
UPDATE public.schedules SET is_global = false WHERE is_global IS NULL;
