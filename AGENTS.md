# AGENTS.md

## Cursor Cloud specific instructions

### Overview

WCS Basketball v2.0 is a single Next.js 16 application (App Router) with TypeScript, Tailwind CSS, and Supabase as the backend. It uses npm as the package manager (`package-lock.json`). There is no monorepo, Docker, or Makefile setup.

### Running the dev server

```bash
npm run dev
```

Starts on `http://localhost:3000`. Requires `.env.local` with at minimum:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_BASE_URL=http://localhost:3000`

The Supabase client in `src/lib/supabaseClient.ts` gracefully falls back to placeholder values when env vars are missing, so the dev server starts even without real credentials. Pages that fetch data from Supabase will show errors, but the UI still renders.

### Known issues

- **ESLint**: `npm run lint` crashes with a circular reference error (`TypeError: Converting circular structure to JSON`). This is a pre-existing compatibility issue between `eslint-config-next@16`, `@eslint/eslintrc@3`, and `eslint@9`. The ESLint config itself (`eslint.config.mjs`) is correct but the dependency versions conflict.
- **Production build**: `npm run build` fails without `STRIPE_SECRET_KEY` because Stripe API routes (`/api/create-checkout-session`, `/api/get-price`, `/api/payment/verify-session`) throw at module evaluation time. The dev server is unaffected since those routes are only compiled when accessed.

### Testing

- **E2E tests**: `npm run test:e2e` (Playwright). Requires `npx playwright install` for browser binaries. Tests need a running dev server and valid Supabase credentials.
- See `README.md` for standard scripts (`npm run dev`, `npm run build`, `npm run lint`, `npm run test:e2e`).

### External services

All external services (Supabase, Stripe, Resend, Twilio, Sentry, Upstash) are SaaS dependencies — no local Docker services needed. Only Supabase credentials are required for the app to be fully functional; the rest are optional.
