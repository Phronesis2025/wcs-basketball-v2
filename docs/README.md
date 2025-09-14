# WCSv2.0 - World Class Sports Basketball League

## Overview

Official website for a youth basketball league in Kansas, managed for Phronesis2025's brother. Built to empower kids (8-18), build character, and generate revenue via merch sales. Features a modern, responsive design with comprehensive security measures and interactive components.

## Tech Stack

- **Frontend**: Next.js 15.5.2, Tailwind CSS 3.3.3, TypeScript, Framer Motion
- **UI Components**: Swiper.js, React Icons, react-intersection-observer
- **Backend**: Supabase (auth, DB, storage), Rate limiting with Upstash Redis
- **Security**: Sentry monitoring, comprehensive CSP headers, input sanitization
- **Deployment**: Vercel with automatic deployments
- **Fonts**: Local Inter, Bebas Neue

## Features

- **Hero Section**: Rotating image carousel with call-to-action
- **Values Section**: Interactive 3-card carousel showcasing league values
- **News Carousel**: Swipeable news section with modal details
- **Team Previews**: Dynamic team cards with logos and information
- **Coaches Corner**: Staff profiles and information
- **Shop Section**: Merchandise preview with pricing
- **User Authentication**: Secure registration and login system
- **Responsive Design**: Mobile-first approach with smooth animations
- **Security**: Rate limiting, input validation, CSP headers, error monitoring

## Setup Instructions

1. Clone repo: `git clone https://github.com/Phronesis2025/wcs-basketball-v2.git`
2. Install deps: `npm install`
3. Add environment variables to `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   UPSTASH_REDIS_REST_URL=your-redis-url
   UPSTASH_REDIS_REST_TOKEN=your-redis-token
   SENTRY_DSN=your-sentry-dsn
   ```
4. Run locally: `npm run dev`
5. Build: `npm run build`

## Live Site

- **Production**: https://wcs-basketball-v2.vercel.app
- **Status**: ✅ Active and deployed

## Contribution Guide

- Use feature branches (e.g., `feature/navbar`)
- Commit messages: `[type] short description` (e.g., `[feat] add hero carousel`)
- Push to GitHub, create PR for review

## Version

- v2.1.0 (Current - Full UI implementation with security measures)
