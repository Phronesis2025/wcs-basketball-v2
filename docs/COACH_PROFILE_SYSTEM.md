# Coach Profile System Design

## Overview

This document outlines the design for a comprehensive coach profile system, including first-time login password setup and a detailed profile page.

## 1. First-Time Login Password Setup Flow

### Current State

- Coaches are created with default password "WCS2025"
- `password_reset: true` flag is set in users table
- Coaches must change password on first login

### Proposed Flow

1. Coach logs in with default password
2. System detects `password_reset: true`
3. Redirects to password setup page (mandatory)
4. Coach creates secure password
5. System updates password and sets `password_reset: false`
6. Redirects to coach dashboard

### Implementation

- New route: `/coaches/setup-password`
- Password strength requirements
- Security validation
- Progress indicators

## 2. Coach Profile Page Content

### Basic Information Section

- **Coach's Name** (first_name, last_name)
- **Email Address** (editable)
- **Profile Image** (upload/change functionality)
- **Bio/Quote** (editable)
- **Contact Information** (phone, additional email if needed)

### Teams & Responsibilities Section

- **Associated Teams** (from team_coaches table)
- **Team Roles** (head coach, assistant, etc.)
- **Team Statistics** (number of players, team performance)

### Activity & Analytics Section

- **Login Statistics** (total logins, last login, first login)
- **Content Created** (schedules, updates, drills posted)
- **Message Board Activity** (posts, replies)
- **Team Updates Posted** (count and recent activity)

### Account Management Section

- **Change Password** (secure password update)
- **Account Status** (active/inactive)
- **Security Settings** (login notifications, etc.)

## 3. Additional Valuable Information

### Performance Metrics

- **Team Performance** (wins/losses if tracked)
- **Player Development** (players added/removed)
- **Engagement Score** (how active they are on the platform)

### Schedule & Availability

- **Upcoming Events** (next 7 days)
- **Practice Schedule** (recurring practices)
- **Availability Status** (available, busy, away)

### Communication Hub

- **Recent Messages** (from message board)
- **Unread Notifications** (system alerts)
- **Team Communication** (recent team updates)

### Resources & Tools

- **Favorite Practice Drills** (bookmarked drills)
- **Custom Drill Library** (drills they created)
- **Team Documents** (uploaded resources)

### Security & Privacy

- **Login History** (recent login attempts)
- **Password Last Changed** (security reminder)
- **Two-Factor Authentication** (if enabled)

## 4. Implementation Plan

### Phase 1: Password Setup Flow

- New route: `/coaches/setup-password`
- Detects first-time login
- Forces password change
- Updates user record
- Redirects to dashboard

### Phase 2: Profile Page

- New route: `/coaches/profile`
- Personal information editing
- Team associations display
- Activity dashboard
- Account management

### Phase 3: Enhanced Features

- Analytics dashboard
- Communication hub
- Resource management
- Security settings

## 5. Database Considerations

### Additional Fields for coaches table

```sql
ALTER TABLE coaches ADD COLUMN phone VARCHAR(20);
ALTER TABLE coaches ADD COLUMN bio TEXT;
ALTER TABLE coaches ADD COLUMN availability_status VARCHAR(20) DEFAULT 'available';
```

### Additional Fields for users table

```sql
ALTER TABLE users ADD COLUMN last_password_change TIMESTAMP;
ALTER TABLE users ADD COLUMN profile_completed BOOLEAN DEFAULT false;
```

## 6. UI/UX Considerations

### Profile Page Layout

- **Header:** Coach photo, name, team badges
- **Tabs:** Personal Info | Teams | Activity | Settings
- **Quick Stats:** Login count, content created, team count
- **Recent Activity:** Timeline of recent actions

### Password Setup Page

- Clean, focused design
- Password strength indicator
- Security tips
- Progress indicator

## 7. Security Features

### Password Requirements

- Minimum 8 characters
- Must include uppercase, lowercase, number
- Cannot be common passwords
- Cannot reuse last 3 passwords

### Account Security

- Login attempt tracking
- Suspicious activity alerts
- Password expiration reminders
- Session management

## 8. Future Enhancements

### Advanced Analytics

- Team performance tracking
- Player development metrics
- Engagement scoring
- Content effectiveness analysis

### Communication Features

- Direct messaging between coaches
- Team announcement system
- Parent communication tools
- Mobile notifications

### Resource Management

- File upload system
- Document sharing
- Practice drill templates
- Team playbook storage
