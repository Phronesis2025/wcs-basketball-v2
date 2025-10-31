# 📧 Email Customization Guide

**Created**: January 2025  
**Purpose**: Guide for customizing Resend email templates in WCS Basketball application

---

## 📋 **Overview**

Your WCS Basketball application now uses **professional, customizable email templates** for all player registration communications. All email templates are centralized in one file for easy maintenance.

---

## 📁 **File Structure**

```
src/lib/
├── emailTemplates.ts        ← All email templates (EDIT THIS FILE)
├── email.ts                 ← Email sending logic (don't modify)

src/app/api/
├── register-player/route.ts  ← Uses registration template
└── approve-player/route.ts   ← Uses approval template
```

---

## 🎨 **How to Customize Emails**

### **Step 1: Open the Templates File**

Open `src/lib/emailTemplates.ts` - this contains all 3 email templates:

1. **Player Registration Email** - Sent to parents after registration
2. **Player Approval Email** - Sent when player is assigned to team
3. **Admin Notification Email** - Sent to admins about new registrations

### **Step 2: Find the Email You Want to Edit**

Each template is a function that returns `{ subject, html }`:

```typescript
export function getPlayerRegistrationEmail(data: {...}): { subject: string; html: string }
```

### **Step 3: Edit the Content**

#### **Change the Subject Line:**

```typescript
const subject = "Welcome to WCS Basketball! Registration Received";
// Change to:
const subject = "🏀 Thanks for Joining WCS Basketball!";
```

#### **Change the Email Body:**

The email body is HTML. Look for the text you want to change:

**Example 1 - Change the greeting:**

```typescript
<p style="font-size: 18px; margin-bottom: 20px;">${parentGreeting}</p>
// Change to:
<p style="font-size: 18px; margin-bottom: 20px;">Dear ${parentGreeting},</p>
```

**Example 2 - Change the main message:**

```typescript
<p>Thank you for registering your child with <strong>WCS Basketball</strong>!</p>
// Change to:
<p>We're thrilled to welcome your child to the <strong>WCS Basketball family</strong>!</p>
```

**Example 3 - Change the timeline:**

```typescript
<strong>⏱️ Timeline:</strong> Team assignments are typically completed within <strong>24-48 hours</strong>.
// Change to:
<strong>⏱️ Timeline:</strong> Team assignments are typically completed within <strong>1-3 business days</strong>.
```

### **Step 4: Save and Test**

1. **Save the file** (`Ctrl+S` or `Cmd+S`)
2. **Test with a new registration** on your site
3. **Check your email** to see the changes

---

## 🎯 **Common Customizations**

### **1. Change Contact Email**

```typescript
// Find this line:
<a href="mailto:info@wcsbasketball.com">info@wcsbasketball.com</a>

// Change to your actual email:
<a href="mailto:contact@yourclub.com">contact@yourclub.com</a>
```

### **2. Change Club Name**

```typescript
// Find "WCS Basketball" throughout the template and replace with your club name
// Example:
"WCS Basketball" → "Your Club Name"
```

### **3. Modify Timeline**

```typescript
// Find:
within <strong>24-48 hours</strong>

// Change to:
within <strong>2-3 business days</strong>
```

### **4. Add Your Logo**

Add this inside the `<div class="header">` section:

```html
<div class="header">
  <img
    src="https://your-website.com/logo.png"
    alt="WCS Basketball"
    style="max-width: 150px; margin-bottom: 10px;"
  />
  <h1>🏀 WCS Basketball</h1>
</div>
```

### **5. Change Colors**

Find the `<style>` section at the top of the HTML and modify:

```css
/* Change primary color (blue) */
.header {
  background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
  /* Change to your club colors, e.g., red: */
  background: linear-gradient(135deg, #991b1b 0%, #dc2626 100%);
}

.button {
  background: #3b82f6; /* Change button color */
}
```

### **6. Add Social Media Links**

Add this to the footer section:

```html
<div class="footer">
  <p style="margin: 5px 0;"><strong>WCS Basketball</strong></p>

  <!-- Add social media links -->
  <p style="margin: 15px 0;">
    <a href="https://facebook.com/yourclub" style="margin: 0 10px;">Facebook</a>
    |
    <a href="https://instagram.com/yourclub" style="margin: 0 10px;"
      >Instagram</a
    >
    |
    <a href="https://twitter.com/yourclub" style="margin: 0 10px;">Twitter</a>
  </p>

  <p>
    Questions? Contact us at
    <a href="mailto:info@wcsbasketball.com">info@wcsbasketball.com</a>
  </p>
</div>
```

---

## 🔧 **Advanced Customization**

### **Add Dynamic Content**

You can use any data passed to the template function:

```typescript
export function getPlayerRegistrationEmail(data: {
  playerFirstName: string;
  playerLastName: string;
  parentFirstName?: string;
  grade?: string;
  gender?: string;
  // Add new fields here
  parentPhone?: string;  // New field!
}) {
  const { playerFirstName, parentPhone } = data;

  // Use in HTML:
  ${parentPhone ? `<p>We'll contact you at ${parentPhone}</p>` : ''}
}
```

### **Add Conditional Content**

Show different messages based on data:

```typescript
${grade === '5th' || grade === '6th'
  ? `<p>Your child will be in the Middle School division.</p>`
  : `<p>Your child will be in the Youth division.</p>`
}
```

---

## 📨 **Email Types Explained**

### **1. Registration Confirmation Email**

- **Sent to**: Parent who registered
- **When**: Immediately after registration
- **Purpose**: Confirm registration received
- **Function**: `getPlayerRegistrationEmail()`
- **File location**: Lines 11-180 in `emailTemplates.ts`

### **2. Approval Email**

- **Sent to**: Parent of approved player
- **When**: When admin assigns player to team
- **Purpose**: Notify of approval + provide payment link
- **Function**: `getPlayerApprovalEmail()`
- **File location**: Lines 185-290 in `emailTemplates.ts`

### **3. Admin Notification**

- **Sent to**: Admin email address
- **When**: New player registers
- **Purpose**: Alert admin to review and assign
- **Function**: `getAdminPlayerRegistrationEmail()`
- **File location**: Lines 295-440 in `emailTemplates.ts`

---

## ⚙️ **Environment Variables**

Make sure these are set in your `.env.local`:

```bash
# Required for email sending
RESEND_API_KEY=re_your_key_here
RESEND_FROM="WCS Basketball <onboarding@resend.dev>"

# For development testing (emails go here instead of real recipient)
RESEND_DEV_TO="your-test-email@gmail.com"

# Admin notifications
ADMIN_NOTIFICATIONS_TO="admin@wcsbasketball.com"

# For payment links in emails
NEXT_PUBLIC_BASE_URL="http://localhost:3000"  # Or your production URL
```

---

## 🧪 **Testing Your Changes**

### **Development Testing**

1. **Make sure** `NODE_ENV` is set to development
2. **All emails** will go to `RESEND_DEV_TO` address
3. **Register a test player** to trigger the email
4. **Check your test inbox** for the email

### **Production Testing**

1. **Deploy your changes** to Vercel
2. **Make sure** `NODE_ENV=production` in Vercel
3. **Test with a real email** address
4. **Emails go to actual recipients**

---

## 🎨 **Email Design Tips**

### **Keep it Simple**

- Use clear, concise language
- Break up text with headings and bullet points
- Use white space effectively

### **Make it Responsive**

- Current templates work on mobile and desktop
- Keep max-width at 600px
- Use `padding` for spacing, not `margin`

### **Brand Consistency**

- Use your club colors
- Add your logo
- Match your website's tone

### **Call-to-Action**

- Make buttons prominent
- Use action-oriented text ("Complete Payment Now" vs "Click Here")
- Ensure links are clearly visible

---

## 📝 **Common Issues & Solutions**

### **Issue: Emails not sending**

**Solution**: Check `RESEND_API_KEY` is set in `.env.local`

### **Issue: Changes not showing up**

**Solution**:

1. Restart your dev server (`npm run dev`)
2. Clear browser cache
3. Make sure you saved the file

### **Issue: Broken styling**

**Solution**:

1. Check HTML is valid (closing tags, quotes)
2. Use inline styles (email clients don't support external CSS)
3. Test in multiple email clients

### **Issue: Dynamic content not showing**

**Solution**:

1. Check the data is being passed to the template
2. Use optional chaining: `${data?.field || 'default'}`
3. Add logging: `console.log(data)` in the API route

---

## 🎓 **Learning Resources**

### **HTML Email Best Practices**

- Use tables for layout (old-school but reliable)
- Inline all CSS styles
- Test in multiple email clients
- Keep images under 1MB

### **Email Design Tools**

- [Really Good Emails](https://reallygoodemails.com/) - Inspiration
- [Can I Email](https://www.caniemail.com/) - CSS support in email clients
- [Litmus](https://www.litmus.com/) - Email testing tool

---

## 🔄 **Making Changes in Production**

1. **Edit** `src/lib/emailTemplates.ts` locally
2. **Test** thoroughly in development
3. **Commit** your changes:
   ```bash
   git add src/lib/emailTemplates.ts
   git commit -m "Update email templates"
   git push origin main
   ```
4. **Deploy** automatically via Vercel (if connected to GitHub)
5. **Test** in production with a real registration

---

## ✅ **Quick Checklist**

Before deploying email changes:

- [ ] Subject line is clear and descriptive
- [ ] All placeholder text is replaced
- [ ] Contact email is correct
- [ ] Club name is correct throughout
- [ ] Links work (test them!)
- [ ] Tested in development
- [ ] HTML is valid (no broken tags)
- [ ] Mobile-friendly (check on phone)
- [ ] Spelling and grammar checked
- [ ] Matches brand guidelines

---

## 📞 **Need Help?**

**Common Questions:**

- Where do I change the email subject? → In the `subject` variable
- How do I add my logo? → Add an `<img>` tag in the header
- Can I use my own CSS file? → No, must use inline styles for emails
- How do I test without sending real emails? → Use `RESEND_DEV_TO` in `.env.local`

---

**Remember**: Email templates are code! Always test your changes before deploying to production.
