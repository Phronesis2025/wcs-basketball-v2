# WCSv2.0 UI Components

**Version**: v2.10.1  
**Last Updated**: January 2025  
**Security Score**: 9/10 (Excellent) 🔒  
**Live URL**: https://wcs-basketball-v2.vercel.app

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

### Team Page (v2.7.6)

- **Dashboard-Style Cards**: Modern card-based layout matching coaches dashboard design
- **White Theme**: Clean white background with proper contrast and professional appearance
- **Event Cards**:
  - Game Cards: White background with red location badge
  - Practice Cards: White background with green location badge
  - Hover effects with subtle shadow transitions
- **Event Limitation**: Display only upcoming 3 events for better focus and performance
- **Responsive Design**: Cards stack vertically on mobile, maintain consistent spacing
- **Empty States**: Styled empty state cards when no events are scheduled
- **Typography**:
  - Headings: `font-inter font-semibold text-gray-900`
  - Body text: `text-gray-500` and `text-gray-600`
  - Consistent with dashboard styling
- **Card Structure**:
  - Left side: Event title and date/time information
  - Right side: Location badge with appropriate color coding
  - Proper spacing and padding for readability
- **Security Enhancements**: Enhanced input sanitization and XSS protection
- **Image Optimization**: Fixed Next.js Image aspect ratio warnings

### Schedules Page (v2.7.6)

- **Mobile-First Calendar**: Custom month grid with color-coded event pills
  - Game: Red (`bg-red`) with white text
  - Practice: Green (`bg-green-700`) with white text
  - Tournament: Purple (`bg-purple-700`) with white text
  - Update/Meeting: Yellow (`bg-amber-500`) with black text
- **Event Pills**: Show team name or "All Teams" for global events; click opens details modal
- **Month Navigation**: Prev | Month | Next buttons at top with compact color legend
- **Event Limit**: Show 3 pills per day with "+n more" expander for additional events
- **Today Highlighting**: Subtle red-tinted background for current date
- **Timezone Handling**: Proper Chicago timezone support for accurate date detection
- **Modal System**:
  - Prevents main page scrolling when modal is open
  - Internal scrolling for tall content with max-height constraints
  - Accessible focus management and keyboard navigation
- **Today's Events Layout**:
  - First line: Event type (colored) + team name
  - Second line: Date/time + location (smaller, gray text)
- **Responsive Design**:
  - Mobile: Team name only, centered in pill
  - Desktop: Team name left-aligned, time right-aligned
- **Bulk Operations**: "Delete All Practices" button with confirmation modal
- **Image Optimization**: Fixed Next.js Image aspect ratio warnings
- **Recurring Practices**: Advanced recurring practice management with group ID tracking
- **Real-time Updates**: Live synchronization of schedule changes across all users

### Tournament Signup Page (v2.10.1)

- **Location**: `src/app/tournament-signup/page.tsx`
- **Tournament Information Section**:
  - Tournament title: "Coach Nate Classic 2026" with prominent red heading (Bebas Neue font)
  - Engaging description honoring Coach Nate as a founding member
  - Three information cards in responsive grid layout:
    - **Registration Deadline**: January 30, 2026 with "Don't miss out!" reminder
    - **Entry Fee**: $180 per team with "Competitive pricing" note
    - **Divisions**: 9 divisions with "All skill levels welcome" message
  - Cards stack vertically on mobile (1 column), display horizontally on tablet/desktop (3 columns)
  - Call-to-action message encouraging registration
- **Tourneymachine Integration**:
  - Embedded iframe with Tourneymachine registration form
  - Tournament ID: `h2025110322180881499b2c2309fc540`
  - Full-width responsive iframe (100% width)
  - Proper scrolling and fullscreen support enabled
- **Ad Hiding Workaround**:
  - CSS-based solution to hide Tourneymachine advertisement at top of embedded form
  - Responsive negative margins:
    - Mobile: `-85px` margin-top
    - Tablet/Desktop: `-250px` margin-top
  - Uses Tailwind responsive classes (`-mt-[85px] md:-mt-[250px]`)
  - Wrapper container with `overflow-hidden` to clip hidden content
  - Increased iframe height (3200px) to compensate for negative margin
- **Styling**:
  - Navy background (`bg-navy`) matching site theme
  - Gray information cards with red accents (`bg-gray-900/50`, `border-red-500/50`)
  - Consistent typography: Bebas Neue for headings, Inter for body text
  - Responsive padding and spacing (`p-4 sm:p-8`)
- **Security**:
  - Content Security Policy (CSP) updated to allow Tourneymachine iframes
  - Only allows specific Tourneymachine domain, not arbitrary external sites
  - All other security restrictions maintained

### 1. Coaches Dashboard – Complete Redesign (v2.6.1)

#### Message Board System

- **Real-time Communication**: Live message updates using Supabase Realtime
- **Role-based Permissions**: Coaches edit own messages, admins manage all
- **UI Fixes (v2.6.1)**: Fixed page scrolling issues and button rendering problems
  - Added `type="button"` to all 17 buttons to prevent form submission behavior
  - Fixed delete button rendering in confirmation modal with enhanced styling
  - Resolved TypeScript build errors with proper JSX compatibility
  - Enhanced user experience by maintaining scroll position during interactions
- **Mobile UI Improvements (v2.9.6)**:
  - Unread badge text now responsive: shows `"{count} unread"` on mobile, `"{count} unread mention(s)"` on desktop/tablet
  - Badge size optimized for mobile view with better visual balance
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
  - **Horizontal Carousel**: Interactive carousel with framer-motion animations for smooth sliding
  - **Navigation Arrows**: Left/right arrows with hover states on desktop/tablet, always visible on mobile
  - **Responsive Display**: Shows 4 cards on desktop/tablet (≥640px), 2 cards on mobile (<640px)
  - **Swipe Functionality**: Drag/swipe support for mobile devices
  - **Keyboard Navigation**: Arrow key support for accessibility
  - **Isolated Hover Effects**: Each card independently handles hover (image scale, overlay, title color)
  - **7 Navigation Cards**: Our Values, Our Teams, Schedules, Practice Drills, Coach Login, Parent Login, Tournament Information
  - **Optimized Height**: Compact cards with aspect-[5/3] image ratio and reduced padding
- **Styling**: Navy background, white cards, smooth animations, mobile-optimized
- **Content**: 7 navigation cards with images, titles, and descriptions linking to various pages
- **Technical Details**:
  - Uses `useInView` hook for fade-in animations when section enters viewport
  - React event handlers for isolated hover effects (onMouseEnter/onMouseLeave)
  - Framer-motion for carousel animations and drag gestures
  - ResizeObserver for responsive width tracking

### 11. Quote Section Component

- **Location**: `src/components/QuoteSection.tsx`
- **Features**:
  - **Auto-Rotating Carousel**: Displays motivational basketball quotes with automatic 7-second rotation
  - **Horizontal Swipe Animation**: Smooth horizontal slide transitions using Framer Motion
  - **15 Inspirational Quotes**: Quotes from legendary coaches and players (John Wooden, Michael Jordan, LeBron James, etc.)
  - **Responsive Font Sizing**: 
    - Quote: `text-lg` on mobile, `text-2xl` on desktop/tablet
    - Author: `text-sm` on mobile, `text-base` on desktop/tablet
  - **Line Clamping**: Quotes limited to 2 lines, author to 1 line for consistent layout
  - **Compact Design**: Minimal padding (`py-2`) and reduced height (`min-h-[80px]`)
  - **Brand Styling**: 
    - Quote text uses `font-bebas-bold-italic` (matches "BE LEGENDARY" styling)
    - Author text uses `font-bebas-light` (matches tagline styling)
  - **Visual Separation**: Brand red top and bottom borders for visual distinction
- **Styling**: Black background, white text, brand red borders, compact height
- **Content**: Rotating motivational quotes with author attribution
- **Technical Details**:
  - Fetches quotes from Supabase `quotes` table on component mount
  - Uses `useEffect` with `setInterval` for auto-rotation
  - Framer Motion `AnimatePresence` for smooth transitions
  - Horizontal slide animation (x-axis: 100 → 0 → -100)
  - Error handling and loading states
  - Positioned between Hero and FanZone sections on home page

### 12. AdSection Component

- **Location**: `src/components/AdSection.tsx`
- **Features**:
  - **BE LEGENDARY Promotional Ad**: Full-width promotional section with basketball court background
  - **Horizontal Layout**: Consistent side-by-side layout (text on left, button on right) across all screen sizes
  - **Responsive Text Scaling**: Text sizes scale appropriately from mobile to desktop (headline: text-2xl to text-8xl, tagline: text-[10px] to text-lg)
  - **Responsive Button**: Button scales from text-xs on mobile to text-2xl on large screens
  - **Click-to-Register**: Entire section and button link to `/register` page
  - **Gradient Overlay**: Dark gradient overlay (darker on left, lighter on right) for text readability
  - **Background Image**: Basketball court background image with object-contain for proper scaling
- **Styling**: White background section, dark gradient overlay, red CTA button, responsive text and spacing
- **Content**: "BE LEGENDARY" headline, "Train. Compete. Rise above." tagline, "GET IN THE GAME" button
- **Technical Details**:
  - Uses Next.js Image component with priority loading
  - Fixed aspect ratio (1200/190) for consistent display
  - Horizontal flex layout (flex-row) for all screen sizes
  - Properly scaled padding and margins for mobile/desktop

### 13. Shop Component

- **Location**: `src/components/Shop.tsx`
- **Features**:
  - Product preview cards with pricing
  - Navy background for better visual hierarchy
  - Mobile-optimized margins matching Fan Zone
  - Enhanced responsive design
- **Styling**: Navy background, white cards, mobile-optimized margins
- **Products**: Jersey, Basketball, Team Hat with pricing

### 13. Logo Marquee Component

- **Location**: `src/components/LogoMarquee.tsx`
- **Features**:
  - Animated team logos with enhanced spacing
  - Smaller logo sizes for better visual balance
  - Slower animation speed for better readability
  - Semi-transparent background with opacity
- **Styling**: Navy background with opacity, smaller logos, enhanced spacing
- **Content**: Team logos from `/public/logos/`

### 14. Footer Component

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

### 15. ScrollToTop Component

- **Location**: `src/components/ScrollToTop.tsx`
- **Features**:
  - Enhanced automatic scroll to top functionality
  - Multiple event listeners for better reliability
  - Visibility change and focus event handling
  - No visual element (utility component)

### 16. Dialog Component (UI Library)

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

### 18. Player Card Component (Parent Profile)

- **Location**: `src/components/parent/ChildDetailsCard.tsx`
- **Features**:
  - **Flip Card Effect**: Active players have interactive 3D flip cards
    - Click to flip and view detailed player information
    - Smooth CSS 3D transform animation (0.6s transition)
    - Front shows basic player info (logo, name, status, team, coach, jersey)
    - Back shows detailed registration information (DOB, grade, gender, shirt size, position, school)
  - **Birthday Celebration**: Party popper emoji (🎉) appears in top-right corner on player's birthday
    - Large, visible size (`text-7xl sm:text-8xl`)
    - Positioned with `-translate-y-6 translate-x-8` for optimal corner placement
    - Improved birthday detection with proper date parsing and timezone handling
  - **Edit Player Information**: Modal for parents to edit player details
    - Pre-filled form with current player data
    - Fields: Name (required), Grade, Date of Birth, Gender, Jersey Number, Shirt Size, Position Preference, Experience Level, School Name
    - Toast notifications for save success/failure
    - Scroll lock when modal is open
    - Page reload after successful save to reflect changes
  - **Regular Cards**: Non-active players display standard card layout
    - Team logo, player name, basic info, status badge
    - Team, coach, jersey number, and birthdate information
    - Payment status messages for non-approved/paid players
- **Styling**: White background, rounded corners, shadow effects, responsive sizing
- **Content**: Player information, team details, status indicators
- **Technical Details**:
  - Uses `perspective`, `transform-style`, `rotateY`, and `backfaceVisibility` for 3D flip effect
  - `isTodayBirthday()` function with direct date string parsing (YYYY-MM-DD format)
  - Birthday detection compares month and day (ignores year) using local timezone
  - Modal uses `useScrollLock` hook to prevent body scrolling
  - API endpoint: `/api/parent/update-player` for saving player updates
  - Toast notifications using `react-hot-toast`

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
