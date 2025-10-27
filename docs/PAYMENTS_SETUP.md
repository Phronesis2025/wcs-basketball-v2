# Payments and Player Status Setup Guide

## Overview

This guide explains how to set up and use the payment tracking and player status management features in the WCS Basketball club management system.

**Created**: January 2025  
**Migration File**: `docs/payments_and_player_status_migration.sql`

---

## 📋 What This Migration Adds

### 1. **Player Status Fields**

Three new fields are added to the `players` table:

- **`status`** (text): Player registration status
  - Values: `'pending'` | `'approved'` | `'active'`
  - Default: `'pending'`
- **`waiver_signed`** (boolean): Whether the player has signed the liability waiver
  - Default: `false`
- **`stripe_customer_id`** (text): Stripe customer ID for payment processing
  - Links the player to their Stripe customer account

### 2. **Payments Table**

A new table for tracking player payments through Stripe:

- **`id`** (uuid): Primary key
- **`player_id`** (uuid): Foreign key to players table
- **`stripe_payment_id`** (text): Stripe Checkout Session ID or Invoice ID
- **`amount`** (numeric): Payment amount in dollars
- **`payment_type`** (text): Type of payment (`'annual'` | `'monthly'` | `'custom'`)
- **`status`** (text): Payment status (`'pending'` | `'paid'` | `'failed'`)
- **`created_at`** (timestamptz): When payment was initiated
- **`updated_at`** (timestamptz): When payment was last updated

---

## 🚀 How to Apply the Migration

### Step 1: Open Supabase SQL Editor

1. Go to your Supabase Dashboard
2. Navigate to the **SQL Editor**
3. Click **New Query**

### Step 2: Run the Migration

1. Copy the entire contents of `docs/payments_and_player_status_migration.sql`
2. Paste into the SQL Editor
3. Click **Run** or press `Ctrl+Enter`

### Step 3: Verify the Migration

Run these verification queries in the SQL Editor:

```sql
-- Check if new columns were added to players table
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'players'
AND column_name IN ('status', 'waiver_signed', 'stripe_customer_id');

-- Verify payments table exists
SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_name = 'payments';

-- Check RLS policies for payments table
SELECT policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename = 'payments';

-- Verify indexes were created
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename IN ('players', 'payments');
```

---

## 🔐 Security Features

### Row Level Security (RLS)

The `payments` table has RLS enabled with the following policies:

- **Public can view payments** (authenticated users only)
- **Only admins can insert payments**
- **Only admins can update payments**
- **Only admins can delete payments**

This ensures that payment data is secure and only accessible to authorized admin users.

---

## 💻 Code Examples

### Using Player Status in TypeScript

```typescript
import { supabaseAdmin } from "@/lib/supabaseClient";
import { Player } from "@/types/supabase";

// Update player status
async function updatePlayerStatus(
  playerId: string,
  status: "pending" | "approved" | "active"
) {
  const { data, error } = await supabaseAdmin
    .from("players")
    .update({ status })
    .eq("id", playerId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Check if player has signed waiver
async function hasPlayerSignedWaiver(playerId: string): Promise<boolean> {
  const { data, error } = await supabaseAdmin
    .from("players")
    .select("waiver_signed")
    .eq("id", playerId)
    .single();

  if (error || !data) return false;
  return data.waiver_signed;
}

// Get players by status
async function getPlayersByStatus(status: string) {
  const { data, error } = await supabaseAdmin
    .from("players")
    .select("*")
    .eq("status", status)
    .eq("is_active", true);

  if (error) throw error;
  return data;
}
```

### Working with Payments

```typescript
import { supabaseAdmin } from "@/lib/supabaseClient";
import { Payment } from "@/types/supabase";

// Create a new payment record
async function createPayment(payment: {
  player_id: string;
  stripe_payment_id: string;
  amount: number;
  payment_type: "annual" | "monthly" | "custom";
}) {
  const { data, error } = await supabaseAdmin
    .from("payments")
    .insert({
      ...payment,
      status: "pending",
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Update payment status (from Stripe webhook)
async function updatePaymentStatus(
  stripePaymentId: string,
  status: "pending" | "paid" | "failed"
) {
  const { data, error } = await supabaseAdmin
    .from("payments")
    .update({ status })
    .eq("stripe_payment_id", stripePaymentId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Get all payments for a player
async function getPlayerPayments(playerId: string) {
  const { data, error } = await supabaseAdmin
    .from("payments")
    .select("*")
    .eq("player_id", playerId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

// Get pending payments
async function getPendingPayments() {
  const { data, error } = await supabaseAdmin
    .from("payments")
    .select(
      `
      *,
      players:player_id (
        id,
        name,
        email,
        parent_email
      )
    `
    )
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}
```

### Example: Stripe Integration

```typescript
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabaseClient";

// Handle Stripe webhook
async function handleStripeWebhook(event: Stripe.Event) {
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    // Update payment status to 'paid'
    const { error } = await supabaseAdmin
      .from("payments")
      .update({ status: "paid" })
      .eq("stripe_payment_id", session.id);

    if (error) {
      console.error("Error updating payment:", error);
      throw error;
    }

    // Optionally update player status
    const { data: payment } = await supabaseAdmin
      .from("payments")
      .select("player_id")
      .eq("stripe_payment_id", session.id)
      .single();

    if (payment) {
      await supabaseAdmin
        .from("players")
        .update({ status: "active" })
        .eq("id", payment.player_id);
    }
  }
}
```

---

## 🔄 Player Status Workflow

A typical player registration and payment workflow:

1. **Player Registers** → `status: 'pending'`, `waiver_signed: false`
2. **Player Signs Waiver** → `waiver_signed: true`
3. **Player Makes Payment** → Payment created with `status: 'pending'`
4. **Payment Confirmed** → Payment `status: 'paid'`, Player `status: 'active'`

---

## 📊 Query Examples

### Find all active players with pending payments

```sql
SELECT
  p.*,
  pay.amount,
  pay.payment_type,
  pay.created_at as payment_date
FROM players p
INNER JOIN payments pay ON p.id = pay.player_id
WHERE p.status = 'approved'
  AND pay.status = 'pending'
  AND p.is_active = true;
```

### Get player payment summary

```sql
SELECT
  p.id,
  p.name,
  p.status,
  COUNT(pay.id) as total_payments,
  SUM(CASE WHEN pay.status = 'paid' THEN pay.amount ELSE 0 END) as total_paid,
  MAX(pay.created_at) as last_payment
FROM players p
LEFT JOIN payments pay ON p.id = pay.player_id
WHERE p.id = 'player-uuid-here'
GROUP BY p.id, p.name, p.status;
```

---

## 🛠️ Troubleshooting

### Issue: Migration fails with "column already exists"

**Solution**: The migration uses `ADD COLUMN IF NOT EXISTS`, so it should be safe to run multiple times. If you're still getting errors, the columns might already exist with different constraints.

### Issue: RLS policies not working

**Solution**: Make sure you're using `supabaseAdmin` client for admin operations. Regular authenticated clients may not have the necessary permissions.

### Issue: Can't see payments data

**Solution**: Check that you're authenticated as an admin user. Only admins can view and manage payment records.

---

## 📝 Notes

- The `updated_at` field on the payments table is automatically managed by a database trigger
- Payment status should be updated via Stripe webhooks, not manually
- Always verify payment status before granting access to services
- The `stripe_customer_id` allows you to look up the Stripe customer directly

---

## 🔗 Related Documentation

- [Stripe Payment Integration](https://stripe.com/docs/payments)
- [Supabase Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Database Schema Updates](./DATABASE_SCHEMA_UPDATES.md)
- [Complete Database Schema](./COMPLETE_DATABASE_SCHEMA.sql)

---

## 📞 Support

If you encounter any issues with this migration or have questions about implementing payments, please refer to the main project documentation or contact the development team.
