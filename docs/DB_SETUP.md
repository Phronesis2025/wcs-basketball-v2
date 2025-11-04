# WCSv2.0 Complete Database Schema

## 📝 Current Schema (v2.8.2)

**Last Updated**: October 31, 2025 - Complete schema synced from production Supabase database

### Database Statistics

- **Tables**: 21 active tables
- **Platform**: Supabase PostgreSQL
- **RLS**: Enabled on all tables
- **Functions**: `set_updated_at()`, `is_admin()`, `is_admin(uid uuid)`

## 📊 Complete Database Schema

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
  is_active boolean DEFAULT true,
  is_deleted boolean DEFAULT false,
  CONSTRAINT teams_pkey PRIMARY KEY (id),
  CONSTRAINT teams_age_group_check CHECK (age_group = ANY (ARRAY['U10'::text, 'U12'::text, 'U14'::text, 'U16'::text, 'U18'::text])),
  CONSTRAINT teams_gender_check CHECK (gender = ANY (ARRAY['Boys'::text, 'Girls'::text]))
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

**Foreign Keys Referencing This Table:**

- `players.team_id` → `teams.id`
- `practice_drills.team_id` → `teams.id`
- `team_updates.team_id` → `teams.id`
- `team_coaches.team_id` → `teams.id`
- `schedules.team_id` → `teams.id`
- `news.team_id` → `teams.id`

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
  CONSTRAINT users_pkey PRIMARY KEY (id),
  CONSTRAINT users_role_check CHECK (role = ANY (ARRAY['coach'::text, 'parent'::text, 'admin'::text]))
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

**Foreign Keys Referencing This Table:**

- `error_logs.user_id` → `users.id`
- `error_logs.resolved_by` → `users.id`
- `coaches.user_id` → `users.id` (ON DELETE CASCADE)
- `coach_messages.author_id` → `users.id` (ON DELETE CASCADE)
- `coach_message_replies.author_id` → `users.id` (ON DELETE CASCADE)
- `audit_logs.user_id` → `users.id`
- `changelog.created_by` → `users.id`
- `message_notifications.mentioned_by_user_id` → `users.id` (ON DELETE CASCADE)
- `message_notifications.mentioned_user_id` → `users.id` (ON DELETE CASCADE)
- `schedules.created_by` → `users.id`
- `team_updates.created_by` → `users.id`
- `practice_drills.created_by` → `users.id`
- `news.created_by` → `users.id`
- `login_logs.user_id` → `users.id`

### 3. Coaches Table

```sql
CREATE TABLE public.coaches (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL UNIQUE,
  bio text,
  created_at timestamp with time zone DEFAULT now(),
  image_url text, -- Comment: Coaches Picture
  quote text, -- Comment: Coaches quote
  user_id uuid,
  is_active boolean DEFAULT true,
  is_deleted boolean DEFAULT false,
  phone varchar(20),
  CONSTRAINT coaches_pkey PRIMARY KEY (id),
  CONSTRAINT coaches_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);
```

**Columns:**

- `id` (uuid, PK) - Auto-generated UUID
- `first_name` (text, NOT NULL) - First name
- `last_name` (text, NOT NULL) - Last name
- `email` (text, NOT NULL, UNIQUE) - Email address
- `bio` (text) - Biography
- `created_at` (timestamptz) - Creation timestamp
- `image_url` (text) - Profile image URL (Coaches Picture)
- `quote` (text) - Motivational quote (Coaches quote)
- `user_id` (uuid, FK to users) - User account link (ON DELETE CASCADE)
- `is_active` (boolean, DEFAULT true) - Active status
- `is_deleted` (boolean, DEFAULT false) - Soft delete flag
- `phone` (varchar(20)) - Phone number

**Foreign Keys Referencing This Table:**

- `team_coaches.coach_id` → `coaches.id` (ON DELETE CASCADE)

### 4. Team Coaches Junction Table

```sql
CREATE TABLE public.team_coaches (
  team_id uuid NOT NULL,
  coach_id uuid NOT NULL,
  CONSTRAINT team_coaches_pkey PRIMARY KEY (team_id, coach_id),
  CONSTRAINT team_coaches_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id) ON DELETE CASCADE,
  CONSTRAINT team_coaches_coach_id_fkey FOREIGN KEY (coach_id) REFERENCES public.coaches(id) ON DELETE CASCADE
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
  title text, -- Comment: Title of the event (used for updates with date_time)
  recurring_group_id text,
  end_date_time timestamp with time zone,
  CONSTRAINT schedules_pkey PRIMARY KEY (id),
  CONSTRAINT schedules_event_type_check CHECK (event_type = ANY (ARRAY['Game'::text, 'Practice'::text, 'Tournament'::text, 'Meeting'::text, 'Update'::text])),
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
- `title` (text) - Title of the event (used for updates with date_time)
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
  date_time timestamp without time zone, -- Comment: Optional date/time for updates to appear on schedule calendar
  CONSTRAINT team_updates_pkey PRIMARY KEY (id),
  CONSTRAINT team_updates_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id) ON DELETE CASCADE,
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
- `date_time` (timestamp) - Optional date/time for updates to appear on schedule calendar

### 7. Practice Drills Table

```sql
CREATE TABLE public.practice_drills (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  team_id uuid,
  title text NOT NULL,
  skills text[] NOT NULL,
  equipment text[] NOT NULL,
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
  CONSTRAINT practice_drills_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id) ON DELETE CASCADE,
  CONSTRAINT practice_drills_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id)
);
```

**Columns:**

- `id` (uuid, PK) - Auto-generated UUID
- `team_id` (uuid, FK) - Associated team
- `title` (text, NOT NULL) - Drill title
- `skills` (text[], NOT NULL) - Skills developed
- `equipment` (text[], NOT NULL) - Required equipment
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
  price numeric(10,2) NOT NULL,
  printful_id text,
  image_url text,
  CONSTRAINT products_pkey PRIMARY KEY (id)
);
```

**Columns:**

- `id` (uuid, PK) - Auto-generated UUID
- `name` (text, NOT NULL) - Product name
- `description` (text) - Product description
- `price` (numeric(10,2), NOT NULL) - Product price
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
  status text DEFAULT 'pending',
  waiver_signed boolean DEFAULT false,
  stripe_customer_id text,
  parent_first_name text, -- Comment: Parent first name
  parent_last_name text, -- Comment: Parent last name
  parent_address_line1 text,
  parent_address_line2 text,
  parent_city text,
  parent_state text,
  parent_zip text,
  parent_id uuid,
  shirt_size text,
  position_preference text,
  previous_experience text,
  school_name text,
  CONSTRAINT players_pkey PRIMARY KEY (id),
  CONSTRAINT players_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id) ON DELETE CASCADE,
  CONSTRAINT players_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.parents(id)
);
```

**Columns:**

- `id` (uuid, PK) - Auto-generated UUID
- `team_id` (uuid, FK) - Associated team
- `name` (text, NOT NULL) - Player name
- `jersey_number` (integer) - Jersey number
- `grade` (text) - Grade level
- `parent_name` (text) - Parent/guardian name (legacy field)
- `parent_email` (text) - Parent/guardian email (legacy field)
- `parent_phone` (text) - Parent/guardian phone (legacy field)
- `emergency_contact` (text) - Emergency contact name
- `emergency_phone` (text) - Emergency contact phone
- `date_of_birth` (date) - Birth date
- `age` (integer) - Calculated age
- `gender` (text) - Gender
- `is_active` (boolean, DEFAULT true) - Active status
- `is_deleted` (boolean, DEFAULT false) - Soft delete flag
- `status` (text, DEFAULT 'pending') - Registration status: pending, approved, active
- `waiver_signed` (boolean, DEFAULT false) - Waiver signature status
- `stripe_customer_id` (text) - Stripe customer ID
- `parent_first_name` (text) - Parent first name
- `parent_last_name` (text) - Parent last name
- `parent_address_line1` (text) - Parent address line 1
- `parent_address_line2` (text) - Parent address line 2
- `parent_city` (text) - Parent city
- `parent_state` (text) - Parent state
- `parent_zip` (text) - Parent ZIP code
- `parent_id` (uuid, FK to parents) - Reference to parents table
- `shirt_size` (text) - Player shirt size
- `position_preference` (text) - Preferred playing position
- `previous_experience` (text) - Previous basketball experience
- `school_name` (text) - School name
- `created_at` (timestamptz) - Creation timestamp

**Foreign Keys Referencing This Table:**

- `payments.player_id` → `players.id` (ON DELETE CASCADE)

### 12. Parents Table

```sql
CREATE TABLE public.parents (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL UNIQUE,
  phone text,
  address_line1 text,
  address_line2 text,
  city text,
  state text,
  zip text,
  emergency_contact text,
  emergency_phone text,
  guardian_relationship text,
  medical_allergies text,
  medical_conditions text,
  medical_medications text,
  doctor_name text,
  doctor_phone text,
  consent_photo_release boolean DEFAULT false,
  consent_medical_treatment boolean DEFAULT false,
  consent_participation boolean DEFAULT false,
  checkout_completed boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT parents_pkey PRIMARY KEY (id),
  CONSTRAINT parents_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
```

**Columns:**

- `id` (uuid, PK) - Auto-generated UUID
- `user_id` (uuid, FK to auth.users) - Links to Supabase auth.users
- `first_name` (text, NOT NULL) - Parent first name
- `last_name` (text, NOT NULL) - Parent last name
- `email` (text, NOT NULL, UNIQUE) - Parent email
- `phone` (text) - Parent phone
- `address_line1` (text) - Address line 1
- `address_line2` (text) - Address line 2
- `city` (text) - City
- `state` (text) - State
- `zip` (text) - ZIP code
- `emergency_contact` (text) - Emergency contact name
- `emergency_phone` (text) - Emergency contact phone
- `guardian_relationship` (text) - Relationship to player
- `medical_allergies` (text) - Medical allergies
- `medical_conditions` (text) - Medical conditions
- `medical_medications` (text) - Medical medications
- `doctor_name` (text) - Doctor name
- `doctor_phone` (text) - Doctor phone
- `consent_photo_release` (boolean, DEFAULT false) - Photo release consent
- `consent_medical_treatment` (boolean, DEFAULT false) - Medical treatment consent
- `consent_participation` (boolean, DEFAULT false) - Participation consent
- `checkout_completed` (boolean, DEFAULT false) - Checkout completion status
- `created_at` (timestamptz) - Creation timestamp
- `updated_at` (timestamptz) - Last update timestamp

**Foreign Keys Referencing This Table:**

- `players.parent_id` → `parents.id`

### 13. Payments Table

```sql
CREATE TABLE public.payments (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  player_id uuid,
  stripe_payment_id text,
  amount numeric,
  payment_type text,
  status text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT payments_pkey PRIMARY KEY (id),
  CONSTRAINT payments_player_id_fkey FOREIGN KEY (player_id) REFERENCES public.players(id) ON DELETE CASCADE
);
```

**Columns:**

- `id` (uuid, PK) - Auto-generated UUID
- `player_id` (uuid, FK to players) - Associated player (ON DELETE CASCADE)
- `stripe_payment_id` (text) - Stripe payment ID
- `amount` (numeric) - Payment amount
- `payment_type` (text) - Payment type (annual, monthly, custom, etc.)
- `status` (text) - Payment status
- `created_at` (timestamptz) - Creation timestamp

### 14. Coach Messages Table

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
- `author_id` (uuid, FK to users, NOT NULL) - Message author (ON DELETE CASCADE)
- `author_name` (text, NOT NULL) - Author display name
- `content` (text, NOT NULL) - Message content
- `created_at` (timestamptz) - Creation timestamp
- `updated_at` (timestamptz) - Last update timestamp
- `deleted_at` (timestamptz) - Soft delete timestamp
- `is_pinned` (boolean, DEFAULT false) - Pinned status

**Foreign Keys Referencing This Table:**

- `message_notifications.message_id` → `coach_messages.id` (ON DELETE CASCADE)
- `coach_message_replies.message_id` → `coach_messages.id` (ON DELETE CASCADE)

### 15. Coach Message Replies Table

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
- `message_id` (uuid, FK, NOT NULL) - Parent message (ON DELETE CASCADE)
- `author_id` (uuid, FK to users, NOT NULL) - Reply author (ON DELETE CASCADE)
- `author_name` (text, NOT NULL) - Author display name
- `content` (text, NOT NULL) - Reply content
- `created_at` (timestamptz) - Creation timestamp
- `updated_at` (timestamptz) - Last update timestamp
- `deleted_at` (timestamptz) - Soft delete timestamp

**Foreign Keys Referencing This Table:**

- `message_notifications.reply_id` → `coach_message_replies.id` (ON DELETE CASCADE)

### 16. Message Notifications Table

```sql
CREATE TABLE public.message_notifications (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  message_id uuid NOT NULL,
  reply_id uuid,
  mentioned_user_id uuid NOT NULL,
  mentioned_by_user_id uuid NOT NULL,
  mentioned_at timestamp with time zone DEFAULT now(),
  is_read boolean DEFAULT false,
  read_at timestamp with time zone,
  acknowledged_at timestamp with time zone,
  CONSTRAINT message_notifications_pkey PRIMARY KEY (id),
  CONSTRAINT message_notifications_message_id_fkey FOREIGN KEY (message_id) REFERENCES public.coach_messages(id) ON DELETE CASCADE,
  CONSTRAINT message_notifications_reply_id_fkey FOREIGN KEY (reply_id) REFERENCES public.coach_message_replies(id) ON DELETE CASCADE,
  CONSTRAINT message_notifications_mentioned_user_id_fkey FOREIGN KEY (mentioned_user_id) REFERENCES public.users(id) ON DELETE CASCADE,
  CONSTRAINT message_notifications_mentioned_by_user_id_fkey FOREIGN KEY (mentioned_by_user_id) REFERENCES public.users(id) ON DELETE CASCADE
);
```

**Columns:**

- `id` (uuid, PK) - Auto-generated UUID
- `message_id` (uuid, FK, NOT NULL) - Parent message (ON DELETE CASCADE)
- `reply_id` (uuid, FK) - Reply (if notification is for a reply)
- `mentioned_user_id` (uuid, FK to users, NOT NULL) - User who was mentioned (ON DELETE CASCADE)
- `mentioned_by_user_id` (uuid, FK to users, NOT NULL) - User who mentioned them (ON DELETE CASCADE)
- `mentioned_at` (timestamptz, DEFAULT now()) - When mention occurred
- `is_read` (boolean, DEFAULT false) - Read status
- `read_at` (timestamptz) - When notification was read
- `acknowledged_at` (timestamptz) - When notification was acknowledged

### 17. Audit Logs Table

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

### 18. Login Logs Table

```sql
-- Comment: Tracks user login events for analytics
CREATE TABLE public.login_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  login_at timestamp with time zone DEFAULT now(),
  ip_address inet,
  user_agent text,
  success boolean DEFAULT true,
  failure_reason text,
  session_duration integer, -- Comment: Session duration in minutes, calculated when user logs out
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
- `session_duration` (integer) - Session duration in minutes, calculated when user logs out

### 19. Error Logs Table

```sql
-- Comment: Stores application errors for admin dashboard viewing
CREATE TABLE public.error_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  severity text NOT NULL, -- Comment: Error severity level: critical, error, warning, info
  message text NOT NULL,
  stack_trace text,
  user_id uuid,
  page_url text,
  user_agent text,
  ip_address inet,
  error_code text,
  resolved boolean DEFAULT false, -- Comment: Whether the error has been resolved by admin
  resolved_at timestamp with time zone,
  resolved_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT error_logs_pkey PRIMARY KEY (id),
  CONSTRAINT error_logs_severity_check CHECK (severity = ANY (ARRAY['critical'::text, 'error'::text, 'warning'::text, 'info'::text])),
  CONSTRAINT error_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT error_logs_resolved_by_fkey FOREIGN KEY (resolved_by) REFERENCES public.users(id)
);
```

**Columns:**

- `id` (uuid, PK) - Auto-generated UUID
- `severity` (text, NOT NULL) - Error severity level: critical, error, warning, info
- `message` (text, NOT NULL) - Error message
- `stack_trace` (text) - Stack trace
- `user_id` (uuid, FK to users) - User who encountered error
- `page_url` (text) - Page URL where error occurred
- `user_agent` (text) - Browser user agent
- `ip_address` (inet) - IP address
- `error_code` (text) - Error code
- `resolved` (boolean, DEFAULT false) - Whether the error has been resolved by admin
- `resolved_at` (timestamptz) - Resolution timestamp
- `resolved_by` (uuid, FK to users) - Admin who resolved error
- `created_at` (timestamptz) - Creation timestamp

### 20. Changelog Table

```sql
CREATE TABLE public.changelog (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  version text NOT NULL,
  release_date date NOT NULL,
  category text NOT NULL CHECK (category = ANY (ARRAY['added'::text, 'changed'::text, 'fixed'::text, 'removed'::text, 'security'::text, 'deprecated'::text])),
  description text NOT NULL,
  created_by uuid,
  is_published boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT changelog_pkey PRIMARY KEY (id),
  CONSTRAINT changelog_category_check CHECK (category = ANY (ARRAY['added'::text, 'changed'::text, 'fixed'::text, 'removed'::text, 'security'::text, 'deprecated'::text])),
  CONSTRAINT changelog_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id)
);
```

**Columns:**

- `id` (uuid, PK) - Auto-generated UUID
- `version` (text, NOT NULL) - Version number (e.g., "2.8.2")
- `release_date` (date, NOT NULL) - Release date
- `category` (text, NOT NULL) - Category: added, changed, fixed, removed, security, deprecated
- `description` (text, NOT NULL) - Change description
- `created_by` (uuid, FK to users) - User who created the entry
- `is_published` (boolean, DEFAULT true) - Publication status
- `created_at` (timestamptz, DEFAULT now()) - Creation timestamp
- `updated_at` (timestamptz, DEFAULT now()) - Last update timestamp

**Indexes:**

- `idx_changelog_created_by` - Index on `created_by` for foreign key performance

### 21. Quotes Table

```sql
CREATE TABLE public.quotes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  quote_text text NOT NULL,
  author text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  display_order integer,
  CONSTRAINT quotes_pkey PRIMARY KEY (id)
);
```

**Columns:**

- `id` (uuid, PK) - Auto-generated UUID
- `quote_text` (text, NOT NULL) - The motivational quote text
- `author` (text, NOT NULL) - Author name (coach or player)
- `created_at` (timestamptz, DEFAULT now()) - Creation timestamp
- `display_order` (integer) - Optional ordering for manual quote sequencing

**Indexes:**

- `idx_quotes_display_order` - Index on `display_order` and `created_at` for sorting performance

**RLS Policies:**

- `Allow public read access to quotes`: Public SELECT access for displaying quotes on homepage

## 🔐 Row Level Security (RLS)

All tables have RLS enabled with optimized policies that use `(select auth.uid())` pattern for better performance.

### Key RLS Policies

**Changelog Policies:**
- `changelog_select_all`: Public can view published entries; admins can view all
- `changelog_insert_admin`: Only admins can insert
- `changelog_update_admin`: Only admins can update
- `changelog_delete_admin`: Only admins can delete

**Parents Policies:**
- `parents_select_consolidated`: Admins can read all; users can read own data
- `parents_insert_consolidated`: Only admins can insert
- `parents_update_consolidated`: Admins can update all; users can update own data
- `parents_delete_consolidated`: Only admins can delete

**Coach Messages Policies:**
- `msg_insert_consolidated`: Coaches and admins can insert; owners can insert own
- `msg_select_consolidated`: Coaches and admins can view non-deleted; owners can view own
- `msg_update_consolidated`: Admins can update any; owners can update own
- `msg_delete_consolidated`: Admins can delete any; owners can delete own

**Coach Message Replies Policies:**
- `rpl_insert_consolidated`: Coaches and admins can insert; owners can insert own
- `rpl_select_consolidated`: Coaches and admins can view non-deleted; owners can view own
- `rpl_update_consolidated`: Admins can update any; owners can update own
- `rpl_delete_consolidated`: Admins can delete any; owners can delete own

## 🎯 Key Relationships

- **Teams ↔ Coaches**: Many-to-many via `team_coaches` table
- **Teams → Players**: One-to-many via `players.team_id`
- **Parents → Players**: One-to-many via `players.parent_id`
- **Players → Payments**: One-to-many via `payments.player_id`
- **Users → Schedules**: Many-to-one via `schedules.created_by`
- **Users → Team Updates**: Many-to-one via `team_updates.created_by`
- **Users → Coach Messages**: One-to-many via `coach_messages.author_id`
- **Coach Messages → Replies**: One-to-many via `coach_message_replies.message_id`
- **Auth Users → Parents**: One-to-one via `parents.user_id` (links to `auth.users`)

## 📝 Global Events Support

Both `schedules` and `team_updates` tables support global events:

- **Global Schedules**: Set `team_id = NULL` and `is_global = true`
- **Global Updates**: Set `team_id = NULL` and `is_global = true`
- Global events appear on all team schedules and calendars

## 🔧 Database Functions

### set_updated_at()

Automatically updates the `updated_at` timestamp column. Configured with `SET search_path = public` for security.

### is_admin()

Checks if a user has admin role. Two versions:
- `is_admin()` - Uses current authenticated user
- `is_admin(uid uuid)` - Checks specific user ID

Both functions configured with `SET search_path = public` for security.

## 📊 Indexes

Key indexes for performance:

- `idx_changelog_created_by` - Foreign key index on `changelog.created_by`
- Various indexes on foreign keys and commonly queried columns

---

**Last Updated**: October 31, 2025  
**Schema Version**: 2.8.2  
**Database**: Supabase PostgreSQL  
**RLS Optimization**: All policies use `(select auth.uid())` pattern for optimal performance
