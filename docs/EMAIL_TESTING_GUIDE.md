# 🧪 Email Testing Guide

**Created**: January 2025  
**Purpose**: Guide for testing the updated WCS Basketball email templates

---

## 🎉 **Email Templates Updated Successfully!**

### **What's Been Updated**

✅ **Registration Email** - Professional template with WCS branding  
✅ **Approval Email** - Team assignment notification with payment link  
✅ **Admin Notification** - Alert for new player registrations  
✅ **Social Media Links** - Facebook, Instagram, Twitter, YouTube  
✅ **Contact Information** - wcsbts@gmail.com  
✅ **Branding** - "WCS Basketball - Where Champions Start"

---

## 🧪 **How to Test the Emails**

### **Step 1: Verify Development Server is Running**

Your development server should be running at: `http://localhost:3000`

If not running, start it with:

```bash
npm run dev
```

### **Step 2: Check Environment Variables**

Make sure these are set in your `.env.local`:

```bash
# Required for email sending
RESEND_API_KEY=re_your_key_here
RESEND_FROM="WCS Basketball <onboarding@resend.dev>"

# Development testing (emails go here instead of real recipient)
RESEND_DEV_TO="phronesis700@gmail.com"

# Admin notifications
ADMIN_NOTIFICATIONS_TO="phronesis700@gmail.com"

# For payment links
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

### **Step 3: Test Registration Email**

1. **Go to**: `http://localhost:3000/register`
2. **Fill out the form** with test data:
   - Email: `test@example.com` (will go to your dev email)
   - Password: `testpassword123`
   - Player Name: `Test Player`
   - Grade: `5th`
   - Gender: `Male`
   - All other fields as needed
3. **Submit the form**
4. **Check your email** (`phronesis700@gmail.com`) for:
   - Registration confirmation email
   - Admin notification email

### **Step 4: Test Approval Email**

1. **Go to**: `http://localhost:3000/admin/club-management`
2. **Find the test player** you just registered
3. **Assign them to a team**
4. **Check your email** for the approval email with payment link

---

## 📧 **What Each Email Should Look Like**

### **1. Registration Confirmation Email**

**Subject**: `🏀 Welcome to WCS Basketball! Registration Received`

**Content**:

- Professional header with WCS Basketball branding
- Personalized greeting with parent's name
- Player information summary
- 3-step "What Happens Next" process
- Timeline: "1-2 business days"
- Social media links (Facebook, Instagram, Twitter, YouTube)
- Contact: wcsbts@gmail.com
- Footer: "WCS Basketball - Where Champions Start"

### **2. Approval Email**

**Subject**: `🎉 Player Approved! Complete Your Payment`

**Content**:

- Success-themed green header
- Team assignment confirmation
- Prominent "Complete Payment Now" button
- 7-day deadline notice
- What to expect after payment
- Social media links
- Contact information

### **3. Admin Notification Email**

**Subject**: `🏀 WCS Basketball - New Player Registration: [Player Name]`

**Content**:

- Admin-focused header
- Complete player details
- Parent contact information
- Direct link to admin dashboard
- Clear next steps

---

## 🔍 **What to Check**

### **✅ Email Content**

- [ ] Subject lines are correct
- [ ] Player names appear correctly
- [ ] Contact email is wcsbts@gmail.com
- [ ] Social media links work
- [ ] Branding is consistent
- [ ] Timeline is "1-2 business days"

### **✅ Email Design**

- [ ] Professional appearance
- [ ] Mobile-friendly layout
- [ ] Clear call-to-action buttons
- [ ] Proper spacing and typography
- [ ] Brand colors (blue theme)

### **✅ Functionality**

- [ ] Registration email sends immediately
- [ ] Admin notification sends to correct email
- [ ] Approval email includes payment link
- [ ] All links work correctly

---

## 🐛 **Troubleshooting**

### **Issue: Emails not sending**

**Solution**:

1. Check `RESEND_API_KEY` in `.env.local`
2. Restart development server
3. Check console for errors

### **Issue: Emails going to wrong address**

**Solution**:

1. Verify `RESEND_DEV_TO` is set correctly
2. Make sure `NODE_ENV=development`
3. Check `RESEND_FROM` contains "@resend.dev"

### **Issue: Template not updating**

**Solution**:

1. Save the file (`Ctrl+S`)
2. Restart development server
3. Clear browser cache

### **Issue: Broken styling**

**Solution**:

1. Check HTML is valid
2. Ensure all quotes are properly escaped
3. Test in different email clients

---

## 📱 **Testing on Different Devices**

### **Desktop Testing**

- Open email in Gmail, Outlook, Apple Mail
- Check layout and formatting
- Test all links

### **Mobile Testing**

- Open email on phone
- Verify responsive design
- Test touch interactions

---

## 🎯 **Expected Results**

After testing, you should see:

1. **Professional emails** that match your brand
2. **Consistent messaging** across all templates
3. **Clear call-to-actions** for parents
4. **Admin notifications** for new registrations
5. **Social media integration** for community building

---

## 🚀 **Next Steps After Testing**

Once testing is complete:

1. **Deploy to production** (Vercel)
2. **Test with real email addresses**
3. **Monitor email delivery**
4. **Gather feedback from parents**
5. **Make any final adjustments**

---

## 📞 **Need Help?**

If you encounter any issues:

1. **Check the console** for error messages
2. **Verify environment variables** are set correctly
3. **Test with a simple registration** first
4. **Check email spam folder** if emails don't arrive

---

**Ready to test?** Go to `http://localhost:3000/register` and create a test registration! 🏀
