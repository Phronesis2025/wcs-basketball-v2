# WCSv2.0 - World Class Sports Basketball League

## Overview

Official website for a youth basketball league in Kansas, managed for Phronesis2025's brother. Built to empower kids (8-18), build character, and generate revenue via merch sales.

## Tech Stack

- **Frontend**: Next.js 15.5.2 (Webpack), Tailwind CSS 3.3.3, TypeScript.
- **Backend**: Supabase (auth, DB, storage).
- **Payments**: Stripe, Printful (via fetch/axios).
- **Deployment**: Vercel.
- **Fonts**: Local Inter, Bebas Neue.

## Setup Instructions

1. Clone repo: `git clone https://github.com/Phronesis2025/wcs-basketball-v2.git`.
2. Install deps: `npm install`.
3. Add Supabase env vars to `.env.local`:
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
4. Run locally: `npm run dev`.
5. Build: `npm run build`.

## Contribution Guide

- Use feature branches (e.g., `feature/navbar`).
- Commit messages: `[type] short description` (e.g., `[fix] adjust font size`).
- Push to GitHub, create PR for review.

## Version

- v2.0.0 (Initial setup).
