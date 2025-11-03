# Email Issues - Fixes Applied

**Date**: November 2, 2025  
**Issues**: Approval email not sent, Stripe receipt email, Detailed form usage

---

## ✅ Fixes Applied

### 1. Approval Email Fix - COMPLETED

**Problem**: Approval email not sent because `player.parent_email` was NULL at approval time

**Solution**: Added logic to fetch `parent_email` from `parents` table if missing

**File**: `src/app/api/approve-player/route.ts`

**Code Added**:
```typescript
// Fix: If parent_email is missing, fetch it from parents table
if (!updated.parent_email && updated.parent_id) {
  const { data: parent } = await supabaseAdmin!
    .from("parents")
    .select("email")
    .eq("id", updated.parent_id)
    .single();
  
  if (parent?.email) {
    // Update player record with parent_email
    await supabaseAdmin!
      .from("players")
      .update({ parent_email: parent.email })
      .eq("id", player_id);
    
    updated.parent_email = parent.email;
    devLog("approve-player: Fixed missing parent_email", { 
      player_id, 
      parent_email: parent.email 
    });
  }
}
```

**Additional Change**: Approval email link now points to `/checkout/[playerId]` instead of `/payment/[playerId]` to ensure detailed form is shown first.

---

## 📋 Remaining Issues

### 1. Stripe Receipt Email

**Status**: ⚠️ Needs verification

**Possible Reasons**:
- Test mode may not send emails automatically
- Email in spam folder
- Stripe email settings need configuration

**Verification Steps**:
1. Check Stripe Dashboard → Payments → `pi_3SP9gDB2WuesLU9g0GdzRPWf` → Email receipts section
2. Check spam/junk folder for `phronesis700@gmail.com`
3. Verify Stripe email settings in dashboard are enabled
4. In test mode, Stripe sometimes doesn't send emails - check dashboard logs

**Note**: The payment intent correctly has `receipt_email: "phronesis700@gmail.com"` set, so Stripe should send it when payment succeeds. In test mode, receipt emails may be delayed or require manual verification.

---

### 2. Detailed Form Usage

**Status**: ❌ Form was bypassed in test flow

**Current Flow**:
- Registration → Admin Approval → Direct to `/payment/[playerId]` → Stripe Checkout

**Expected Flow**:
- Registration → Admin Approval → `/checkout/[playerId]` (detailed form) → Stripe Checkout

**Fix Applied**: 
- Approval email link now points to `/checkout/[playerId]` instead of `/payment/[playerId]`
- This ensures the detailed form is shown before payment

**What the Detailed Form Collects**:
- Player: School, shirt size, position, experience
- Address: Full mailing address
- Guardian: Emergency contact info
- Medical: Allergies, conditions, medications, doctor info
- Consents: Photo release, medical treatment, participation

**Note**: The detailed form (`/checkout/[playerId]`) should be required before payment for new players. Existing players who have completed it can go directly to payment.

---

## 🔍 Summary

| Issue | Status | Action Taken |
|-------|--------|--------------|
| Approval Email Not Sent | ✅ FIXED | Added fallback to fetch `parent_email` from parents table |
| Approval Email Link | ✅ FIXED | Changed from `/payment/` to `/checkout/` to show detailed form |
| Stripe Receipt Email | ⚠️ Needs Verification | Check Stripe dashboard and spam folder |
| Detailed Form Bypassed | ✅ FIXED | Approval link now routes to checkout page |

---

**Next Steps**:
1. Test approval email again with a player that has null `parent_email` - should now send email
2. Verify Stripe receipt email in dashboard or check spam folder
3. Test complete flow with detailed form: Approval → Checkout → Detailed Form → Payment

