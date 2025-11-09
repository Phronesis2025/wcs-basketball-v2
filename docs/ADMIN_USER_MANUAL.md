# WCS Basketball Admin User Manual

**Version:** 1.0  
**Date:** January 2025  
**For:** Administrators

---

<div style="page-break-after: always;"></div>

## Table of Contents

1. [Introduction](#introduction)
2. [Public-Facing Pages](#public-facing-pages)
3. [Parent Portal Overview](#parent-portal-overview)
4. [Admin Section](#admin-section)
   - [4.1 Login and Authentication](#41-login-and-authentication)
   - [4.2 Admin Dashboard Overview](#42-admin-dashboard-overview)
   - [4.3 Profile Tab](#43-profile-tab)
     - [4.3.1 Personal Info Section](#431-personal-info-section)
     - [4.3.2 Teams Section](#432-teams-section)
     - [4.3.3 Activity Section](#433-activity-section)
     - [4.3.4 Account Section](#434-account-section)
     - [4.3.5 Schedule Section](#435-schedule-section)
     - [4.3.6 Messages Section](#436-messages-section)
     - [4.3.7 Resources Section](#437-resources-section)
   - [4.4 Payments Tab](#44-payments-tab)
   - [4.5 Manage Tab](#45-manage-tab)
     - [4.5.1 Managing Coaches](#451-managing-coaches)
     - [4.5.2 Managing Teams](#452-managing-teams)
     - [4.5.3 Managing Players](#453-managing-players)
   - [4.6 Coach Tab](#46-coach-tab)
   - [4.7 Monitor Tab](#47-monitor-tab)

---

<div style="page-break-after: always;"></div>

## Introduction

Welcome to the WCS Basketball Admin User Manual! This comprehensive guide will help you navigate and utilize all the administrative features of the WCS Basketball web application.

### About WCS Basketball Platform

The WCS Basketball platform is a comprehensive basketball program management system designed to streamline operations for administrators, coaches, parents, and players. The platform provides tools for team management, scheduling, communication, payment processing, and more.

### Purpose of This Manual

This manual is specifically designed for administrators who need to:
- Manage coaches, teams, and players
- Process payments and registrations
- Monitor system activity and analytics
- Create schedules and team updates
- Upload and manage resources

### Quick Navigation Guide

- **Public Pages**: Accessible to all visitors (Home, Teams, Schedules, Drills)
- **Parent Portal**: Where parents register, view their children's information, and make payments
- **Admin Dashboard**: Your main workspace for managing the entire program
- **Coach Features**: Tools for creating schedules, updates, and drills

---

<div style="page-break-after: always;"></div>

## Public-Facing Pages

Before diving into administrative functions, it's helpful to understand what visitors and parents see on the public-facing website.

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

Understanding what parents see and can do helps you better support them and manage the system.

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

5. Admin receives notification (visible in Manage tab)

6. Admin reviews and approves/rejects player

7. If approved, parent receives email with payment link

8. Parent completes payment

9. Player status changes to "active"

### Parent Profile Features

Parents can access their profile at `/parent/profile` with three main tabs:

- **Players Tab**: View all registered children, their status, team assignments, and details
- **Contact Info Tab**: Edit parent contact information
- **Billing Tab**: View payment history and transaction details

[SCREENSHOT: Parent profile page showing the three tabs]

**Note**: Parents manage their own profiles through the parent portal. Admin viewing of parent information has not been set up yet.

---

<div style="page-break-after: always;"></div>

## Admin Section

This section covers all administrative features available to you as an admin user.

### 4.1 Login and Authentication

#### Accessing the Admin Login Page

1. Navigate to the WCS Basketball website
2. Click on the **"Coaches"** link in the navigation bar, OR
3. Navigate directly to: `https://[your-domain]/coaches/login`

[SCREENSHOT: Navigation bar showing "Coaches" link]

[SCREENSHOT: Admin/Coach login page]

#### Login Process

1. **Enter Your Email Address**
   
   a. Type your admin email address in the email field
   
   b. Ensure the email is correct (case-sensitive)

2. **Enter Your Password**
   
   a. Type your password in the password field
   
   b. Click the eye icon to show/hide password if needed

3. **Click "Sign In"**
   
   a. The system will validate your credentials
   
   b. You'll be redirected to the Admin Dashboard (`/admin/club-management`)

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

### 4.2 Admin Dashboard Overview

After logging in, you'll be taken to the Admin Dashboard, also called the Club Management page.

#### Dashboard Layout

The Admin Dashboard is organized into tabs at the top:

1. **Profile** - Your personal information and account settings
2. **Payments** - Payment management and history (Admin only)
3. **Manage** - Create and manage coaches, teams, and players
4. **Coach** - Team management tools (schedules, updates, drills)
5. **Monitor** - Analytics and system monitoring (Admin only)

[SCREENSHOT: Admin dashboard showing all five tabs]

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

---

<div style="page-break-after: always;"></div>

### 4.3 Profile Tab

The Profile tab contains your personal information, account settings, and resource management. It's organized into several sections accessible via the left sidebar.

#### Profile Tab Sections

The Profile tab has the following sections:
- **Personal Info** - View and edit your personal information
- **Teams** - View teams you're associated with
- **Activity** - View your activity statistics
- **Account** - Manage account settings and password
- **Schedule** - Coming soon feature
- **Messages** - Access the message board
- **Resources** - Upload and download documents and logos

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

**Note**: Your email address cannot be changed from this interface. Contact a system administrator if you need to change your email.

---

#### 4.3.2 Teams Section

The Teams section shows all teams you're associated with as a coach or administrator.

**Viewing Your Teams:**

1. Click the **Profile** tab

2. Click **"Teams"** in the left sidebar

3. View the teams you're associated with:
   
   a. Team name
   
   b. Age group
   
   c. Gender (Boys/Girls)
   
   d. Team logo (if available)

[SCREENSHOT: Teams section showing team cards with logos and information]

**Note**: As an admin, you may see all teams or only teams you're directly assigned to, depending on your specific admin permissions.

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
- Pin important messages (admin only)
- Delete messages (admin only)

**Note**: The Messages section in the Profile tab provides the same functionality as the message board in the Coach tab. See section 4.6 for detailed message board instructions.

---

#### 4.3.7 Resources Section

The Resources section allows you to upload, view, and download documents, team logos, and club logos. As an admin, you have full access to upload and delete resources.

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
   
   a. Document name
   
   b. File size
   
   c. Download option

[SCREENSHOT: Documents subsection showing grid of document cards]

**Downloading Documents:**

1. Click on any document card

2. A confirmation modal will appear

3. Click **"Download"** to download the file

4. The file will download to your computer

[SCREENSHOT: Document download confirmation modal]

**Uploading Documents (Admin Only):**

1. In the Documents subsection, click the **"+ Upload"** button (top right)

2. An upload modal will appear

3. Click **"Choose File"** or drag and drop a file

4. Select the document file you want to upload

5. Enter a **File Name** (optional - defaults to original filename)

6. Click **"Upload"** to complete the upload

7. The document will appear in the documents list

[SCREENSHOT: Upload document modal with file selector]

**Supported File Types:**
- PDF files
- Word documents (.doc, .docx)
- Text files (.txt)
- Other document formats (check with system administrator)

**Deleting Documents (Admin Only):**

The delete process follows the same confirmation pattern as other delete operations:

1. Click on a document card

2. In the confirmation modal, click **"Delete"**

3. Confirm the deletion

4. The document will be permanently removed

[SCREENSHOT: Delete confirmation in document modal]

#### Team Logos Subsection

**Viewing Team Logos:**

1. In the Resources section, scroll to the **"Team Logos"** subsection

2. View all available team logos in a grid layout

3. Each logo card shows:
   
   a. Team name
   
   b. Logo preview
   
   c. File size

[SCREENSHOT: Team Logos subsection showing grid of logo cards]

**Downloading Team Logos:**

1. Click on any team logo card

2. A confirmation modal will appear showing the logo preview

3. Click **"Download"** to download the logo file

[SCREENSHOT: Team logo download modal with preview]

**Uploading Team Logos (Admin Only):**

1. In the Team Logos subsection, click the **"+ Upload"** button (top right)

2. An upload modal will appear

3. Click **"Choose File"** or drag and drop an image file

4. Select the logo image you want to upload

5. Select the **Team** this logo belongs to from the dropdown

6. Click **"Upload"** to complete the upload

7. The logo will appear in the team logos list

[SCREENSHOT: Upload team logo modal with team selector]

**Supported Image Formats:**
- PNG files (recommended for logos with transparency)
- JPG/JPEG files
- SVG files (if supported)

**Deleting Team Logos (Admin Only):**

The delete process follows the same confirmation pattern as deleting documents:

1. Click on a team logo card

2. In the confirmation modal, click **"Delete"**

3. Confirm the deletion

4. The logo will be permanently removed

#### Club Logos Subsection

**Viewing Club Logos:**

1. In the Resources section, scroll to the **"Club Logos"** subsection

2. View all available club logos in a grid layout

3. Each logo card shows:
   
   a. Logo name
   
   b. Logo preview
   
   c. File size

[SCREENSHOT: Club Logos subsection showing grid of logo cards]

**Downloading Club Logos:**

1. Click on any club logo card

2. A confirmation modal will appear showing the logo preview

3. Click **"Download"** to download the logo file

[SCREENSHOT: Club logo download modal with preview]

**Uploading Club Logos (Admin Only):**

1. In the Club Logos subsection, click the **"+ Upload"** button (top right)

2. An upload modal will appear

3. Click **"Choose File"** or drag and drop an image file

4. Select the logo image you want to upload

5. Enter a **Logo Name** (optional - defaults to filename)

6. Click **"Upload"** to complete the upload

7. The logo will appear in the club logos list

[SCREENSHOT: Upload club logo modal]

**Deleting Club Logos (Admin Only):**

The delete process follows the same confirmation pattern as deleting documents and team logos:

1. Click on a club logo card

2. In the confirmation modal, click **"Delete"**

3. Confirm the deletion

4. The logo will be permanently removed

---

<div style="page-break-after: always;"></div>

### 4.4 Payments Tab

The Payments tab (Admin only) provides comprehensive payment management tools.

**Accessing the Payments Tab:**

1. Click the **"Payments"** tab in the dashboard navigation
2. The payments interface will load

[SCREENSHOT: Payments tab interface]

#### Payment Statistics

At the top of the Payments tab, you'll see key statistics:
- Total revenue
- Membership fees collected
- Tournament fees collected
- Merchandise fees collected
- Number of paid players
- Number of pending payments

[SCREENSHOT: Payment statistics cards at top of Payments tab]

#### Viewing Payment History

1. Scroll down to view the payment history table

2. The table shows:
   
   a. Player name
   
   b. Parent name
   
   c. Payment amount
   
   d. Payment date
   
   e. Payment status
   
   f. Payment type (membership, tournament, merchandise)

3. Use filters or search to find specific payments

[SCREENSHOT: Payment history table with all columns visible]

#### Managing Player Payments

**Viewing Player Payment Details:**

1. Find the player in the payment history table

2. Click on the player's name or payment entry

3. View detailed payment information

**Processing Payments:**

1. Navigate to the player's payment entry

2. Review payment details

3. Update payment status if needed (mark as paid, refund, etc.)

**Note**: Most payments are processed automatically through Stripe. Manual payment processing may be available for special cases.

#### Payment Approval Workflow

When a player is approved and payment is required:

1. Admin approves player (see section 4.5.3)

2. System sends payment email to parent

3. Parent completes payment through Stripe

4. Payment appears in Payments tab

5. Player status automatically updates to "active" upon successful payment

[SCREENSHOT: Payment workflow diagram or explanation]

---

<div style="page-break-after: always;"></div>

### 4.5 Manage Tab

The Manage tab is your primary workspace for creating and managing coaches, teams, and players. This tab provides full administrative control.

**Accessing the Manage Tab:**

1. Click the **"Manage"** tab in the dashboard navigation

2. The management interface will load with three main sections:
   
   a. Coaches
   
   b. Teams
   
   c. Players

[SCREENSHOT: Manage tab showing three collapsible sections]

Each section can be expanded or collapsed by clicking the section header.

---

#### 4.5.1 Managing Coaches

The Coaches section allows you to create, edit, view, and delete coach accounts.

**Viewing All Coaches:**

1. In the Manage tab, locate the **"Coaches"** section

2. Click the section header to expand it (if collapsed)

3. View the list of all coaches with:
   
   a. Coach name
   
   b. Email address
   
   c. Teams assigned
   
   d. Status (active/inactive)

[SCREENSHOT: Coaches section showing list of coaches]

**Adding a New Coach:**

1. In the Coaches section, click the **"Add Coach"** button

2. A modal window will appear with a coach creation form

3. Fill in the required information:
   
   a. **First Name** (required)
   
   b. **Last Name** (required)
   
   c. **Email** (required - must be unique)
   
   d. **Phone** (optional)
   
   e. **Bio** (optional - text area)
   
   f. **Quote** (optional - text area)
   
   g. **Image URL** (optional - link to coach photo)

4. Click **"Create Coach"** to save

5. The system will:
   
   a. Create the coach account
   
   b. Send login credentials to the coach's email
   
   c. Display a success message

[SCREENSHOT: Add Coach modal with form fields]

**Important**: The coach will receive an email with their login credentials. Make sure the email address is correct.

**Editing Coach Information:**

The process for editing a coach follows the same pattern as adding a coach (see "Adding a New Coach" above), with these differences:

1. In the Coaches list, find the coach you want to edit

2. Click the **"Edit"** button (pencil icon) next to the coach's name

3. The modal will open with the coach's current information pre-filled

4. Update any fields you want to change

5. Click **"Save Changes"** to update, or **"Cancel"** to discard

[SCREENSHOT: Edit Coach modal with pre-filled form]

**Viewing Coach Details:**

1. In the Coaches list, click the **"View"** button (eye icon) next to the coach's name

2. A detailed view modal will appear showing:
   
   a. Full coach information
   
   b. Assigned teams
   
   c. Login statistics
   
   d. Activity history

[SCREENSHOT: Coach detail modal showing all information]

**Assigning Coaches to Teams:**

1. Edit a coach (see "Editing Coach Information" above)

2. In the edit modal, you'll see a **"Teams"** section

3. Select teams from the dropdown or checkboxes

4. Click **"Save Changes"**

5. The coach will now have access to manage those teams

**Note**: Team assignment can also be done when creating/editing teams (see section 4.5.2).

**Deleting a Coach:**

The delete process follows a standard confirmation pattern:

1. In the Coaches list, find the coach you want to delete

2. Click the **"Delete"** button (trash icon) next to the coach's name

3. A confirmation dialog will appear

4. Confirm the deletion

5. The coach account will be permanently removed

**Warning**: Deleting a coach will remove their access to the system. Make sure this is what you want to do.

[SCREENSHOT: Delete coach confirmation dialog]

**Searching and Filtering Coaches:**

1. Use the search box at the top of the Coaches section
2. Type a coach's name or email to filter the list
3. The list will update in real-time as you type

[SCREENSHOT: Coaches section with search box]

---

#### 4.5.2 Managing Teams

The Teams section allows you to create, edit, view, and delete teams.

**Viewing All Teams:**

1. In the Manage tab, locate the **"Teams"** section

2. Click the section header to expand it (if collapsed)

3. View the list of all teams with:
   
   a. Team name
   
   b. Age group
   
   c. Gender
   
   d. Grade level
   
   e. Season
   
   f. Assigned coaches
   
   g. Status (active/inactive)

[SCREENSHOT: Teams section showing list of teams]

**Creating a New Team:**

1. In the Teams section, click the **"Add Team"** button

2. A modal window will appear with a team creation form

3. Fill in the required information:
   
   a. **Team Name** (required - e.g., "Warriors", "Sharks")
   
   b. **Age Group** (required - dropdown: U10, U12, U14, U16, U18)
   
   c. **Gender** (required - dropdown: Boys, Girls)
   
   d. **Grade Level** (optional - text field)
   
   e. **Season** (optional - text field, e.g., "2024-2025")
   
   f. **Coach Email(s)** (optional - select from existing coaches)
   
   g. **Logo URL** (optional - link to team logo image)
   
   h. **Team Image URL** (optional - link to team photo)

4. Click **"Create Team"** to save

5. The team will appear in the teams list

[SCREENSHOT: Add Team modal with all form fields]

**Editing Team Information:**

The process for editing a team follows the same pattern as creating a team (see "Creating a New Team" above), with these differences:

1. In the Teams list, find the team you want to edit

2. Click the **"Edit"** button (pencil icon) next to the team's name

3. The modal will open with the team's current information pre-filled

4. Update any fields you want to change

5. Click **"Save Changes"** to update, or **"Cancel"** to discard

[SCREENSHOT: Edit Team modal with pre-filled form]

**Viewing Team Details:**

1. In the Teams list, click the **"View"** button (eye icon) next to the team's name

2. A detailed view modal will appear showing:
   
   a. Full team information
   
   b. Assigned coaches
   
   c. Current roster (players)
   
   d. Team statistics

[SCREENSHOT: Team detail modal showing all information]

**Team Logo and Image Management:**

**Uploading Team Logo:**

1. When creating or editing a team, you can:
   - Enter a **Logo URL** directly in the form, OR
   - Upload a logo through the Resources section (see 4.3.7) and use that URL

**Uploading Team Image:**

1. When creating or editing a team, enter a **Team Image URL** in the form
2. This image will be displayed on the team's public page

**Note**: For best results, use high-quality images. Recommended formats: PNG for logos, JPG for photos.

**Deleting a Team:**

The delete process follows the same confirmation pattern as deleting a coach (see "Deleting a Coach" in section 4.5.1):

1. In the Teams list, find the team you want to delete

2. Click the **"Delete"** button (trash icon) next to the team's name

3. A confirmation dialog will appear

4. Confirm the deletion

5. The team will be permanently removed

**Warning**: Deleting a team will remove all associated data. Players assigned to the team will need to be reassigned. Make sure this is what you want to do.

[SCREENSHOT: Delete team confirmation dialog]

**Searching and Filtering Teams:**

1. Use the search box or filter dropdown at the top of the Teams section
2. Filter by:
   - Age group
   - Gender
   - Season
   - Coach
3. The list will update based on your filters

[SCREENSHOT: Teams section with filter options]

---

#### 4.5.3 Managing Players

The Players section is one of the most important administrative functions. Here you can add, edit, approve, and manage all players in the system.

**Viewing All Players:**

1. In the Manage tab, locate the **"Players"** section

2. Click the section header to expand it (if collapsed)

3. View the list of all players with:
   
   a. Player name
   
   b. Team assignment
   
   c. Status (pending, approved, active, on hold, rejected)
   
   d. Parent information
   
   e. Jersey number

[SCREENSHOT: Players section showing list of players]

**Player Statuses Explained:**

- **Pending**: Player has registered but not yet reviewed by admin
- **Approved**: Admin has approved, waiting for payment
- **Active**: Player is fully registered and paid
- **On Hold**: Player approval is temporarily delayed (requires reason)
- **Rejected**: Player registration was rejected (requires reason)

**Adding a New Player:**

1. In the Players section, click the **"Add Player"** button

2. A modal window will appear with a player creation form

3. Fill in the required information:
   
   a. **Team** (required - select from dropdown)
   
   b. **Player Name** (required - first and last name)
   
   c. **Jersey Number** (optional - number)
   
   d. **Grade** (optional - text)
   
   e. **Date of Birth** (optional - date picker)
   
   f. **Gender** (optional - dropdown: Male, Female)
   
   g. **Parent Name** (required)
   
   h. **Parent Email** (required - email format)
   
   i. **Parent Phone** (optional - phone number)
   
   j. **Emergency Contact** (optional - name)
   
   k. **Emergency Phone** (optional - phone number)

4. Click **"Create Player"** to save

5. The player will be created with "pending" status by default

[SCREENSHOT: Add Player modal with all form fields]

**Editing Player Information:**

The process for editing a player follows the same pattern as adding a player (see "Adding a New Player" above), with these differences:

1. In the Players list, find the player you want to edit

2. Click the **"Edit"** button (pencil icon) next to the player's name

3. The modal will open with the player's current information pre-filled

4. Update any fields you want to change

5. Click **"Save Changes"** to update, or **"Cancel"** to discard

[SCREENSHOT: Edit Player modal with pre-filled form]

**Viewing Player Details:**

1. In the Players list, click the **"View"** button (eye icon) next to the player's name

2. A detailed view modal will appear showing:
   
   a. Full player information
   
   b. Parent/guardian information
   
   c. Emergency contacts
   
   d. Team assignment
   
   e. Status history
   
   f. Payment information

[SCREENSHOT: Player detail modal showing all information]

**Player Approval Workflow:**

This is a critical administrative function. When a player registers, they start with "pending" status. You need to review and approve them.

**Approving a Player:**

1. In the Players list, find a player with "pending" status

2. Click the **"Approve"** button (or action button) next to the player's name

3. A modal or confirmation will appear

4. Select the **Team** to assign the player to (if not already assigned)

5. Click **"Approve"** to confirm

6. The system will:
   
   a. Change player status to "approved"
   
   b. Send an approval email to the parent with payment link
   
   c. Update the player's team assignment

[SCREENSHOT: Approve player modal with team selector]

**Placing a Player On Hold:**

Sometimes you need to delay approval while waiting for additional information.

1. In the Players list, find the player you want to place on hold

2. Click the **"On Hold"** button (or similar action)

3. Enter a **Reason** for placing the player on hold

4. Click **"Place On Hold"** to confirm

5. The system will:
   
   a. Change player status to "on_hold"
   
   b. Send an email to the parent explaining the hold status
   
   c. The player will remain in the system but won't receive payment link

[SCREENSHOT: On Hold modal with reason field]

**Rejecting a Player:**

If a player doesn't meet registration requirements, you can reject them.

1. In the Players list, find the player you want to reject

2. Click the **"Reject"** button (or similar action)

3. Enter a **Rejection Reason** (required)

4. Click **"Reject"** to confirm

5. The system will:
   
   a. Change player status to "rejected"
   
   b. Send a rejection email to the parent
   
   c. Record the rejection reason and timestamp

[SCREENSHOT: Reject player modal with reason field]

**Note**: Rejected players remain in the system for record-keeping but cannot proceed with registration.

**Importing Players (Bulk Import):**

For adding multiple players at once, use the bulk import feature.

1. In the Players section, click the **"Import Players"** button

2. You'll be redirected to the Import page (`/admin/import`)

3. Follow the import instructions:
   
   a. Download the sample template (if available)
   
   b. Fill in player information in the template
   
   c. Upload the completed file

4. Review the import preview

5. Confirm the import

6. All players will be added to the system

[SCREENSHOT: Import players page]

**Note**: The import feature may support CSV or Excel files. Check the import page for specific format requirements.

**Searching and Filtering Players:**

1. Use the search box at the top of the Players section

2. Type a player's name, parent name, or email to filter

3. Use the **Team Filter** dropdown to filter by team

4. Use the **Status Filter** to show only specific statuses:
   
   a. All players
   
   b. Pending
   
   c. Approved
   
   d. Active
   
   e. On Hold
   
   f. Rejected

5. The list will update in real-time

[SCREENSHOT: Players section with search box and filters]

**Deleting a Player:**

The delete process follows the same confirmation pattern as deleting coaches and teams (see sections 4.5.1 and 4.5.2):

1. In the Players list, find the player you want to delete

2. Click the **"Delete"** button (trash icon) next to the player's name

3. A confirmation dialog will appear

4. Confirm the deletion

5. The player will be permanently removed from the system

**Warning**: Deleting a player will remove all associated data including payment history. This action cannot be undone. Make sure this is what you want to do.

[SCREENSHOT: Delete player confirmation dialog]

---

<div style="page-break-after: always;"></div>

### 4.6 Coach Tab

The Coach tab provides team management tools including schedule creation, team updates, practice drills, and message board access. As an admin, you have access to all teams.

**Accessing the Coach Tab:**

1. Click the **"Coach"** tab in the dashboard navigation

2. The coach dashboard will load

[SCREENSHOT: Coach tab interface]

#### Team Selection

At the top of the Coach tab, you'll see a team selector dropdown.

**Selecting a Team:**

1. Click the **Team Selector** dropdown

2. Choose a team from the list:
   
   a. As admin, you'll see "All teams (program-wide)" option
   
   b. Or select a specific team

3. The dashboard will update to show that team's information

[SCREENSHOT: Team selector dropdown with teams listed]

**Note**: When "All teams" is selected, you can create program-wide updates and view all team schedules.

#### Dashboard Statistics

After selecting a team, you'll see statistics cards:
- **Next Game**: Days until next game and opponent
- **New Updates**: Number of recent team updates
- **Practice Drills**: Number of drills in the library

[SCREENSHOT: Statistics cards showing team metrics]

#### Creating Games

**Adding a Single Game:**

1. In the Coach tab, select a team (or "All teams")

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

7. The game will appear in the upcoming games list

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

4. The game will be removed

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

6. The practice will appear in the practice schedule

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

Team updates are announcements and news posts that appear on team pages and the home page.

**Creating a Team Update:**

1. In the Coach tab, scroll to the **"Recent Announcements"** section

2. Click the **"+ Add Update"** button

3. A modal window will appear with the update creation form

4. Fill in the update information:
   
   a. **Title** (required - headline for the update)
   
   b. **Content** (required - main text of the update)
   
   c. **Date & Time** (optional - defaults to current date/time)
   
   d. **Image URL** (optional - link to an image to include)
   
   e. **Team** (pre-selected, or choose "All teams" for program-wide update)

5. Click **"Create Update"** to save

6. The update will appear in recent announcements and on the team's public page

[SCREENSHOT: Add Update modal with form fields]

**Note**: Updates with images are more engaging. You can upload images through the upload API or use image URLs.

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

Practice drills are exercises and activities that coaches can use during practices.

**Viewing Practice Drills:**

1. In the Coach tab, you'll see drill statistics in the dashboard
2. Scroll to view drills or navigate to the Drills page (`/drills`) for the full library

**Creating a Practice Drill:**

1. In the Coach tab, look for the **"Practice Drills"** section or button
2. Click **"+ Add Drill"** or navigate to create drill option
3. A modal window will appear with the drill creation form
4. Fill in the drill information:
   - **Title** (required - name of the drill)
   - **Category** (required - dropdown: Drill, Warm-up, Conditioning, Skill Development, Team Building)
   - **Difficulty** (required - dropdown: Basic, Intermediate, Advanced, Expert)
   - **Time** (required - duration, e.g., "10 minutes")
   - **Skills** (required - array of skills worked on)
   - **Equipment** (optional - array of required equipment)
   - **Instructions** (required - step-by-step instructions)
   - **Benefits** (required - what players will gain from this drill)
   - **Additional Info** (optional - extra notes)
   - **Image URL** (optional - demonstration image)
   - **Week Number** (optional - for curriculum planning)
   - **Team** (pre-selected based on your team selection)
5. Click **"Create Drill"** to save
6. The drill will be added to the drill library

[SCREENSHOT: Add Drill modal with all form fields]

**Editing a Practice Drill:**

1. Find the drill you want to edit (in drill library or list)
2. Click the **"Edit"** button (pencil icon)
3. Update the information in the modal
4. Click **"Save Changes"**

**Deleting a Practice Drill:**

1. Find the drill you want to delete
2. Click the **"Delete"** button (trash icon)
3. Confirm the deletion
4. The drill will be removed from the library

[SCREENSHOT: Drill card with edit and delete buttons]

#### Message Board Usage

The message board allows coaches and admins to communicate with each other.

**Accessing the Message Board:**

1. In the Coach tab, scroll to the **"Message Board"** section
2. Or access it from the Profile tab → Messages section (see 4.3.6)

[SCREENSHOT: Message board interface]

**Posting a New Message:**

1. In the message board, click **"New Message"** or the message input area
2. Type your message in the text area
3. Use **@mentions** to tag other coaches/admins (type @ followed by their name or email prefix)
4. Click **"Post"** to publish your message
5. Your message will appear at the top of the message board

[SCREENSHOT: New message input with @mention example]

**Replying to a Message:**

1. Find the message you want to reply to
2. Click **"Reply"** button
3. Type your reply in the reply text area
4. Use @mentions if needed
5. Click **"Post Reply"** to publish

[SCREENSHOT: Reply interface below a message]

**Viewing and Responding to Mentions:**

When someone mentions you in a message (using @yourname), you'll receive a notification.

1. Look for the **unread mentions badge** in the dashboard header or message board
2. Click on the badge or navigate to messages
3. Messages where you're mentioned will be highlighted
4. Click on a mentioned message to view it
5. Reply if needed
6. The mention will be marked as read

[SCREENSHOT: Unread mentions badge and highlighted messages]

**Pinning Messages (Admin Only):**

As an admin, you can pin important messages to the top of the message board.

1. Find the message you want to pin
2. Click the **"Pin"** button (pin icon)
3. The message will move to the top and stay there
4. Click **"Unpin"** to remove the pin

[SCREENSHOT: Pin button on message]

**Deleting Messages (Admin Only):**

1. Find the message you want to delete
2. Click the **"Delete"** button (trash icon)
3. Confirm the deletion
4. The message and all replies will be removed

**Note**: Only admins can delete messages. Coaches can only delete their own messages (if this feature is enabled).

---

<div style="page-break-after: always;"></div>

### 4.7 Monitor Tab

The Monitor tab (Admin only) provides comprehensive analytics, error monitoring, and system activity tracking.

**Accessing the Monitor Tab:**

1. Click the **"Monitor"** tab in the dashboard navigation

2. The monitoring interface will load

[SCREENSHOT: Monitor tab interface]

#### Analytics Dashboard

The analytics dashboard provides an overview of system health and performance.

**Key Metrics Displayed:**

- Total errors
- Unresolved errors
- Critical errors
- Resolved errors
- System performance metrics
- User activity statistics

[SCREENSHOT: Analytics dashboard with metric cards]

#### Error Logs and Monitoring

**Viewing Error Logs:**

1. In the Monitor tab, scroll to the **"Error Logs"** section

2. View a table of all system errors with:
   
   a. Timestamp (when the error occurred)
   
   b. Severity (Critical, Error, Warning, Info)
   
   c. Message (error description)
   
   d. Page/Route (where the error occurred)
   
   e. Status (Resolved/Unresolved)

[SCREENSHOT: Error logs table]

**Filtering Error Logs:**

1. Use the **Severity Filter** dropdown to filter by error type

2. Select: All, Critical, Error, Warning, or Info

3. The table will update to show only filtered errors

[SCREENSHOT: Error logs with severity filter]

**Resolving Errors:**

1. Find the error in the error logs table

2. Review the error details

3. Take appropriate action to fix the issue

4. Mark the error as resolved (if option available)

5. Errors are automatically tracked and updated

**Deleting All Error Logs:**

1. In the Error Logs section, click **"Delete All"** button

2. A confirmation dialog will appear

3. Confirm that you want to delete all error logs

4. All error logs will be permanently removed

**Warning**: Deleting error logs removes historical error data. Only do this if you're sure you don't need the logs.

[SCREENSHOT: Delete all error logs confirmation]

#### Activity Monitor

The Activity Monitor tracks user activity and system usage.

**Viewing Traffic Overview:**

1. In the Monitor tab, scroll to the **"Activity Monitor"** section

2. View traffic statistics:
   
   a. Total page views
   
   b. Unique visitors
   
   c. Mobile vs Desktop usage
   
   d. Top pages

[SCREENSHOT: Activity monitor with traffic statistics]

**Viewing Login Activity:**

1. In the Activity Monitor section, find the **"Login Activity"** table

2. View login statistics for all users:
   
   a. Name
   
   b. Email
   
   c. Role (Admin, Coach, Parent)
   
   d. Total Logins
   
   e. Last Login (date and time)
   
   f. Status (Active/Inactive - based on recent activity)

[SCREENSHOT: Login activity table]

**Identifying Inactive Users:**

Users who haven't logged in for more than 30 days may be marked as inactive or highlighted differently in the login activity table.

**Searching Login Activity:**

1. Use the search box to find specific users

2. Filter by name, email, or role

3. The table will update in real-time

#### Performance Metrics

**Viewing Performance Data:**

1. In the Monitor tab, look for **"Performance Metrics"** section

2. View metrics such as:
   
   a. Average page load time
   
   b. Error rate percentage
   
   c. System uptime
   
   d. API response times

[SCREENSHOT: Performance metrics display]

**Accessing Detailed Analytics:**

1. Look for a link to **"Vercel Analytics"** or detailed analytics

2. Click the link to view comprehensive analytics (if integrated)

3. External analytics may open in a new tab

**Note**: Some analytics features may require external service integration (e.g., Vercel Analytics, Google Analytics).

---

<div style="page-break-after: always;"></div>

## Conclusion

Congratulations! You've completed the WCS Basketball Admin User Manual. This guide has covered all the major administrative features available in the system.

### Key Takeaways

- **Profile Tab**: Manage your personal information, view activity, and handle resources
- **Payments Tab**: Track and manage all payments and revenue
- **Manage Tab**: Create and manage coaches, teams, and players
- **Coach Tab**: Create schedules, updates, drills, and communicate via message board
- **Monitor Tab**: Track system health, errors, and user activity

### Getting Help

If you need assistance:
1. Review the relevant section in this manual
2. Check the system for inline help text and tooltips
3. Contact the system administrator
4. Refer to error messages for troubleshooting guidance

### Best Practices

- **Regular Monitoring**: Check the Monitor tab regularly for errors and system health
- **Player Approval**: Review and approve players promptly to keep registration flow smooth
- **Communication**: Use the message board to keep coaches informed
- **Updates**: Post regular team updates to keep parents and players engaged
- **Backup**: Important data is automatically backed up, but keep local records of critical information

Thank you for using the WCS Basketball platform!

---

**Document Version**: 1.0  
**Last Updated**: January 2025  
**For**: WCS Basketball Administrators

