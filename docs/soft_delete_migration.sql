-- Soft Delete Migration
-- Add is_active columns to coaches, teams, and players tables

-- Add is_active column to coaches table
ALTER TABLE public.coaches 
ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;

-- Add is_active column to teams table  
ALTER TABLE public.teams 
ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;

-- Add is_active column to players table
ALTER TABLE public.players 
ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;

-- Update existing records to be active by default
UPDATE public.coaches SET is_active = true WHERE is_active IS NULL;
UPDATE public.teams SET is_active = true WHERE is_active IS NULL;
UPDATE public.players SET is_active = true WHERE is_active IS NULL;

-- Add indexes for better performance on is_active queries
CREATE INDEX IF NOT EXISTS idx_coaches_is_active ON public.coaches(is_active);
CREATE INDEX IF NOT EXISTS idx_teams_is_active ON public.teams(is_active);
CREATE INDEX IF NOT EXISTS idx_players_is_active ON public.players(is_active);

-- Update RLS policies to only show active items by default
-- (Keep existing policies, but add filters in application logic)
