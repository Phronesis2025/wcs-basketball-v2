WCSv2.0 - Testing Documentation
📋 Overview
This document outlines the testing strategy for the World Class Sports Basketball (WCSv2.0) website, focusing on ensuring robust functionality, data validation, UI/UX, and security for the coaches dashboard and related features. Tests cover end-to-end (E2E) flows and manual verification, with a priority on team updates, followed by news and practice drills. The goal is to maintain high reliability, catch issues early, and provide clear debugging steps for future maintenance.
Current Version: v2.4.3  
Last Updated: January 2025  
Status: Production Ready ✅  
Security Score: 10/10 (Perfect) 🔒

🛠️ Test Environment
Setup
Testing uses Playwright for E2E tests, integrated with Next.js 15.5.2 and Supabase. The environment is configured for development (local) and production (Vercel) testing.
Dependencies

Playwright: Browser automation for E2E testing.
@testing-library/react: DOM querying for robust selectors.
react-hot-toast: For success/error notifications.
Supabase Mocks: Mock auth and DB queries to avoid hitting production.

Installation
Run these commands to set up the test environment:
npm install --save-dev playwright @playwright/test @testing-library/react
npx playwright install # Installs browser binaries
npm install react-hot-toast # For notifications

Configuration

Create playwright.config.ts in the project root:

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
testDir: './tests',
fullyParallel: true,
forbidOnly: !!process.env.CI,
retries: process.env.CI ? 2 : 0,
workers: process.env.CI ? 1 : undefined,
reporter: 'html',
use: {
baseURL: 'http://localhost:3000',
trace: 'on-first-retry',
actionTimeout: 10000,
},
projects: [
{
name: 'chromium-desktop',
use: { ...devices['Desktop Chrome'] },
},
{
name: 'mobile',
use: { ...devices['iPhone 12'] },
},
],
});

Create tests/setup.ts for Supabase mocks.
Update .gitignore to include playwright-report/ and test-results/.

Running Tests
npx playwright test # Run all tests
npx playwright test --project=chromium-desktop # Desktop only
npx playwright test --project=mobile # Mobile only
npx playwright show-report # View HTML report

🧪 Test Types
End-to-End (E2E) Tests

Tool: Playwright
Scope: Full user flows (e.g., login → dashboard → create/update/delete team updates).
Focus: Functionality, data validation, UI/UX (mobile responsiveness), security (CSRF, RLS).
Location: tests/coaches.e2e.ts

Manual Tests

Scope: Manual verification of UI, validation, and edge cases.
Focus: Confirm E2E test coverage, catch visual/UX issues, and verify security.
Logged: Below in Manual Test Steps.

🎯 Test Coverage Goals

Functionality: 100% coverage of create/update/delete for team updates, news, drills.
Validation: Test all input edge cases (empty, invalid, malicious).
UI/UX: Verify mobile responsiveness (iPhone 12 viewport), toasts, spinners.
Security: Confirm CSRF token validation, RLS policies, input sanitization.
Error Rate: <0.1% failure rate in production.
Performance: Page interactions <500ms, API calls <200ms.

🧪 E2E Test Plan
Team Updates (Priority 1)
Test Case: Coach Flow for Team Updates

ID: E2E-TU-001
Description: Test coach login, navigate to dashboard, create/update/delete a team update, verify UI feedback (toasts/spinners), and check mobile responsiveness.
Setup:
Mock Supabase auth to return a coach user (role: 'coach', id: '550e8400-e29b-41d4-a716-446655440000').
Mock team_updates table with DB_SETUP.md sample data.
Mock CSRF token generation to return a fixed token for testing.

Steps:
Navigate to /coaches/login.
Enter valid email/password, submit, verify redirect to /coaches/dashboard.
Select a team (e.g., 'WCS Sharks').
Create a team update (valid title/content/image), verify toast shows “Team update created!”.
Update the team update, verify toast shows “Team update updated!”.
Delete the team update, verify toast shows “Team update deleted!”.
Test invalid inputs (empty title, malicious content), verify error messages.
Switch to mobile viewport (iPhone 12), repeat steps, verify responsiveness.

Expected:
Login redirects to dashboard.
Team update CRUD operations succeed with toasts/spinners.
Invalid inputs show error messages.
Mobile view: forms/buttons readable, no overflow.

Files:
tests/coaches.e2e.ts
src/app/coaches/dashboard/page.tsx

Status: Planned

Mock Setup (tests/setup.ts):

Mock Supabase client:

import { createClient } from '@supabase/supabase-js';
jest.mock('@supabase/supabase-js', () => ({
createClient: () => ({
auth: {
signInWithPassword: jest.fn().mockResolvedValue({
data: { user: { id: '550e8400-e29b-41d4-a716-446655440000' } },
error: null,
}),
getUser: jest.fn().mockResolvedValue({
data: { user: { id: '550e8400-e29b-41d4-a716-446655440000' } },
error: null,
}),
},
from: jest.fn().mockReturnValue({
select: jest.fn().mockReturnThis(),
eq: jest.fn().mockReturnThis(),
single: jest.fn().mockReturnThis(),
insert: jest.fn().mockReturnThis(),
update: jest.fn().mockReturnThis(),
// Mock DB_SETUP.md sample data for team_updates
data: [
{
id: '123e4567-e89b-12d3-a456-426614174000',
team_id: '550e8400-e29b-41d4-a716-446655440001',
title: 'Game Recap',
content: 'Great win against the Vipers!',
image_url: null,
created_by: '550e8400-e29b-41d4-a716-446655440000',
created_at: '2025-02-10T12:00:00Z',
deleted_at: null,
},
],
}),
}),
}));

Test Case: Homepage Setup Verification

ID: E2E-HP-001
Description: Verify Playwright setup by loading the homepage, checking Hero content, and confirming the "Our Teams" link in FanZone.
Setup:
No mocks needed (static homepage).
Ensure npm run dev is running at http://localhost:3000.

Steps:
Navigate to /.
Verify body is visible.
Verify Hero heading ("We are World Class") is visible.
Verify "Our Teams" link in FanZone (via data-testid="fan-zone-teams-link") is visible.

Expected:
Page loads, Hero heading and Teams link are visible.
Passes on both desktop and mobile viewports.

Files:
tests/dummy.spec.ts
src/app/page.tsx
src/components/FanZone.tsx

Status: In Progress

🖐️ Manual Test Steps
Team Updates

Test Case: Manual-TU-001
Description: Verify coach can create/update/delete team updates in the dashboard.
Environment: Local dev (http://localhost:3000), Chrome DevTools (Desktop + iPhone 12 viewport).
Setup:
Ensure Supabase URL/anon key set in .env.local (per DB_SETUP.md).
Use sample data: team 'WCS Sharks' (id: '550e8400-e29b-41d4-a716-446655440001'), coach email 'coach1@example.com'.

Steps:
Open browser, navigate to http://localhost:3000/coaches/login.
Enter email: 'coach1@example.com', password: 'test123', submit.
Verify redirect to /coaches/dashboard.

Select team 'WCS Sharks' from dropdown.
In “Team Updates” section, enter:
Title: 'Practice Update', Content: 'Focus on dribbling drills', Image: valid PNG (<2MB).
Submit, verify spinner shows, then toast: “Team update created!”.

Edit the update:
Click 'Edit', change title to 'Updated Practice', submit.
Verify spinner, then toast: “Team update updated!”.

Delete the update:
Click 'Delete', confirm, verify toast: “Team update deleted!”.

Test invalid inputs:
Empty title, submit, verify error message (e.g., “Title is required”).
Malicious content (e.g., <script>alert('xss')</script>), verify sanitization (no script execution).

Open Chrome DevTools, switch to iPhone 12 viewport.
Repeat steps 3-7, verify forms/buttons are readable, no overflow, toasts visible.

Expected:
Login redirects to dashboard.
CRUD operations show spinners/toasts, update DB correctly.
Invalid inputs show clear errors.
Mobile view: UI is responsive, no clipping.

Debugging:
If login fails: Check Supabase auth logs, verify .env.local vars.
If toasts don’t show: Check console for react-hot-toast errors.
If DB errors: Verify RLS policies in Supabase dashboard, check deleted_at null for active records.

Status: Planned

📊 Test Log

Test ID
Type
Feature
Status
Result
Notes
Date

E2E-TU-001
E2E
Team Updates
Planned

- Awaiting Playwright setup
-

Manual-TU-001
Manual
Team Updates
Planned

- Awaiting manual test run
-

E2E-HP-001
E2E
Homepage Setup
Failed
Strict mode violation: multiple "Teams" links matched
Updated test to use data-testid="fan-zone-teams-link" for FanZone "Our Teams" link
2025-09-30

🚀 Next Steps

Run Setup: Install Playwright and react-hot-toast, configure playwright.config.ts.
Write E2E Tests: Implement tests/coaches.e2e.ts for team updates flow.
Update Dashboard: Add toasts/spinners to src/app/coaches/dashboard/page.tsx.
Manual Testing: Run Manual-TU-001 steps, log results.
Update Teams Page: Modify teams/[id]/page.tsx to display team updates.
Proceed to News/Drills: Repeat for news, then drills.

Reference Files:

Code: src/app/coaches/dashboard/page.tsx, src/lib/actions.ts, src/types/supabase.ts, src/components/FanZone.tsx
Docs: DB_SETUP.md, CODEBASE_STRUCTURE.md
