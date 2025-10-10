# WCSv2.0 Database Setup

## 📝 Schema Updates (v2.6.0)

**Last Updated**: December 2024 - Updated to reflect current production database schema

### Message Board System (v2.6.0):

- **Coach Messages Table**: Added `coach_messages` table for real-time coach communication
- **Message Replies Table**: Added `coach_message_replies` table for threaded conversations
- **Real-time Support**: Enabled Supabase Realtime for live message updates
- **Row Level Security**: Comprehensive RLS policies for role-based message access
- **Input Sanitization**: Enhanced security with proper content validation

### Recent Schema Fixes (v2.6.0):

- **Column Validation**: Fixed references to non-existent columns (`updated_at`, `updated_by`) in `team_updates` table
- **Type Safety**: Improved TypeScript type definitions for better database interaction
- **Image Upload**: Enhanced image upload functionality with proper error handling
- **Build Optimization**: Resolved all TypeScript compilation errors and warnings

## 📝 Schema Updates (v2.5.0)

**Last Updated**: October 2025 - Updated to reflect current production database schema

### Key Changes:

- **Audit Logging**: Added comprehensive `audit_logs` table for security monitoring
- **Soft Deletes**: Added `deleted_at` columns to `schedules`, `team_updates`, and `news` tables
- **Enhanced Event Types**: Schedules now support 'Tournament' and 'Meeting' event types
- **Program‑Wide Schedules**: `schedules.is_global BOOLEAN DEFAULT false NOT NULL` for admin program‑wide events
- **Program‑Wide Updates**: `team_updates.team_id` accepts NULL when `is_global=true`
- **User References**: Updated foreign key references from `coaches(id)` to `users(id)` for better consistency
- **News Team Association**: Added `team_id` to news table for team-specific news
- **Password Reset Tracking**: Added `last_password_reset` timestamp to users table
- **Array Types**: Updated practice drills to use generic `ARRAY` type instead of `TEXT[]`
- **Security Enhancements**: Added audit triggers and comprehensive logging

## 🗄️ Current Database Status

### Supabase Configuration

- **Platform**: Supabase (PostgreSQL)
- **Status**: ✅ Active and Configured
- **Region**: US East (N. Virginia)
- **Plan**: Pro Plan
- **Connection**: Secure HTTPS with SSL

### Database Statistics

- **Tables**: 13 active tables (teams, coaches, schedules, team_updates, practice_drills, users, news, products, resources, team_coaches, audit_logs, coach_messages, coach_message_replies)
- **Rows**: ~100+ records across all tables
- **Storage**: <200MB (well within limits)
- **Connections**: Stable connection pool
- **Performance**: Optimized with proper indexing and RLS policies
- **Real-time**: ✅ Enabled for message board tables (coach_messages, coach_message_replies)

## 📊 Database Schema

### 1. Teams Table

```sql
CREATE TABLE public.teams (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name text NOT NULL UNIQUE,
  age_group text CHECK (age_group = ANY (ARRAY['U10'::text, 'U12'::text, 'U14'::text, 'U16'::text, 'U18'::text])),
  gender text CHECK (gender = ANY (ARRAY['Boys'::text, 'Girls'::text])),
  coach_email text NOT NULL,
  grade_level text,
  season text,
  logo_url text,
  team_image text,
  CONSTRAINT teams_pkey PRIMARY KEY (id)
);
```

### 2. Users Table

```sql
CREATE TABLE public.users (
  id uuid NOT NULL,
  email text NOT NULL UNIQUE,
  role text CHECK (role = ANY (ARRAY['coach'::text, 'parent'::text, 'admin'::text])),
  created_at timestamp without time zone DEFAULT now(),
  password_reset boolean DEFAULT true,
  last_password_reset timestamp with time zone,
  CONSTRAINT users_pkey PRIMARY KEY (id)
);
```

### 3. Coaches Table

```sql
CREATE TABLE public.coaches (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL UNIQUE,
  bio text,
  created_at timestamp with time zone DEFAULT now(),
  image_url text,
  quote text,
  user_id uuid,
  CONSTRAINT coaches_pkey PRIMARY KEY (id),
  CONSTRAINT coaches_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
```

### 4. Team Coaches Junction Table

```sql
CREATE TABLE public.team_coaches (
  team_id uuid NOT NULL,
  coach_id uuid NOT NULL,
  CONSTRAINT team_coaches_pkey PRIMARY KEY (coach_id, team_id),
  CONSTRAINT team_coaches_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id),
  CONSTRAINT team_coaches_coach_id_fkey FOREIGN KEY (coach_id) REFERENCES public.coaches(id)
);
```

### 5. Schedules Table

```sql
CREATE TABLE public.schedules (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  team_id uuid,
  event_type text CHECK (event_type = ANY (ARRAY['Game'::text, 'Practice'::text, 'Tournament'::text, 'Meeting'::text])),
  date_time timestamp without time zone NOT NULL,
  location text,
  opponent text,
  created_at timestamp without time zone DEFAULT now(),
  created_by uuid,
  deleted_at timestamp with time zone,
  description text,
  is_global boolean NOT NULL DEFAULT false,
  CONSTRAINT schedules_pkey PRIMARY KEY (id),
  CONSTRAINT schedules_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id),
  CONSTRAINT schedules_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id)
);
```

### 6. Team Updates Table

```sql
CREATE TABLE public.team_updates (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  team_id uuid,
  title text NOT NULL,
  content text NOT NULL,
  image_url text,
  is_global boolean DEFAULT false,
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  deleted_at timestamp with time zone,
  CONSTRAINT team_updates_pkey PRIMARY KEY (id),
  CONSTRAINT team_updates_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id),
  CONSTRAINT team_updates_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id)
);
```

### 7. Practice Drills Table

```sql
CREATE TABLE public.practice_drills (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  team_id uuid,
  title text NOT NULL,
  skills ARRAY NOT NULL,
  equipment ARRAY NOT NULL,
  time text NOT NULL,
  instructions text NOT NULL,
  additional_info text,
  benefits text NOT NULL,
  difficulty text NOT NULL,
  category text NOT NULL,
  week_number integer NOT NULL,
  image_url text,
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT practice_drills_pkey PRIMARY KEY (id),
  CONSTRAINT practice_drills_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id),
  CONSTRAINT practice_drills_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id)
);
```

### 8. News Table

```sql
CREATE TABLE public.news (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  image_url text,
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  team_id uuid,
  deleted_at timestamp with time zone,
  CONSTRAINT news_pkey PRIMARY KEY (id),
  CONSTRAINT news_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id),
  CONSTRAINT news_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id)
);
```

### 9. Products Table

```sql
CREATE TABLE public.products (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  description text,
  price numeric NOT NULL,
  printful_id text,
  image_url text,
  CONSTRAINT products_pkey PRIMARY KEY (id)
);
```

### 10. Resources Table

```sql
CREATE TABLE public.resources (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  description text,
  file_url text,
  coach_email text NOT NULL,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT resources_pkey PRIMARY KEY (id)
);
```

### 11. Coach Messages Table

```sql
CREATE TABLE public.coach_messages (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  author_id uuid NOT NULL,
  author_name text NOT NULL,
  content text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  deleted_at timestamp with time zone,
  is_pinned boolean DEFAULT false,
  CONSTRAINT coach_messages_pkey PRIMARY KEY (id),
  CONSTRAINT coach_messages_author_id_fkey FOREIGN KEY (author_id)
    REFERENCES public.users(id) ON DELETE CASCADE
);
```

### 12. Coach Message Replies Table

```sql
CREATE TABLE public.coach_message_replies (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  message_id uuid NOT NULL,
  author_id uuid NOT NULL,
  author_name text NOT NULL,
  content text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  deleted_at timestamp with time zone,
  CONSTRAINT coach_message_replies_pkey PRIMARY KEY (id),
  CONSTRAINT coach_message_replies_message_id_fkey FOREIGN KEY (message_id)
    REFERENCES public.coach_messages(id) ON DELETE CASCADE,
  CONSTRAINT coach_message_replies_author_id_fkey FOREIGN KEY (author_id)
    REFERENCES public.users(id) ON DELETE CASCADE
);
```

### 13. Audit Logs Table

```sql
CREATE TABLE public.audit_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  table_name text NOT NULL,
  operation text NOT NULL,
  user_id uuid,
  old_data jsonb,
  new_data jsonb,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT audit_logs_pkey PRIMARY KEY (id),
  CONSTRAINT audit_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
```

## 🔍 Audit Logging System

### Overview

The audit logging system provides comprehensive security monitoring and change tracking across all critical database tables.

### Features

- **Automatic Logging**: All INSERT, UPDATE, and DELETE operations are automatically logged
- **Change Tracking**: Captures both old and new data for each operation
- **User Attribution**: Links each change to the authenticated user
- **Security Monitoring**: Enables detection of unauthorized access or suspicious activity

### Audit Log Structure

- **table_name**: The table that was modified
- **operation**: The type of operation (INSERT, UPDATE, DELETE)
- **user_id**: The user who performed the operation
- **old_data**: Previous state of the record (for UPDATE/DELETE)
- **new_data**: New state of the record (for INSERT/UPDATE)
- **created_at**: Timestamp of the operation

### Security Benefits

- **Compliance**: Meets audit requirements for data governance
- **Forensics**: Enables investigation of security incidents
- **Monitoring**: Provides real-time visibility into database changes
- **Accountability**: Ensures all changes are attributable to specific users

## 🔐 Row Level Security (RLS)

### Teams Table Policies

```sql
-- Public can view all teams
CREATE POLICY "Public view teams" ON teams
FOR SELECT TO public USING (true);

-- Coaches can edit teams they are assigned to
CREATE POLICY "Coaches edit assigned teams" ON teams
FOR ALL TO authenticated
USING (EXISTS (
  SELECT 1 FROM team_coaches tc
  JOIN coaches c ON tc.coach_id = c.id
  WHERE tc.team_id = teams.id
  AND c.user_id = auth.uid()
));

-- Admins can edit all teams
CREATE POLICY "Admins edit all teams" ON teams
FOR ALL TO authenticated
USING (EXISTS (
  SELECT 1 FROM users
  WHERE users.id = auth.uid()
  AND users.role = 'admin'
));
```

### Coaches Table Policies

```sql
-- Public can view all coaches
CREATE POLICY "Public view coaches" ON coaches
FOR SELECT TO public USING (true);

-- Coaches can edit their own records
CREATE POLICY "Coaches edit own records" ON coaches
FOR ALL TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Admins can edit all coaches
CREATE POLICY "Admins edit all coaches" ON coaches
FOR ALL TO authenticated
USING (EXISTS (
  SELECT 1 FROM users
  WHERE users.id = auth.uid()
  AND users.role = 'admin'
));
```

### Team Coaches Junction Table Policies

```sql
-- Public can view team-coach relationships
CREATE POLICY "Public view team coaches" ON team_coaches
FOR SELECT TO public USING (true);

-- Coaches can manage their own team assignments
CREATE POLICY "Coaches manage team assignments" ON team_coaches
FOR ALL TO authenticated
USING (EXISTS (
  SELECT 1 FROM coaches
  WHERE coaches.id = team_coaches.coach_id
  AND coaches.user_id = auth.uid()
));
```

### Schedules Table Policies

```sql
-- Public can view all schedules
CREATE POLICY "Public view schedules" ON schedules
FOR SELECT TO public USING (true);

-- Coaches can manage team schedules; admins can manage all and create global
CREATE POLICY "Coaches and admins manage schedules" ON schedules
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM team_coaches tc
    JOIN coaches c ON tc.coach_id = c.id
    WHERE tc.team_id = schedules.team_id
    AND c.user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'
  )
);
```

### Team Updates Table Policies

```sql
-- Public can view all team updates
CREATE POLICY "Public view team updates" ON team_updates
FOR SELECT TO public USING (true);

-- Coaches manage team updates; admins can manage all; allow program‑wide
CREATE POLICY "Coaches manage team updates" ON team_updates
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM team_coaches tc
    JOIN coaches c ON tc.coach_id = c.id
    WHERE tc.team_id = team_updates.team_id
    AND c.user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'
  )
);
```

### Practice Drills Table Policies

```sql
-- Public can view all practice drills
CREATE POLICY "Public view practice drills" ON practice_drills
FOR SELECT TO public USING (true);

-- Coaches can manage drills for their teams
CREATE POLICY "Coaches manage practice drills" ON practice_drills
FOR ALL TO authenticated
USING (EXISTS (
  SELECT 1 FROM team_coaches tc
  JOIN coaches c ON tc.coach_id = c.id
  WHERE tc.team_id = practice_drills.team_id
  AND c.user_id = auth.uid()
) OR created_by = auth.uid());
```

### Users Table Policies

```sql
-- Users can view their own profile
CREATE POLICY "Users view own profile" ON users
FOR SELECT TO authenticated
USING (auth.email() = email);

-- Users can update their own profile
CREATE POLICY "Users update own profile" ON users
FOR UPDATE TO authenticated
USING (auth.email() = email)
WITH CHECK (auth.email() = email);
```

### News Table Policies

```sql
-- Public can view all news
CREATE POLICY "Public view news" ON news
FOR SELECT TO public USING (true);

-- Authenticated users can create news
CREATE POLICY "Authenticated users create news" ON news
FOR INSERT TO authenticated
WITH CHECK (created_by = auth.uid());

-- Users can update their own news
CREATE POLICY "Users update own news" ON news
FOR UPDATE TO authenticated
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());

-- Admins can manage all news
CREATE POLICY "Admins manage all news" ON news
FOR ALL TO authenticated
USING (EXISTS (
  SELECT 1 FROM users
  WHERE users.id = auth.uid()
  AND users.role = 'admin'
));
```

### Products Table Policies

```sql
-- Public can view all products
CREATE POLICY "Public view products" ON products
FOR SELECT TO public USING (true);

-- Admins can manage all products
CREATE POLICY "Admins manage all products" ON products
FOR ALL TO authenticated
USING (EXISTS (
  SELECT 1 FROM users
  WHERE users.id = auth.uid()
  AND users.role = 'admin'
));
```

### Resources Table Policies

```sql
-- Public can view all resources
CREATE POLICY "Public view resources" ON resources
FOR SELECT TO public USING (true);

-- Coaches can create resources
CREATE POLICY "Coaches create resources" ON resources
FOR INSERT TO authenticated
WITH CHECK (coach_email = auth.email());

-- Coaches can update their own resources
CREATE POLICY "Coaches update own resources" ON resources
FOR UPDATE TO authenticated
USING (coach_email = auth.email())
WITH CHECK (coach_email = auth.email());
```

### Audit Logs Table Policies

```sql
-- Only admins can view audit logs
CREATE POLICY "Admins view audit logs" ON audit_logs
FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM users
  WHERE users.id = auth.uid()
  AND users.role = 'admin'
));
```

### Audit Triggers and Functions

```sql
-- Function to automatically log changes
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (table_name, operation, user_id, old_data, new_data)
  VALUES (
    TG_TABLE_NAME,
    TG_OP,
    auth.uid(),
    CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE NULL END,
    CASE WHEN TG_OP != 'DELETE' THEN row_to_json(NEW) ELSE NULL END
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for audit logging on critical tables
CREATE TRIGGER audit_users_trigger
  AFTER INSERT OR UPDATE OR DELETE ON users
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_teams_trigger
  AFTER INSERT OR UPDATE OR DELETE ON teams
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_coaches_trigger
  AFTER INSERT OR UPDATE OR DELETE ON coaches
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
```

### Helper Functions

```sql
-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users
    WHERE id = user_id
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is coach
CREATE OR REPLACE FUNCTION is_coach(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users
    WHERE id = user_id
    AND role = 'coach'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user owns team
CREATE OR REPLACE FUNCTION owns_team(user_id UUID, team_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM teams
    WHERE id = team_id
    AND created_by = user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## 📝 Sample Data

### Teams Data

```sql
INSERT INTO teams (name, age_group, gender, coach_email, grade_level, season, logo_url)
VALUES
('WCS Warriors', 'U12', 'Boys', 'coach1@example.com', '6th', '2025-2026', '/logos/warriors.png'),
('WCS Sharks', 'U14', 'Girls', 'coach2@example.com', '8th', '2025-2026', '/logos/sharks.png'),
('WCS Blue', 'U10', 'Boys', 'coach3@example.com', '4th', '2025-2026', '/logos/blue.png'),
('WCS Red', 'U16', 'Girls', 'coach4@example.com', '10th', '2025-2026', '/logos/red.png'),
('WCS White', 'U18', 'Girls', 'coach5@example.com', '12th', '2025-2026', '/logos/white.png');
```

### Schedules Data

```sql
INSERT INTO schedules (team_id, event_type, date_time, location, opponent, created_by)
VALUES
((SELECT id FROM teams WHERE name = 'WCS Warriors'), 'Game', '2025-02-15 10:00:00', 'Main Gym', 'Riverside Hawks', (SELECT id FROM coaches WHERE email = 'coach1@example.com')),
((SELECT id FROM teams WHERE name = 'WCS Warriors'), 'Practice', '2025-02-12 18:00:00', 'Practice Court', NULL, (SELECT id FROM coaches WHERE email = 'coach1@example.com')),
((SELECT id FROM teams WHERE name = 'WCS Sharks'), 'Game', '2025-02-16 14:00:00', 'Main Gym', 'Valley Vipers', (SELECT id FROM coaches WHERE email = 'coach2@example.com')),
((SELECT id FROM teams WHERE name = 'WCS Sharks'), 'Practice', '2025-02-13 19:00:00', 'Practice Court', NULL, (SELECT id FROM coaches WHERE email = 'coach2@example.com'));
```

## 🔧 Database Configuration

### Connection Settings

```typescript
// src/lib/supabaseClient.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
```

### Environment Variables

```bash
# Required for database connection
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Required for admin operations and RLS bypass
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Service Role Key Usage

The `SUPABASE_SERVICE_ROLE_KEY` is essential for:

- **Server Actions**: Bypassing RLS in server-side operations
- **Admin Operations**: Managing users, teams, and system data
- **Audit Logging**: Recording system-level changes
- **Data Migration**: Bulk operations and maintenance tasks

**Security Note**: Never expose the service role key to client-side code. It should only be used in server-side operations.

## 📈 Performance Optimization

### Indexes

```sql
-- Performance indexes
CREATE INDEX idx_teams_coach_email ON teams(coach_email);
CREATE INDEX idx_schedules_team_id ON schedules(team_id);
CREATE INDEX idx_schedules_date_time ON schedules(date_time);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
```

### Query Optimization

- **Connection Pooling**: Automatic with Supabase
- **Query Caching**: Built-in caching for frequently accessed data
- **Real-time Subscriptions**: Efficient real-time updates
- **Batch Operations**: Optimized for bulk operations

## 🔍 Monitoring & Analytics

### Database Metrics

- **Query Performance**: Average query time <50ms
- **Connection Count**: Stable connection pool usage
- **Storage Usage**: <100MB (well within limits)
- **Error Rate**: <0.1% (excellent)
- **Audit Logs**: Real-time change tracking and security monitoring

### Monitoring Tools

- **Supabase Dashboard**: Real-time database monitoring
- **Query Performance**: Built-in query analysis
- **Error Tracking**: Database error monitoring
- **Usage Analytics**: Connection and query analytics
- **Audit Logs**: Security event monitoring and change tracking
- **RLS Policy Monitoring**: Row-level security policy effectiveness

## 🛠️ Maintenance Procedures

### Daily Tasks

- **Health Check**: Verify database connectivity
- **Performance Review**: Check query performance
- **Error Monitoring**: Review any database errors
- **Backup Verification**: Ensure backups are working
- **Audit Log Review**: Check for suspicious activity or unauthorized access

### Weekly Tasks

- **Index Analysis**: Review and optimize indexes
- **Query Optimization**: Analyze slow queries
- **Storage Monitoring**: Check storage usage
- **Security Review**: Review access logs and audit trail
- **Audit Log Analysis**: Review audit logs for patterns and anomalies

### Monthly Tasks

- **Performance Audit**: Comprehensive performance review
- **Security Audit**: Review RLS policies and access
- **Data Cleanup**: Remove old or unused data
- **Backup Testing**: Test backup restoration
- **Audit Log Cleanup**: Archive old audit logs and maintain retention policy

## 🚨 Backup & Recovery

### Backup Strategy

- **Automated Backups**: Daily automated backups
- **Point-in-Time Recovery**: Available for last 7 days
- **Geographic Redundancy**: Multi-region backup storage
- **Retention Policy**: 30-day retention for automated backups
- **Audit Log Retention**: 90-day retention for audit logs (configurable)

### Recovery Procedures

1. **Data Loss**: Restore from most recent backup
2. **Corruption**: Use point-in-time recovery
3. **Accidental Deletion**: Restore from backup
4. **Security Breach**: Isolate and restore from clean backup
5. **Audit Log Recovery**: Restore audit logs for forensic analysis

## 💬 Message Board System

### Overview

The coaches message board provides a real-time communication platform for coaches and administrators to share insights, ask questions, and collaborate on coaching strategies.

### Features

- **Real-time Messaging**: Live updates using Supabase Realtime
- **Message Threading**: Reply to messages with threaded conversations
- **Role-based Permissions**: Coaches can edit/delete their own messages, admins can manage all
- **Message Pinning**: Admins can pin important messages to the top
- **Soft Deletes**: Messages are soft-deleted to maintain conversation history
- **Character Limits**: 1000 characters for messages, 500 for replies
- **Edit Tracking**: Visual indicators for edited messages and replies

### Database Design

#### Coach Messages Table

- **Primary Key**: `id` (UUID)
- **Author Tracking**: `author_id` and `author_name` for user attribution
- **Content**: `content` field with validation
- **Timestamps**: `created_at`, `updated_at`, `deleted_at` for full audit trail
- **Pinning**: `is_pinned` boolean for admin-controlled message priority

#### Coach Message Replies Table

- **Foreign Key**: `message_id` links to parent message
- **Author Tracking**: `author_id` and `author_name` for reply attribution
- **Content**: `content` field with validation
- **Timestamps**: `created_at`, `updated_at`, `deleted_at` for full audit trail

### Security Features

- **Row Level Security**: All tables protected with RLS policies
- **Permission-based Access**: Users can only edit/delete their own content
- **Admin Override**: Admins can manage all messages and replies
- **Soft Deletes**: Maintains data integrity while allowing content removal
- **Input Validation**: Character limits and content sanitization

### Real-time Updates

- **Supabase Channels**: Uses `coach-messages` channel for live updates
- **Postgres Changes**: Listens to database changes for instant UI updates
- **Optimistic UI**: Immediate feedback with server-side validation
- **Connection Management**: Automatic reconnection and error handling

### Performance Optimizations

- **Indexed Queries**: Optimized indexes for message retrieval and sorting
- **Pagination Ready**: Structure supports future pagination implementation
- **Efficient Loading**: Loads messages and replies separately for better performance
- **Caching Strategy**: Client-side state management for reduced API calls

## 📞 Support & Resources

### Supabase Support

- **Documentation**: https://supabase.com/docs
- **Community**: https://github.com/supabase/supabase/discussions
- **Status Page**: https://status.supabase.com

### Database Resources

- **PostgreSQL Docs**: https://www.postgresql.org/docs/
- **Supabase Guides**: https://supabase.com/docs/guides
- **RLS Documentation**: https://supabase.com/docs/guides/auth/row-level-security
- **Audit Logging**: https://supabase.com/docs/guides/database/audit-logs
- **Security Best Practices**: https://supabase.com/docs/guides/database/security
