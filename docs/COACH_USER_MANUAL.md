# WCS Basketball Coach User Manual

**Version:** 1.0  
**Date:** January 2025  
**For:** Coaches

---

<div style="page-break-after: always;"></div>

## Table of Contents

1. [Introduction](#introduction)
2. [Public-Facing Pages](#public-facing-pages)
3. [Parent Portal Overview](#parent-portal-overview)
4. [Coach Section](#coach-section)
   - [4.1 Login and Authentication](#41-login-and-authentication)
   - [4.2 Coach Dashboard Overview](#42-coach-dashboard-overview)
   - [4.3 Profile Tab](#43-profile-tab)
     - [4.3.1 Personal Info Section](#431-personal-info-section)
     - [4.3.2 Teams Section](#432-teams-section)
     - [4.3.3 Activity Section](#433-activity-section)
     - [4.3.4 Account Section](#434-account-section)
     - [4.3.5 Schedule Section](#435-schedule-section)
     - [4.3.6 Messages Section](#436-messages-section)
     - [4.3.7 Resources Section](#437-resources-section)
   - [4.4 Coach Tab](#44-coach-tab)
   - [4.5 Manage Tab](#45-manage-tab)

---

<div style="page-break-after: always;"></div>

## Introduction

Welcome to the WCS Basketball Coach User Manual! This comprehensive guide will help you navigate and utilize all the coaching features of the WCS Basketball web application.

### About WCS Basketball Platform

The WCS Basketball platform is a comprehensive basketball program management system designed to streamline operations for administrators, coaches, parents, and players. The platform provides tools for team management, scheduling, communication, and more.

### Purpose of This Manual

This manual is specifically designed for coaches who need to:
- Manage team schedules (games and practices)
- Post team updates and announcements
- Create and manage practice drills
- Communicate with other coaches via message board
- View team rosters and player information
- Access resources and documents

### Quick Navigation Guide

- **Public Pages**: Accessible to all visitors (Home, Teams, Schedules, Drills)
- **Parent Portal**: Where parents register, view their children's information, and make payments
- **Coach Dashboard**: Your main workspace for managing your assigned teams
- **Profile**: Your personal information and account settings

---

<div style="page-break-after: always;"></div>

## Public-Facing Pages

Before diving into coaching functions, it's helpful to understand what visitors and parents see on the public-facing website.

### Home Page

The home page (`/`) is the main landing page that showcases the basketball program.

**Key Features:**
- **Hero Section**: Video background with a flaming basketball animated GIF overlay
- **Quote Section**: Inspirational quotes about basketball and teamwork
- **Fan Zone**: Interactive carousel with navigation cards to different sections
- **Team Updates**: Latest news and announcements from teams
- **Logo Marquee**: Rotating display of team logos
- **Ad Section**: Promotional content and sponsors

[SCREENSHOT: Home page showing hero section, fan zone, and team updates]

### Teams Page

The Teams page (`/teams`) displays all active teams in the program.

**Features:**
- Grid layout showing all teams
- Team cards with logos, names, age groups, and gender
- Clickable team cards that lead to detailed team pages
- Team detail pages show:
  - Team information and coaches
  - Upcoming games and practices
  - Team roster

[SCREENSHOT: Teams page showing grid of team cards]

### Schedules Page

The Schedules page (`/schedules`) displays all upcoming games and practices.

**Features:**
- Calendar view or list view of events
- Color-coded event types (Games, Practices, Tournaments)
- Filter by team (if applicable)
- Event details include:
  - Date and time
  - Location
  - Opponent (for games)
  - Team name

[SCREENSHOT: Schedules page showing calendar or list view of events]

### Drills Page

The Drills page (`/drills`) provides access to the practice drill library.

**Features:**
- Comprehensive drill library
- Filtering options:
  - By time duration
  - By skill level
  - By difficulty (Basic, Intermediate, Advanced, Expert)
  - By category (Drill, Warm-up, Conditioning, Skill Development, Team Building)
- Detailed drill view with:
  - Instructions
  - Required equipment
  - Benefits
  - Images (when available)

[SCREENSHOT: Drills page showing drill library with filters]

### About Page

The About page (`/about`) provides information about the WCS Basketball program, values, and mission.

[SCREENSHOT: About page]

### Tournament Signup Page

The Tournament Signup page (`/tournament-signup`) is used by **outside teams** to register for the club's annual tournament.

**Important Notes:**
- This page is specifically for external teams (not WCS players/parents)
- WCS players and parents will have their tournament signup handled by administrators through the admin dashboard
- External teams can register themselves through this public page

**Features:**
- Tournament information
- Registration form for external teams
- Payment processing (if applicable)

[SCREENSHOT: Tournament signup page with registration form]

---

<div style="page-break-after: always;"></div>

## Parent Portal Overview

Understanding what parents see and can do helps you better support them and communicate effectively.

### What Parents Can Do

Parents have access to a dedicated portal where they can:

1. **Register New Players**: Create an account and register their child(ren) for the program
2. **View Player Information**: See their children's team assignments, status, and details
3. **Make Payments**: Complete registration payments and view payment history
4. **Add Additional Children**: Register multiple children under one parent account
5. **Update Contact Information**: Edit their contact details

### Registration Process Overview

When a new parent registers:

1. Parent chooses authentication method:
   
   a. **Email Registration**: Parent signs up using their email address and creates a password
   
   b. **Google Sign-In**: Parent links their WCS account to their Gmail address through Google sign-in

2. Parent fills out registration form with:
   
   a. Parent contact information
   
   b. Child's information (name, date of birth, grade, gender)
   
   c. Waiver agreement

3. System creates parent account

4. Player is created with "pending" status

5. Admin reviews and approves player

6. If approved, parent receives email with payment link

7. Parent completes payment

8. Player status changes to "active"

### Parent Profile Features

Parents can access their profile at `/parent/profile` with three main tabs:

- **Players Tab**: View all registered children, their status, team assignments, and details
- **Contact Info Tab**: Edit parent contact information
- **Billing Tab**: View payment history and transaction details

[SCREENSHOT: Parent profile page showing the three tabs]

**Note**: Parents manage their own profiles through the parent portal. Admin viewing of parent information has not been set up yet.

---

<div style="page-break-after: always;"></div>

## Coach Section

This section covers all coaching features available to you as a coach user.

### 4.1 Login and Authentication

#### Accessing the Coach Login Page

1. Navigate to the WCS Basketball website
2. Click on the **"Coaches"** link in the navigation bar, OR
3. Navigate directly to: `https://[your-domain]/coaches/login`

[SCREENSHOT: Navigation bar showing "Coaches" link]

[SCREENSHOT: Coach login page]

#### Login Process

1. **Enter Your Email Address**
   
   a. Type your coach email address in the email field
   
   b. Ensure the email is correct (case-sensitive)

2. **Enter Your Password**
   
   a. Type your password in the password field
   
   b. Click the eye icon to show/hide password if needed

3. **Click "Sign In"**
   
   a. The system will validate your credentials
   
   b. You'll be redirected to the Coach Dashboard (`/admin/club-management`)

[SCREENSHOT: Login form with email and password fields filled]

**Security Features:**
- Rate limiting: Maximum 5 login attempts per 5 minutes
- CSRF protection: Built-in security tokens
- Input sanitization: All inputs are automatically sanitized

**Troubleshooting:**
- If you see "Too many login attempts", wait 5 minutes before trying again
- If you forget your password, use the "Forgot Password" link
- Contact system administrator if you're locked out

#### Password Reset

If you need to reset your password:

1. On the login page, click **"Forgot Password?"**

2. Enter your email address

3. Check your email for a password reset link

4. Click the link and follow the instructions to create a new password

[SCREENSHOT: Forgot password form]

---

<div style="page-break-after: always;"></div>

### 4.2 Coach Dashboard Overview

After logging in, you'll be taken to the Coach Dashboard, also called the Club Management page.

#### Dashboard Layout

The Coach Dashboard is organized into tabs at the top:

1. **Profile** - Your personal information and account settings
2. **Coach** - Team management tools (schedules, updates, drills, messages)
3. **Manage** - View teams and players (limited access)

[SCREENSHOT: Coach dashboard showing all three tabs]

#### Tab Navigation

- Click any tab name to switch between sections
- The active tab is highlighted in red
- Your current location is saved, so refreshing the page keeps you on the same tab

#### Dashboard Header

At the top of the dashboard, you'll see:
- Welcome message with your name
- Unread mentions badge (if you have unread mentions in messages)
- Inspirational quote

[SCREENSHOT: Dashboard header with welcome message and unread mentions]

**Note**: As a coach, you only have access to teams assigned to you by an administrator. You cannot create new teams or coaches.

---

<div style="page-break-after: always;"></div>

### 4.3 Profile Tab

The Profile tab contains your personal information, account settings, and resource access. It's organized into several sections accessible via the left sidebar.

#### Profile Tab Sections

The Profile tab has the following sections:
- **Personal Info** - View and edit your personal information
- **Teams** - View teams you're assigned to
- **Activity** - View your activity statistics
- **Account** - Manage account settings and password
- **Schedule** - Coming soon feature
- **Messages** - Access the message board
- **Resources** - Download documents and logos

[SCREENSHOT: Profile tab showing sidebar navigation with all sections]

---

#### 4.3.1 Personal Info Section

The Personal Info section displays and allows you to edit your personal information.

**Viewing Personal Information:**

1. Click the **Profile** tab

2. Click **"Personal Info"** in the left sidebar (it's selected by default)

3. View your information:
   
   a. First Name
   
   b. Last Name
   
   c. Email (read-only)
   
   d. Phone
   
   e. Bio
   
   f. Quote

[SCREENSHOT: Personal Info section showing read-only view]

**Editing Personal Information:**

1. In the Personal Info section, click the **"Edit"** button (top right)

2. The form will switch to edit mode

3. Update any of the following fields:
   
   a. **First Name**: Your first name
   
   b. **Last Name**: Your last name
   
   c. **Phone**: Your phone number (format: (555) 123-4567)
   
   d. **Bio**: A brief biography about yourself
   
   e. **Quote**: Your favorite quote or motto

4. Click **"Save Changes"** to save, or **"Cancel"** to discard changes

[SCREENSHOT: Personal Info section in edit mode with form fields]

**Note**: Your email address cannot be changed from this interface. Contact an administrator if you need to change your email.

---

#### 4.3.2 Teams Section

The Teams section shows all teams you're assigned to as a coach.

**Viewing Your Teams:**

1. Click the **Profile** tab

2. Click **"Teams"** in the left sidebar

3. View the teams you're assigned to:
   
   a. Team name
   
   b. Age group
   
   c. Gender (Boys/Girls)
   
   d. Team logo (if available)

[SCREENSHOT: Teams section showing team cards with logos and information]

**Note**: You can only see teams that have been assigned to you by an administrator. If you don't see a team you should have access to, contact an administrator.

---

#### 4.3.3 Activity Section

The Activity section provides statistics about your account activity and content creation.

**Viewing Activity Statistics:**

1. Click the **Profile** tab

2. Click **"Activity"** in the left sidebar

3. View the following statistics:

**Activity Statistics:**
- **Total Logins**: Number of times you've logged in
- **Last Activity**: Date and time of your last login
- **Account Created**: Date your account was created

**Content Created:**
- **Schedules**: Number of games/practices you've created
- **Updates**: Number of team updates you've posted
- **Drills**: Number of practice drills you've created

**Message Board Activity:**
- **Total Messages**: Number of messages you've posted
- **Unread Mentions**: Number of times you've been mentioned in messages

[SCREENSHOT: Activity section showing all statistics in organized cards]

---

#### 4.3.4 Account Section

The Account section allows you to manage your account security and view account status.

**Viewing Account Information:**

1. Click the **Profile** tab

2. Click **"Account"** in the left sidebar

3. View your account information:

**Security:**
- **Password**: Button to change your password
- **Last Password Changed**: Date you last changed your password (if applicable)

**Account Status:**
- **Status**: Active or Inactive indicator
- **Account Created**: Date your account was created

[SCREENSHOT: Account section showing security and account status information]

**Changing Your Password:**

1. In the Account section, click **"Change Password"**

2. A modal window will appear

3. Enter your **Current Password**

4. Enter your **New Password** (must meet security requirements)

5. Confirm your **New Password** by entering it again

6. Click **"Change Password"** to save, or **"Cancel"** to close

[SCREENSHOT: Change password modal with form fields]

**Password Requirements:**
- Minimum length requirements (check with system administrator)
- Must be different from your current password

---

#### 4.3.5 Schedule Section

The Schedule section is a placeholder for future schedule management features.

**Current Status:**
- This section displays "Coming Soon"
- Schedule management and availability features are in development

[SCREENSHOT: Schedule section showing "Coming Soon" message]

**Note**: For now, use the Coach tab to manage schedules for your teams.

---

#### 4.3.6 Messages Section

The Messages section provides access to the Coach Message Board directly from your profile.

**Accessing Messages:**

1. Click the **Profile** tab

2. Click **"Messages"** in the left sidebar

3. The message board will load in the main content area

[SCREENSHOT: Messages section showing message board]

**Message Board Features:**
- View all messages from coaches and admins
- Post new messages
- Reply to existing messages
- View and respond to mentions (when someone tags you with @yourname)

**Note**: The Messages section in the Profile tab provides the same functionality as the message board in the Coach tab. See section 4.4 for detailed message board instructions.

---

#### 4.3.7 Resources Section

The Resources section allows you to view and download documents, team logos, and club logos. As a coach, you have read-only access to resources.

**Accessing Resources:**

1. Click the **Profile** tab

2. Click **"Resources"** in the left sidebar

3. View the three resource categories:
   
   a. Documents
   
   b. Team Logos
   
   c. Club Logos

[SCREENSHOT: Resources section showing three categories]

#### Documents Subsection

**Viewing Documents:**

1. In the Resources section, scroll to the **"Documents"** subsection
2. View all available documents in a grid layout
3. Each document card shows:
   - Document name
   - File size
   - Download option

[SCREENSHOT: Documents subsection showing grid of document cards]

**Downloading Documents:**

1. Click on any document card
2. A confirmation modal will appear
3. Click **"Download"** to download the file
4. The file will download to your computer

[SCREENSHOT: Document download confirmation modal]

**Note**: Only administrators can upload or delete documents. If you need a document added, contact an administrator.

#### Team Logos Subsection

**Viewing Team Logos:**

1. In the Resources section, scroll to the **"Team Logos"** subsection
2. View all available team logos in a grid layout
3. Each logo card shows:
   - Team name
   - Logo preview
   - File size

[SCREENSHOT: Team Logos subsection showing grid of logo cards]

**Downloading Team Logos:**

1. Click on any team logo card
2. A confirmation modal will appear showing the logo preview
3. Click **"Download"** to download the logo file

[SCREENSHOT: Team logo download modal with preview]

**Note**: Only administrators can upload or delete team logos.

#### Club Logos Subsection

**Viewing Club Logos:**

1. In the Resources section, scroll to the **"Club Logos"** subsection
2. View all available club logos in a grid layout
3. Each logo card shows:
   - Logo name
   - Logo preview
   - File size

[SCREENSHOT: Club Logos subsection showing grid of logo cards]

**Downloading Club Logos:**

1. Click on any club logo card
2. A confirmation modal will appear showing the logo preview
3. Click **"Download"** to download the logo file

[SCREENSHOT: Club logo download modal with preview]

**Note**: Only administrators can upload or delete club logos.

---

<div style="page-break-after: always;"></div>

### 4.4 Coach Tab

The Coach tab is your primary workspace for managing your assigned teams. Here you can create schedules, post updates, manage drills, and communicate with other coaches.

**Accessing the Coach Tab:**

1. Click the **"Coach"** tab in the dashboard navigation
2. The coach dashboard will load

[SCREENSHOT: Coach tab interface]

#### Team Selection

At the top of the Coach tab, you'll see a team selector dropdown.

**Selecting a Team:**

1. Click the **Team Selector** dropdown

2. Choose one of your assigned teams from the list

3. The dashboard will update to show that team's information

[SCREENSHOT: Team selector dropdown with assigned teams listed]

**Note**: You can only see and manage teams that have been assigned to you by an administrator. If you need access to additional teams, contact an administrator.

#### Dashboard Statistics

After selecting a team, you'll see statistics cards:
- **Next Game**: Days until next game and opponent
- **New Updates**: Number of recent team updates
- **Practice Drills**: Number of drills in the library

[SCREENSHOT: Statistics cards showing team metrics]

#### Creating Games

**Adding a Single Game:**

1. In the Coach tab, select a team from the dropdown

2. Scroll to the **"Upcoming Games"** section

3. Click the **"+ Add Game"** button

4. A modal window will appear with the game creation form

5. Fill in the game information:
   
   a. **Title** (optional - defaults to "Game")
   
   b. **Date & Time** (required - date and time picker)
   
   c. **Opponent** (optional - team name)
   
   d. **Location** (optional - venue address)
   
   e. **Description** (optional - additional details)
   
   f. **Team** (pre-selected based on your team selection)

6. Click **"Create Game"** to save

7. The game will appear in the upcoming games list and on the public schedules page

[SCREENSHOT: Add Game modal with form fields]

**Editing a Game:**

The process for editing a game follows the same pattern as adding a game (see "Adding a Single Game" above):

1. Find the game in the "Upcoming Games" section

2. Click the **"Edit"** button (pencil icon) on the game card

3. The modal will open with the game's current information pre-filled

4. Update any fields you want to change

5. Click **"Save Changes"**

**Deleting a Game:**

The delete process follows the same confirmation pattern as other delete operations:

1. Find the game in the "Upcoming Games" section

2. Click the **"Delete"** button (trash icon) on the game card

3. Confirm the deletion

4. The game will be removed from all locations

[SCREENSHOT: Game card with edit and delete buttons]

#### Creating Practices

**Adding a Single Practice:**

1. In the Coach tab, scroll to the **"Practice Schedule"** section

2. Click the **"+ Add Practice"** button

3. A modal window will appear with the practice creation form

4. Fill in the practice information:
   
   a. **Title** (optional - defaults to "Practice")
   
   b. **Date & Time** (required - date and time picker)
   
   c. **Location** (optional - practice venue)
   
   d. **Description** (optional - practice focus, drills planned, etc.)
   
   e. **Team** (pre-selected based on your team selection)

5. Click **"Create Practice"** to save

6. The practice will appear in the practice schedule and on the public schedules page

[SCREENSHOT: Add Practice modal with form fields]

**Creating Recurring Practices:**

For teams that practice on a regular schedule (e.g., every Tuesday and Thursday), you can create recurring practices.

1. In the Practice Schedule section, click **"+ Add Practice"**

2. In the modal, look for **"Recurring Practice"** option or toggle

3. Enable recurring practice

4. Fill in the practice details:
   
   a. **Start Date** (when to begin the recurring schedule)
   
   b. **End Date** (when to stop, or leave open-ended)
   
   c. **Days of Week** (select which days: Monday, Tuesday, etc.)
   
   d. **Time** (practice time)
   
   e. **Location** (practice venue)
   
   f. **Frequency** (weekly, bi-weekly, etc.)

5. Click **"Create Recurring Practice"** to save

6. The system will create all practice instances automatically

[SCREENSHOT: Recurring practice form with day selection]

**Editing a Practice:**

The process for editing a practice follows the same pattern as adding a practice (see "Adding a Single Practice" above):

1. Find the practice in the "Practice Schedule" section

2. Click the **"Edit"** button (pencil icon) on the practice card

3. The modal will open with the practice's current information pre-filled

4. Update any fields you want to change

5. Click **"Save Changes"**

**Deleting Practices:**

**Deleting a Single Practice:**

The delete process follows the same confirmation pattern as deleting games:

1. Find the practice in the "Practice Schedule" section

2. Click the **"Delete"** button (trash icon) on the practice card

3. Confirm the deletion

**Bulk Delete All Practices:**

1. In the Practice Schedule section, look for **"Delete All Practices"** button

2. Click the button

3. A confirmation dialog will appear

4. Confirm that you want to delete ALL practices for the selected team

5. All practices will be permanently removed

**Warning**: Bulk delete cannot be undone. Make sure you want to delete all practices before confirming.

[SCREENSHOT: Bulk delete confirmation dialog]

#### Posting Team Updates

Team updates are announcements and news posts that appear on team pages and the home page. These are great for keeping parents and players informed.

**Creating a Team Update:**

1. In the Coach tab, scroll to the **"Recent Announcements"** section

2. Click the **"+ Add Update"** button

3. A modal window will appear with the update creation form

4. Fill in the update information:
   
   a. **Title** (required - headline for the update)
   
   b. **Content** (required - main text of the update)
   
   c. **Date & Time** (optional - defaults to current date/time)
   
   d. **Image URL** (optional - link to an image to include)
   
   e. **Team** (pre-selected based on your team selection)

5. Click **"Create Update"** to save

6. The update will appear in recent announcements and on the team's public page

[SCREENSHOT: Add Update modal with form fields]

**Tips for Effective Updates:**
- Keep titles clear and concise
- Include important dates and times
- Use images to make updates more engaging
- Post regularly to keep parents informed

**Editing a Team Update:**

The process for editing an update follows the same pattern as creating an update (see "Creating a Team Update" above):

1. Find the update in the "Recent Announcements" section

2. Click the **"Edit"** button (pencil icon) on the update card

3. The modal will open with the update's current information pre-filled

4. Update any fields you want to change

5. Click **"Save Changes"**

**Deleting a Team Update:**

The delete process follows the same confirmation pattern as other delete operations:

1. Find the update in the "Recent Announcements" section

2. Click the **"Delete"** button (trash icon) on the update card

3. Confirm the deletion

4. The update will be removed from all locations

[SCREENSHOT: Update card with edit and delete buttons]

#### Managing Practice Drills

Practice drills are exercises and activities that you can use during practices. You can create drills, view the drill library, and organize drills by category and difficulty.

**Viewing Practice Drills:**

1. In the Coach tab, you'll see drill statistics in the dashboard
2. Scroll to view drills or navigate to the Drills page (`/drills`) for the full library

**Creating a Practice Drill:**

1. In the Coach tab, look for the **"Practice Drills"** section or button

2. Click **"+ Add Drill"** or navigate to create drill option

3. A modal window will appear with the drill creation form

4. Fill in the drill information:
   
   a. **Title** (required - name of the drill)
   
   b. **Category** (required - dropdown: Drill, Warm-up, Conditioning, Skill Development, Team Building)
   
   c. **Difficulty** (required - dropdown: Basic, Intermediate, Advanced, Expert)
   
   d. **Time** (required - duration, e.g., "10 minutes")
   
   e. **Skills** (required - array of skills worked on, e.g., "Dribbling", "Shooting", "Defense")
   
   f. **Equipment** (optional - array of required equipment, e.g., "Basketballs", "Cones")
   
   g. **Instructions** (required - step-by-step instructions)
   
   h. **Benefits** (required - what players will gain from this drill)
   
   i. **Additional Info** (optional - extra notes)
   
   j. **Image URL** (optional - demonstration image)
   
   k. **Week Number** (optional - for curriculum planning)
   
   l. **Team** (pre-selected based on your team selection)

5. Click **"Create Drill"** to save

6. The drill will be added to the drill library and available to all coaches

[SCREENSHOT: Add Drill modal with all form fields]

**Editing a Practice Drill:**

The process for editing a drill follows the same pattern as creating a drill (see "Creating a Practice Drill" above):

1. Find the drill you want to edit (in drill library or list)

2. Click the **"Edit"** button (pencil icon)

3. The modal will open with the drill's current information pre-filled

4. Update any fields you want to change

5. Click **"Save Changes"**

**Deleting a Practice Drill:**

The delete process follows the same confirmation pattern as other delete operations:

1. Find the drill you want to delete

2. Click the **"Delete"** button (trash icon)

3. Confirm the deletion

4. The drill will be removed from the library

[SCREENSHOT: Drill card with edit and delete buttons]

**Note**: Drills you create are available to all coaches in the system. Be descriptive and clear in your instructions so other coaches can use your drills effectively.

#### Message Board Usage

The message board allows coaches and admins to communicate with each other. This is useful for coordinating schedules, sharing information, and asking questions.

**Accessing the Message Board:**

1. In the Coach tab, scroll to the **"Message Board"** section
2. Or access it from the Profile tab → Messages section (see 4.3.6)

[SCREENSHOT: Message board interface]

**Posting a New Message:**

1. In the message board, click **"New Message"** or the message input area
2. Type your message in the text area
3. Use **@mentions** to tag other coaches/admins:
   - Type **@** followed by their name or email prefix
   - A dropdown will appear with matching users
   - Select the person you want to mention
4. Click **"Post"** to publish your message
5. Your message will appear at the top of the message board
6. Mentioned users will receive a notification

[SCREENSHOT: New message input with @mention example]

**Replying to a Message:**

1. Find the message you want to reply to

2. Click **"Reply"** button

3. Type your reply in the reply text area

4. Use @mentions if needed to tag specific people

5. Click **"Post Reply"** to publish

6. Your reply will appear nested under the original message

[SCREENSHOT: Reply interface below a message]

**Viewing and Responding to Mentions:**

When someone mentions you in a message (using @yourname), you'll receive a notification.

1. Look for the **unread mentions badge** in the dashboard header:
   
   a. The badge shows a number indicating how many unread mentions you have

2. Click on the badge or navigate to the Messages section

3. Messages where you're mentioned will be highlighted or marked

4. Click on a mentioned message to view it

5. Reply if needed

6. The mention will be marked as read when you view it

[SCREENSHOT: Unread mentions badge and highlighted messages]

**Best Practices for Message Board:**
- Use @mentions when you need a specific person's attention
- Keep messages clear and concise
- Reply to messages promptly
- Use the message board for team coordination and questions
- Be respectful and professional in all communications

---

<div style="page-break-after: always;"></div>

### 4.5 Manage Tab

The Manage tab allows you to view information about your assigned teams and players. As a coach, you have limited access - you can view but not create or edit teams and players.

**Accessing the Manage Tab:**

1. Click the **"Manage"** tab in the dashboard navigation
2. The management interface will load with sections for:
   - Teams (view only)
   - Players (view only)

[SCREENSHOT: Manage tab showing view-only sections]

#### Viewing Your Teams

**Viewing Team Information:**

1. In the Manage tab, locate the **"Teams"** section

2. Click the section header to expand it (if collapsed)

3. View the list of teams assigned to you:
   
   a. Team name
   
   b. Age group
   
   c. Gender
   
   d. Grade level
   
   e. Season
   
   f. Status

[SCREENSHOT: Teams section showing list of assigned teams]

**Viewing Team Details:**

1. In the Teams list, click the **"View"** button (eye icon) next to a team's name

2. A detailed view modal will appear showing:
   
   a. Full team information
   
   b. Assigned coaches
   
   c. Current roster (players)
   
   d. Team statistics

[SCREENSHOT: Team detail modal showing all information]

**Note**: You can only view teams assigned to you. You cannot create new teams or edit team information. Contact an administrator if you need team information changed.

#### Viewing Players

**Viewing Player Information:**

1. In the Manage tab, locate the **"Players"** section

2. Click the section header to expand it (if collapsed)

3. View the list of players on your assigned teams:
   
   a. Player name
   
   b. Team assignment
   
   c. Status (pending, approved, active, on hold, rejected)
   
   d. Parent information
   
   e. Jersey number

[SCREENSHOT: Players section showing list of players]

**Filtering Players:**

1. Use the **Team Filter** dropdown to filter by team

2. Use the **Search** box to find specific players by name

3. The list will update in real-time

[SCREENSHOT: Players section with search and filter options]

**Viewing Player Details:**

1. In the Players list, click the **"View"** button (eye icon) next to a player's name

2. A detailed view modal will appear showing:
   
   a. Full player information
   
   b. Parent/guardian information
   
   c. Emergency contacts
   
   d. Team assignment
   
   e. Status history

[SCREENSHOT: Player detail modal showing all information]

**Note**: You can only view players on teams assigned to you. You cannot create, edit, or delete players. Player registration and approval is handled by administrators. If you notice incorrect player information, contact an administrator.

#### Limited Editing Capabilities

As a coach, your editing capabilities in the Manage tab are limited to viewing only. You cannot:
- Create new teams
- Edit team information
- Create new players
- Edit player information
- Delete teams or players
- Approve or reject players

**What You Can Do:**
- View team and player information
- See player status and contact information
- Access team rosters
- View team statistics

If you need to make changes to teams or players, contact an administrator who has full access to the Manage tab.

---

<div style="page-break-after: always;"></div>

## Conclusion

Congratulations! You've completed the WCS Basketball Coach User Manual. This guide has covered all the major coaching features available in the system.

### Key Takeaways

- **Profile Tab**: Manage your personal information, view activity, and access resources
- **Coach Tab**: Create schedules, post updates, manage drills, and communicate via message board
- **Manage Tab**: View your assigned teams and players (read-only access)

### Getting Help

If you need assistance:
1. Review the relevant section in this manual
2. Check the system for inline help text and tooltips
3. Contact an administrator for team/player management needs
4. Use the message board to ask other coaches questions

### Best Practices

- **Regular Updates**: Post team updates regularly to keep parents and players informed
- **Schedule Management**: Keep game and practice schedules up to date
- **Communication**: Use the message board to coordinate with other coaches
- **Drill Library**: Contribute quality drills to help the entire coaching community
- **Organization**: Use recurring practices for teams with regular schedules

### Remember

- You can only manage teams assigned to you by an administrator
- Player registration and approval is handled by administrators
- Contact an administrator if you need access to additional teams or features
- All your content (schedules, updates, drills) is visible to parents and players on the public site

Thank you for using the WCS Basketball platform!

---

**Document Version**: 1.0  
**Last Updated**: January 2025  
**For**: WCS Basketball Coaches

