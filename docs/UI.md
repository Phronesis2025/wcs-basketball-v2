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

### 1. Navbar Component
- **Location**: `src/components/Navbar.tsx`
- **Features**: 
  - Responsive navigation with mobile hamburger menu
  - Logo display with fallback
  - Authentication state management
  - Smooth mobile menu transitions
- **Styling**: Navy background, white text, Bebas font
- **Props**: None (self-contained)

### 2. Hero Section
- **Location**: `src/components/Hero.tsx`
- **Features**:
  - Rotating image carousel (5 images, 3-second intervals)
  - Framer Motion fade transitions
  - Call-to-action button
  - Dark gradient overlay for text readability
- **Styling**: Full-width, 500px height, centered text
- **Images**: Basketball action shots from `/public/images/`

### 3. Values Section
- **Location**: `src/components/ValuesSection.tsx`
- **Features**:
  - Interactive 3-card carousel with navigation
  - Directional slide animations (left/right)
  - Modal popups for detailed information
  - Continuous looping navigation
- **Styling**: White background, card-based layout
- **Values**: 7 core values with images and descriptions

### 4. News Carousel
- **Location**: `src/components/NewsCarousel.tsx`
- **Features**:
  - Swiper.js-powered carousel
  - Responsive breakpoints (1/2/3 columns)
  - Modal details with full content
  - Navigation arrows and touch support
- **Styling**: Navy background, white cards
- **Content**: 3 news items with images and descriptions

### 5. Team Previews
- **Location**: `src/app/page.tsx` (inline)
- **Features**:
  - Dynamic team cards with logos
  - Hover effects and animations
  - Responsive grid layout
  - Error handling for missing images
- **Styling**: Gray background, white cards
- **Data**: 3 teams with logos from `/public/logos/`

### 6. Coaches Corner
- **Location**: `src/app/page.tsx` (inline)
- **Features**:
  - Staff profile cards
  - Animated entrance effects
  - Hover interactions
  - Responsive layout
- **Styling**: Gray background, white cards
- **Content**: 3 coaches with initials and descriptions

### 7. Shop Section
- **Location**: `src/app/page.tsx` (inline)
- **Features**:
  - Product preview cards
  - Pricing display
  - Add to cart buttons (placeholder)
  - Hover effects
- **Styling**: White background, bordered cards
- **Products**: Jersey, Basketball, Team Hat

### 8. ScrollToTop Component
- **Location**: `src/components/ScrollToTop.tsx`
- **Features**:
  - Automatic scroll to top on page load
  - Visibility change handling
  - No visual element (utility component)

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

### Touch Interactions
- **Swipe Support**: News carousel and values section
- **Touch Targets**: Minimum 44px for all interactive elements
- **Gesture Support**: Native swipe gestures for carousels

### Performance
- **Image Optimization**: Next.js Image component with proper sizing
- **Lazy Loading**: Intersection Observer for animations
- **Bundle Size**: Optimized with code splitting

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
