# E2E Test Suite - Registration Flow

This directory contains end-to-end tests for the new parent/new player registration flow.

## Test Files

- `registration-new-parent.spec.ts` - Main E2E test covering the complete registration flow

## Test Structure

The test suite is organized into 5 phases:

### Phase 1: Registration
- Navigate to homepage
- Complete registration form (Parent Info → Player Info → Review & Consent)
- Verify registration success
- Verify database records (pending_registrations, players, parents)
- Email checkpoint (registration confirmation, admin notification)

### Phase 2: Admin Approval
- Admin login
- Navigate to club management
- Assign player to team
- Approve player
- Verify database (status = approved, team_id set)
- Email checkpoint (approval email with payment link)

### Phase 3: Payment
- Parent login
- Complete detailed form (address, medical, consent)
- Navigate to payment page
- Complete Stripe payment (test mode)
- Verify payment success
- Verify database (payment record, player status = active)
- Email checkpoint (payment confirmation)

### Phase 4: Admin Payment Verification
- Admin login
- Navigate to payment metrics/admin dashboard
- Verify payment appears with correct details

### Phase 5: Log Verification
- Browser console logs
- Application logs (audit_logs, login_logs, error_logs)
- Supabase logs (API, Postgres, Auth)
- Stripe logs (webhooks, payment events)

## Helpers

- `helpers/auth.ts` - Authentication helpers (parent/admin login, logout)
- `helpers/database.ts` - Database verification helpers (Supabase queries)
- `helpers/email.ts` - Email verification checkpoints (manual verification)
- `helpers/stripe.ts` - Stripe payment helpers (test card filling, checkout)

## Configuration

### Environment Variables

Required in `.env.local`:

```bash
# Supabase (for database helpers)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Test Data (already configured in test file)
# Parent: phronesis700@gmail.com / test1234567
# Admin: jason.boyer@wcs.com / WCS2025sports!

# Email
ADMIN_NOTIFICATIONS_TO=admin@wcs.com

# Stripe (test mode)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Base URL (optional - defaults to localhost:3000)
E2E_BASE_URL=http://localhost:3000
# Or for deployed:
# E2E_BASE_URL=https://your-deployed-url.com
```

### Playwright Configuration

The test suite is configured in `playwright.config.ts`:

- **Test Directory**: `./tests/e2e`
- **Base URL**: From `E2E_BASE_URL` env var or `localhost:3000`
- **Browser**: Chromium (Desktop Chrome)
- **Reporters**: HTML, JSON, List
- **Screenshots**: On failure only
- **Videos**: Retain on failure

## Running Tests

### Local Testing (localhost:3000)

```bash
# Run all E2E tests
npm run test:e2e

# Run with UI mode (interactive)
npm run test:e2e:ui

# Run in headed mode (see browser)
npm run test:e2e:headed

# Debug mode
npm run test:e2e:debug

# View HTML report
npm run test:e2e:report
```

### Deployed Testing

1. Set `E2E_BASE_URL` in `.env.local`:
   ```bash
   E2E_BASE_URL=https://your-deployed-url.com
   ```

2. Run tests:
   ```bash
   npm run test:e2e
   ```

## Test Data

Test uses the following data:

- **Parent**: phronesis700@gmail.com / test1234567
- **Player**: Amelia Boyer (Birthdate: 2013-11-12, Grade: 6th, Gender: Female)
- **Team**: WCS Eagles Elite (U12, Girls) - ID: `95c83e18-572a-45cf-b7e5-eb009921a3ae`
- **Admin**: jason.boyer@wcs.com / WCS2025sports!
- **Payment**: $360 (annual)

## Test Reports

Test reports are generated in `tests/e2e/reports/`:

- `html/` - HTML test report (view with `npm run test:e2e:report`)
- `results.json` - JSON test results
- `screenshots/` - Screenshots on test failures

## Email Verification

The test suite uses **manual email verification checkpoints**. After each test run:

1. Review the email checkpoints logged in the console
2. Manually verify each email was received:
   - Registration confirmation email to parent
   - Admin notification email
   - Player approval email with payment link
   - Payment confirmation email

Email verification is tracked via the `helpers/email.ts` module, which records checkpoints but requires manual verification.

## Error Handling

- **Screenshots**: Automatically captured on test failures
- **Console Logs**: Browser console errors are captured and logged
- **Resume Capability**: Tests can be run individually if one phase fails
- **Database Verification**: Includes retry logic with polling

## Troubleshooting

### Tests Fail to Connect to Base URL

- Verify the server is running (`npm run dev` for localhost)
- Check `E2E_BASE_URL` environment variable
- Verify network connectivity

### Player Not Found in Admin Dashboard

- Wait a few seconds for database sync
- Refresh the admin page manually
- Check Supabase logs for any errors

### Stripe Payment Fails

- Verify Stripe test mode is enabled
- Check that test card (`4242 4242 4242 4242`) is being used
- Verify Stripe webhook endpoint is configured

### Database Verification Fails

- Check `SUPABASE_SERVICE_ROLE_KEY` is set correctly
- Verify Supabase project is accessible
- Check RLS policies allow admin queries

## Next Steps

1. Run tests locally: `npm run test:e2e`
2. Review email checkpoints manually
3. Check test reports in `tests/e2e/reports/html`
4. Run against deployed version by setting `E2E_BASE_URL`

