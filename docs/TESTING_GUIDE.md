# WCS Basketball - Comprehensive Testing Guide

## Overview

This guide provides step-by-step instructions to test all functions and features in both the Manage tab and Coach tab of the club management system. Updated for v2.7.8 with enhanced security features, mobile optimization, and improved user experience.

## Prerequisites

- **Admin access**: `jason.boyer@wcs.com` / `WCS2025sports!`
- **Coach access**: `jack.frost@WCS.com` / `WCS2025sports!`
- **Development server**: Running on `http://localhost:3000`
- **Security Features**: Rate limiting (1000 requests/minute), XSS protection, CSRF tokens
- **Build Status**: Clean production build with zero errors
- **Mobile Testing**: Test on both desktop and mobile viewports
- **Footer**: Removed from admin pages for cleaner interface

---

## 👨‍💼 **ADMIN ROLE TESTING**

### **Admin Access Verification**

1. **Login as Admin**
   - Navigate to `http://localhost:3000/coaches/login`
   - Enter: `jason.boyer@wcs.com` / `WCS2025sports!`
   - **Verify**: Redirected to admin dashboard
   - **Verify**: "Club Management" option visible in navigation

2. **Admin Dashboard Access**
   - Click "Club Management" in navigation
   - **Verify**: Access to all tabs (Overview, Manage, Profile, Payments)
   - **Verify**: Footer is NOT visible (cleaner interface)
   - **Verify**: Full admin privileges available

---

## 🏀 **COACH ROLE TESTING**

### **Coach Access Verification**

1. **Login as Coach**
   - Navigate to `http://localhost:3000/coaches/login`
   - Enter: `jack.frost@WCS.com` / `WCS2025sports!`
   - **Verify**: Redirected to coach dashboard
   - **Verify**: Limited access to coach-specific features

2. **Coach Dashboard Access**
   - **Verify**: Access to Overview and Profile tabs only
   - **Verify**: NO access to "Club Management" or admin features
   - **Verify**: Coach-specific functionality available

---

## 🔧 **MANAGE TAB TESTING (ADMIN ONLY)**

### **Section 1: Coaches Management**

#### **1.1 Add New Coach**

1. Navigate to Admin Dashboard → Manage tab
2. Click "Add Coach" button in Coaches section
3. Fill out the form:
   - **First Name**: Test
   - **Last Name**: Coach
   - **Email**: test.coach@wcs.com
   - **Bio**: "Experienced basketball coach with 10+ years"
   - **Quote**: "Practice makes perfect"
   - **Upload Image**: Select a coach photo file
4. Click "Add Coach"
5. **Verify**: New coach appears in coaches list

#### **1.2 Edit Existing Coach**

1. Click "Edit" button on any coach row
2. Modify fields:
   - **First Name**: Updated Name
   - **Bio**: "Updated bio information"
3. Click "Update Coach"
4. **Verify**: Changes are reflected in coaches list

#### **1.3 Coach Form Validation**

1. Try submitting empty form
2. **Verify**: Required field errors appear
3. Test profanity filter with inappropriate content
4. **Verify**: Profanity warning appears

---

### **Section 2: Teams Management**

#### **2.1 Add New Team**

1. Click "Add Team" button in Teams section
2. Fill out the form:
   - **Team Name**: Test Team
   - **Age Group**: U12 (Under 12)
   - **Description**: "Competitive youth team"
   - **Active Team**: Checked
   - **Upload Logo**: Select a logo file
   - **Upload Team Image**: Select a team photo file
3. Click "Add Team"
4. **Verify**: New team appears in teams list

#### **2.2 Edit Existing Team**

1. Click "Edit" button on any team row
2. Modify fields:
   - **Team Name**: Updated Team Name
   - **Age Group**: U14 (Under 14)
   - **Description**: "Updated team description"
3. Click "Update Team"
4. **Verify**: Changes are reflected in teams list

#### **2.3 Team Form Validation**

1. Try submitting with empty required fields
2. **Verify**: Validation errors appear
3. Test with invalid age group selection
4. **Verify**: Form prevents submission

---

### **Section 3: Players Management**

#### **3.1 Add New Player**

1. Click "Add Player" button in Players section
2. Fill out the form:
   - **First Name**: John
   - **Last Name**: Doe
   - **Date of Birth**: 2010-05-15
   - **Gender**: Male
   - **Team**: Select appropriate team
   - **Active**: Checked
3. Click "Add Player"
4. **Verify**: New player appears in players list

#### **3.2 Edit Existing Player**

1. Click "Edit" button on any player row
2. Modify fields:
   - **First Name**: Updated Name
   - **Date of Birth**: 2011-03-20
   - **Team**: Change to different team
3. Click "Update Player"
4. **Verify**: Changes are reflected in players list

#### **3.3 Player Age Validation**

1. Try adding player with age incompatible with selected team
2. **Verify**: Age validation warning appears
3. Test with future date of birth
4. **Verify**: Future date error appears

#### **3.4 Player Gender Validation**

1. Try assigning female player to boys team
2. **Verify**: Gender compatibility warning appears
3. Test "Unassigned" team selection
4. **Verify**: Player can be unassigned

#### **3.5 Player Form Validation**

1. Try submitting with empty required fields
2. **Verify**: Required field errors appear
3. Test with invalid date format
4. **Verify**: Date validation error appears

---

## 📊 **OVERVIEW TAB TESTING (ADMIN ONLY)**

### **Section 1: Overview Dashboard**

#### **1.1 Dashboard Statistics**
1. Navigate to Club Management → Overview tab
2. **Verify**: Statistics cards display correctly
   - Total Coaches count
   - Total Teams count  
   - Total Players count
   - Active/Inactive breakdowns
3. **Verify**: Data loads without errors
4. **Verify**: Real-time updates when data changes

#### **1.2 Coaches Section (Overview)**
1. **Verify**: Coaches list displays with images
2. **Verify**: Login statistics load correctly
3. **Verify**: Active/Inactive status badges
4. **Verify**: Last login dates show correctly
5. **Test Mobile View**: 
   - Switch to mobile viewport
   - **Verify**: Clean layout with essential info only
   - **Verify**: Last login date/time on separate line
   - **Verify**: No bio/quote in mobile view

#### **1.3 Teams Section (Overview)**
1. **Verify**: Teams list with logos
2. **Verify**: Player counts per team
3. **Verify**: Coach assignments per team
4. **Test Mobile View**:
   - **Verify**: Each team info on separate lines
   - **Verify**: Team name, age group, gender, player count, coach count
   - **Verify**: Clean mobile layout

#### **1.4 Players Section (Overview)**
1. **Verify**: Players list with avatars
2. **Verify**: Team assignments
3. **Verify**: Jersey numbers
4. **Test Mobile View**:
   - **Verify**: Player name, team assignment, jersey number on separate lines
   - **Verify**: Clean mobile layout

---

## 🏀 **COACH TAB TESTING (ADMIN & COACH)**

### **Section 4: Schedule Management**

#### **4.1 Add New Game**

1. Navigate to Coach tab
2. Select a team from dropdown
3. Click "+ Add Game" button
4. Fill out the form:
   - **Date & Time**: Future date/time
   - **Opponent**: Test Opponent
   - **Location**: Test Gym
   - **Comments**: "Important game"
5. Click "Schedule Game"
6. **Verify**: Game appears in upcoming games list

#### **4.2 Edit Existing Game**

1. Click "Edit" button on any game
2. Modify fields:
   - **Opponent**: Updated Opponent
   - **Location**: Updated Location
   - **Comments**: "Updated comments"
3. Click "Schedule Game"
4. **Verify**: Changes are reflected in games list

#### **4.3 View Game Details**

1. Click "👁️" (eye) icon on any game
2. **Verify**: View modal opens with game details
3. Close modal
4. **Verify**: Modal closes properly

#### **4.4 Delete Game**

1. Click "🗑️" (delete) icon on any game
2. **Verify**: Game is removed from list

#### **4.5 Game Form Validation**

1. Try submitting with empty required fields
2. **Verify**: Validation errors appear
3. Test with past date
4. **Verify**: Past date warning appears

---

### **Section 5: Practice Management**

#### **5.1 Add New Practice**

1. Click "+ Add Practice" button
2. Fill out the form:
   - **Title**: Shooting Practice
   - **Date & Time**: Future date/time
   - **Duration**: 90 min
   - **Location**: Practice Gym
   - **Comments**: "Focus on shooting fundamentals"
3. Click "Schedule Practice"
4. **Verify**: Practice appears in practice schedule list

#### **5.2 Edit Existing Practice**

1. Click "Edit" button on any practice
2. Modify fields:
   - **Title**: Updated Practice Title
   - **Duration**: 120 min
   - **Location**: Updated Location
3. Click "Schedule Practice"
4. **Verify**: Changes are reflected in practice list

#### **5.3 View Practice Details**

1. Click "👁️" (eye) icon on any practice
2. **Verify**: View modal opens with practice details
3. Close modal
4. **Verify**: Modal closes properly

#### **5.4 Delete Practice**

1. Click "🗑️" (delete) icon on any practice
2. **Verify**: Practice is removed from list

#### **5.5 Practice Form Validation**

1. Try submitting with empty required fields
2. **Verify**: Validation errors appear
3. Test with past date
4. **Verify**: Past date warning appears

---

## 👤 **PROFILE TAB TESTING (ADMIN & COACH)**

### **Section 1: Profile Information**

#### **1.1 Profile Display**
1. Navigate to Profile tab
2. **Verify**: User information displays correctly
   - Name, email, role
   - Profile image (if uploaded)
   - Account creation date
3. **Verify**: Last login information
4. **Verify**: Login count statistics
5. **Verify**: "Today", "Yesterday", "X days ago" formatting

#### **1.2 Activity Metrics**
1. **Verify**: Login activity tracking
   - Total logins count
   - Last login date/time
   - Login history (if available)
2. **Verify**: Data consistency with admin overview
3. **Verify**: Real-time updates after login

#### **1.3 Profile Image Upload**
1. Click "Upload Image" button
2. Select image file
3. **Verify**: Image uploads successfully
4. **Verify**: New image displays in profile
5. **Verify**: Image appears in navigation/other areas

#### **1.4 Password Change (Coach Only)**
1. Click "Change Password" button
2. Enter current password
3. Enter new password
4. Confirm new password
5. **Verify**: Password changes successfully
6. **Verify**: Can login with new password

---

## 💰 **PAYMENTS TAB TESTING (ADMIN ONLY)**

### **Section 1: Payment Management**

#### **1.1 Payment Overview**
1. Navigate to Payments tab (Admin only)
2. **Verify**: Payment statistics display
3. **Verify**: Payment history (if any)
4. **Verify**: Payment methods available

#### **1.2 Payment Processing**
1. **Test**: Payment form functionality
2. **Test**: Payment validation
3. **Test**: Payment confirmation
4. **Verify**: Payment records update

---

## 🔍 **CROSS-FUNCTIONAL TESTING**

### **Section 6: Data Consistency**

#### **6.1 Team-Player Relationships**

1. Assign player to team
2. **Verify**: Player appears in team's player list
3. Change player's team
4. **Verify**: Player moves to new team
5. Set player to "Unassigned"
6. **Verify**: Player shows as "Unassigned"

#### **6.2 Schedule Integration**

1. Create game for specific team
2. **Verify**: Game appears in team's schedule
3. Edit game details
4. **Verify**: Changes reflect in schedule
5. Delete game
6. **Verify**: Game removed from schedule

#### **6.3 Data Persistence**

1. Add new coach/team/player
2. Refresh page
3. **Verify**: Data persists after refresh
4. Log out and log back in
5. **Verify**: Data still exists

---

## 🚨 **ERROR HANDLING TESTING**

### **Section 7: Network Error Simulation**

#### **7.1 Upload Failures**

1. Try uploading very large files
2. **Verify**: Appropriate error messages appear
3. Test with invalid file types
4. **Verify**: File type validation works

#### **7.2 Form Submission Errors**

1. Submit forms with network disconnected
2. **Verify**: Error handling works properly
3. Test with invalid data
4. **Verify**: Validation prevents submission

---

## 📊 **PERFORMANCE TESTING**

### **Section 8: Load Testing**

#### **8.1 Large Data Sets**

1. Add multiple coaches/teams/players
2. **Verify**: System handles large lists efficiently
3. Test pagination if implemented
4. **Verify**: Navigation works smoothly

#### **8.2 Concurrent Operations**

1. Open multiple modals simultaneously
2. **Verify**: No conflicts occur
3. Test rapid form submissions
4. **Verify**: System handles gracefully

---

## ✅ **VERIFICATION CHECKLIST**

### **🔐 Authentication & Access Control**

- [ ] Admin login works correctly
- [ ] Coach login works correctly
- [ ] Admin has access to all features
- [ ] Coach has limited access (no admin features)
- [ ] Footer removed from admin pages
- [ ] Navigation works correctly for both roles

### **📊 Overview Tab (Admin Only)**

- [ ] Dashboard statistics display correctly
- [ ] Coaches section loads with login stats
- [ ] Teams section shows player/coach counts
- [ ] Players section displays team assignments
- [ ] Mobile view works correctly for all sections
- [ ] Data consistency across all views

### **🔧 Manage Tab - Coaches (Admin Only)**

- [ ] Add coach functionality works
- [ ] Edit coach functionality works
- [ ] View coach details works
- [ ] Delete coach functionality works
- [ ] Form validation works
- [ ] Image upload works
- [ ] Bio and quote fields work
- [ ] Data persists after refresh

### **🔧 Manage Tab - Teams (Admin Only)**

- [ ] Add team functionality works
- [ ] Edit team functionality works
- [ ] View team details works
- [ ] Delete team functionality works
- [ ] Logo upload works
- [ ] Team image upload works
- [ ] Form validation works
- [ ] Data persists after refresh

### **🔧 Manage Tab - Players (Admin Only)**

- [ ] Add player functionality works
- [ ] Edit player functionality works
- [ ] View player details works
- [ ] Delete player functionality works
- [ ] Age validation works
- [ ] Gender validation works
- [ ] Team assignment works
- [ ] Unassigned option works
- [ ] Form validation works
- [ ] Data persists after refresh

### **🏀 Coach Tab - Games (Admin & Coach)**

- [ ] Add game functionality works
- [ ] Edit game functionality works
- [ ] View game functionality works
- [ ] Delete game functionality works
- [ ] Form validation works
- [ ] Data persists after refresh

### **🏀 Coach Tab - Practices (Admin & Coach)**

- [ ] Add practice functionality works
- [ ] Edit practice functionality works
- [ ] View practice functionality works
- [ ] Delete practice functionality works
- [ ] Form validation works
- [ ] Data persists after refresh

### **👤 Profile Tab (Admin & Coach)**

- [ ] Profile information displays correctly
- [ ] Activity metrics work correctly
- [ ] Login count tracking works
- [ ] Date formatting works ("Today", "Yesterday", etc.)
- [ ] Profile image upload works
- [ ] Password change works (Coach only)

### **💰 Payments Tab (Admin Only)**

- [ ] Payment overview displays
- [ ] Payment processing works
- [ ] Payment validation works
- [ ] Payment records update correctly

---

## 📱 **MOBILE TESTING**

### **Mobile Viewport Testing**

#### **1. Responsive Design**
1. **Test on Mobile Devices**: Use browser dev tools mobile viewport
2. **Verify**: All tabs accessible on mobile
3. **Verify**: Forms work correctly on mobile
4. **Verify**: Touch interactions work properly
5. **Verify**: Text is readable without zooming

#### **2. Mobile-Specific Layouts**
1. **Overview Tab Mobile**:
   - **Verify**: Clean coach list layout
   - **Verify**: Last login date/time on separate line
   - **Verify**: No bio/quote in mobile view
2. **Manage Tab Mobile**:
   - **Verify**: Teams show each item on separate line
   - **Verify**: Players show name, team, jersey on separate lines
   - **Verify**: Forms work correctly on mobile
3. **Coach Tab Mobile**:
   - **Verify**: Schedule management works on mobile
   - **Verify**: Practice management works on mobile

#### **3. Mobile Navigation**
1. **Verify**: Navigation menu works on mobile
2. **Verify**: Tab switching works smoothly
3. **Verify**: Modal dialogs work on mobile
4. **Verify**: Touch gestures work properly

---

## 🔐 **ROLE-BASED TESTING**

### **Admin Role Testing**

#### **1. Full Access Verification**
1. **Login as Admin**: `jason.boyer@wcs.com`
2. **Verify**: Access to Club Management
3. **Verify**: Access to all tabs (Overview, Manage, Profile, Payments)
4. **Verify**: Can manage coaches, teams, players
5. **Verify**: Can view all data and statistics

#### **2. Admin-Only Features**
1. **Verify**: Can add/edit/delete coaches
2. **Verify**: Can add/edit/delete teams
3. **Verify**: Can add/edit/delete players
4. **Verify**: Can view payment information
5. **Verify**: Can access all administrative functions

### **Coach Role Testing**

#### **1. Limited Access Verification**
1. **Login as Coach**: `jack.frost@WCS.com`
2. **Verify**: NO access to Club Management
3. **Verify**: Access to Overview and Profile tabs only
4. **Verify**: Can manage own schedule and practices
5. **Verify**: Cannot access admin functions

#### **2. Coach-Only Features**
1. **Verify**: Can manage team schedules
2. **Verify**: Can manage practices
3. **Verify**: Can view team information
4. **Verify**: Can change password
5. **Verify**: Cannot access admin functions

---

## 🐛 **COMMON ISSUES TO WATCH FOR**

1. **Modal Conflicts**: Ensure only one modal opens at a time
2. **Form Reset**: Verify forms reset properly after submission
3. **Data Loading**: Check for loading states during operations
4. **Error Messages**: Ensure clear, helpful error messages
5. **Navigation**: Verify proper navigation between tabs
6. **Responsive Design**: Test on different screen sizes
7. **Browser Compatibility**: Test in different browsers
8. **Role Permissions**: Verify correct access levels for admin vs coach
9. **Mobile Layout**: Test mobile-specific layouts and interactions
10. **Footer Display**: Verify footer removed from admin pages

---

## 📝 **TESTING NOTES**

- **Test Environment**: Use development server for testing
- **Data Cleanup**: Consider cleaning up test data after testing
- **Screenshots**: Take screenshots of any issues found
- **Console Logs**: Check browser console for any errors
- **Network Tab**: Monitor network requests for failures

---

## 🎯 **SUCCESS CRITERIA**

### **Functional Requirements**
- ✅ All forms accept valid input
- ✅ All forms reject invalid input with clear errors
- ✅ All CRUD operations work correctly
- ✅ Data persists after submission and refresh
- ✅ Role-based access control works properly
- ✅ Mobile responsiveness works on all devices

### **User Experience Requirements**
- ✅ Intuitive navigation for both admin and coach roles
- ✅ Clear error messages and validation feedback
- ✅ Fast loading times and smooth interactions
- ✅ Consistent design across all tabs and features
- ✅ Mobile-optimized layouts and interactions

### **Technical Requirements**
- ✅ No console errors or warnings
- ✅ Proper error handling and graceful failures
- ✅ Data integrity maintained across all operations
- ✅ Security features working (rate limiting, XSS protection)
- ✅ Footer correctly hidden on admin pages

---

## 🔄 **TESTING WORKFLOW**

### **Phase 1: Authentication Testing**
1. Test admin login and access
2. Test coach login and access
3. Verify role-based permissions
4. Test logout and session management

### **Phase 2: Admin Functionality Testing**
1. Test Overview tab functionality
2. Test Manage tab (Coaches, Teams, Players)
3. Test Profile tab features
4. Test Payments tab (if applicable)

### **Phase 3: Coach Functionality Testing**
1. Test Overview tab (limited access)
2. Test Coach tab (Games, Practices)
3. Test Profile tab features
4. Verify no admin access

### **Phase 4: Mobile Testing**
1. Test all features on mobile viewport
2. Verify mobile-specific layouts
3. Test touch interactions
4. Verify responsive design

### **Phase 5: Cross-Functional Testing**
1. Test data consistency across tabs
2. Test concurrent operations
3. Test error handling
4. Test performance with large datasets

---

_Last Updated: December 2024_
_Version: 2.0 - Comprehensive Testing Guide_
