# Coach Tab Testing Plan - WCS Basketball v2.0

## ⚠️ FINAL PRODUCTION TEST - CRITICAL IMPORTANCE ⚠️

**THIS IS A FINAL PRODUCTION TEST - EVERY FUNCTION MUST WORK CORRECTLY**

This comprehensive testing plan validates ALL Coach tab functionality in the club management page. **EVERY SINGLE FUNCTION MUST WORK PERFECTLY** - there are no acceptable failures in this production test. This plan covers game scheduling, practice management, team updates, drills, and message board operations for team WCS Frost.

**CRITICAL REQUIREMENTS:**

- ✅ All CRUD operations MUST work flawlessly
- ✅ All data MUST persist correctly
- ✅ All error handling MUST work properly
- ✅ All form validations MUST function correctly
- ✅ All UI interactions MUST be responsive
- ✅ All database operations MUST complete successfully

## Test Environment Setup

**Target Team**: WCS Frost  
**Test Period**: November 2025 - January 2026  
**User Role**: Coach (logged in as coach with access to WCS Frost team)

## Test Scenarios

### 1. Game Scheduling Tests

#### 1.1 Create 2 Games in November 2025

- **Test**: Schedule 2 games for WCS Frost in November 2025
- **Steps**:
  1. Navigate to Coach tab in club management
  2. Select WCS Frost team
  3. Click "Add Game" button
  4. Fill in game details:
     - **Game 1**: Date: November 15, 2025, Time: 7:00 PM, Location: WCS Gym, Opponent: WCS Thunder
       Comment: This is the first game scheduled of the test on OCT 24th
     - **Game 2**: Date: November 22, 2025, Time: 6:30 PM, Location: Community Center, Opponent: WCS Warriors
       Comment: This is the second game scheduled of the test on OCT 24th
  5. Submit both games
- **Expected Result**: Both games appear in upcoming games list
- **Validation**: Games visible in schedule view with correct details

#### 1.2 Edit 1 Game

- **Test**: Edit one of the scheduled games
- **Steps**:
  1. Find the November 15th game in the list
  2. Click "Edit" button
  3. Change opponent to "WCS Sharks"
  4. Change location to "Main Arena"
  5. Submit changes
- **Expected Result**: Game details updated successfully
- **Validation**: Edited game shows new opponent and location
- **Mark Edit**: Record date and time of edit

#### 1.3 Delete 1 Game

- **Test**: Delete one of the scheduled games
- **Steps**:
  1. Find the November 22nd game in the list
  2. Click "Delete" button
  3. Confirm deletion
- **Expected Result**: Game removed from schedule
- **Validation**: Game no longer appears in upcoming games list

### 2. Practice Scheduling Tests

#### 2.1 Create 2 Practices in December 2025

- **Test**: Schedule 2 practices for WCS Frost in December 2025
- **Steps**:
  1. Click "Add Practice" button
  2. Fill in practice details:
     - **Practice 1**: Date: December 5, 2025, Time: 6:00 PM, Location: WCS Gym, Duration: 90 minutes
       Comment: This is the first practice scheduled of the test on OCT 24th
     - **Practice 2**: Date: December 12, 2025, Time: 7:30 PM, Location: WCS Gym, Duration: 90 minutes
       Comment: This is the first second scheduled of the test on OCT 24th
  3. Submit both practices
- **Expected Result**: Both practices appear in schedule
- **Validation**: Practices visible in upcoming events list

#### 2.2 Edit 1 Practice

- **Test**: Edit one of the scheduled practices
- **Steps**:
  1. Find the December 5th practice in the list
  2. Click "Edit" button
  3. Change time to 7:00 PM
  4. Change duration to 120 minutes
  5. Submit changes
- **Expected Result**: Practice details updated successfully
- **Validation**: Edited practice shows new time and duration
- **Mark Edit**: Record date and time of edit

#### 2.3 Delete 1 Practice

- **Test**: Delete one of the scheduled practices
- **Steps**:
  1. Find the December 12th practice in the list
  2. Click "Delete" button
  3. Confirm deletion
- **Expected Result**: Practice removed from schedule
- **Validation**: Practice no longer appears in upcoming events list

#### 2.4 Create 4 Recurring Practices in January 2026

- **Test**: Schedule recurring practices for WCS Frost in January 2026
- **Steps**:
  1. Click "Add Practice" button
  2. Select "Recurring" option
  3. Set start date: January 8, 2026
  4. Set end date: January 29, 2026
  5. Set frequency: Weekly (every Wednesday)
  6. Set time: 6:30 PM
  7. Set location: WCS Gym
  8. Set duration: 90 minutes
  9. Set comment: This is a reoccurring practices scheduled from the test on OCT 24th
  10. Submit recurring practice
- **Expected Result**: 4 practices created (Jan 8, 15, 22, 29)
- **Validation**: All 4 practices appear in schedule for January 2026

### 3. Team Updates Tests

#### 3.1 Create 2 Team Updates

- **Test**: Create 2 team updates for WCS Frost
- **Steps**:
  1. Navigate to Team Updates section
  2. Click "Add Update" button
  3. Create updates:
     - **Update 1**: Title: "January Practice Schedule", Content: "This is the first update posted from the test on OCT 24th.
       New practice times for January", Date: January 3, 2026
     - **Update 2**: Title: "Tournament Registration", Content: "This is the second update posted from the test on OCT 24th. Sign up for spring tournament", Date: January 10, 2026
  4. Submit both updates
- **Expected Result**: Both updates appear in team updates list
- **Validation**: Updates visible with correct titles and content

#### 3.2 Edit 1 Team Update

- **Test**: Edit one of the team updates
- **Steps**:
  1. Find the "January Practice Schedule" update
  2. Click "Edit" button
  3. Change title to "Updated January Practice Schedule"
  4. Add content: "Updated with new gym availability"
  5. Submit changes
- **Expected Result**: Update details modified successfully
- **Validation**: Edited update shows new title and content
- **Mark Edit**: Record date and time of edit

#### 3.3 Delete 1 Team Update

- **Test**: Delete one of the team updates
- **Steps**:
  1. Find the "Tournament Registration" update
  2. Click "Delete" button
  3. Confirm deletion
- **Expected Result**: Update removed from list
- **Validation**: Update no longer appears in team updates

### 4. Practice Drills Tests

#### 4.1 Create 2 Practice Drills

- **Test**: Create 2 practice drills for WCS Frost
- **Steps**:
  1. Navigate to Practice Drills section
  2. Click "Add Drill" button
  3. Create drills:
     - **Drill 1**: Name: "Free Throw Practice", Description: "Focus on form and consistency. This is the first drill posted from the test on OCT 24th.", Duration: 15 minutes
     - **Drill 2**: Name: "Defensive Drills", Description: "Man-to-man defense techniques. This is the second drill posted from the test on OCT 24th.", Duration: 20 minutes
  4. Submit both drills
- **Expected Result**: Both drills appear in drills library
- **Validation**: Drills visible with correct names and descriptions

#### 4.2 Edit 1 Practice Drill

- **Test**: Edit one of the practice drills
- **Steps**:
  1. Find the "Free Throw Practice" drill
  2. Click "Edit" button
  3. Change duration to 20 minutes
  4. Add description: "Include pressure situations"
  5. Submit changes
- **Expected Result**: Drill details updated successfully
- **Validation**: Edited drill shows new duration and description
- **Mark Edit**: Record date and time of edit

#### 4.3 Delete 1 Practice Drill

- **Test**: Delete one of the practice drills
- **Steps**:
  1. Find the "Defensive Drills" drill
  2. Click "Delete" button
  3. Confirm deletion
- **Expected Result**: Drill removed from library
- **Validation**: Drill no longer appears in drills list

### 5. Message Board Tests

#### 5.1 Create 2 New Messages

- **Test**: Post 2 new messages on the message board
- **Steps**:
  1. Navigate to Message Board section
  2. Click "New Message" button
  3. Fill in the textarea field (placeholder: "What's on your mind?"):
     - **Message 1**: "Practice Cancelled. This is the first comment posted from the test on OCT 24th."
     - **Message 2**: "Tournament Update. This is the second comment posted from the test on OCT 24th."
  4. Click "Post Message" button for both messages
- **Expected Result**: Both messages appear on message board
- **Validation**: Messages visible with correct content and timestamps

#### 5.2 Reply to 2 Existing Messages

- **Test**: Reply to 2 existing messages
- **Steps**:
  1. Find the "Practice Cancelled" message
  2. Click "Reply" button
  3. Fill in the reply textarea field:
     - **Reply 1**: "Thanks for the update, see you next week. This is the first reply posted from the test on OCT 24th."
  4. Click "Post Reply" button
  5. Find the "Tournament Update" message
  6. Click "Reply" button
  7. Fill in the reply textarea field:
     - **Reply 2**: "Looking forward to the tournament. This is the second reply posted from the test on OCT 24th."
  8. Click "Post Reply" button
- **Expected Result**: Both replies appear under respective messages
- **Validation**: Replies visible with correct content and threading

#### 5.3 Edit 1 Message

- **Test**: Edit one of the posted messages
- **Steps**:
  1. Find the "Practice Cancelled" message
  2. Click "Edit" button
  3. Modify the textarea field content to: "Tonight's practice is cancelled due to weather. Rescheduled for tomorrow at 6 PM"
  4. Click "Save Changes" button
- **Expected Result**: Message content updated successfully
- **Validation**: Edited message shows new content
- **Mark Edit**: Record date and time of edit

#### 5.4 Delete 1 Message

- **Test**: Delete one of the posted messages
- **Steps**:
  1. Find the "Tournament Update" message
  2. Click "Delete" button
  3. Confirm deletion
- **Expected Result**: Message removed from board
- **Validation**: Message no longer appears on message board

## Test Data Summary

### Games Created

- November 15, 2025: WCS Frost vs WCS Thunder (7:00 PM, WCS Gym)
- November 22, 2025: WCS Frost vs WCS Warriors (6:30 PM, Community Center) - **DELETED**

### Games Edited

- November 15, 2025: Changed opponent to WCS Sharks, location to Main Arena - **EDITED**

### Practices Created

- December 5, 2025: Practice (6:00 PM, WCS Gym, 90 min) - **EDITED to 7:00 PM, 120 min**
- December 12, 2025: Practice (7:30 PM, WCS Gym, 90 min) - **DELETED**
- January 8, 15, 22, 29, 2026: Recurring practices (6:30 PM, WCS Gym, 90 min)

### Team Updates Created

- January 3, 2026: "January Practice Schedule" - **EDITED**
- January 10, 2026: "Tournament Registration" - **DELETED**

### Practice Drills Created

- "Free Throw Practice" (15 min) - **EDITED to 20 min**
- "Defensive Drills" (20 min) - **DELETED**

### Messages Created

- "Practice Cancelled" - **EDITED and has 1 reply**
- "Tournament Update" - **DELETED but had 1 reply**

## Success Criteria

### Functional Requirements

- [ ] All CRUD operations work correctly (Create, Read, Update, Delete)
- [ ] Data persists after page refresh
- [ ] Error messages display appropriately for failed operations
- [ ] Success messages confirm completed operations
- [ ] Form validation prevents invalid submissions

### User Experience Requirements

- [ ] All operations complete within 3 seconds
- [ ] Clear feedback for all user actions
- [ ] Intuitive navigation between different sections
- [ ] Responsive design works on different screen sizes

### Data Integrity Requirements

- [ ] All created items appear in correct sections
- [ ] Edited items retain all changes
- [ ] Deleted items are completely removed
- [ ] Recurring events generate correct number of instances
- [ ] Message threading works correctly

## Test Execution Notes

### Pre-Test Setup

1. Ensure WCS Frost team exists in the system
2. Verify coach has proper permissions for WCS Frost team
3. Clear any existing test data for WCS Frost team
4. Set system date to November 2025 for accurate testing

### Test Execution

1. Execute tests in the order listed above
2. Document any errors or unexpected behavior
3. Take screenshots of successful operations
4. Record timestamps for all edit operations
5. Verify data persistence after each major operation

### Post-Test Cleanup

1. Remove all test data created during testing
2. Reset system date to current date
3. Document any issues found during testing
4. Create bug reports for any failed operations

## Expected Outcomes

After completing all test scenarios:

- **Total Games**: 1 remaining (1 created, 1 edited, 1 deleted)
- **Total Practices**: 5 remaining (2 created, 1 edited, 1 deleted, 4 recurring)
- **Total Team Updates**: 1 remaining (2 created, 1 edited, 1 deleted)
- **Total Practice Drills**: 1 remaining (2 created, 1 edited, 1 deleted)
- **Total Messages**: 1 remaining with 1 reply (2 created, 1 edited, 1 deleted, 2 replies)

## 🚨 PRODUCTION TEST CRITICAL CHECKLIST 🚨

### Pre-Test Verification

- [ ] **SYSTEM READY**: All previous fixes implemented and tested
- [ ] **AUTHENTICATION**: Valid coach credentials available for WCS Frost team
- [ ] **DATABASE**: All tables accessible and responsive
- [ ] **NETWORK**: Stable connection to Supabase backend
- [ ] **BROWSER**: Clean browser session with no cached data

### Test Execution Requirements

- [ ] **ZERO TOLERANCE**: Any failure = IMMEDIATE STOP and bug report
- [ ] **REAL-TIME LOGGING**: Document every step with timestamps
- [ ] **SCREENSHOTS**: Capture all successful operations
- [ ] **ERROR CAPTURE**: Screenshot and log any failures immediately
- [ ] **DATA VERIFICATION**: Confirm all data persists after page refresh

### Post-Test Validation

- [ ] **FINAL VERIFICATION**: All expected data remains in database
- [ ] **CLEANUP**: Remove all test data after validation
- [ ] **REPORT**: Document any issues found during testing
- [ ] **SIGN-OFF**: Confirm all functionality works as expected

**⚠️ REMEMBER: This is a FINAL PRODUCTION TEST - EVERY FUNCTION MUST WORK PERFECTLY ⚠️**

## 📊 DATABASE FIELD MAPPING DOCUMENTATION

### Games Table Mapping

**Table**: `schedules`
**Event Type**: `Game`

| Form Field  | Database Column | Data Type | Required | Notes                    |
| ----------- | --------------- | --------- | -------- | ------------------------ |
| Date & Time | `date_time`     | timestamp | Yes      | Format: YYYY-MM-DDTHH:MM |
| Opponent    | `opponent`      | text      | Yes      | Team name or opponent    |
| Location    | `location`      | text      | Yes      | Game venue               |
| Comments    | `comments`      | text      | No       | Additional game notes    |
| Game Type   | `game_type`     | text      | No       | "game" or "tournament"   |
| Team ID     | `team_id`       | uuid      | Yes      | References teams.id      |
| Event Type  | `event_type`    | text      | Yes      | Always "Game"            |
| Created By  | `created_by`    | uuid      | Yes      | User ID who created      |

### Practices Table Mapping

**Table**: `schedules`
**Event Type**: `Practice`

| Form Field         | Database Column      | Data Type | Required | Notes                        |
| ------------------ | -------------------- | --------- | -------- | ---------------------------- |
| Date & Time        | `date_time`          | timestamp | Yes      | Format: YYYY-MM-DDTHH:MM     |
| Duration           | `duration`           | integer   | No       | Minutes                      |
| Location           | `location`           | text      | Yes      | Practice venue               |
| Comments           | `comments`           | text      | No       | Practice notes               |
| Team ID            | `team_id`            | uuid      | Yes      | References teams.id          |
| Event Type         | `event_type`         | text      | Yes      | Always "Practice"            |
| Is Recurring       | `is_recurring`       | boolean   | No       | True for recurring practices |
| Recurring End Date | `recurring_end_date` | timestamp | No       | End date for recurring       |
| Selected Days      | `selected_days`      | integer[] | No       | Days of week (0-6)           |
| Created By         | `created_by`         | uuid      | Yes      | User ID who created          |

### Team Updates Table Mapping

**Table**: `team_updates`

| Form Field   | Database Column | Data Type | Required | Notes                   |
| ------------ | --------------- | --------- | -------- | ----------------------- |
| Title        | `title`         | text      | Yes      | Update headline         |
| Content      | `content`       | text      | Yes      | Update body text        |
| Date & Time  | `date_time`     | timestamp | No       | When update was posted  |
| Image URL    | `image_url`     | text      | No       | Optional image          |
| Is Important | `is_important`  | boolean   | No       | Flag for priority       |
| Team ID      | `team_id`       | uuid      | Yes      | References teams.id     |
| Created By   | `created_by`    | uuid      | Yes      | User ID who created     |
| Is Global    | `is_global`     | boolean   | No       | Global vs team-specific |

### Practice Drills Table Mapping

**Table**: `practice_drills`

| Form Field  | Database Column | Data Type | Required | Notes                     |
| ----------- | --------------- | --------- | -------- | ------------------------- |
| Title       | `title`         | text      | Yes      | Drill name                |
| Description | `description`   | text      | Yes      | Drill instructions        |
| Skills      | `skills`        | text[]    | No       | Array of skill categories |
| Equipment   | `equipment`     | text[]    | No       | Required equipment        |
| Time        | `time`          | integer   | No       | Duration in minutes       |
| Team ID     | `team_id`       | uuid      | Yes      | References teams.id       |
| Created By  | `created_by`    | uuid      | Yes      | User ID who created       |

### Message Board Table Mapping

**Table**: `coach_messages`

| Form Field   | Database Column | Data Type | Required | Notes                 |
| ------------ | --------------- | --------- | -------- | --------------------- |
| Message Text | `message`       | text      | Yes      | Message content       |
| Coach Name   | `coach_name`    | text      | Yes      | Display name          |
| User ID      | `user_id`       | uuid      | Yes      | References auth.users |
| Is Pinned    | `is_pinned`     | boolean   | No       | Priority message flag |
| Created At   | `created_at`    | timestamp | Yes      | Auto-generated        |

### Message Replies Table Mapping

**Table**: `coach_message_replies`

| Form Field | Database Column | Data Type | Required | Notes                        |
| ---------- | --------------- | --------- | -------- | ---------------------------- |
| Reply Text | `reply`         | text      | Yes      | Reply content                |
| Message ID | `message_id`    | uuid      | Yes      | References coach_messages.id |
| Coach Name | `coach_name`    | text      | Yes      | Display name                 |
| User ID    | `user_id`       | uuid      | Yes      | References auth.users        |
| Created At | `created_at`    | timestamp | Yes      | Auto-generated               |

### Common Database Fields

**All Tables Include**:

- `id` (uuid, primary key)
- `created_at` (timestamp, auto-generated)
- `updated_at` (timestamp, auto-updated)
- `deleted_at` (timestamp, soft delete)

### Foreign Key Relationships

- `schedules.team_id` → `teams.id`
- `schedules.created_by` → `auth.users.id`
- `team_updates.team_id` → `teams.id`
- `team_updates.created_by` → `auth.users.id`
- `practice_drills.team_id` → `teams.id`
- `practice_drills.created_by` → `auth.users.id`
- `coach_messages.user_id` → `auth.users.id`
- `coach_message_replies.message_id` → `coach_messages.id`
- `coach_message_replies.user_id` → `auth.users.id`

### Data Validation Rules

- **Required Fields**: All form submissions must include required database columns
- **Data Types**: Ensure proper data type conversion (strings to integers, date formatting)
- **Foreign Keys**: Verify team_id and user_id exist before insertion
- **Text Length**: Respect database column length limits
- **Timestamps**: Use UTC timezone for all date/time fields

This comprehensive test plan ensures all Coach tab functionality is thoroughly validated for the WCS Frost team.
