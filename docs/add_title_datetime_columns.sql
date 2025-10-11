-- Add title column to schedules table
ALTER TABLE schedules ADD COLUMN title TEXT;

-- Add date_time column to team_updates table
ALTER TABLE team_updates ADD COLUMN date_time TIMESTAMPTZ;

-- Update the event_type enum to include 'Update'
ALTER TYPE event_type_enum ADD VALUE 'Update';

-- Add comment to explain the new columns
COMMENT ON COLUMN schedules.title IS 'Title of the event (used for updates with date_time)';
COMMENT ON COLUMN team_updates.date_time IS 'Optional date/time for updates to appear on schedule calendar';
