# WCSv2.0 Changelog

## v2.3.2 - January 2025 (Current)

### 🔧 Bug Fixes & Improvements

- **Favicon Conflict Resolution**: Fixed favicon.ico 500 error by removing duplicate file
  - Removed conflicting favicon.ico from `src/app/` directory
  - Kept favicon.ico in `public/` directory for proper Next.js App Router handling
  - Resolved "conflicting public file and page file" error
- **Footer Design Overhaul**: Complete mobile and desktop footer redesign
  - Mobile layout: Logo → Quick Links → Stay Updated → Follow Us
  - Desktop layout: 3-column horizontal layout with proper alignment
  - Centered quick links in two columns under title
  - Removed legal links for cleaner appearance
  - Added proper responsive design and visual hierarchy
- **Navigation Enhancement**: Made navbar logo and text clickable
  - Added Link wrapper around logo and "WCS BASKETBALL" text
  - Implemented hover effects with opacity transition
  - Improved user experience with clear navigation cues
- **Hero Component Fix**: Corrected flaming basketball positioning
  - Fixed desktop positioning to move basketball further left
  - Maintained mobile landscape positioning
  - Improved responsive design consistency
- **Build Optimization**: Resolved TypeScript compilation errors and ESLint warnings
- **Security Headers**: Updated CSP to allow Vercel Analytics scripts
- **Database Timeouts**: Added timeout protection to prevent hanging requests

## v2.3.1 - January 2025

### 🔧 Bug Fixes & Improvements

- **Favicon Loading**: Fixed favicon.ico and icon files not loading correctly
  - Moved favicon.ico to correct Next.js App Router location (`src/app/`)
  - Moved PNG icons to public directory for proper static serving
  - Added comprehensive favicon metadata with proper MIME types and sizes
  - Fixed console security by replacing production console.warn with devError

### 🎉 Major Features

- **Hero Section**: Enhanced responsive design with mobile-optimized text sizing and positioning
- **Values Section**: Interactive 3-card carousel with directional slide animations
- **News Carousel**: Swiper.js-powered news section with modal details
- **Team Previews**: Dynamic team cards with responsive design and gender-specific backgrounds
- **Coaches Corner**: Staff profiles with hover effects
- **Shop Section**: Merchandise preview with pricing and mobile-optimized margins
- **Fan Zone**: Interactive video cards with mobile-responsive layout
- **User Authentication**: Complete registration and login system with Supabase
- **Design Consistency**: Unified design language across all sections with consistent margins and typography

### 🔒 Advanced Security Enhancements

- **CSRF Protection System**: Cryptographically secure token generation and validation
- **Row Level Security (RLS)**: Database-level access control with comprehensive policies
- **Enhanced Security Headers**: Added X-XSS-Protection and X-Permitted-Cross-Domain-Policies
- **Audit Logging**: Security event tracking and monitoring system
- **Security Utilities**: Comprehensive security utility functions (src/lib/security.ts)
- **Rate Limiting**: Client-side rate limiting for registration (5 attempts per 5 minutes)
- **Input Validation**: Comprehensive email format, password strength, and length validation
- **Input Sanitization**: XSS prevention for user-generated content
- **Enhanced CSP**: Updated Content Security Policy for Next.js compatibility
- **Security Headers**: Complete set of security headers including HSTS, CSP, and more
- **Error Handling**: Generic error messages to prevent information disclosure
- **Environment Validation**: Enhanced environment variable validation with detailed error messages
- **Production Security**: Test endpoints disabled in production environment
- **Security Logging**: Development-only logging utilities for secure debugging

### 🎨 UI/UX Improvements

- **Mobile Hero**: Enhanced mobile layout with split text and optimized sizing
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Animations**: Smooth transitions with Framer Motion
- **Image Optimization**: Next.js Image component with proper sizing
- **Scroll-to-Top**: Enhanced automatic page positioning with multiple event listeners
- **Loading States**: Proper loading indicators and error handling
- **Teams Section**: Added subtitle for consistency with other sections
- **Card Navigation**: Limited Teams section to 2 cards with swipe navigation
- **Typography**: Unified font styles and sizing across all components
- **Mobile Layout**: Enhanced responsive design for all card sections
- **Background Images**: Gender-specific team card backgrounds (boys/girls)
- **Logo Marquee**: Optimized logo sizes (100px → 140px) with enhanced spacing and opacity
- **Image Optimization**: Fixed Next.js Image warnings and improved performance
- **LCP Optimization**: Added priority props to critical images for better Core Web Vitals
- **Hydration Fixes**: Resolved server/client hydration mismatches on About page
- **Smooth Scrolling**: Fixed Next.js scroll behavior warnings
- **Fan Zone**: Black background with improved mobile margins
- **Shop Section**: Navy background with mobile-optimized margins

### 🛠️ Technical Updates

- **Dependencies**: Added Swiper.js, react-intersection-observer, react-icons, Shadcn UI components
- **Image Assets**: Added placeholder images for news and team content, gender-specific team backgrounds
- **TypeScript**: Enhanced type safety throughout the application
- **Performance**: Optimized images and lazy loading
- **Component Library**: Added Shadcn UI Button component for consistent styling
- **PostCSS**: Added postcss-nesting for CSS nesting support
- **Security Audit**: Zero vulnerabilities found in all dependencies
- **Build System**: Fixed React hooks rules violations and TypeScript errors
- **Code Quality**: Removed unused imports and improved code organization
- **Documentation**: Added comprehensive environment setup guide

## v2.2.2 - January 2025 (Latest)

### 🔧 Bug Fixes & Improvements

- **About Page**: Removed 'Learn More' buttons from value cards for cleaner design
- **Console Security**: Replaced all production console.error with secure devError utility
- **Error Handling**: Enhanced error handling in FanZone and test-auth components
- **Code Cleanup**: Removed unused Button and Link imports from About page
- **UI Simplification**: Streamlined About page cards to focus on content without navigation

### 🎨 UI/UX Updates

- **About Page**: Cleaner card design with title and description only
- **Value Cards**: Simplified layout focusing on core message delivery
- **Security Logging**: All console statements now use development-only logging utilities

## v2.2.1 - January 2025

### 🔧 Bug Fixes & Improvements

- **Supabase Integration**: Fixed createClient import issue in actions.ts
- **Error Handling**: Improved error handling in fetchTeams() and fetchCoaches() functions
- **Image Loading**: Resolved shop-teaser image 404 errors and improved fallback handling
- **Shop Content**: Updated shop section text from "jerseys, balls" to "t-shirts, hats" for better product representation
- **Code Optimization**: Removed Sentry dependency from actions.ts for cleaner error handling
- **Build Cache**: Cleared Next.js build cache to resolve persistent image loading issues

### 🎨 UI/UX Updates

- **Shop Section**: Enhanced product description with more relevant merchandise items
- **Image Fallbacks**: Improved error handling for missing images with proper fallback chains
- **Error Logging**: Replaced Sentry error logging with console.warn for development debugging

### 🛠️ Build Optimization & Code Quality

- **Image Optimization**: Replaced all `<img>` tags with Next.js `<Image>` components for better performance
- **Code Cleanup**: Removed unused imports and variables, improved code quality
- **Build Performance**: Optimized build process with cleaner warnings and faster compilation
- **ESLint Compliance**: Fixed all actionable linting warnings and unused variable issues
- **Vercel Analytics**: Implemented web analytics for user behavior tracking
- **Vercel Speed Insights**: Added Core Web Vitals monitoring with 10% sample rate for optimal performance tracking
- **CSP Updates**: Fixed Content Security Policy to allow Vercel Analytics domains and inline scripts

## v2.0.0 - September 09, 2025

- Initial setup with Next.js, Tailwind, Supabase
- Added local fonts (Inter, Bebas Neue), security headers
- Seeded Supabase with team data, tested auth

## Future Releases

- v2.2.0: Parent Portal with player stats and attendance tracking
- v2.3.0: Stripe integration for shop payments
- v2.4.0: Live game updates and real-time notifications
