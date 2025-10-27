# WCSv2.0 Complete Database Schema

## 📝 Current Schema (v2.8.0)

**Last Updated**: January 2025 - Complete schema synced from production Supabase database

### Database Statistics
- **Tables**: 18 active tables
- **Total Rows**: 1,000+ records
- **Platform**: Supabase PostgreSQL
- **Region**: US East (N. Virginia)
- **RLS**: Enabled on all tables

## 📊 Complete Database Schema

### 1. Teams Table

```sql
CREATE TABLE public.teams (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name text NOT NULL UNIQUE,
  age_group text,
  gender text CHECK (gender = ANY (ARRAY['Boys'::text, 'Girls'::text])),
  coach_email text NOT NULL,
  grade_level text,
  season text,
  logo_url text,
  team_image text,
  is_active boolean DEFAULT true,
  is_deleted boolean DEFAULT false,
  CONSTRAINT teams_pkey PRIMARY KEY (id),
  CONSTRAINT age_group_check CHECK (age_group = ANY (ARRAY['U10'::text, 'U12'::text, 'U14'::text, 'U16'::text, 'U18'::text]))
);
```

**Columns:**
- `id` (uuid, PK) - Auto-generated UUID
- `name` (text, NOT NULL, UNIQUE) - Team name
- `age_group` (text) - U10, U12, U14, U16, U18
- `gender` (text) - Boys or Girls
- `coach_email` (text, NOT NULL) - Primary coach email
- `grade_level` (text) - School grade level
- `season` (text) - Season identifier
- `logo_url` (text) - Team logo URL
- `team_image` (text) - Team photo URL
- `is_active` (boolean, DEFAULT true) - Active status
- `is_deleted` (boolean, DEFAULT false) - Soft delete flag

### 2. Users Table

```sql
CREATE TABLE public.users (
  id uuid NOT NULL,
  email text NOT NULL UNIQUE,
  role text CHECK (role = ANY (ARRAY['coach'::text, 'parent'::text, 'admin'::text])),
  created_at timestamp without time zone DEFAULT now(),
  password_reset boolean DEFAULT true,
  last_password_reset timestamp with time zone,
  login_count integer DEFAULT 0,
  last_login_at timestamp with time zone,
  CONSTRAINT users_pkey PRIMARY KEY (id)
);
```

**Columns:**
- `id` (uuid, PK) - User UUID (links to auth.users)
- `email` (text, NOT NULL, UNIQUE) - User email
- `role` (text) - coach, parent, or admin
- `created_at` (timestamp) - Account creation time
- `password_reset` (boolean, DEFAULT true) - Password reset flag
- `last_password_reset` (timestamptz) - Last reset timestamp
- `login_count` (integer, DEFAULT 0) - Login count
- `last_login_at` (timestamptz) - Last login timestamp

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
  is_active boolean DEFAULT true,
  is_deleted boolean DEFAULT false,
  phone varchar,
  CONSTRAINT coaches_pkey PRIMARY KEY (id),
  CONSTRAINT coaches_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
```

**Columns:**
- `id` (uuid, PK) - Auto-generated UUID
- `first_name` (text, NOT NULL) - First name
- `last_name` (text, NOT NULL) - Last name
- `email` (text, NOT NULL, UNIQUE) - Email address
- `bio` (text) - Biography
- `created_at` (timestamptz) - Creation timestamp
- `image_url` (text) - Profile image URL
- `quote` (text) - Motivational quote
- `user_id` (uuid, FK to users) - User account link
- `is_active` (boolean, DEFAULT true) - Active status
- `is_deleted` (boolean, DEFAULT false) - Soft delete flag
- `phone` (varchar) - Phone number

### 4. Team Coaches Junction Table

```sql
CREATE TABLE public.team_coaches (
  team_id uuid NOT NULL,
  coach_id uuid NOT NULL,
  CONSTRAINT team_coaches_pkey PRIMARY KEY (team_id, coach_id),
  CONSTRAINT team_coaches_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id),
  CONSTRAINT team_coaches_coach_id_fkey FOREIGN KEY (coach_id) REFERENCES public.coaches(id)
);
```

**Purpose:** Many-to-many relationship between teams and coaches

### 5. Schedules Table

```sql
CREATE TABLE public.schedules (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  team_id uuid,
  event_type text CHECK (event_type = ANY (ARRAY['Game'::text, 'Practice'::text, 'Tournament'::text, 'Meeting'::text, 'Update'::text])),
  date_time timestamp without time zone NOT NULL,
  location text,
  opponent text,
  created_at timestamp without time zone DEFAULT now(),
  created_by uuid,
  deleted_at timestamp with time zone,
  description text,
  is_global boolean NOT NULL DEFAULT false,
  title text,
  recurring_group_id text,
  end_date_time timestamp with time zone,
  CONSTRAINT schedules_pkey PRIMARY KEY (id),
  CONSTRAINT schedules_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id),
  CONSTRAINT schedules_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id)
);
```

**Columns:**
- `id` (uuid, PK) - Auto-generated UUID
- `team_id` (uuid, FK, nullable) - Associated team (NULL for global events)
- `event_type` (text) - Game, Practice, Tournament, Meeting, or Update
- `date_time` (timestamp, NOT NULL) - Event start time
- `end_date_time` (timestamptz) - Event end time (for tournaments)
- `location` (text) - Event location
- `opponent` (text) - Opponent name (for games)
- `title` (text) - Event title
- `description` (text) - Event description
- `created_at` (timestamp) - Creation timestamp
- `created_by` (uuid, FK to users) - Creator user ID
- `deleted_at` (timestamptz) - Soft delete timestamp
- `is_global` (boolean, NOT NULL, DEFAULT false) - Global event flag
- `recurring_group_id` (text) - Recurring event group identifier

### 6. Team Updates Table

```sql
CREATE TABLE public.team_updates (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  team_id uuid,
  title text NOT NULL,
  content text NOT NULL,
  image_url text,
  is_global boolean NOT NULL DEFAULT false,
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  deleted_at timestamp with time zone,
  date_time timestamp without time zone,
  CONSTRAINT team_updates_pkey PRIMARY KEY (id),
  CONSTRAINT team_updates_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id),
  CONSTRAINT team_updates_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id)
);
```

**Columns:**
- `id` (uuid, PK) - Auto-generated UUID
- `team_id` (uuid, FK, nullable) - Associated team (NULL for global updates)
- `title` (text, NOT NULL) - Update title
- `content` (text, NOT NULL) - Update content
- `image_url` (text) - Update image URL
- `is_global` (boolean, NOT NULL, DEFAULT false) - Global update flag
- `created_by` (uuid, FK to users) - Creator user ID
- `created_at` (timestamptz) - Creation timestamp
- `deleted_at` (timestamptz) - Soft delete timestamp
- `date_time` (timestamp) - Optional schedule date/time

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

**Columns:**
- `id` (uuid, PK) - Auto-generated UUID
- `team_id` (uuid, FK) - Associated team
- `title` (text, NOT NULL) - Drill title
- `skills` (ARRAY, NOT NULL) - Skills developed
- `equipment` (ARRAY, NOT NULL) - Required equipment
- `time` (text, NOT NULL) - Duration
- `instructions` (text, NOT NULL) - Instructions
- `additional_info` (text) - Additional information
- `benefits` (text, NOT NULL) - Drill benefits
- `difficulty` (text, NOT NULL) - Difficulty level
- `category` (text, NOT NULL) - Category
- `week_number` (integer, NOT NULL) - Week number
- `image_url` (text) - Drill image URL
- `created_by` (uuid, FK to users) - Creator user ID
- `created_at` (timestamptz) - Creation timestamp

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

**Columns:**
- `id` (uuid, PK) - Auto-generated UUID
- `title` (text, NOT NULL) - News title
- `content` (text, NOT NULL) - News content
- `image_url` (text) - News image URL
- `team_id` (uuid, FK) - Associated team
- `created_by` (uuid, FK to users) - Creator user ID
- `created_at` (timestamptz) - Creation timestamp
- `deleted_at` (timestamptz) - Soft delete timestamp

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

**Columns:**
- `id` (uuid, PK) - Auto-generated UUID
- `name` (text, NOT NULL) - Product name
- `description` (text) - Product description
- `price` (numeric, NOT NULL) - Product price
- `printful_id` (text) - Printful integration ID
- `image_url` (text) - Product image URL

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

**Columns:**
- `id` (uuid, PK) - Auto-generated UUID
- `title` (text, NOT NULL) - Resource title
- `description` (text) - Resource description
- `file_url` (text) - Resource file URL
- `coach_email` (text, NOT NULL) - Coach email
- `created_at` (timestamp) - Creation timestamp

### 11. Players Table

```sql
CREATE TABLE public.players (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  team_id uuid,
  name text NOT NULL,
  jersey_number integer,
  grade text,
  parent_name text,
  parent_email text,
  parent_phone text,
  emergency_contact text,
  emergency_phone text,
  created_at timestamp with time zone DEFAULT now(),
  is_active boolean DEFAULT true,
  date_of_birth date,
  age integer,
  gender text,
  is_deleted boolean DEFAULT false,
  CONSTRAINT players_pkey PRIMARY KEY (id),
  CONSTRAINT players_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id)
);
```

**Columns:**
- `id` (uuid, PK) - Auto-generated UUID
- `team_id` (uuid, FK) - Associated team
- `name` (text, NOT NULL) - Player name
- `jersey_number` (integer) - Jersey number
- `grade` (text) - Grade level
- `parent_name` (text) - Parent/guardian name
- `parent_email` (text) - Parent/guardian email
- `parent_phone` (text) - Parent/guardian phone
- `emergency_contact` (text) - Emergency contact name
- `emergency_phone` (text) - Emergency contact phone
- `date_of_birth` (date) - Birth date
- `age` (integer) - Calculated age
- `gender` (text) - Gender
- `is_active` (boolean, DEFAULT true) - Active status
- `is_deleted` (boolean, DEFAULT false) - Soft delete flag
- `created_at` (timestamptz) - Creation timestamp

### 12. Coach Messages Table

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
  CONSTRAINT coach_messages_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.users(id) ON DELETE CASCADE
);
```

**Columns:**
- `id` (uuid, PK) - Auto-generated UUID
- `author_id` (uuid, FK to users, NOT NULL) - Message author
- `author_name` (text, NOT NULL) - Author display name
- `content` (text, NOT NULL) - Message content
- `created_at` (timestamptz) - Creation timestamp
- `updated_at` (timestamptz) - Last update timestamp
- `deleted_at` (timestamptz) - Soft delete timestamp
- `is_pinned` (boolean, DEFAULT false) - Pinned status

### 13. Coach Message Replies Table

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
  CONSTRAINT coach_message_replies_message_id_fkey FOREIGN KEY (message_id) REFERENCES public.coach_messages(id) ON DELETE CASCADE,
  CONSTRAINT coach_message_replies_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.users(id) ON DELETE CASCADE
);
```

**Columns:**
- `id` (uuid, PK) - Auto-generated UUID
- `message_id` (uuid, FK, NOT NULL) - Parent message
- `author_id` (uuid, FK to users, NOT NULL) - Reply author
- `author_name` (text, NOT NULL) - Author display name
- `content` (text, NOT NULL) - Reply content
- `created_at` (timestamptz) - Creation timestamp
- `updated_at` (timestamptz) - Last update timestamp
- `deleted_at` (timestamptz) - Soft delete timestamp

### 14. Audit Logs Table

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

**Columns:**
- `id` (uuid, PK) - Auto-generated UUID
- `table_name` (text, NOT NULL) - Audited table name
- `operation` (text, NOT NULL) - Operation type
- `user_id` (uuid, FK to users) - User who performed operation
- `old_data` (jsonb) - Previous state (for updates/deletes)
- `new_data` (jsonb) - New state (for inserts/updates)
- `created_at` (timestamptz) - Operation timestamp

### 15. Login Logs Table

```sql
CREATE TABLE public.login_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  login_at timestamp with time zone DEFAULT now(),
  ip_address inet,
  user_agent text,
  success boolean DEFAULT true,
  failure_reason text,
  session_duration integer,
  CONSTRAINT login_logs_pkey PRIMARY KEY (id),
  CONSTRAINT login_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
```

**Columns:**
- `id` (uuid, PK) - Auto-generated UUID
- `user_id` (uuid, FK to users, NOT NULL) - User who logged in
- `login_at` (timestamptz) - Login timestamp
- `ip_address` (inet) - Login IP address
- `user_agent` (text) - Browser user agent
- `success` (boolean, DEFAULT true) - Login success flag
- `failure_reason` (text) - Failure reason (if failed)
- `session_duration` (integer) - Session duration in minutes

### 16. Error Logs Table

```sql
CREATE TABLE public.error_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  severity text NOT NULL,
  message text NOT NULL,
  stack_trace text,
  user_id uuid,
  page_url text,
  user_agent text,
  ip_address inet,
  error_code text,
  resolved boolean DEFAULT false,
  resolved_at timestamp with time zone,
  resolved_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT error_logs_pkey PRIMARY KEY (id),
  CONSTRAINT error_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT error_logs_resolved_by_fkey FOREIGN KEY (resolved_by) REFERENCES public.users(id),
  CONSTRAINT severity_check CHECK (severity = ANY (ARRAY['critical'::text, 'error'::text, 'warning'::text, 'info'::text]))
);
```

**Columns:**
- `id` (uuid, PK) - Auto-generated UUID
- `severity` (text, NOT NULL) - Error severity level (critical, error, warning, info)
- `message` (text, NOT NULL) - Error message
- `stack_trace` (text) - Stack trace
- `user_id` (uuid, FK to users) - User who encountered error
- `page_url` (text) - Page URL where error occurred
- `user_agent` (text) - Browser user agent
- `ip_address` (inet) - IP address
- `error_code` (text) - Error code
- `resolved` (boolean, DEFAULT false) - Resolution status
- `resolved_at` (timestamptz) - Resolution timestamp
- `resolved_by` (uuid, FK to users) - Admin who resolved error
- `created_at` (timestamptz) - Creation timestamp

## 🔐 Row Level Security (RLS)

All tables have RLS enabled. Key policies include:

### Teams Policy
```sql
-- Public can view all teams
CREATE POLICY "Public view teams" ON teams FOR SELECT TO public USING (true);

-- Coaches can edit assigned teams
CREATE POLICY "Coaches edit assigned teams" ON teams FOR ALL TO authenticated
USING (EXISTS (
  SELECT 1 FROM team_coaches tc
  JOIN coaches c ON tc.coach_id = c.id
  WHERE tc.team_id = teams.id AND c.user_id = auth.uid()
));

-- Admins can edit all teams
CREATE POLICY "Admins edit all teams" ON teams FOR ALL TO authenticated
USING (EXISTS (
  SELECT 1 FROM users
  WHERE users.id = auth.uid() AND users.role = 'admin'
));
```

### Schedules Policy
```sql
-- Public can view all schedules
CREATE POLICY "Public view schedules" ON schedules FOR SELECT TO public USING (true);

-- Coaches and admins can manage schedules
CREATE POLICY "Coaches and admins manage schedules" ON schedules FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM team_coaches tc
    JOIN coaches c ON tc.coach_id = c.id
    WHERE tc.team_id = schedules.team_id AND c.user_id = auth.uid()
  )
  OR EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
);
```

### Team Updates Policy
```sql
-- Public can view all team updates
CREATE POLICY "Public view team updates" ON team_updates FOR SELECT TO public USING (true);

-- Coaches manage team updates; admins can manage all
CREATE POLICY "Coaches manage team updates" ON team_updates FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM team_coaches tc
    JOIN coaches c ON tc.coach_id = c.id
    WHERE tc.team_id = team_updates.team_id AND c.user_id = auth.uid()
  )
  OR EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
);
```

## 🎯 Key Relationships

- **Teams ↔ Coaches**: Many-to-many via `team_coaches` table
- **Teams → Players**: One-to-many via `players.team_id`
- **Users → Schedules**: Many-to-one via `schedules.created_by`
- **Users → Team Updates**: Many-to-one via `team_updates.created_by`
- **Users → Coach Messages**: One-to-many via `coach_messages.author_id`
- **Coach Messages → Replies**: One-to-many via `coach_message_replies.message_id`

## 📝 Global Events Support (v2.8.0)

Both `schedules` and `team_updates` tables support global events:

- **Global Schedules**: Set `team_id = NULL` and `is_global = true`
- **Global Updates**: Set `team_id = NULL` and `is_global = true`
- Global events appear on all team schedules and calendars

---

**Last Updated**: January 2025  
**Schema Version**: 2.8.0  
**Database**: Supabase PostgreSQL