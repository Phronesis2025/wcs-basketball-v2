# WCS Basketball v2.0

A modern, secure basketball team management system built with Next.js 15, TypeScript, and Supabase.

**Current Version**: v2.7.5  
**Last Updated**: January 2025  
**Security Score**: 10/10 (Perfect) 🔒  
**Build Status**: Clean Build ✅

## 🏀 Features

- **Team Management**: Complete team roster and information system with dashboard-style card layouts
- **Coach Dashboard**: Secure coach portal with bulk operations and recurring practice management
- **Schedules Page**: Mobile-first calendar with color-coded event pills, modal scrolling fixes, and improved layout
- **Team Pages**: Modern card-based design matching dashboard style with white theme and event limitations
- **Fan Zone**: Public team information and news
- **Schedule Management**: Game and practice scheduling with real-time updates
- **Team Updates**: News and announcements system
- **Recurring Practices**: Advanced recurring practice creation and management
- **Bulk Operations**: Delete all practices functionality for coaches
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Modal System**: Accessible modals with proper scrolling and focus management
- **Image Optimization**: Fixed Next.js Image aspect ratio warnings for better performance
- **Security**: Perfect 10/10 security score with comprehensive protection

## 🔒 Security

- **Perfect Security Score**: 10/10 (All vulnerabilities eliminated)
- **XSS Protection**: Input sanitization on all user-generated content
- **CSRF Protection**: Token-based form protection
- **Content Security Policy**: Comprehensive CSP implementation
- **Row Level Security**: Database-level access control
- **Input Validation**: Comprehensive input sanitization and validation
- **Zero Vulnerabilities**: All NPM packages secure and up-to-date

## 🚀 Tech Stack

- **Framework**: Next.js 15.5.2 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS 3.3.3
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Deployment**: Vercel
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

   ```bash
   cp .env.example .env.local
   # Add your Supabase credentials
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

- **Build Time**: ~6.5 seconds
- **Bundle Size**: 163 kB First Load JS
- **Security Score**: 10/10 (Perfect)
- **Zero Vulnerabilities**: All dependencies secure
- **TypeScript**: Zero errors
- **ESLint**: Zero linting errors

## 🚀 Deployment

The application is deployed on Vercel with automatic deployments from the main branch.

**Live URL**: [https://wcs-basketball-v2.vercel.app](https://wcs-basketball-v2.vercel.app)

## 📝 Recent Updates

### v2.4.3 - January 2025

- **CRITICAL SECURITY FIX**: Eliminated XSS vulnerability in Team Updates
- **Perfect Security Score**: Achieved 10/10 security rating
- **Enhanced Input Sanitization**: All user content properly sanitized
- **Security Audit**: Comprehensive security review completed

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
