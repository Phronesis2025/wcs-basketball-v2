-- Message Notifications Migration
-- Create table for tracking @mention notifications

CREATE TABLE public.message_notifications (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  message_id uuid NOT NULL,
  reply_id uuid, -- NULL for main messages, UUID for replies
  mentioned_user_id uuid NOT NULL,
  mentioned_by_user_id uuid NOT NULL,
  mentioned_at timestamp with time zone DEFAULT now(),
  is_read boolean DEFAULT false,
  read_at timestamp with time zone,
  CONSTRAINT message_notifications_pkey PRIMARY KEY (id),
  CONSTRAINT message_notifications_message_id_fkey FOREIGN KEY (message_id) REFERENCES public.coach_messages(id) ON DELETE CASCADE,
  CONSTRAINT message_notifications_reply_id_fkey FOREIGN KEY (reply_id) REFERENCES public.coach_message_replies(id) ON DELETE CASCADE,
  CONSTRAINT message_notifications_mentioned_user_id_fkey FOREIGN KEY (mentioned_user_id) REFERENCES public.users(id) ON DELETE CASCADE,
  CONSTRAINT message_notifications_mentioned_by_user_id_fkey FOREIGN KEY (mentioned_by_user_id) REFERENCES public.users(id) ON DELETE CASCADE
);

-- Add RLS policies
CREATE POLICY "Users can view their own notifications" ON public.message_notifications FOR SELECT
USING (mentioned_user_id = auth.uid());

CREATE POLICY "Users can update their own notifications" ON public.message_notifications FOR UPDATE
USING (mentioned_user_id = auth.uid());

CREATE POLICY "Authenticated users can create notifications" ON public.message_notifications FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Add indexes for performance
CREATE INDEX idx_message_notifications_mentioned_user_id ON public.message_notifications(mentioned_user_id);
CREATE INDEX idx_message_notifications_is_read ON public.message_notifications(is_read);
CREATE INDEX idx_message_notifications_message_id ON public.message_notifications(message_id);
CREATE INDEX idx_message_notifications_mentioned_at ON public.message_notifications(mentioned_at);
