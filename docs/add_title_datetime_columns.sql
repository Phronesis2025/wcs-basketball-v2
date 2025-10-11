-- Add title column to schedules table
ALTER TABLE public.schedules ADD COLUMN title TEXT;

-- Add date_time column to team_updates table
ALTER TABLE public.team_updates ADD COLUMN date_time TIMESTAMP WITHOUT TIME ZONE;

-- Update the event_type CHECK constraint to include 'Update'
ALTER TABLE public.schedules DROP CONSTRAINT IF EXISTS schedules_event_type_check;
ALTER TABLE public.schedules ADD CONSTRAINT schedules_event_type_check 
  CHECK (event_type = ANY (ARRAY['Game'::text, 'Practice'::text, 'Tournament'::text, 'Meeting'::text, 'Update'::text]));

-- Add comments to explain the new columns
COMMENT ON COLUMN public.schedules.title IS 'Title of the event (used for updates with date_time)';
COMMENT ON COLUMN public.team_updates.date_time IS 'Optional date/time for updates to appear on schedule calendar';
