# WCS Basketball v2.0

A modern, secure basketball team management system built with Next.js 15, TypeScript, and Supabase.

**Current Version**: v2.0.1  
**Last Updated**: January 2025  
**Security Score**: 8.5/10 (Good) 🔒  
**Build Status**: Clean Build ✅  
**Live URL**: https://wcs-basketball-v2.vercel.app

## 🏀 Features

### Core Functionality

- **Team Management**: Complete team roster and information system with dashboard-style card layouts
- **Coach Dashboard**: Secure coach portal with bulk operations and recurring practice management
- **Schedules Page**: Mobile-first calendar with color-coded event pills, modal scrolling fixes, and improved layout
- **Team Pages**: Modern card-based design matching dashboard style with white theme and event limitations
- **Practice Drills**: Comprehensive drill library with filtering by time, skill, and difficulty
- **Message Board**: Real-time coach communication system with role-based permissions

### Security & Performance

- **Security**: 8.5/10 security score with comprehensive audit and zero dependency vulnerabilities
- **Authentication**: Role-based access control with admin and coach permissions
- **Input Sanitization**: XSS protection and comprehensive profanity filtering for all user content
- **Delete Confirmation**: All destructive actions require user confirmation to prevent accidental data loss
- **CSRF Protection**: Cryptographic token-based form protection
- **Rate Limiting**: Protection against brute force attacks
- **Image Optimization**: Fixed Next.js Image aspect ratio warnings for better performance

### User Experience

- **Registration Flow**: Enhanced club registration system with proper navigation and access control
- **Admin Analytics**: Secure admin-only analytics dashboard with proper role-based access control
- **Fan Zone**: Public team information and news
- **Schedule Management**: Game and practice scheduling with real-time updates
- **Team Updates**: News and announcements system
- **Recurring Practices**: Advanced recurring practice creation and management
- **Bulk Operations**: Delete all practices functionality for coaches
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Modal System**: Accessible modals with proper scrolling and focus management

## 🔒 Security

- **Perfect Security Score**: 10/10 (All vulnerabilities eliminated)
- **XSS Protection**: Input sanitization on all user-generated content
- **CSRF Protection**: Token-based form protection
- **Content Security Policy**: Comprehensive CSP implementation
- **Row Level Security**: Database-level access control
- **Input Validation**: Comprehensive input sanitization and validation
- **Zero Vulnerabilities**: All NPM packages secure and up-to-date

## 🚀 Tech Stack

### Frontend

- **Framework**: Next.js 15.5.2 with App Router
- **Language**: TypeScript 5.9.2
- **Styling**: Tailwind CSS 3.3.3
- **UI Components**: Custom component library with Framer Motion
- **State Management**: React Query for server state, Zustand for client state
- **Animations**: Framer Motion 12.23.12

### Backend & Database

- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth with role-based access control
- **Real-time**: Supabase Realtime subscriptions
- **File Storage**: Supabase Storage for images and documents
- **API**: Server Actions with TypeScript

### Deployment & Monitoring

- **Hosting**: Vercel Pro Plan
- **CDN**: Global content delivery
- **Analytics**: Vercel Analytics and Speed Insights
- **Error Monitoring**: Sentry integration
- **Security**: Custom security utilities and comprehensive headers

## 📦 Getting Started

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd wcsv2.0-new
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env.local` file in the project root with:
   ```bash
   # Required
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   
   # See docs/ENVIRONMENT_SETUP.md for complete list
   ```

4. **Run the development server**

   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📚 Documentation

- [Security Documentation](docs/SECURITY.md) - Comprehensive security implementation
- [Database Setup](docs/DB_SETUP.md) - Database schema and RLS policies
- [Environment Setup](docs/ENVIRONMENT_SETUP.md) - Configuration guide
- [Deployment Guide](docs/DEPLOY.md) - Production deployment instructions
- [Testing Guide](docs/TESTING.md) - Testing procedures and examples

## 🛡️ Security Features

- **Input Sanitization**: All user inputs sanitized before processing
- **XSS Prevention**: Comprehensive XSS protection on all content
- **CSRF Protection**: Cryptographic token-based form protection
- **Rate Limiting**: Protection against brute force attacks
- **Secure Headers**: HSTS, CSP, X-Frame-Options, and more
- **Audit Logging**: Database-level security event tracking
- **Development Security**: Secure logging utilities for development only

## 📊 Performance

- **Build Time**: ~2.8 minutes
- **Bundle Size**: 181 kB First Load JS (shared)
- **Security Score**: 8.5/10 (Good)
- **Zero Vulnerabilities**: All dependencies secure
- **TypeScript**: Zero errors
- **ESLint**: Zero linting errors

## 🚀 Deployment

The application is deployed on Vercel with automatic deployments from the main branch.

**Live URL**: [https://wcs-basketball-v2.vercel.app](https://wcs-basketball-v2.vercel.app)

## 📝 Recent Updates

### v2.9.7 - November 2025 (Current)

- **Player Card Birthday Celebration**: Added party popper emoji (🎉) in top-right corner of player cards when it's their birthday
- **PDF Invoice Fix**: Fixed encoding error preventing invoice emails from being sent (removed unsupported checkmark character)
- **Birthday Detection**: Improved birthday detection with proper date parsing and timezone handling
- **UI Enhancement**: Replaced birthday cake icon with more prominent party popper in corner position
- **Known Issue**: PDF email invoice layout does not currently match the HTML invoice view - work in progress

### v2.0.1 - January 2025

- **Security Audit**: Completed comprehensive security check with 8.5/10 score
- **Critical Security Fixes**: 
  - Removed secrets.txt from git tracking (security risk)
  - Fixed Server Actions CORS configuration (restricted to known origins)
- **Build Optimization**: Successful production build with zero errors
- **Documentation**: Comprehensive documentation updates and audit reports
- **Deployment Ready**: All security fixes applied and verified

### Previous Versions

- **Team Page Dashboard-Style Cards**: Modern card-based design matching coaches dashboard
- **Modal Scrolling Fixes**: Prevented main page scrolling when modals are open
- **Today's Events Layout**: Improved two-line layout for better readability
- **Timezone Handling**: Proper Chicago timezone support for accurate date detection
- **Bulk Operations**: "Delete All Practices" functionality for coaches
- **Security Audit**: Comprehensive security review with zero vulnerabilities found

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run security and linting checks
5. Submit a pull request

## 📄 License

This project is proprietary software. All rights reserved.

## 📞 Support

For support and questions, please contact the development team.
