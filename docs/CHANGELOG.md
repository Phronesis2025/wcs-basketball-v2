# WCSv2.0 Changelog

## v2.1.0 - January 2025 (Current)

### 🎉 Major Features
- **Hero Section**: Implemented rotating image carousel with Framer Motion animations
- **Values Section**: Created interactive 3-card carousel with directional slide animations
- **News Carousel**: Added Swiper.js-powered news section with modal details
- **Team Previews**: Dynamic team cards with responsive design
- **Coaches Corner**: Staff profiles with hover effects
- **Shop Section**: Merchandise preview with pricing and add-to-cart buttons
- **User Authentication**: Complete registration and login system with Supabase

### 🔒 Security Enhancements
- **Rate Limiting**: Client-side rate limiting for registration (5 attempts per 5 minutes)
- **Input Validation**: Comprehensive email format, password strength, and length validation
- **CSRF Protection**: Token-based protection for forms
- **Input Sanitization**: XSS prevention for user-generated content
- **Enhanced CSP**: Updated Content Security Policy for Next.js compatibility
- **Security Headers**: Added Referrer-Policy and Permissions-Policy headers
- **Error Handling**: Generic error messages to prevent information disclosure

### 🎨 UI/UX Improvements
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Animations**: Smooth transitions with Framer Motion
- **Image Optimization**: Next.js Image component with proper sizing
- **Scroll-to-Top**: Automatic page positioning on load/refresh
- **Loading States**: Proper loading indicators and error handling

### 🛠️ Technical Updates
- **Dependencies**: Added Swiper.js, react-intersection-observer, react-icons
- **Image Assets**: Added placeholder images for news and team content
- **TypeScript**: Enhanced type safety throughout the application
- **Performance**: Optimized images and lazy loading

## v2.0.0 - September 09, 2025

- Initial setup with Next.js, Tailwind, Supabase
- Added local fonts (Inter, Bebas Neue), security headers
- Seeded Supabase with team data, tested auth

## Future Releases

- v2.2.0: Parent Portal with player stats and attendance tracking
- v2.3.0: Stripe integration for shop payments
- v2.4.0: Live game updates and real-time notifications
