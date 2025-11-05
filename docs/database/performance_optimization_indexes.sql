-- Performance Optimization: Add Critical Database Indexes
-- This addresses the performance issues identified in the audit

-- Message board performance indexes
CREATE INDEX IF NOT EXISTS idx_coach_messages_created_at ON coach_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_coach_messages_author_id ON coach_messages(author_id);
CREATE INDEX IF NOT EXISTS idx_coach_messages_deleted_at ON coach_messages(deleted_at);
CREATE INDEX IF NOT EXISTS idx_coach_messages_is_pinned ON coach_messages(is_pinned);

-- Message replies performance indexes
CREATE INDEX IF NOT EXISTS idx_coach_message_replies_message_id ON coach_message_replies(message_id);
CREATE INDEX IF NOT EXISTS idx_coach_message_replies_author_id ON coach_message_replies(author_id);
CREATE INDEX IF NOT EXISTS idx_coach_message_replies_deleted_at ON coach_message_replies(deleted_at);
CREATE INDEX IF NOT EXISTS idx_coach_message_replies_created_at ON coach_message_replies(created_at DESC);

-- Message notifications performance indexes
CREATE INDEX IF NOT EXISTS idx_message_notifications_mentioned_user_id ON message_notifications(mentioned_user_id);
CREATE INDEX IF NOT EXISTS idx_message_notifications_acknowledged_at ON message_notifications(acknowledged_at);
CREATE INDEX IF NOT EXISTS idx_message_notifications_unread ON message_notifications(mentioned_user_id, acknowledged_at) WHERE acknowledged_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_message_notifications_mentioned_at ON message_notifications(mentioned_at DESC);

-- Team and player performance indexes
CREATE INDEX IF NOT EXISTS idx_schedules_team_id ON schedules(team_id);
CREATE INDEX IF NOT EXISTS idx_schedules_date ON schedules(date);
CREATE INDEX IF NOT EXISTS idx_team_updates_team_id ON team_updates(team_id);
CREATE INDEX IF NOT EXISTS idx_team_updates_created_at ON team_updates(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_players_team_id ON players(team_id);
CREATE INDEX IF NOT EXISTS idx_players_is_deleted ON players(is_deleted);
CREATE INDEX IF NOT EXISTS idx_players_name ON players(name);

-- User performance indexes
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC);

-- Practice drills performance indexes
CREATE INDEX IF NOT EXISTS idx_practice_drills_team_id ON practice_drills(team_id);
CREATE INDEX IF NOT EXISTS idx_practice_drills_category ON practice_drills(category);
CREATE INDEX IF NOT EXISTS idx_practice_drills_difficulty ON practice_drills(difficulty);
CREATE INDEX IF NOT EXISTS idx_practice_drills_created_at ON practice_drills(created_at DESC);

-- Analytics and logging performance indexes
CREATE INDEX IF NOT EXISTS idx_error_logs_created_at ON error_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_error_logs_severity ON error_logs(severity);
CREATE INDEX IF NOT EXISTS idx_error_logs_resolved ON error_logs(resolved);
CREATE INDEX IF NOT EXISTS idx_login_logs_user_id ON login_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_login_logs_created_at ON login_logs(created_at DESC);

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_coach_messages_active ON coach_messages(deleted_at, is_pinned, created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_players_active_by_team ON players(team_id, is_deleted, name) WHERE is_deleted = false;
CREATE INDEX IF NOT EXISTS idx_schedules_upcoming ON schedules(team_id, date) WHERE date >= CURRENT_DATE;

-- Analyze tables to update statistics
ANALYZE coach_messages;
ANALYZE coach_message_replies;
ANALYZE message_notifications;
ANALYZE schedules;
ANALYZE team_updates;
ANALYZE players;
ANALYZE users;
ANALYZE practice_drills;
ANALYZE error_logs;
ANALYZE login_logs;
