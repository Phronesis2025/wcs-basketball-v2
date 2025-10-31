# Registration Process Flows (Current)

This document describes the live registration flows implemented in the site for both new parents and existing parents adding another child.

## New Parent + New Player

Steps

- Parent opens `/register` and completes quick register (parent + player).
- Backend creates/updates parent, creates player with status `pending`.
- Supabase sends confirmation email to the new parent (auth flow).
- After confirmation, parent can visit profile; admin later approves the player.
- Admin approval sends professional approval email with Stripe link.
- Parent completes payment; billing visible on Parent Profile.

Mermaid

```mermaid
flowchart TD
  A[Parent clicks Register (/register)] --> B[Quick register: parent + player]
  B --> C[/POST /api/register-player]
  C -->|Create/Update parent| P1[(parents)]
  C -->|Create player (pending)| P2[(players)]
  P2 --> D{Brand new parent?}

  D -- Yes --> E[Supabase confirmation email]
  E --> F[Auth verified]
  F --> G[Registration success/profile]

  %% Converged path
  G --> H[Admin approves in Club Management]
  H --> I[/POST /api/approve-player]
  I -->|Update player: team_id, status=approved| P2
  I --> J[Approval email with payment link]
  J --> K[Parent opens /payment/:playerId]
  K --> L[/POST /api/create-checkout-session]
  L -->|Stripe Checkout| M{Payment}
  M -- Success --> N[/payment/success]
  N --> O[Parent Profile: Billing tab shows payments]
```

## Existing Parent + New Player (Add Another Child)

Steps

- Parent logs in and uses `/add-child` to register a new player.
- Backend uses existing parent and creates player with `pending` status.
- Sends our registration confirmation email (template) to the parent.
- Redirects back to Parent Profile.
- Admin approves → approval email with Stripe link.
- Parent completes payment; billing visible on Parent Profile.

Mermaid

```mermaid
flowchart TD
  A[Parent logged in] --> B[Add Another Child (/add-child)]
  B --> C[Player form]
  C --> D[/POST /api/register-player]
  D -->|Use existing parent| P1[(parents)]
  D -->|Create player (pending)| P2[(players)]
  D --> E[Send registration confirmation email]
  E --> F[Redirect to Parent Profile]

  %% Converged path
  F --> G[Admin approves in Club Management]
  G --> H[/POST /api/approve-player]
  H -->|Update player: team_id, status=approved| P2
  H --> I[Approval email with payment link]
  I --> J[Parent opens /payment/:playerId]
  J --> K[/POST /api/create-checkout-session]
  K -->|Stripe Checkout| L{Payment}
  L -- Success --> M[/payment/success]
  M --> N[Parent Profile: Billing tab shows payments]
```

## Key Files

- Pages: `src/app/register/page.tsx`, `src/app/add-child/page.tsx`, `src/app/checkout/[playerId]/page.tsx`, `src/app/payment/[playerId]/page.tsx`, `src/app/payment/success/page.tsx`, `src/app/parent/profile/page.tsx`
- APIs: `src/app/api/register-player/route.ts`, `src/app/api/approve-player/route.ts`, `src/app/api/create-checkout-session/route.ts`, `src/app/api/stripe-webhook/route.ts`, `src/app/api/parent/profile/route.ts`
- Emails: `src/lib/emailTemplates.ts`, `src/lib/email.ts`
