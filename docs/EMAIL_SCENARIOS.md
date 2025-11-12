# WCS Basketball - Complete Email Operations Map

This document maps out **all** email scenarios in the WCS Basketball system, including when they're triggered, who sends them, who receives them, the email content, and whether a PDF is attached.

---

## Parent-Facing Emails

### 1. Welcome/Registration Confirmation Email

**Operation:** Parent completes player registration form

**Trigger:**

- API: `POST /api/register-player`
- Sent immediately after player is created in database with status "pending"

**Sender:** Resend API (WCS Basketball)

**Receiver:** Parent (email used during registration)

**Email Template:** `getPlayerRegistrationEmail()` from `src/lib/emailTemplates.ts` (lines 81-475)

**Template Location:** `src/lib/emailTemplates.ts` (lines 81-475)

**Subject:**

```
🏀 Welcome to WCS Basketball! Registration Received
```

**PDF Attached:** No

**Email Body Summary:**

- "Thank you for registering your child with WCS Basketball!"
- Success banner: "Registration Received Successfully"
- Player information card (name, grade, gender, status: "Pending Team Assignment")
- What Happens Next section:
  1. Team Assignment - coaches review and assign to appropriate team
  2. Email Notification - you'll receive approval email with payment link
  3. Complete Payment - after payment, player is officially enrolled
- Timeline: "Team assignments typically completed within 1-2 business days"

**Code Location:** `src/app/api/register-player/route.ts` (lines 153-166)

**Important Notes:**

- This email is sent to **ALL** parent registrations (both new and existing parents)
- New parents signing up via Gmail will also receive Supabase's authentication confirmation email separately

---

### 2. Player Approval Email (with Payment Link)

**Operation:** Admin approves player and assigns to team

**Trigger:**

- API: `POST /api/approve-player`
- When admin changes player status from "pending" to "approved"

**Sender:** Resend API (WCS Basketball)

**Receiver:** Parent (player.parent_email or parents.email or Gmail account from users table)

**Email Template:** `getPlayerApprovalEmail()` from `src/lib/emailTemplates.ts` (lines 603-740)

**Template Location:** `src/lib/emailTemplates.ts` (lines 603-740)

**Subject:**

```
🎉 Player Approved! Complete Your Payment
```

**PDF Attached:** No

**Email Body Summary:**

- "Congratulations! Your player has been approved"
- Success box: "Team Assignment Complete" with player name and team
- Next Step: Complete Payment section
- Magic link button: "Complete Payment Now →" (auto-login + redirect to checkout)
- Important Payment Information:
  - Deadline: Complete payment within 7 days
  - Payment Methods: Credit card, debit card, or PayPal
  - Security: All payments processed securely through Stripe
  - Receipt: You'll receive email confirmation after payment
- What You'll Receive After Payment:
  - Practice Schedule
  - Coach Information
  - Team Roster
  - Game Schedule
  - Equipment List
  - Parent Handbook

**Code Location:** `src/app/api/approve-player/route.ts` (lines 147-205)

**Important Notes:**

- Includes a Supabase magic link that auto-logs in the parent and redirects to checkout
- If magic link generation fails, falls back to direct checkout URL
- Priority for parent email: 1) Gmail account (users.email), 2) parents.email, 3) players.parent_email

---

### 3. Player On-Hold Email

**Operation:** Admin places player registration on hold

**Trigger:**

- API: `POST /api/approve-player`
- When admin changes player status to "on_hold"

**Sender:** Resend API (WCS Basketball)

**Receiver:** Parent

**Email Template:** `getPlayerOnHoldEmail()` from `src/lib/emailTemplates.ts` (lines 745-839)

**Template Location:** `src/lib/emailTemplates.ts` (lines 745-839)

**Subject:**

```
⏸️ Player Registration On Hold
```

**PDF Attached:** No

**Email Body Summary:**

- "Your registration is currently on hold"
- Reason box with admin-provided reason or "Pending additional review"
- What This Means: Registration is temporarily on hold, not a rejection
- Next Steps:
  - You'll receive another email once review is complete
  - If additional information needed, we'll contact directly
  - Can check registration status in parent profile

**Code Location:** `src/app/api/approve-player/route.ts` (lines 206-216)

---

### 4. Player Rejected Email

**Operation:** Admin rejects player registration

**Trigger:**

- API: `POST /api/approve-player`
- When admin changes player status to "rejected"

**Sender:** Resend API (WCS Basketball)

**Receiver:** Parent

**Email Template:** `getPlayerRejectedEmail()` from `src/lib/emailTemplates.ts` (lines 844-948)

**Template Location:** `src/lib/emailTemplates.ts` (lines 844-948)

**Subject:**

```
❌ Registration Status Update
```

**PDF Attached:** No

**Email Body Summary:**

- "We regret to inform you that registration has not been approved at this time"
- Reason box with admin-provided reason
- What This Means: After careful review, unable to approve based on current information
- Resubmission: May resubmit after 30 days if circumstances change

**Code Location:** `src/app/api/approve-player/route.ts` (lines 217-228)

---

### 5. Payment Confirmation Email (First Payment - Checkout)

**Operation:** Parent completes payment through Stripe Checkout

**Trigger:**

- Webhook: Stripe `checkout.session.completed` event
- API: `POST /api/stripe-webhook`
- Triggered when checkout session is successfully completed

**Sender:** Resend API (WCS Basketball)

**Receiver:** Parent

**Email Template:** `getPaymentConfirmationEmail()` from `src/lib/emailTemplates.ts` (lines 1153-1579)

**Template Location:** `src/lib/emailTemplates.ts` (lines 1153-1579)

**Subject:**

```
✅ Payment Received - {PlayerFirstName} {PlayerLastName} is Now Active!
```

**PDF Attached:** Yes (single-payment invoice PDF generated via `pdf-lib`)

**Email Body Summary:**

- "Thank You for Your Payment!"
- Success box: Player is now ACTIVE and ready to start playing
- Payment Receipt section:
  - Player Name
  - Team
  - Payment Type (Annual/Monthly/Quarterly)
  - Payment Date
  - Amount Paid (green, highlighted)
- Note: Separate payment receipt also sent by Stripe (if enabled in Stripe settings)
- What Happens Next:
  - Check Your Dashboard: Log in to view practice/game schedule
  - Meet the Coach: Team coach will reach out with welcome info
  - Team Communication: Updates about practices, games, announcements
  - Monthly Billing (if applicable): Subscription auto-renews each month
- **Team Information (if available):**
  - Practice Schedule (next 2 weeks)
  - Games & Tournaments (next 2 weeks)
  - Coach Information (name, email, phone)
  - Equipment List
  - Link to View Full Team Roster
  - Link to Parent Handbook
- Link to Parent Dashboard

**Code Location:** `src/app/api/stripe-webhook/route.ts` (lines 236-584, case `checkout.session.completed`)

**Important Notes:**

- Updates player status to "active"
- Updates payment status to "paid"
- Invoice PDF attached uses `generateInvoicePDF()` from `pdf-lib`
- Includes detailed team information (schedules, coaches) if player is assigned to team

---

### 6. Payment Confirmation Email (Subsequent Payments - All Types)

**Operation:** Any payment that is NOT the first payment (Annual, Monthly, Quarterly, or Other subscription types)

**Trigger:**

- Webhook: Stripe `invoice.payment_succeeded` event (excluding `subscription_create`)
- API: `POST /api/stripe-webhook`
- Triggered for any subsequent payment after the first payment
- Works for all payment types: Annual, Monthly, Quarterly, and Other

**Sender:** Resend API (WCS Basketball)

**Receiver:** Parent

**Email Template:** `getPaymentConfirmationEmail()` from `src/lib/emailTemplates.ts` (lines 1153-1579)

**Template Location:** `src/lib/emailTemplates.ts` (lines 1153-1579)

**Subject:**

```
✅ Payment Received - Thank You for Your Support
```

**PDF Attached:** Yes (invoice PDF generated via `pdf-lib`)

**Email Body Summary:**

- **Header:** "Thank you for your continued support"
- **Success Box:** "Thank You for Your Payment and Support!"
  - Thanks user for payment and continued participation in WCS Basketball
  - Mentions their support helps provide quality programs for all players
- **Payment Receipt Section:**
  - Player Name
  - Team (if assigned)
  - Payment Type (Annual/Monthly/Quarterly/Other)
  - Payment Date
  - Amount Paid
  - **Next Payment Due:** MM/DD/YYYY (only shown if there's a remaining balance)
  - **Remaining Balance:** $X.XX (only shown if there's a remaining balance)
- **Support Section:** "Your Continued Support Matters"
  - Explains how their participation helps the program
  - Appreciates commitment to player's growth
  - Shows next payment due date if balance exists
- **Footer:** "Thank you for your continued support of WCS Basketball!"
- **Note:** Team information (practices, games, coaches) is NOT included for subsequent payments (only for first payment)

**Code Location:** `src/app/api/stripe-webhook/route.ts` (lines 651-912, case `invoice.payment_succeeded`)

**Important Notes:**

- Skips `subscription_create` billing reason (handled by checkout.session.completed)
- Determines if payment is first by counting existing paid payments before inserting new one
- Calculates remaining balance: `annualFee - totalPaid`
- Calculates next due date: 30 days after payment date (only if there's a remaining balance)
- Payment type determined from invoice metadata or most common type from existing payments
- Creates new payment record in database
- Ensures player remains "active"
- Invoice PDF attached for the payment
- Works for ALL payment types: Annual, Monthly, Quarterly, and Other

---

### 7. Manual Single Player Invoice Email

**Operation:** Parent clicks "Email Invoice to Parent" on payment page (`/payment/[playerId]`)

**Trigger:**

- API: `POST /api/send-invoice`
- Manually triggered by parent clicking button

**Sender:** Resend API (WCS Basketball)

**Receiver:** Parent (player.parent_email or parents.email)

**Email Template:** Inline HTML template in API route

**Template Location:** `src/app/api/send-invoice/route.ts` (lines 291-567)

**Subject:**

```
Your WCS Invoice • {PlayerFirstName} • Balance ${remaining} (or "Paid in Full")
```

**PDF Attached:** Yes (full HTML invoice rendered via **Puppeteer** as PDF)

**Email Body Summary:**

- "Hello, Please find your invoice attached."
- Information grid:
  - Player: {PlayerName}
  - Next Payment Due: MM/DD/YYYY (30 days after last payment or creation)
  - Subtotal: ${totalPaid}
  - Total Amount: ${annualFee}
  - Remaining: ${remaining}
- Footer: Payment Terms, Contact Info

**Code Location:** `src/app/api/send-invoice/route.ts`

**Important Notes:**

- Uses **Puppeteer** to render `/payment/[playerId]?print=1` to PDF
- PDF generation: `generateInvoicePDFFromHTML(playerId, false)` from `src/lib/pdf/puppeteer-invoice.ts`
- Next payment due date calculated as 30 days after last paid payment or player creation
- Email text and subject improved to match user requirements

---

### 8. Manual Combined Invoice Email (All Players)

**Operation:** Parent clicks "Email Full Invoice" button on billing tab

**Trigger:**

- API: `POST /api/send-parent-invoice`
- Manually triggered by parent clicking button

**Sender:** Resend API (WCS Basketball)

**Receiver:** Parent (parents.email)

**Email Template:** Inline HTML template in API route

**Template Location:** `src/app/api/send-parent-invoice/route.ts` (lines 358-614)

**Subject:**

```
Your WCS Combined Invoice • {N} Players • Balance ${remaining} (or "Paid in Full")
```

**PDF Attached:** Yes (combined HTML invoice rendered via **Puppeteer** as PDF)

**Email Body Summary:**

- "Hello, Please find attached your combined invoice for all your children ({N} children)."
- If paid: "This invoice has been paid in full."
- If balance due: "There is a remaining balance of ${remaining}."
- Information grid:
  - Players: {count} Players
  - Next Payment Due: MM/DD/YYYY (earliest due date across all children)
  - Subtotal: ${totalPaid}
  - Total Amount: ${totalAnnualFee}
  - Remaining: ${remaining}
- Footer: Payment Terms, Contact Info

**Code Location:** `src/app/api/send-parent-invoice/route.ts`

**Important Notes:**

- Uses **Puppeteer** to render `/payment/[firstPlayerId]?print=1&combined=1` to PDF
- PDF generation: `generateInvoicePDFFromHTML(firstPlayerId, true)` from `src/lib/pdf/puppeteer-invoice.ts`
- Aggregates payments across all approved/active children
- Next payment due is earliest date across all children
- Subject includes player count and balance status

---

### 9. Payment Reminder Email (Admin-Triggered)

**Operation:** Admin manually sends payment reminder to parent

**Trigger:**

- API: `POST /api/admin/parents/send-reminder`
- Manually triggered by admin from parent management page

**Sender:** Resend API (WCS Basketball)

**Receiver:** Parent (email specified by admin)

**Email Template:** Inline HTML template in API route

**Template Location:** `src/app/api/admin/parents/send-reminder/route.ts` (lines 130-233)

**Subject:**

```
Payment Reminder - WCS Basketball
```

**PDF Attached:** No

**Email Body Summary:**

- "Hello {ParentName},"
- "This is a friendly reminder that you have a pending payment balance for your child/children's participation in WCS Basketball."
- Player(s) section listing all approved children
- Payment breakdown table:
  - Total Amount Due: ${totalDue}
  - Amount Paid: ${totalPaid}
  - Pending Balance: ${pendingAmount} (red, bold)
- "To complete your payment, please log in to your parent account and navigate to the payment section."
- Button: "Make Payment" (links to parent profile)

**Code Location:** `src/app/api/admin/parents/send-reminder/route.ts`

**Important Notes:**

- Requires admin authentication
- Calculates totals across all approved/active children
- Only includes children with status "approved" or "active"

---

## Admin-Facing Emails

### 10. New Player Registration Notification (Admin)

**Operation:** Parent completes player registration

**Trigger:**

- API: `POST /api/register-player`
- Sent immediately after player creation

**Sender:** Resend API (WCS Basketball)

**Receiver:** Admin(s) (from `ADMIN_NOTIFICATIONS_TO` env var)

**Email Template:** `getAdminPlayerRegistrationEmail()` from `src/lib/emailTemplates.ts` (lines 954-1147)

**Template Location:** `src/lib/emailTemplates.ts` (lines 954-1147)

**Subject:**

```
🏀 WCS Basketball - New Player Registration: {PlayerFirstName} {PlayerLastName}
```

**PDF Attached:** No

**Email Body Summary:**

- Alert box: "Please review and assign this player to a team"
- Player Details:
  - Player Name
  - Grade
  - Gender
  - Player ID
- Parent/Guardian Information:
  - Name
  - Email (clickable mailto link)
  - Phone (clickable tel link)
- Button: "Go to Admin Dashboard →"
- Next Steps:
  1. Review player information
  2. Assign to appropriate team
  3. Parent will receive automatic approval email with payment link

**Code Location:** `src/app/api/register-player/route.ts` (lines 176-209)

**Important Notes:**

- Supports multiple admins (comma-separated emails in env var)
- Uses BCC for multiple admins to maintain privacy

---

### 11. Payment Received Notification (Admin)

**Operation:** Payment successfully processed (checkout or renewal)

**Trigger:**

- Webhook: Stripe `checkout.session.completed` or `invoice.payment_succeeded`
- API: `POST /api/stripe-webhook`

**Sender:** Resend API (WCS Basketball)

**Receiver:** Admin(s) (from `ADMIN_NOTIFICATIONS_TO` env var)

**Email Template:** `getAdminPaymentConfirmationEmail()` from `src/lib/emailTemplates.ts` (lines 1585-1810)

**Template Location:** `src/lib/emailTemplates.ts` (lines 1585-1810)

**Subject:**

```
💰 Payment Received - {PlayerFirstName} {PlayerLastName} - ${amount}
```

**PDF Attached:** No

**Email Body Summary:**

- Success box: "Payment Successfully Processed" with large amount displayed
- Player Information:
  - Player Name
  - Team
  - Player ID
- Parent/Guardian Information:
  - Name
  - Email
- Payment Details:
  - Amount (large, green, bold)
  - Payment Type (Annual/Monthly/Quarterly)
  - Payment Date
  - Payment ID
- Button: "View Player in Admin Dashboard →"
- Note: "The parent has been automatically notified via email about this payment."

**Code Location:** `src/app/api/stripe-webhook/route.ts` (lines 526-579, 857-910)

**Important Notes:**

- Sent for both first payments and renewals
- Uses BCC for multiple admins

---

### 12. Coach/Volunteer Application Notification (Admin)

**Operation:** Someone submits coach or volunteer application

**Trigger:**

- API: `POST /api/coach-volunteer-signup`
- Form submission from `/coach-volunteer` page

**Sender:** Resend API (WCS Basketball)

**Receiver:** Admin(s) (from `ADMIN_NOTIFICATIONS_TO` env var)

**Email Template:** Inline HTML template in API route

**Template Location:** `src/app/api/coach-volunteer-signup/route.ts` (lines 146-269)

**Subject:**

```
New Coach Application: {FirstName} {LastName}
(or "New Volunteer Application: {FirstName} {LastName}")
```

**PDF Attached:** No

**Email Body Summary:**

- Application Details table:
  - Name
  - Email
  - Phone
  - Role (Coach/Volunteer)
  - Address (full)
  - Child on Team (Yes/No)
  - Child's Name
  - Child's Team
  - Background Check Consent
- Additional Information:
  - Experience
  - Availability
  - Why Interested
- Next Steps box: "Please review this application and contact the applicant to discuss next steps, including scheduling a background check."
- Footer: Application ID and submission timestamp

**Code Location:** `src/app/api/coach-volunteer-signup/route.ts` (lines 136-286)

**Important Notes:**

- No parent confirmation email sent (admin notification only)
- Uses BCC for multiple admins

---

### 13. Merged Pending Registration Notification (Admin)

**Operation:** Pending registration is merged after parent creates account

**Trigger:**

- API: `POST /api/merge-pending-registration`
- When parent who pre-registered creates an account

**Sender:** Resend API (WCS Basketball)

**Receiver:** Admin(s) (from `ADMIN_NOTIFICATIONS_TO` env var)

**Email Template:** `getAdminPlayerRegistrationEmail()` from `src/lib/emailTemplates.ts` (lines 954-1147)

**Template Location:** `src/lib/emailTemplates.ts` (lines 954-1147)

**Subject:**

```
🏀 WCS Basketball - New Player Registration: {PlayerFirstName} {PlayerLastName}
```

**PDF Attached:** No

**Email Body Summary:**

- Same as regular admin player registration notification (scenario #10)

**Code Location:** `src/app/api/merge-pending-registration/route.ts` (lines 129-146)

**Important Notes:**

- Occurs when a parent who previously submitted a registration form (before creating account) finally logs in
- Creates player record and notifies admins

---

## Email Flow Summary

### Parent Registration & Approval Flow

1. Parent registers → **Welcome/Registration Email** (#1) + **Admin Notification** (#10)
2. Admin approves → **Player Approval Email with Payment Link** (#2)
3. Parent pays → **Payment Confirmation Email** (#5) + **Admin Payment Notification** (#11)

### Subscription Renewal Flow

1. Stripe processes monthly renewal → **Payment Confirmation Email** (#6) + **Admin Payment Notification** (#11)

### Manual Invoice Flow

1. Parent clicks "Email Invoice to Parent" → **Single Player Invoice Email** (#7)
2. Parent clicks "Email Full Invoice" → **Combined Invoice Email** (#8)

### Admin-Triggered Flow

1. Admin sends payment reminder → **Payment Reminder Email** (#9)

### Rejection/Hold Flow

1. Admin places on hold → **On-Hold Email** (#3)
2. Admin rejects → **Rejected Email** (#4)

---

## Environment Variables for Email

```env
# Resend API Configuration
RESEND_API_KEY=your_resend_api_key
RESEND_FROM="WCS Basketball <noreply@wcsbasketball.site>"
RESEND_DEV_TO="your-dev-email@example.com"  # For testing (sandbox mode)

# Admin Notifications (comma-separated for multiple admins)
ADMIN_NOTIFICATIONS_TO="admin1@example.com,admin2@example.com,admin3@example.com"

# Stripe Configuration (for webhooks)
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```

---

## Important Notes

### Puppeteer vs pdf-lib for PDFs

- **Puppeteer** (new): Used for manual invoice emails (#7, #8)
  - Generates PDF by rendering actual HTML invoice page
  - More accurate, matches HTML exactly
  - Located: `src/lib/pdf/puppeteer-invoice.ts`
- **pdf-lib** (legacy): Used for automatic payment confirmation emails (#5, #6)
  - Generates PDF programmatically
  - Located: `src/lib/pdf/invoice.ts`

### Email Routing (Sandbox vs Production)

- If `RESEND_FROM` contains `@resend.dev` (sandbox): ALL emails go to `RESEND_DEV_TO`
- If `RESEND_FROM` uses verified domain: Emails go to actual recipients
- See: `src/lib/email.ts`

### Parent Email Priority

When sending emails to parents, the system uses this priority:

1. Gmail account email (users.email) - if parent signed up via Gmail
2. Parent record email (parents.email)
3. Player record email (players.parent_email)

This ensures emails go to the actual Gmail account for Gmail sign-ups.

---

## Testing Email Flows in Development

### Setup Stripe Webhook Forwarding

```bash
# Start Stripe CLI webhook forwarding
stripe listen --forward-to localhost:3000/api/stripe-webhook

# Copy the webhook secret and add to .env.local
STRIPE_WEBHOOK_SECRET=whsec_xxx...
```

### Testing Checklist

- [ ] Parent registration → Welcome email sent
- [ ] Admin receives registration notification
- [ ] Player approval → Approval email with magic link sent
- [ ] Payment completion → Payment confirmation with PDF sent
- [ ] Admin receives payment notification
- [ ] Manual invoice emails work with Puppeteer PDF
- [ ] Monthly renewal → Renewal email with PDF sent
- [ ] Payment reminder works from admin panel

---

## Files Referenced

### Email Templates

- `src/lib/emailTemplates.ts` - All email HTML templates
- `src/lib/email.ts` - Email sending utility (Resend)
- `src/lib/emailHelpers.ts` - Helper functions for team data

### API Routes (Email Triggers)

- `src/app/api/register-player/route.ts` - Registration emails
- `src/app/api/approve-player/route.ts` - Approval/rejection emails
- `src/app/api/stripe-webhook/route.ts` - Payment confirmation emails
- `src/app/api/send-invoice/route.ts` - Manual single invoice
- `src/app/api/send-parent-invoice/route.ts` - Manual combined invoice
- `src/app/api/admin/parents/send-reminder/route.ts` - Payment reminders
- `src/app/api/coach-volunteer-signup/route.ts` - Coach/volunteer applications
- `src/app/api/merge-pending-registration/route.ts` - Merged registrations

### PDF Generation

- `src/lib/pdf/puppeteer-invoice.ts` - Puppeteer PDF generation (new, for manual emails)
- `src/lib/pdf/invoice.ts` - pdf-lib PDF generation (legacy, for automatic emails)

---

_Last Updated: Based on codebase analysis on 2025-01-11_
