-- =====================================================
-- RLS Performance Optimization Migration
-- Generated: January 2025
-- Purpose: Fix auth function re-evaluation in RLS policies
-- =====================================================

-- ISSUE: RLS policies are calling auth.uid() and auth.role() 
-- for each row, causing performance degradation.
-- SOLUTION: Wrap auth functions in SELECT to evaluate once per query.

-- =====================================================
-- 1. COACH_MESSAGES TABLE - Optimize RLS Policies
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Coaches and admins can insert messages" ON public.coach_messages;
DROP POLICY IF EXISTS "Coaches and admins can view non-deleted messages" ON public.coach_messages;
DROP POLICY IF EXISTS "Users can update own messages, admins can update any" ON public.coach_messages;
DROP POLICY IF EXISTS "Users can delete own messages, admins can delete any" ON public.coach_messages;

-- Recreate with optimized auth function calls
CREATE POLICY "Coaches and admins can insert messages"
  ON public.coach_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = (SELECT auth.uid())
      AND role IN ('coach', 'admin')
    )
  );

CREATE POLICY "Coaches and admins can view non-deleted messages"
  ON public.coach_messages
  FOR SELECT
  TO authenticated
  USING (
    deleted_at IS NULL
    AND EXISTS (
      SELECT 1 FROM public.users
      WHERE id = (SELECT auth.uid())
      AND role IN ('coach', 'admin')
    )
  );

CREATE POLICY "Users can update own messages, admins can update any"
  ON public.coach_messages
  FOR UPDATE
  TO authenticated
  USING (
    author_id = (SELECT auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.users
      WHERE id = (SELECT auth.uid())
      AND role = 'admin'
    )
  );

CREATE POLICY "Users can delete own messages, admins can delete any"
  ON public.coach_messages
  FOR UPDATE
  TO authenticated
  USING (
    author_id = (SELECT auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.users
      WHERE id = (SELECT auth.uid())
      AND role = 'admin'
    )
  );

-- =====================================================
-- 2. COACH_MESSAGE_REPLIES TABLE - Optimize RLS Policies
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Coaches and admins can insert replies" ON public.coach_message_replies;
DROP POLICY IF EXISTS "Coaches and admins can view non-deleted replies" ON public.coach_message_replies;
DROP POLICY IF EXISTS "Users can update own replies, admins can update any" ON public.coach_message_replies;
DROP POLICY IF EXISTS "Users can delete own replies, admins can delete any" ON public.coach_message_replies;

-- Recreate with optimized auth function calls
CREATE POLICY "Coaches and admins can insert replies"
  ON public.coach_message_replies
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = (SELECT auth.uid())
      AND role IN ('coach', 'admin')
    )
  );

CREATE POLICY "Coaches and admins can view non-deleted replies"
  ON public.coach_message_replies
  FOR SELECT
  TO authenticated
  USING (
    deleted_at IS NULL
    AND EXISTS (
      SELECT 1 FROM public.users
      WHERE id = (SELECT auth.uid())
      AND role IN ('coach', 'admin')
    )
  );

CREATE POLICY "Users can update own replies, admins can update any"
  ON public.coach_message_replies
  FOR UPDATE
  TO authenticated
  USING (
    author_id = (SELECT auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.users
      WHERE id = (SELECT auth.uid())
      AND role = 'admin'
    )
  );

CREATE POLICY "Users can delete own replies, admins can delete any"
  ON public.coach_message_replies
  FOR UPDATE
  TO authenticated
  USING (
    author_id = (SELECT auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.users
      WHERE id = (SELECT auth.uid())
      AND role = 'admin'
    )
  );

-- =====================================================
-- 3. PAYMENTS TABLE - Optimize RLS Policies
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Admins can insert payments" ON public.payments;
DROP POLICY IF EXISTS "Admins can update payments" ON public.payments;
DROP POLICY IF EXISTS "Admins can delete payments" ON public.payments;
DROP POLICY IF EXISTS "Admins can view all payments" ON public.payments;
DROP POLICY IF EXISTS "Parents can view own payments" ON public.payments;

-- Recreate with optimized auth function calls
CREATE POLICY "Admins can insert payments"
  ON public.payments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = (SELECT auth.uid())
      AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update payments"
  ON public.payments
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = (SELECT auth.uid())
      AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete payments"
  ON public.payments
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = (SELECT auth.uid())
      AND role = 'admin'
    )
  );

-- Combine the two SELECT policies into one for better performance
CREATE POLICY "Users can view payments based on role"
  ON public.payments
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = (SELECT auth.uid())
      AND (
        u.role = 'admin'
        OR (
          u.role = 'parent'
          AND EXISTS (
            SELECT 1 FROM public.players p
            WHERE p.id = payments.player_id
            AND p.parent_email = u.email
          )
        )
      )
    )
  );

-- =====================================================
-- 4. MESSAGE_NOTIFICATIONS TABLE - Optimize RLS Policies
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Authenticated users can create notifications" ON public.message_notifications;
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.message_notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.message_notifications;

-- Recreate with optimized auth function calls
CREATE POLICY "Authenticated users can create notifications"
  ON public.message_notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT auth.uid()) IS NOT NULL
  );

CREATE POLICY "Users can view their own notifications"
  ON public.message_notifications
  FOR SELECT
  TO authenticated
  USING (
    mentioned_user_id = (SELECT auth.uid())
  );

CREATE POLICY "Users can update their own notifications"
  ON public.message_notifications
  FOR UPDATE
  TO authenticated
  USING (
    mentioned_user_id = (SELECT auth.uid())
  );

-- =====================================================
-- VERIFICATION QUERY
-- =====================================================
-- Run this to verify all policies were updated correctly:
/*
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('coach_messages', 'coach_message_replies', 'payments', 'message_notifications')
ORDER BY tablename, policyname;
*/

