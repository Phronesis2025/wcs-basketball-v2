-- Add recurring_group_id column to schedules table
-- This allows grouping related recurring events together

ALTER TABLE schedules 
ADD COLUMN recurring_group_id TEXT;

-- Add index for better performance when querying by group
CREATE INDEX idx_schedules_recurring_group_id ON schedules(recurring_group_id);

-- Add comment to document the column
COMMENT ON COLUMN schedules.recurring_group_id IS 'Groups related recurring events together. NULL for non-recurring events.';
