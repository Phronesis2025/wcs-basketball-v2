-- Add parent_first_name and parent_last_name fields to players table
-- Created: January 2025
-- Purpose: Allow storing parent first and last name separately

-- Add parent_first_name column
ALTER TABLE public.players
ADD COLUMN IF NOT EXISTS parent_first_name text;

-- Add parent_last_name column
ALTER TABLE public.players
ADD COLUMN IF NOT EXISTS parent_last_name text;

-- Add comments for documentation
COMMENT ON COLUMN public.players.parent_first_name IS 'Parent first name';
COMMENT ON COLUMN public.players.parent_last_name IS 'Parent last name';

