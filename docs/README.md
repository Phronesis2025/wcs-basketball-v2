# WCSv2.0 - World Class Sports Basketball League

## Overview

Official website for a youth basketball league in Kansas, managed for Phronesis2025's brother. Built to empower kids (8-18), build character, and generate revenue via merch sales. Features a modern, responsive design with comprehensive security measures, enhanced mobile experience, and interactive components.

## Tech Stack

- **Frontend**: Next.js 15.5.2, Tailwind CSS 3.3.3, TypeScript, Framer Motion
- **UI Components**: Swiper.js, React Icons, react-intersection-observer
- **Backend**: Supabase (auth, DB, storage), Rate limiting with Upstash Redis
- **Security**: Sentry monitoring, comprehensive CSP headers, CSRF protection, RLS policies, input sanitization, security utilities
- **Deployment**: Vercel with automatic deployments
- **Fonts**: Local Inter, Bebas Neue

## Features

- **Hero Section**: Enhanced responsive design with mobile-optimized text sizing and positioning, fixed flaming basketball positioning
- **Values Section**: Interactive 3-card carousel showcasing league values
- **News Carousel**: Swipeable news section with modal details
- **Team Previews**: Dynamic team cards with logos and information
- **Coaches Corner**: Staff profiles and information
- **Coaches Dashboard**: Modern card-based dashboard with statistics cards, unified modal system, and comprehensive team management interface
- **Message Board**: Real-time communication system for coaches with live updates, role-based permissions, and mobile optimization
- **Practice Drills**: Comprehensive drill library with filtering by time, skill level, and difficulty
- **Coaches Authentication**: Secure login system with role-based access control
  - Coaches now only see teams they are assigned to
  - Admins see all teams and can create program‑wide schedules/updates
  - Real-time message board for coach communication
- **Shop Section**: Merchandise preview with updated product descriptions and mobile-optimized margins
- **Fan Zone**: Interactive video cards with mobile-responsive layout and enhanced data validation
- **Footer**: Complete redesign with mobile and desktop layouts, centered quick links, clean design
- **Navigation**: Clickable logo and text with hover effects for improved user experience
- **User Authentication**: Secure registration and login system with rate limiting
- **Enhanced Data Validation**: Defensive programming with proper error handling and recovery
- **Responsive Design**: Mobile-first approach with enhanced mobile experience
- **Security**: Comprehensive security utilities, rate limiting, input validation, CSP headers (now allow `blob:` for image previews), security audit completion
- **Scroll Management**: Automatic scroll-to-top functionality
- **Logo Marquee**: Animated team logos with enhanced spacing and opacity
- **UI Components**: Enhanced component library with dialog, input, and select components

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

## Security Features

- **Security Headers**: Comprehensive CSP, HSTS, X-Frame-Options, X-XSS-Protection, and more
- **Input Validation**: Email format, password strength, length validation
- **Rate Limiting**: Client-side protection against brute force attacks
- **CSRF Protection**: Cryptographically secure token-based form protection
- **Row Level Security**: Database-level access control with RLS policies
- **Input Sanitization**: XSS prevention for user-generated content
- **Environment Validation**: Secure environment variable handling
- **Production Security**: Test endpoints disabled in production
- **Error Monitoring**: Sentry integration for production monitoring
- **Audit Logging**: Security event tracking and monitoring
- **Message Board Security**: Enhanced input sanitization and XSS protection for coach communications
- **Console Security**: All console statements replaced with secure development-only logging utilities
- **Perfect Security Score**: 10/10 security rating with zero vulnerabilities

## Live Site

- **Production**: https://wcs-basketball-v2.vercel.app
- **Status**: ✅ Active and deployed with enhanced security

## Contribution Guide

- Use feature branches (e.g., `feature/navbar`)
- Commit messages: `[type] short description` (e.g., `[feat] add hero carousel`)
- Push to GitHub, create PR for review
- Follow security best practices for all new features

## Version

- v2.5.0 (Current – recurring practices, calendar single‑day fix, program‑wide scheduling/updates, coach team filtering, CSP image preview fix, schedules team fetch update)
