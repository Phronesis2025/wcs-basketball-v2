-- Add column to track if notification has been acknowledged
ALTER TABLE public.message_notifications
ADD COLUMN IF NOT EXISTS acknowledged_at timestamp with time zone;

-- Update existing is_read logic - a notification is read when acknowledged
-- Keep existing is_read column for backward compatibility
-- acknowledged_at will be the new source of truth

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_message_notifications_acknowledged 
ON public.message_notifications(acknowledged_at);

-- Add index for unread queries
CREATE INDEX IF NOT EXISTS idx_message_notifications_unread 
ON public.message_notifications(mentioned_user_id, acknowledged_at) 
WHERE acknowledged_at IS NULL;
