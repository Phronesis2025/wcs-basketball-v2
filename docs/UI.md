# WCSv2.0 UI Components

## 🎨 Design System

### Color Palette

- **Primary Navy**: `#1C2526` - Main background and text
- **Accent Red**: `#D91E18` - CTAs, highlights, and interactive elements
- **White**: `#FFFFFF` - Cards, contrast text
- **Light Navy**: `#002C51` - Secondary backgrounds
- **Light Blue**: `#004080` - Hover states and accents
- **Gray Scale**: Various shades for text hierarchy and borders

### Typography

- **Headings**: Bebas Neue (local TTF) - Bold, uppercase styling
- **Body Text**: Inter (local TTF) - Clean, readable font
- **Font Weights**: 400 (regular), 600 (semibold), 700 (bold)

### Spacing & Layout

- **Container**: Max-width 7xl (1280px) with responsive padding
- **Grid System**: CSS Grid and Flexbox with Tailwind utilities
- **Mobile-First**: Responsive breakpoints (sm, md, lg, xl)
- **Card Layout**: Rounded corners, shadows, hover effects

## 🧩 Implemented Components

### 1. Coaches Dashboard – Complete Redesign (v2.6.0)

#### Message Board System

- **Real-time Communication**: Live message updates using Supabase Realtime
- **Role-based Permissions**: Coaches edit own messages, admins manage all
- **Message Features**: Create, edit, delete, pin messages and replies
- **Input Sanitization**: Enhanced security with XSS protection
- **Mobile Optimized**: Fully responsive interface for all devices
- **Visual Indicators**: Pinned messages, edited status, real-time connection status

**Modern Card-Based Layout**

- **Statistics Cards**: 4-card grid at top showing Next Game, New Updates, New Messages, and Practice Drills
- **Content Sections**: Upcoming Games, Practice Schedule, Recent Announcements, Your Practice Drills, Message Board
- **Custom Header**: Logo, coach name, and sign-out button (no navigation links)
- **Unified Modal**: Single modal with tabs for Game, Practice, Update, and Drill creation
- **Responsive Design**: Mobile-optimized layout matching provided mockups

**New Components**

- **StatCard**: Reusable statistics display component with enhanced icons and styling
- **GameCard**: Individual game event display
- **PracticeCard**: Individual practice event display with improved mobile layout
- **AnnouncementCard**: Team update display
- **DrillCard**: Practice drill display
- **MessageBoard**: Full-featured message board with real-time updates and CRUD operations
- **ScheduleModal**: Unified modal with tabbed interface

### 2. Coaches Dashboard – Legacy Scheduling (Deprecated)

- **Location**: `src/app/coaches/dashboard/page.tsx`
- **What's new**:
  - Combined Date/Time + Recurrence card for Practice events
  - Weekly repeat pattern with End options: On date / After N times
  - Day-of-week chips; live summary sentence
  - Program‑wide selector for Admins (`__GLOBAL__`), hidden for coaches
  - Image preview uses `blob:` URLs; CSP updated to allow previews
- **Behavior**:
  - Recurring generator creates weekly instances on submit
  - For program‑wide updates/schedules, `team_id` is set to `NULL` and `is_global=true`

### 2. Navbar Component

- **Location**: `src/components/Navbar.tsx`
- **Features**:
  - Responsive navigation with mobile hamburger menu
  - Logo display with fallback
  - Authentication state management
  - Smooth mobile menu transitions
  - **Clickable logo and text** - Logo and "WCS BASKETBALL" text are now clickable links to home page
  - **Hover effects** - Opacity transition on hover for better user feedback
- **Styling**: Navy background, white text, Bebas font
- **Props**: None (self-contained)

### 3. Hero Section

- **Location**: `src/components/Hero.tsx`
- **Features**:
  - Enhanced responsive design with mobile-optimized text sizing
  - Split text layout: "More Than Basketball" and "We are World Class"
  - Framer Motion fade transitions
  - Call-to-action button with enhanced styling
  - Dark gradient overlay for text readability
  - Mobile-first responsive design
  - **Flaming basketball positioning** - Fixed desktop positioning to move basketball further left
  - **Responsive basketball** - Maintains proper positioning on mobile landscape view
- **Styling**: Full-width, full-height (h-screen), left-aligned text
- **Images**: Basketball action shots from `/public/images/`
- **Mobile**: Optimized text sizing and positioning for mobile devices

### 4. Values Section

- **Location**: `src/components/ValuesSection.tsx`
- **Features**:
  - Interactive 3-card carousel with navigation
  - Directional slide animations (left/right)
  - Modal popups for detailed information
  - Continuous looping navigation
- **Styling**: White background, card-based layout
- **Values**: 7 core values with images and descriptions

### 5. News Carousel

- **Location**: `src/components/NewsCarousel.tsx`
- **Features**:
  - Swiper.js-powered carousel
  - Responsive breakpoints (1/2/3 columns)
  - Modal details with full content
  - Navigation arrows and touch support
- **Styling**: Navy background, white cards
- **Content**: 3 news items with images and descriptions

### 6. Team Previews

- **Location**: `src/app/page.tsx` (inline)
- **Features**:
  - Dynamic team cards with logos
  - Hover effects and animations
  - Responsive grid layout
  - Error handling for missing images
- **Styling**: Gray background, white cards
- **Data**: 3 teams with logos from `/public/logos/`

### 7. Coaches Corner

- **Location**: `src/app/page.tsx` (inline)
- **Features**:
  - Staff profile cards
  - Animated entrance effects
  - Hover interactions
  - Responsive layout
- **Styling**: Gray background, white cards
- **Content**: 3 coaches with initials and descriptions

### 8. Dialog Component (UI Library)

- **Location**: `src/components/ui/dialog.tsx`
- **Features**:
  - **TypeScript Type Safety**: Complete type safety with proper interfaces
  - **DialogTriggerProps Interface**: Proper typing for trigger component with onClick support
  - **Display Names**: All sub-components have proper display names for debugging
  - **React.cloneElement Fix**: Properly typed cloneElement calls for better type safety
  - **Component Composition**: Modular design with Trigger, Content, Header, and Title components
  - **Accessibility**: ARIA labels and keyboard navigation support
- **Styling**: Navy background with red accents, rounded corners, overlay backdrop
- **Props**:
  - `DialogTriggerProps`: `{ children: ReactNode; className?: string; onClick?: () => void }`
  - `DialogContentProps`: `{ children: ReactNode; className?: string }`
  - `DialogHeaderProps`: `{ children: ReactNode }`
  - `DialogTitleProps`: `{ children: ReactNode }`

### 9. Shop Section

- **Location**: `src/app/page.tsx` (inline)
- **Features**:
  - Product preview cards
  - Pricing display
  - Add to cart buttons (placeholder)
  - Hover effects
- **Styling**: White background, bordered cards
- **Products**: Jersey, Basketball, Team Hat

### 10. Fan Zone Component

- **Location**: `src/components/FanZone.tsx`
- **Features**:
  - Interactive video cards with hover effects
  - Mobile-responsive layout with enhanced margins
  - Black background for better contrast
  - Video playback on hover
- **Styling**: Black background, white cards, mobile-optimized margins
- **Content**: 4 fan zone cards with videos and descriptions

### 11. Shop Component

- **Location**: `src/components/Shop.tsx`
- **Features**:
  - Product preview cards with pricing
  - Navy background for better visual hierarchy
  - Mobile-optimized margins matching Fan Zone
  - Enhanced responsive design
- **Styling**: Navy background, white cards, mobile-optimized margins
- **Products**: Jersey, Basketball, Team Hat with pricing

### 12. Logo Marquee Component

- **Location**: `src/components/LogoMarquee.tsx`
- **Features**:
  - Animated team logos with enhanced spacing
  - Smaller logo sizes for better visual balance
  - Slower animation speed for better readability
  - Semi-transparent background with opacity
- **Styling**: Navy background with opacity, smaller logos, enhanced spacing
- **Content**: Team logos from `/public/logos/`

### 13. Footer Component

- **Location**: `src/components/Footer.tsx`
- **Features**:
  - **Complete redesign** - Mobile and desktop layouts completely overhauled
  - **Mobile layout**: Logo → Quick Links → Stay Updated → Follow Us
  - **Desktop layout**: 3-column horizontal layout with proper alignment
  - **Centered quick links** - Two columns centered under "QUICK LINKS" title
  - **Clean design** - Removed legal links for cleaner appearance
  - **Responsive design** - Proper mobile and desktop layouts
  - **Social media icons** - Circular icons with hover effects
  - **Join Our Community button** - Call-to-action with proper styling
- **Styling**: Navy background, white text, centered mobile layout
- **Content**: Navigation links, social media, contact information

### 14. ScrollToTop Component

- **Location**: `src/components/ScrollToTop.tsx`
- **Features**:
  - Enhanced automatic scroll to top functionality
  - Multiple event listeners for better reliability
  - Visibility change and focus event handling
  - No visual element (utility component)

### 15. Dialog Component (NEW)

- **Location**: `src/components/ui/dialog.tsx`
- **Features**:
  - Modal system with Framer Motion animations
  - Accessible modal dialogs with proper ARIA labels
  - Smooth animations with reduced motion support
  - Customizable styling with consistent design system
  - Trigger-based activation system
  - Focus management and keyboard navigation
- **Styling**: Navy background, red accents, rounded corners
- **Props**: `children`, `className`

### 16. Input Component (NEW)

- **Location**: `src/components/ui/input.tsx`
- **Features**:
  - Standardized form inputs with consistent styling
  - Focus states and accessibility features
  - Error state handling and validation
  - Customizable className support
  - Forward ref support for form libraries
- **Styling**: Navy background, gray borders, red focus states
- **Props**: Standard HTML input props + `className`

### 17. Select Component (NEW)

- **Location**: `src/components/ui/select.tsx`
- **Features**:
  - Dropdown selection interface with consistent theming
  - Accessibility features and keyboard navigation
  - Customizable options and styling
  - Form integration support
  - Forward ref support for form libraries
- **Styling**: Navy background, gray borders, red focus states
- **Props**: Standard HTML select props + `className`

## 🎭 Animations & Interactions

### Framer Motion Animations

- **Hero Text**: Fade in with staggered delays
- **Values Cards**: Directional slide animations
- **Team Cards**: Hover scale effects
- **News Cards**: Hover scale and shadow changes
- **Page Transitions**: Smooth fade effects

### Hover Effects

- **Cards**: Scale (1.02x) and shadow changes
- **Buttons**: Opacity and color transitions
- **Images**: Scale effects on hover
- **Navigation**: Color and background changes

### Responsive Behavior

- **Mobile**: Single column layouts, touch-friendly buttons
- **Tablet**: 2-column grids, medium spacing
- **Desktop**: 3-column grids, full spacing
- **Navigation**: Hamburger menu on mobile, full nav on desktop

## 📱 Mobile Optimization

### Enhanced Mobile Experience

- **Hero Section**: Mobile-optimized text sizing and positioning
- **Split Text Layout**: "More Than Basketball" split into two lines on mobile
- **Responsive Margins**: Enhanced mobile margins for Fan Zone and Shop sections
- **Touch Interactions**: Swipe support for news carousel and values section
- **Touch Targets**: Minimum 44px for all interactive elements
- **Gesture Support**: Native swipe gestures for carousels

### Mobile-Specific Features

- **Text Sizing**: Optimized font sizes for mobile readability
- **Layout Adjustments**: Mobile-first responsive design
- **Margin Consistency**: Uniform mobile margins across all sections
- **Background Colors**: Enhanced contrast with black Fan Zone and navy Shop

### Performance

- **Image Optimization**: Next.js Image component with proper sizing
- **Lazy Loading**: Intersection Observer for animations
- **Bundle Size**: Optimized with code splitting (163 kB First Load JS)
- **Build Time**: Optimized to ~6.5 seconds

## 🎯 Accessibility Features

### ARIA Labels

- **Navigation**: Proper ARIA labels for screen readers
- **Buttons**: Descriptive labels for all interactive elements
- **Modals**: Proper dialog roles and focus management

### Keyboard Navigation

- **Tab Order**: Logical tab sequence through all elements
- **Focus States**: Visible focus indicators
- **Modal Trapping**: Focus management in modals

### Screen Reader Support

- **Alt Text**: Descriptive alt text for all images
- **Semantic HTML**: Proper heading hierarchy and landmarks
- **Form Labels**: Associated labels for all form inputs

## 🔧 Technical Implementation

### State Management

- **React Hooks**: useState, useEffect for component state
- **Context**: No global state management (component-level state)
- **Props**: Minimal prop drilling, self-contained components

### Styling Approach

- **Tailwind CSS**: Utility-first styling
- **Custom Classes**: Minimal custom CSS
- **Responsive**: Mobile-first breakpoint system
- **Dark Mode**: Not implemented (future consideration)

### Performance Optimizations

- **Image Loading**: Next.js Image with priority loading
- **Code Splitting**: Automatic with Next.js
- **Bundle Analysis**: Regular bundle size monitoring
- **Lazy Loading**: Intersection Observer for animations
