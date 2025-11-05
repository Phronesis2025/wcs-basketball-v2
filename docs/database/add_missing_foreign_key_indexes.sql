-- =====================================================
-- Add Missing Foreign Key Indexes
-- Generated: January 2025
-- Purpose: Add indexes for unindexed foreign keys
-- =====================================================

-- ISSUE: Foreign keys without covering indexes can impact query performance
-- TABLES AFFECTED: message_notifications

-- =====================================================
-- MESSAGE_NOTIFICATIONS TABLE - Add Missing FK Indexes
-- =====================================================

-- Index for mentioned_by_user_id foreign key
CREATE INDEX IF NOT EXISTS idx_message_notifications_mentioned_by_user_id
  ON public.message_notifications(mentioned_by_user_id);

-- Index for reply_id foreign key (nullable, so include WHERE clause)
CREATE INDEX IF NOT EXISTS idx_message_notifications_reply_id
  ON public.message_notifications(reply_id)
  WHERE reply_id IS NOT NULL;

-- =====================================================
-- COMPOSITE INDEXES FOR COMMON QUERIES
-- =====================================================

-- Composite index for querying notifications by user and read status
CREATE INDEX IF NOT EXISTS idx_message_notifications_user_read
  ON public.message_notifications(mentioned_user_id, is_read, mentioned_at DESC);

-- Composite index for message-related queries
CREATE INDEX IF NOT EXISTS idx_message_notifications_message_reply
  ON public.message_notifications(message_id, reply_id)
  WHERE deleted_at IS NULL;

-- =====================================================
-- ANALYZE TABLE
-- =====================================================
-- Update table statistics for query planner
ANALYZE public.message_notifications;

-- =====================================================
-- VERIFICATION QUERY
-- =====================================================
-- Run this to verify all indexes were created:
/*
SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename = 'message_notifications'
ORDER BY indexname;
*/

