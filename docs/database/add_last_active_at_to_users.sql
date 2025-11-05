-- Add last_active_at column to public.users to support activity heartbeat
-- Safe to run multiple times; IF NOT EXISTS guards prevent duplicate errors

DO $$
BEGIN
  -- Add column if it does not exist
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'users'
      AND column_name = 'last_active_at'
  ) THEN
    ALTER TABLE public.users
      ADD COLUMN last_active_at timestamptz NULL;
  END IF;

  -- Optional index to speed up recent-activity queries
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname = 'public' AND indexname = 'idx_users_last_active_at'
  ) THEN
    CREATE INDEX idx_users_last_active_at ON public.users (last_active_at DESC);
  END IF;
END$$;


