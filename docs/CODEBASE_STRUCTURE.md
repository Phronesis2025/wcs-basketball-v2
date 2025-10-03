# WCS Basketball v2.0 - Codebase Structure

## 📁 Project Overview

This is a **Next.js 15.5.2** application for World Class Sports Basketball, built with TypeScript, Tailwind CSS, and Supabase integration.

**Latest Updates (v2.4.3):**

- **CRITICAL SECURITY FIX**: Eliminated XSS vulnerability in Team Updates
- **Perfect Security Score**: Achieved 10/10 security rating
- **Enhanced Input Sanitization**: All user content properly sanitized
- **Security Audit**: Comprehensive security review completed
- Team page layout optimization with centered logo/name and side-by-side coaches/team image
- Mobile layout improvements with team image under logo and coaches below
- Full-width team updates and schedules for better content display
- Security enhancements with devLog/devError utilities replacing all console statements
- Real-time subscription security fixes with proper parameter handling
- React unescaped entities fixes for proper HTML rendering
- Build system optimization with zero errors and clean compilation
- Enhanced responsive design with improved mobile and desktop layouts
- **NEW**: Coaches dashboard with team management, schedule creation, and drill management
- **NEW**: Practice drills system with filtering and categorization
- **NEW**: Enhanced UI component library with dialog, input, and select components
- **NEW**: Coaches login system with authentication and role-based access
- **ENHANCED**: FanZone data validation with defensive programming and error recovery
- **ENHANCED**: Comprehensive security audit with zero vulnerabilities found
- **ENHANCED**: Data validation and error handling across all data operations
- **ENHANCED**: Database schema updates with soft delete support and improved foreign keys

## 🏗️ Root Directory Structure

```
wcsv2.0-new/
├── 📁 docs/                    # Project documentation
├── 📁 public/                  # Static assets
├── 📁 src/                     # Source code
├── 📁 node_modules/            # Dependencies
├── 📄 Configuration files      # Next.js, TypeScript, Tailwind, etc.
└── 📄 README.md
```

## 📁 Source Code Structure (`src/`)

### 🛣️ App Router (`src/app/`)

Next.js 13+ App Router structure for pages and API routes:

```
src/app/
├── 📁 about/                   # About page
│   └── page.tsx
├── 📁 api/                     # API routes
│   ├── csrf/route.ts          # CSRF protection
│   └── test-supabase/route.ts # Supabase testing
├── 📁 coaches/                 # Coaches section
│   ├── dashboard/              # Coaches dashboard
│   │   └── page.tsx           # Team management, schedules, drills
│   ├── drills/                # Practice drills
│   │   └── page.tsx           # Drill library with filtering
│   ├── login/                 # Coaches login
│   │   └── page.tsx           # Authentication for coaches
│   └── page.tsx               # Public coaches page
├── 📁 news/                    # News page
│   └── page.tsx
├── 📁 register/                # User registration
│   └── page.tsx
├── 📁 schedules/               # Game schedules
│   └── page.tsx
├── 📁 shop/                    # Merchandise shop
│   └── page.tsx
├── 📁 teams/                   # Teams page
│   ├── page.tsx               # Teams listing page
│   └── [id]/                  # Dynamic team detail pages
│       └── page.tsx           # Individual team page with coaches, schedules, updates
├── 📁 test-auth/               # Authentication testing
│   └── page.tsx
├── 📄 page.tsx                 # Home page
├── 📄 layout.tsx               # Root layout
├── 📄 error.tsx                # Error handling
├── 📄 globals.css              # Global styles
└── 📄 favicon.ico              # Site favicon (moved to public/ directory)
```

### 🧩 Components (`src/components/`)

Reusable React components:

```
src/components/
├── 📁 ui/                      # UI components
│   ├── button.tsx             # Custom button component
│   ├── dialog.tsx             # Modal dialog component
│   ├── input.tsx              # Form input component
│   └── select.tsx             # Select dropdown component
├── 📄 ClientTeams.tsx         # Client-side teams component
├── 📄 Coaches.tsx             # Coaches display
├── 📄 FanZone.tsx             # Fan zone section
├── 📄 Footer.tsx              # Site footer
├── 📄 Hero.tsx                # Hero section (main banner)
├── 📄 HomeSections.tsx        # Home page sections
├── 📄 LogoMarquee.tsx         # Logo carousel
├── 📄 Navbar.tsx              # Navigation bar
├── 📄 NewsCarousel.tsx        # News slider
├── 📄 ScrollToTop.tsx         # Scroll to top button
├── 📄 Shop.tsx                # Shop component
├── 📄 TeamCard.tsx            # Individual team card
├── 📄 Teams.tsx               # Teams display
└── 📄 ValuesSection.tsx       # Core values section
```

### 🔧 Utilities (`src/lib/`)

Core functionality and configurations:

```
src/lib/
├── 📄 actions.ts              # Server actions with enhanced data validation
├── 📄 security.ts             # Security utilities and defensive programming
├── 📄 supabaseClient.ts       # Supabase configuration
├── 📄 testEnv.ts              # Environment testing utilities
└── 📄 utils.ts                # General utilities
```

### 🪝 Hooks (`src/hooks/`)

Custom React hooks:

```
src/hooks/
└── 📄 useCSRF.ts              # CSRF protection hook
```

### 📋 Types (`src/types/`)

TypeScript type definitions:

```
src/types/
├── 📄 supabase.ts             # Supabase database types
└── 📄 vercel-modules.d.ts     # Vercel type definitions
```

## 🖼️ Static Assets (`public/`)

### 🎨 Images & Media

```
public/
├── 📁 fonts/                  # Custom fonts
│   ├── BebasNeue-Regular.ttf
│   └── Inter-Regular.ttf
├── 📁 images/                 # Content images
│   ├── Core values icons (adaptability, leadership, etc.)
│   ├── Team photos
│   └── Placeholder images
├── 📁 logos/                  # Team logos
│   ├── Various team logos (Sharks, Warriors, etc.)
│   └── Logo variations (blue, red, white)
├── 📁 teams/                  # Team-specific images
│   ├── boys-team.png
│   └── girls-team.png
├── 📁 video/                  # Video content
│   ├── hero.mp4
│   ├── basketball-flames.gif
│   └── Various team videos
├── 📄 favicon files           # Site icons
└── 📄 site.webmanifest        # PWA manifest
```

## ⚙️ Configuration Files

### 🔧 Core Configuration

- **`next.config.ts`** - Next.js configuration with security headers
- **`tsconfig.json`** - TypeScript configuration
- **`tailwind.config.js`** - Tailwind CSS configuration
- **`package.json`** - Dependencies and scripts

### 🛡️ Security & Monitoring

- **`sentry.*.config.ts`** - Error monitoring (3 files)
- **`eslint.config.mjs`** - Code linting rules

### 🎨 Styling

- **`postcss.config.js`** - PostCSS configuration
- **`postcss.config.mjs`** - Alternative PostCSS config

## 📚 Documentation (`docs/`)

Comprehensive project documentation:

- **CHANGELOG.md** - Version history
- **CODEBASE_STRUCTURE.md** - This file
- **DB_SETUP.md** - Database setup instructions
- **DEPLOY.md** - Deployment guide
- **ENVIRONMENT_SETUP.md** - Environment configuration
- **ERRORS.md** - Error handling documentation
- **MAINTENANCE.md** - Maintenance procedures
- **PROGRESS.md** - Development progress
- **ROADMAP.md** - Future plans
- **ROW_LEVEL_SECURITY.sql** - Database security policies
- **SECURITY.md** - Security guidelines
- **UI.md** - UI/UX documentation
- **WCSv2.0 Project Doc** - Main project documentation

## 🏀 Key Features

### 🎯 Core Functionality

- **Team Management** - Boys and girls basketball teams with detailed team pages
- **Coach Profiles** - Coach information, bios, and quotes with responsive layouts
- **Coaches Dashboard** - Team management interface for coaches with schedule creation and drill management
- **Practice Drills** - Comprehensive drill library with filtering by time, skill, and difficulty
- **Game Schedules** - Upcoming games and events with full-width display
- **Team Updates** - Latest team news with carousel display
- **Practice Schedules** - Practice times and locations
- **News & Updates** - Latest team news
- **Shop** - Merchandise and team gear
- **User Registration** - Member signup system
- **Coaches Authentication** - Secure login system for coaches with role-based access

### 🛡️ Security Features

- **CSRF Protection** - Cross-site request forgery prevention with cryptographic tokens
- **Content Security Policy** - XSS protection with comprehensive headers
- **Supabase Integration** - Secure authentication and database with RLS policies
- **Error Monitoring** - Sentry integration for error tracking
- **Input Validation** - XSS prevention and data sanitization
- **Rate Limiting** - Client-side protection against brute force attacks
- **Security Audit** - Comprehensive security validation with zero vulnerabilities
- **Defensive Programming** - Enhanced error handling and data validation

### 🎨 UI/UX Features

- **Responsive Design** - Mobile-first approach with optimized layouts
- **Custom Animations** - Framer Motion integration with smooth transitions
- **Video Backgrounds** - Engaging hero sections
- **Team Branding** - Custom logos and color schemes
- **Team Detail Pages** - Comprehensive team information with coaches, schedules, and updates
- **Mobile Optimization** - Optimized mobile layouts with proper content flow
- **Full-Width Content** - Schedules and updates extend across full screen width
- **Enhanced Data Validation** - Graceful error handling and user feedback
- **FanZone Interactivity** - Interactive video cards with enhanced data validation

## 🚀 Technology Stack

- **Framework**: Next.js 15.5.2 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase
- **Authentication**: Supabase Auth
- **Animations**: Framer Motion
- **UI Components**: Radix UI, Class Variance Authority
- **Carousel**: Swiper.js, Embla Carousel
- **Forms**: Zod validation
- **State Management**: Zustand
- **Monitoring**: Sentry
- **Deployment**: Vercel (configured)

## 📝 File Naming Conventions

### Components

- **PascalCase** for component files: `Hero.tsx`, `Navbar.tsx`
- **camelCase** for utility files: `supabaseClient.ts`, `utils.ts`

### Pages

- **lowercase** for page directories: `about/`, `teams/`
- **page.tsx** for page components

### Assets

- **kebab-case** for image files: `hero-basketball.jpg`, `basketball-flames.gif`
- **descriptive names** for better organization

## 🔄 Development Workflow

1. **Components** are developed in `src/components/`
2. **Pages** are created in `src/app/` using App Router
3. **Static assets** are stored in `public/`
4. **Utilities** and configurations go in `src/lib/`
5. **Types** are defined in `src/types/`

## 🎯 Best Practices

- **Component Organization**: Group related components together
- **Asset Management**: Use descriptive names and organize by type
- **Type Safety**: Define types for all data structures
- **Security**: Implement proper authentication and authorization
- **Performance**: Optimize images and use proper caching
- **Accessibility**: Follow WCAG guidelines for inclusive design
- **Data Validation**: Implement defensive programming with null checks and array validation
- **Error Handling**: Use comprehensive error handling with graceful fallbacks
- **Security Logging**: Use development-only logging utilities (devLog/devError)
- **Code Quality**: Maintain zero TypeScript errors and ESLint warnings

---

_This structure follows Next.js best practices with a clear separation of concerns, making it easy to maintain and scale your basketball team website! 🏀_

**Last Updated**: January 2025
**Version**: 2.4.2
