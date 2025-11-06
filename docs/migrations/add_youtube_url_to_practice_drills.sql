-- Migration: Add youtube_url column to practice_drills table
-- Date: 2025-01-XX
-- Purpose: Support YouTube video URLs for practice drills

-- Add youtube_url column to practice_drills table (optional, for YouTube video links)
ALTER TABLE public.practice_drills
ADD COLUMN IF NOT EXISTS youtube_url text;

