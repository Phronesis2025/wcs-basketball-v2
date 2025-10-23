# WCS Basketball - Database Field Mapping

## Overview

This document maps each form field in the WCS Basketball club management system to its corresponding database table and column in Supabase.

---

## 🏀 **COACHES MANAGEMENT**

### **Table: `coaches`**

| Form Field    | Database Column | Data Type | Required | Notes                       |
| ------------- | --------------- | --------- | -------- | --------------------------- |
| First Name    | `first_name`    | `text`    | ✅ Yes   |                             |
| Last Name     | `last_name`     | `text`    | ✅ Yes   |                             |
| Email         | `email`         | `text`    | ✅ Yes   | Unique identifier           |
| Bio           | `bio`           | `text`    | ❌ No    | Optional description        |
| Quote         | `quote`         | `text`    | ❌ No    | Optional motivational quote |
| Image         | `image_url`     | `text`    | ❌ No    | URL to uploaded image       |
| Active Status | `is_active`     | `boolean` | ✅ Yes   | Default: `true`             |

### **Related Tables**

- **`users`**: Contains authentication data linked by `email`
- **`auth.users`**: Supabase Auth table for login credentials

---

## 🏆 **TEAMS MANAGEMENT**

### **Table: `teams`**

| Form Field    | Database Column | Data Type | Required | Notes                                |
| ------------- | --------------- | --------- | -------- | ------------------------------------ |
| Team Name     | `name`          | `text`    | ✅ Yes   |                                      |
| Age Group     | `age_group`     | `text`    | ✅ Yes   | Options: U8, U10, U12, U14, U16, U18 |
| Description   | `description`   | `text`    | ❌ No    | Optional team description            |
| Logo          | `logo_url`      | `text`    | ❌ No    | URL to uploaded logo                 |
| Team Image    | `team_image`    | `text`    | ❌ No    | URL to uploaded team photo           |
| Active Status | `is_active`     | `boolean` | ✅ Yes   | Default: `true`                      |

### **Storage Locations**

- **Logos**: `https://htgkddahhgugesktujds.supabase.co/storage/v1/object/public/images/logos/`
- **Team Images**: `https://htgkddahhgugesktujds.supabase.co/storage/v1/object/public/images/teams/`

---

## 👥 **PLAYERS MANAGEMENT**

### **Table: `players`**

| Form Field      | Database Column | Data Type | Required | Notes                         |
| --------------- | --------------- | --------- | -------- | ----------------------------- |
| First Name      | `first_name`    | `text`    | ✅ Yes   |                               |
| Last Name       | `last_name`     | `text`    | ✅ Yes   |                               |
| Date of Birth   | `date_of_birth` | `date`    | ✅ Yes   | Used for age calculation      |
| Age             | `age`           | `integer` | ✅ Yes   | Calculated from date_of_birth |
| Gender          | `gender`        | `text`    | ✅ Yes   | Options: Male, Female, Other  |
| Team Assignment | `team_id`       | `uuid`    | ❌ No    | Foreign key to teams table    |
| Active Status   | `is_active`     | `boolean` | ✅ Yes   | Default: `true`               |

### **Related Tables**

- **`teams`**: Linked via `team_id` foreign key
- **Age Validation**: Uses `date_of_birth` to calculate age and validate team compatibility
- **Gender Validation**: Ensures gender compatibility with team type

---

## 📅 **SCHEDULE MANAGEMENT**

### **Table: `schedules`**

| Form Field  | Database Column | Data Type     | Required | Notes                                  |
| ----------- | --------------- | ------------- | -------- | -------------------------------------- |
| Event Type  | `event_type`    | `text`        | ✅ Yes   | Options: Game, Practice, Update, Drill |
| Title       | `title`         | `text`        | ❌ No    | Event title/name                       |
| Date & Time | `date_time`     | `timestamptz` | ✅ Yes   | Event date and time                    |
| Opponent    | `opponent`      | `text`        | ❌ No    | For games only                         |
| Location    | `location`      | `text`        | ❌ No    | Event location                         |
| Comments    | `comments`      | `text`        | ❌ No    | Additional notes                       |
| Duration    | `duration`      | `text`        | ❌ No    | For practices only                     |
| Team        | `team_id`       | `uuid`        | ✅ Yes   | Foreign key to teams table             |
| Created By  | `created_by`    | `uuid`        | ✅ Yes   | Foreign key to users table             |

### **Event Type Specific Fields**

- **Games**: `opponent`, `location`, `comments`
- **Practices**: `title`, `duration`, `location`, `comments`
- **Updates**: `title`, `content` (stored in `comments`)
- **Drills**: `title`, `skills`, `equipment`, `time`, `instructions`, `additional_info`, `benefits`

---

## 📢 **TEAM UPDATES**

### **Table: `team_updates`**

| Form Field   | Database Column | Data Type     | Required | Notes                      |
| ------------ | --------------- | ------------- | -------- | -------------------------- |
| Title        | `title`         | `text`        | ✅ Yes   | Update title               |
| Content      | `content`       | `text`        | ✅ Yes   | Update content             |
| Team         | `team_id`       | `uuid`        | ✅ Yes   | Foreign key to teams table |
| Coach        | `coach_id`      | `uuid`        | ✅ Yes   | Foreign key to users table |
| Created Date | `created_at`    | `timestamptz` | ✅ Yes   | Auto-generated             |
| Deleted Date | `deleted_at`    | `timestamptz` | ❌ No    | Soft delete timestamp      |

---

## 💬 **COACH MESSAGES**

### **Table: `coach_messages`**

| Form Field      | Database Column | Data Type     | Required | Notes                      |
| --------------- | --------------- | ------------- | -------- | -------------------------- |
| Message Content | `content`       | `text`        | ✅ Yes   | Message text               |
| Author          | `author_id`     | `uuid`        | ✅ Yes   | Foreign key to users table |
| Created Date    | `created_at`    | `timestamptz` | ✅ Yes   | Auto-generated             |
| Updated Date    | `updated_at`    | `timestamptz` | ❌ No    | Last modification time     |
| Deleted Date    | `deleted_at`    | `timestamptz` | ❌ No    | Soft delete timestamp      |

---

## 🏃 **PRACTICE DRILLS**

### **Table: `practice_drills`**

| Form Field      | Database Column   | Data Type | Required | Notes                      |
| --------------- | ----------------- | --------- | -------- | -------------------------- |
| Title           | `title`           | `text`    | ✅ Yes   | Drill name                 |
| Skills          | `skills`          | `text`    | ❌ No    | Skills developed           |
| Equipment       | `equipment`       | `text`    | ❌ No    | Required equipment         |
| Time            | `time`            | `text`    | ❌ No    | Duration                   |
| Instructions    | `instructions`    | `text`    | ❌ No    | Step-by-step instructions  |
| Additional Info | `additional_info` | `text`    | ❌ No    | Extra notes                |
| Benefits        | `benefits`        | `text`    | ❌ No    | Drill benefits             |
| Team            | `team_id`         | `uuid`    | ✅ Yes   | Foreign key to teams table |
| Created By      | `created_by`      | `uuid`    | ✅ Yes   | Foreign key to users table |

---

## 🔐 **AUTHENTICATION & USERS**

### **Table: `users`**

| Form Field     | Database Column  | Data Type     | Required | Notes                 |
| -------------- | ---------------- | ------------- | -------- | --------------------- |
| Email          | `email`          | `text`        | ✅ Yes   | Unique identifier     |
| Role           | `role`           | `text`        | ✅ Yes   | Options: admin, coach |
| Password Reset | `password_reset` | `boolean`     | ❌ No    | Default: `false`      |
| Created Date   | `created_at`     | `timestamptz` | ✅ Yes   | Auto-generated        |

### **Related Tables**

- **`auth.users`**: Supabase Auth table for authentication
- **`coaches`**: Linked via email for coach-specific data
- **`schedules`**: Linked via `created_by` for schedule ownership
- **`team_updates`**: Linked via `coach_id` for update authorship
- **`coach_messages`**: Linked via `author_id` for message authorship

---

## 📊 **AUDIT & LOGGING TABLES**

### **Table: `audit_logs`**

| Field     | Database Column | Data Type     | Purpose                   |
| --------- | --------------- | ------------- | ------------------------- |
| Action    | `action`        | `text`        | Type of action performed  |
| Table     | `table_name`    | `text`        | Database table affected   |
| Record ID | `record_id`     | `uuid`        | ID of affected record     |
| User      | `user_id`       | `uuid`        | User who performed action |
| Timestamp | `created_at`    | `timestamptz` | When action occurred      |

### **Table: `login_logs`**

| Field      | Database Column | Data Type     | Purpose             |
| ---------- | --------------- | ------------- | ------------------- |
| User       | `user_id`       | `uuid`        | User who logged in  |
| IP Address | `ip_address`    | `text`        | Login IP address    |
| User Agent | `user_agent`    | `text`        | Browser information |
| Timestamp  | `created_at`    | `timestamptz` | Login time          |

### **Table: `error_logs`**

| Field         | Database Column | Data Type     | Purpose                    |
| ------------- | --------------- | ------------- | -------------------------- |
| Error Message | `error_message` | `text`        | Error description          |
| Stack Trace   | `stack_trace`   | `text`        | Technical error details    |
| User          | `user_id`       | `uuid`        | User who encountered error |
| Timestamp     | `created_at`    | `timestamptz` | When error occurred        |

---

## 🔗 **RELATIONSHIPS & FOREIGN KEYS**

### **Primary Relationships**

- **Teams → Players**: `teams.id` → `players.team_id`
- **Users → Schedules**: `users.id` → `schedules.created_by`
- **Teams → Schedules**: `teams.id` → `schedules.team_id`
- **Users → Team Updates**: `users.id` → `team_updates.coach_id`
- **Teams → Team Updates**: `teams.id` → `team_updates.team_id`
- **Users → Coach Messages**: `users.id` → `coach_messages.author_id`
- **Teams → Practice Drills**: `teams.id` → `practice_drills.team_id`
- **Users → Practice Drills**: `users.id` → `practice_drills.created_by`

### **Authentication Relationships**

- **Auth Users → Users**: `auth.users.id` → `users.id`
- **Users → Coaches**: `users.email` → `coaches.email`

---

## 🛡️ **SECURITY & PERMISSIONS**

### **Row Level Security (RLS)**

- **Coaches**: RLS policies control access to coach data
- **Teams**: RLS policies control team data access
- **Players**: RLS policies control player data access
- **Schedules**: RLS policies control schedule access
- **Messages**: RLS policies control message access

### **User Roles**

- **Admin**: Full access to all data and functions
- **Coach**: Limited access to assigned team data only

---

## 📝 **NOTES & CONSIDERATIONS**

### **Data Validation**

- Age validation uses `date_of_birth` to calculate age
- Gender validation ensures team compatibility
- Team assignment validation prevents age/gender mismatches

### **File Storage**

- Images stored in Supabase Storage
- URLs stored in database as text fields
- Automatic file naming based on team/coach names

### **Soft Deletes**

- Most tables use `deleted_at` for soft deletes
- Allows data recovery and audit trails
- Maintains referential integrity

### **Timestamps**

- All tables include `created_at` timestamps
- Some tables include `updated_at` for modification tracking
- Automatic timestamp generation via database triggers

---

_Last Updated: October 22, 2025_  
_Database Version: Supabase PostgreSQL_  
_Schema Version: 1.0_
