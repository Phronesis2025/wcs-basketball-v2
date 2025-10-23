# WCS Basketball - Comprehensive Testing Guide

## Overview

This guide provides step-by-step instructions to test all forms and fields in both the Manage tab and Coach tab of the club management system.

## Prerequisites

- Admin access with credentials: `jason.boyer@wcs.com` / `test123`
- Coach access with credentials: `david.dupy@WCS.com` / `WCS2025sports`
- Development server running on `http://localhost:3000`

---

## 🔧 **MANAGE TAB TESTING**

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

## 🏀 **COACH TAB TESTING**

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

### **Manage Tab - Coaches**

- [ ] Add coach functionality works
- [ ] Edit coach functionality works
- [ ] Form validation works
- [ ] Image upload works
- [ ] Data persists after refresh

### **Manage Tab - Teams**

- [ ] Add team functionality works
- [ ] Edit team functionality works
- [ ] Logo upload works
- [ ] Team image upload works
- [ ] Form validation works
- [ ] Data persists after refresh

### **Manage Tab - Players**

- [ ] Add player functionality works
- [ ] Edit player functionality works
- [ ] Age validation works
- [ ] Gender validation works
- [ ] Team assignment works
- [ ] Unassigned option works
- [ ] Form validation works
- [ ] Data persists after refresh

### **Coach Tab - Games**

- [ ] Add game functionality works
- [ ] Edit game functionality works
- [ ] View game functionality works
- [ ] Delete game functionality works
- [ ] Form validation works
- [ ] Data persists after refresh

### **Coach Tab - Practices**

- [ ] Add practice functionality works
- [ ] Edit practice functionality works
- [ ] View practice functionality works
- [ ] Delete practice functionality works
- [ ] Form validation works
- [ ] Data persists after refresh

---

## 🐛 **COMMON ISSUES TO WATCH FOR**

1. **Modal Conflicts**: Ensure only one modal opens at a time
2. **Form Reset**: Verify forms reset properly after submission
3. **Data Loading**: Check for loading states during operations
4. **Error Messages**: Ensure clear, helpful error messages
5. **Navigation**: Verify proper navigation between tabs
6. **Responsive Design**: Test on different screen sizes
7. **Browser Compatibility**: Test in different browsers

---

## 📝 **TESTING NOTES**

- **Test Environment**: Use development server for testing
- **Data Cleanup**: Consider cleaning up test data after testing
- **Screenshots**: Take screenshots of any issues found
- **Console Logs**: Check browser console for any errors
- **Network Tab**: Monitor network requests for failures

---

## 🎯 **SUCCESS CRITERIA**

All forms should:

- ✅ Accept valid input
- ✅ Reject invalid input with clear errors
- ✅ Persist data after submission
- ✅ Handle errors gracefully
- ✅ Provide good user experience
- ✅ Work consistently across all browsers
- ✅ Maintain data integrity

---

_Last Updated: [Current Date]_
_Version: 1.0_
