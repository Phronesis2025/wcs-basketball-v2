# TypeScript Errors Documentation - Step 1.2

## Summary
Build completed with **errors** that need to be fixed. The TypeScript strict mode is already enabled, but there are many `any` types and other issues that need to be addressed.

## Error Categories

### 1. `@typescript-eslint/no-explicit-any` Errors (Critical - Must Fix)
These are the most critical errors - using `any` type defeats the purpose of TypeScript's type safety.

**Total Count: ~200+ instances across multiple files**

#### Files with Most `any` Type Errors:

1. **`src/app/admin/club-management/page.tsx`** - 30+ instances
   - Lines: 124, 131, 142, 202, 203, 207, 209, 228, 239, 514, 566, 821, 876, 882, 1098, 1162, 1228, 1264, 1334, 1370, 1500, 1605, 1693, 1792, 1796, 3678, 3691, 3773, 3786, 3871, 3880, 3968, 3977, 4082

2. **`src/app/api/admin/parents/payment-overview/route.ts`** - 11 instances
   - Lines: 128, 137, 146, 147, 186, 190, 205, 229 (2x), 260

3. **`src/app/api/send-parent-invoice/route.ts`** - 13 instances
   - Lines: 108, 127, 129, 163, 233, 234, 235, 241, 269, 284, 645, 694

4. **`src/lib/excel-parser.ts`** - 7 instances
   - Lines: 99, 106, 199 (2x), 200, 267, 426

5. **`src/lib/pdf/practiceDrill.ts`** - 7 instances
   - Lines: 15, 45, 51, 52, 95, 96, 97

6. **`src/components/AdminOverviewContent.tsx`** - 15+ instances
   - Lines: 53, 54, 55, 56, 103, 117, 262, 282, 284, 326, 329, 334, 553, 557, 616, 620, 687, 691, 843

7. **`src/app/api/admin/import/parse/route.ts`** - 7 instances
   - Lines: 21 (2x), 22, 84, 233, 311, 318

8. **`src/app/api/payment/verify-session/route.ts`** - 3 instances
   - Lines: 388, 421, 661

9. **`src/app/api/stripe-webhook/route.ts`** - 3 instances
   - Lines: 419, 833, 1070

10. **`src/app/api/admin/import/execute/route.ts`** - 2 instances
    - Lines: 187, 432

#### Other Files with `any` Types:
- `src/app/admin/import/page.tsx` - 6 instances
- `src/app/api/activity/heartbeat/route.ts` - 2 instances
- `src/app/api/admin/cleanup-data/route.ts` - 1 instance
- `src/app/api/admin/coaches/[id]/route.ts` - 1 instance
- `src/app/api/admin/create-player/route.ts` - 1 instance
- `src/app/api/admin/create-team/route.ts` - 1 instance
- `src/app/api/admin/parents/route.ts` - 5 instances
- `src/app/api/admin/parents/send-reminder/route.ts` - 4 instances
- `src/app/api/admin/payments/metrics/route.ts` - 4 instances
- `src/app/api/admin/players/[id]/route.ts` - 1 instance
- `src/app/api/admin/teams/[id]/route.ts` - 1 instance
- `src/app/api/approve-player/route.ts` - 1 instance
- `src/app/api/checkout/complete-form/route.ts` - 1 instance
- `src/app/api/coach/profile/route.ts` - 1 instance
- `src/app/api/coach/update-profile/route.ts` - 2 instances
- `src/app/api/coaches/route.ts` - 1 instance
- `src/app/api/create-checkout-session/route.ts` - 1 instance
- `src/app/api/generate-welcome-kit/route.ts` - 4 instances
- `src/app/api/get-price/route.ts` - 1 instance
- `src/app/api/parent/profile/route.ts` - 6 instances
- `src/app/api/parent/update-contact/route.ts` - 1 instance
- `src/app/api/parent/update-player/route.ts` - 1 instance
- `src/app/api/player/payments/[playerId]/route.ts` - 1 instance
- `src/app/api/register-player/route.ts` - 1 instance
- `src/app/api/send-invoice/route.ts` - 3 instances
- `src/app/api/stripe-webhook/test/route.ts` - 1 instance
- `src/app/api/teams/route.ts` - 4 instances
- `src/app/checkout/[playerId]/page.tsx` - 5 instances
- `src/app/coach-volunteer-signup/page.tsx` - 3 instances
- `src/app/coaches/login/page.tsx` - 1 instance
- `src/app/coaches/reset-password/page.tsx` - 2 instances
- `src/app/coaches/setup-password/page.tsx` - 1 instance
- `src/app/parent/login/page.tsx` - 2 instances
- `src/app/parent/reset-password/page.tsx` - 1 instance
- `src/app/payment/select/page.tsx` - 1 instance
- `src/app/register/page.tsx` - 1 instance
- `src/app/teams/[id]/page.tsx` - 4 instances
- `src/components/ChangelogModal.tsx` - 3 instances
- `src/components/ChangelogTable.tsx` - 1 instance
- `src/components/CoachDetailModal.tsx` - 1 instance
- `src/components/CoachPlayersView.tsx` - 4 instances
- `src/components/CommitChart.tsx` - 2 instances
- `src/components/dashboard/MessageBoard.tsx` - 1 instance
- `src/components/dashboard/PlayerPaymentModal.tsx` - 3 instances
- `src/components/parent/ChildDetailsCard.tsx` - 3 instances
- `src/components/parent/StatusTimeline.tsx` - 2 instances
- `src/components/PlayerDetailModal.tsx` - 1 instance
- `src/components/registration/RegistrationWizard.tsx` - 1 instance
- `src/components/TeamDetailModal.tsx` - 1 instance
- `src/hooks/useAuth.ts` - 1 instance
- `src/lib/actions.ts` - 5 instances
- `src/lib/ageValidation.ts` - 1 instance
- `src/lib/analytics.ts` - 1 instance
- `src/lib/authPersistence.ts` - 3 instances
- `src/lib/email.ts` - 1 instance
- `src/lib/emailHelpers.ts` - 1 instance
- `src/lib/pdf/puppeteer-drill.ts` - 2 instances
- `src/lib/pdf/puppeteer-invoice.ts` - 3 instances

### 2. `@typescript-eslint/no-unused-vars` Warnings (Should Fix)
Unused variables that should be removed or used.

**Total Count: ~100+ instances**

Key files:
- `src/app/admin/club-management/page.tsx` - Many unused variables
- Various API routes with unused parameters
- Components with unused state variables

### 3. `react-hooks/exhaustive-deps` Warnings (Should Fix)
Missing dependencies in useEffect hooks.

**Total Count: ~20+ instances**

Key files:
- `src/app/admin/club-management/page.tsx` - Multiple missing dependencies
- `src/components/dashboard/MessageBoard.tsx`
- `src/components/dashboard/ScheduleModal.tsx`
- Various other components

### 4. `react/no-unescaped-entities` Errors (Should Fix)
Unescaped quotes and apostrophes in JSX.

**Total Count: ~30+ instances**

Key files:
- `src/app/admin/club-management/page.tsx` - Lines 2028, 2029
- `src/app/checkout/[playerId]/page.tsx` - Line 959
- `src/app/coach-volunteer-signup/page.tsx` - Multiple
- `src/app/parent/login/page.tsx` - Multiple
- `src/app/payment/success/page.tsx` - Multiple
- Various other components

### 5. `@next/next/no-img-element` Warnings (Should Fix)
Using `<img>` instead of Next.js `<Image />` component.

**Total Count: ~15+ instances**

Key files:
- `src/components/AdminOverviewContent.tsx`
- `src/components/dashboard/AddCoachModal.tsx`
- `src/components/dashboard/AddTeamModal.tsx`
- `src/components/parent/ChildDetailsCard.tsx`
- Various other components

## Priority Fix Order

1. **CRITICAL**: Fix all `@typescript-eslint/no-explicit-any` errors (Step 1.3)
2. **HIGH**: Fix `react/no-unescaped-entities` errors (affects build)
3. **MEDIUM**: Fix `@typescript-eslint/no-unused-vars` warnings
4. **MEDIUM**: Fix `react-hooks/exhaustive-deps` warnings
5. **LOW**: Fix `@next/next/no-img-element` warnings

## Next Steps

Proceed to **Step 1.3: Fix TypeScript Errors from Strict Mode** to address these issues systematically.

