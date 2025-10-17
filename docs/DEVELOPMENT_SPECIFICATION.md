# WCS Basketball Web Application - Development Specification

## Project Overview

**Project Name:** World Class Sports Basketball (WCS Basketball)  
**Technology Stack:** Next.js 15.5.2, TypeScript, Supabase, Tailwind CSS, Framer Motion  
**Target Users:** Youth basketball players, coaches, parents, and administrators  
**Primary Purpose:** Comprehensive basketball program management and community engagement platform  
**Version:** v2.7.6  
**Status:** Production Ready ✅  
**Security Score:** 10/10 (Perfect) 🔒  
**Live URL:** https://wcs-basketball-v2.vercel.app

---

## Core Application Architecture

### Frontend Framework

- **Next.js 15.5.2** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **React Query** for data fetching and caching
- **Sentry** for error monitoring
- **Vercel Analytics** for performance tracking

### Backend & Database

- **Supabase** as Backend-as-a-Service
- **PostgreSQL** database with Row Level Security (RLS)
- **Supabase Auth** for authentication
- **Supabase Storage** for file uploads
- **Real-time subscriptions** for live updates

### Security Features

- CSRF token validation
- Input sanitization and validation
- Profanity filtering
- Rate limiting on login attempts
- Row Level Security (RLS) policies
- Admin/coach role-based access control

---

## Page Structure & Functionality

### 1. **Home Page** (`/`)

**Purpose:** Main landing page showcasing the basketball program

**Key Features:**

- Hero section with video background and animated basketball flames
- Logo marquee showcasing team logos
- Fan zone with team information
- Team updates carousel (latest 3 updates)
- Shop section placeholder
- Responsive design with mobile-first approach

**Technical Implementation:**

- Server-side data fetching for teams
- Error handling for database connection issues
- Optimized video loading with fallback images
- Lazy loading for performance

### 2. **Teams Page** (`/teams`)

**Purpose:** Display all basketball teams with filtering and search

**Key Features:**

- Grid layout of all teams
- Team cards showing logo, name, age group, gender, grade level
- Click-to-view individual team details
- Error handling and loading states
- Real-time updates via Supabase subscriptions

**Technical Implementation:**

- Client-side component with React Query
- Image optimization with Next.js Image component
- Error boundaries for graceful failure handling
- Sentry integration for error tracking

### 3. **Individual Team Page** (`/teams/[id]`)

**Purpose:** Detailed team information and schedules

**Key Features:**

- Team identity section (logo, name, age group, gender, grade)
- Coach information with photos and bios
- Team photo display
- Recent team updates (last 5)
- Upcoming games (next 3)
- Practice schedule (next 3)
- Real-time updates for schedules and announcements

**Technical Implementation:**

- Dynamic routing with Next.js
- Server-side data fetching
- Real-time subscriptions for live updates
- Image error handling with fallbacks
- Scroll position management
- Framer Motion animations

### 4. **Schedules Page** (`/schedules`)

**Purpose:** Comprehensive calendar view of all team events

**Key Features:**

- Custom mobile-optimized calendar component
- Filter by team and event type
- Today's events highlight
- Event details modal
- Real-time updates for schedule changes
- Responsive design for mobile and desktop

**Technical Implementation:**

- Custom calendar component (MobileMonth)
- Event filtering and sorting
- Real-time subscriptions
- Modal system for event details
- Timezone handling (America/Chicago)

### 5. **Practice Drills Page** (`/drills`)

**Purpose:** Library of basketball practice drills and exercises

**Key Features:**

- Drill library with filtering by time and skill
- Drill categories (Drill, Warm-up, Conditioning, Skill Development, Team Building)
- Difficulty levels (Basic, Intermediate, Advanced, Expert)
- Detailed drill view with instructions, equipment, and benefits
- Image support for drill demonstrations
- Search and filter functionality

**Technical Implementation:**

- Client-side filtering and search
- Modal system for drill details
- Image optimization
- Framer Motion animations
- Real-time updates for new drills

### 6. **Coaches Dashboard** (`/coaches/dashboard`)

**Purpose:** Administrative interface for coaches to manage their teams

**Key Features:**

- Team selection dropdown
- Statistics dashboard (next game, new updates, messages, drills)
- Schedule management (games, practices, tournaments, meetings)
- Recurring practice creation with flexible scheduling
- Team updates and announcements
- Practice drill library management
- Message board for coach communication
- Bulk operations (delete all practices)
- Admin analytics access

**Technical Implementation:**

- Role-based access control (admin vs coach)
- Real-time subscriptions for live updates
- Modal system for CRUD operations
- Image upload handling
- CSRF protection
- Input validation and sanitization
- Profanity filtering
- Permission-based UI rendering

### 7. **Coaches Login** (`/coaches/login`)

**Purpose:** Secure authentication for coaches and administrators

**Key Features:**

- Email/password authentication
- CSRF token protection
- Rate limiting (5 attempts per 5 minutes)
- Input sanitization
- Auto-redirect to dashboard on success
- Error handling and user feedback

**Technical Implementation:**

- Supabase Auth integration
- Client-side rate limiting with localStorage
- CSRF token generation and validation
- Input sanitization
- Security best practices

### 8. **Admin Analytics** (`/admin/analytics`)

**Purpose:** Administrative dashboard for program analytics (placeholder)

**Key Features:**

- Admin-only access control
- Analytics cards (placeholder for future implementation)
- Charts and data visualization (planned)
- Export functionality (planned)
- Recent activity feed (planned)

**Technical Implementation:**

- Role-based access control
- Placeholder UI for future analytics
- Admin permission verification

### 9. **Additional Pages**

- **About** (`/about`): Program information and core values
- **Shop** (`/shop`): E-commerce placeholder
- **News** (`/news`): News section placeholder
- **Privacy** (`/privacy`): Privacy policy
- **Terms** (`/terms`): Terms of service
- **Refund Policy** (`/refund-policy`): Refund policy
- **Club Registration** (`/club-registration`): Registration form placeholder

---

## Database Schema

### Core Tables

#### **teams**

- `id` (UUID, Primary Key)
- `name` (Text)
- `age_group` (Text)
- `gender` (Text)
- `grade_level` (Text)
- `logo_url` (Text, Nullable)
- `season` (Text)
- `team_image` (Text, Nullable)

#### **coaches**

- `id` (UUID, Primary Key)
- `first_name` (Text)
- `last_name` (Text)
- `email` (Text)
- `bio` (Text)
- `image_url` (Text, Nullable)
- `quote` (Text)
- `user_id` (UUID, Foreign Key to auth.users)

#### **team_coaches** (Junction Table)

- `team_id` (UUID, Foreign Key)
- `coach_id` (UUID, Foreign Key)

#### **schedules**

- `id` (UUID, Primary Key)
- `team_id` (UUID, Foreign Key, Nullable)
- `event_type` (Text: Game, Practice, Tournament, Meeting, Update)
- `date_time` (Timestamp)
- `title` (Text, Nullable)
- `location` (Text)
- `opponent` (Text, Nullable)
- `description` (Text, Nullable)
- `is_global` (Boolean)
- `recurring_group_id` (Text, Nullable)
- `created_by` (UUID, Foreign Key)
- `created_at` (Timestamp)
- `deleted_at` (Timestamp, Nullable)

#### **team_updates**

- `id` (UUID, Primary Key)
- `team_id` (UUID, Foreign Key, Nullable)
- `title` (Text)
- `content` (Text)
- `date_time` (Timestamp, Nullable)
- `image_url` (Text, Nullable)
- `is_global` (Boolean)
- `created_by` (UUID, Foreign Key)
- `created_at` (Timestamp)
- `deleted_at` (Timestamp, Nullable)

#### **practice_drills**

- `id` (UUID, Primary Key)
- `team_id` (UUID, Foreign Key)
- `title` (Text)
- `skills` (Text Array)
- `equipment` (Text Array)
- `time` (Text)
- `instructions` (Text)
- `additional_info` (Text, Nullable)
- `benefits` (Text)
- `difficulty` (Text)
- `category` (Text)
- `week_number` (Integer)
- `image_url` (Text, Nullable)
- `created_by` (UUID, Foreign Key)
- `created_at` (Timestamp)

#### **coach_messages**

- `id` (UUID, Primary Key)
- `author_id` (UUID, Foreign Key)
- `author_name` (Text)
- `content` (Text)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)
- `deleted_at` (Timestamp, Nullable)
- `is_pinned` (Boolean)

#### **coach_message_replies**

- `id` (UUID, Primary Key)
- `message_id` (UUID, Foreign Key)
- `author_id` (UUID, Foreign Key)
- `author_name` (Text)
- `content` (Text)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)
- `deleted_at` (Timestamp, Nullable)

#### **users** (Custom User Management)

- `id` (UUID, Primary Key)
- `role` (Text: admin, coach)
- `password_reset` (Boolean)
- `last_password_reset` (Timestamp, Nullable)

---

## Key Features & Functionality

### 1. **Real-time Updates**

- Live schedule updates
- Real-time team announcements
- Instant message board updates
- Automatic data refresh without page reload

### 2. **Role-based Access Control**

- **Admin**: Full access to all teams and features
- **Coach**: Access only to assigned teams
- Permission-based UI rendering
- Secure API endpoints

### 3. **Schedule Management**

- Single event creation
- Recurring practice scheduling with flexible patterns
- Bulk operations (delete all practices)
- Event types: Games, Practices, Tournaments, Meetings, Updates
- Global vs team-specific events

### 4. **Content Management**

- Team updates with image support
- Practice drill library with categorization
- Message board for coach communication
- Image upload and optimization
- Content moderation and profanity filtering

### 5. **Mobile-first Design**

- Responsive layout for all screen sizes
- Touch-friendly interface
- Optimized mobile calendar
- Progressive Web App features

### 6. **Performance Optimization**

- Image optimization with Next.js
- Lazy loading for non-critical content
- Code splitting and dynamic imports
- CDN integration for static assets
- Real-time data caching

### 7. **Security Features**

- CSRF token protection
- Input sanitization and validation
- Rate limiting on sensitive operations
- Row Level Security (RLS) policies
- Secure file upload handling
- Profanity filtering system

---

## Technical Implementation Details

### **State Management**

- React Query for server state
- Local state with React hooks
- Real-time subscriptions with Supabase

### **Styling & UI**

- Tailwind CSS for utility-first styling
- Custom component library
- Responsive design patterns
- Dark theme with navy/red color scheme
- Framer Motion for animations

### **Data Fetching**

- Server-side rendering for initial page loads
- Client-side data fetching with React Query
- Real-time subscriptions for live updates
- Optimistic updates for better UX

### **Error Handling**

- Sentry integration for error tracking
- Graceful error boundaries
- User-friendly error messages
- Fallback UI components

### **Performance**

- Next.js Image optimization
- Lazy loading for images and components
- Code splitting for better bundle sizes
- CDN integration for static assets
- Real-time data caching

---

## Development Complexity Assessment

### **High Complexity Features**

1. **Real-time System**: Live updates across multiple components
2. **Role-based Access Control**: Complex permission system
3. **Recurring Schedule Management**: Flexible scheduling patterns
4. **Mobile Calendar**: Custom calendar component with touch support
5. **File Upload System**: Image handling with optimization
6. **Security Implementation**: CSRF, RLS, input validation

### **Medium Complexity Features**

1. **Dashboard Management**: CRUD operations with modals
2. **Data Filtering**: Search and filter across multiple data types
3. **Responsive Design**: Mobile-first approach with complex layouts
4. **Animation System**: Framer Motion integration
5. **Error Handling**: Comprehensive error management

### **Low Complexity Features**

1. **Static Pages**: About, Privacy, Terms pages
2. **Basic CRUD**: Simple data operations
3. **Form Handling**: Standard form validation
4. **Navigation**: Basic routing and navigation

---

## Estimated Development Time

### **Frontend Development**

- **Setup & Configuration**: 1-2 weeks
- **Core Pages & Components**: 4-6 weeks
- **Dashboard & Admin Features**: 3-4 weeks
- **Real-time Features**: 2-3 weeks
- **Mobile Optimization**: 2-3 weeks
- **Testing & Bug Fixes**: 2-3 weeks

### **Backend Development**

- **Database Design & Setup**: 1-2 weeks
- **API Development**: 2-3 weeks
- **Authentication & Security**: 2-3 weeks
- **Real-time Subscriptions**: 1-2 weeks
- **File Upload System**: 1-2 weeks

### **Total Estimated Time**

- **Minimum**: 16-20 weeks (4-5 months)
- **Realistic**: 20-24 weeks (5-6 months)
- **With Buffer**: 24-28 weeks (6-7 months)

---

## Technology Dependencies

### **Core Dependencies**

- Next.js 14
- React 18
- TypeScript
- Supabase
- Tailwind CSS
- Framer Motion

### **Additional Dependencies**

- React Query
- Sentry
- Vercel Analytics
- React Hot Toast
- React Hook Form (implied)

### **Development Tools**

- ESLint
- Prettier
- TypeScript
- Playwright (testing)
- Vercel (deployment)

---

## Scalability Considerations

### **Database**

- Supabase handles automatic scaling
- RLS policies for data security
- Indexed queries for performance

### **Frontend**

- Next.js App Router for optimal performance
- Code splitting for better loading times
- CDN integration for static assets

### **Real-time Features**

- Supabase real-time subscriptions
- Efficient data filtering
- Connection management

---

## Security Considerations

### **Authentication**

- Supabase Auth with secure token handling
- Role-based access control
- Session management

### **Data Protection**

- Row Level Security (RLS) policies
- Input sanitization and validation
- CSRF token protection
- Rate limiting on sensitive operations

### **File Uploads**

- Secure file handling
- Image optimization
- Storage bucket security

---

## Maintenance & Support

### **Monitoring**

- Sentry for error tracking
- Vercel Analytics for performance
- Real-time error notifications

### **Updates**

- Regular dependency updates
- Security patch management
- Feature enhancements

### **Backup & Recovery**

- Supabase automatic backups
- Database migration scripts
- Disaster recovery procedures

---

This specification provides a comprehensive overview of the WCS Basketball web application, detailing all features, technical implementation, and development requirements for a professional development team to accurately estimate and build the project.
