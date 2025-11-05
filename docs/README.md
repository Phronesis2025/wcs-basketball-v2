# WCS Basketball v2.0 Documentation

**Last Updated**: January 2025  
**Organization**: Organized by category for easier navigation

---

## 📁 Documentation Structure

### Core Documentation (Root Level)

- **`CHANGELOG.md`** - Complete version history and release notes
- **`README.md`** - This file - documentation index
- **`SECURITY.md`** - Comprehensive security guide
- **`PERFORMANCE_OPTIMIZATION.md`** - Performance optimization guide
- **`PERFORMANCE_MONITORING_SETUP.md`** - Performance monitoring setup guide
- **`ENVIRONMENT_SETUP.md`** - Environment variables configuration
- **`DB_SETUP.md`** - Database schema and setup guide
- **`OVERVIEW.md`** - Project overview and architecture
- **`PROGRESS.md`** - Development progress tracking
- **`ROADMAP.md`** - Future development roadmap

### 📂 Subdirectories

#### `/deployment` - Deployment Guides
- **`VERCEL_DEPLOYMENT.md`** - Complete Vercel deployment guide (consolidated)

#### `/security` - Security Documentation
- **`SECURITY_AUDITS.md`** - Consolidated security audit reports

#### `/mcp` - MCP (Model Context Protocol) Setup
- **`MCP_SETUP.md`** - Complete MCP configuration guide (consolidated)

#### `/database` - Database Migrations & Scripts
- All SQL migration files (`.sql`)
- Database setup and migration scripts

---

## 🚀 Quick Start Guides

### For New Developers

1. Read `OVERVIEW.md` for project architecture
2. Follow `ENVIRONMENT_SETUP.md` for local setup
3. Review `DB_SETUP.md` for database configuration
4. Check `SECURITY.md` for security best practices

### For Deployment

1. Follow `deployment/VERCEL_DEPLOYMENT.md` for production deployment
2. Configure environment variables per `ENVIRONMENT_SETUP.md`
3. Review `SECURITY.md` before deploying

### For Security Audits

1. Review `security/SECURITY_AUDITS.md` for latest audit findings
2. Check `SECURITY.md` for security best practices
3. Review `CHANGELOG.md` for security-related changes

---

## 📚 Documentation by Category

### Setup & Configuration
- `ENVIRONMENT_SETUP.md` - Environment variables
- `DB_SETUP.md` - Database setup
- `deployment/VERCEL_DEPLOYMENT.md` - Deployment

### Security
- `SECURITY.md` - Security guide
- `security/SECURITY_AUDITS.md` - Audit reports
- `enable_leaked_password_protection.md` - Password protection setup

### Performance
- `PERFORMANCE_OPTIMIZATION.md` - Optimization guide
- `PERFORMANCE_MONITORING_SETUP.md` - Monitoring setup

### Development
- `CODEBASE_STRUCTURE.md` - Code structure
- `DEVELOPMENT_SPECIFICATION.md` - Development specs
- `CLUB_MANAGEMENT_SYSTEM.md` - Club management features
- `COACH_PROFILE_SYSTEM.md` - Coach profile system
- `EXCEL_IMPORT_IMPLEMENTATION.md` - Excel import feature

### Features
- `REGISTRATION_FLOW.md` - Registration process
- `PAYMENTS_SETUP.md` - Payment integration
- `MESSAGE_BOARD_SETUP.md` - Message board system
- `REALTIME_TROUBLESHOOTING.md` - Realtime features

### Testing
- `PRODUCTION_TESTING_GUIDE.md` - Testing procedures
- `TEST_REGISTRATION_FLOW.md` - Registration testing
- `WEBHOOK_TESTING_GUIDE.md` - Webhook testing

### Troubleshooting
- `ERRORS.md` - Common errors and solutions
- `LOGIN_DEBUGGING_GUIDE.md` - Login issues
- `REALTIME_TROUBLESHOOTING.md` - Realtime issues

---

## 📝 Document Maintenance

### Adding New Documentation

1. **Core docs** go in root `docs/` directory
2. **Category-specific docs** go in appropriate subdirectory:
   - Deployment guides → `/deployment`
   - Security audits → `/security`
   - MCP setup → `/mcp`
   - Database scripts → `/database`

### Updating Documentation

1. Update relevant documentation files
2. Update `CHANGELOG.md` if significant changes
3. Update this README if structure changes

### Consolidating Duplicate Files

When consolidating:
1. Keep the most comprehensive/up-to-date version
2. Move older versions to `.backup` files
3. Update references in this README

---

## 🔍 Finding Documentation

### By Topic

- **Security**: `SECURITY.md`, `security/SECURITY_AUDITS.md`
- **Performance**: `PERFORMANCE_OPTIMIZATION.md`, `PERFORMANCE_MONITORING_SETUP.md`
- **Deployment**: `deployment/VERCEL_DEPLOYMENT.md`
- **Database**: `DB_SETUP.md`, `/database` directory
- **Features**: Check feature-specific files (e.g., `CLUB_MANAGEMENT_SYSTEM.md`)

### By File Type

- **Setup Guides**: Files with `SETUP` or `CONFIGURATION` in name
- **Feature Docs**: Files with feature names (e.g., `REGISTRATION`, `PAYMENTS`)
- **Migration Scripts**: All `.sql` files in `/database`
- **Audit Reports**: Files in `/security` directory

---

## 📖 Important Documents

### Must-Read for All Developers

1. `ENVIRONMENT_SETUP.md` - Required for local development
2. `SECURITY.md` - Security best practices
3. `CHANGELOG.md` - Latest changes and updates

### Must-Read Before Deployment

1. `deployment/VERCEL_DEPLOYMENT.md` - Deployment guide
2. `security/SECURITY_AUDITS.md` - Security audit results
3. `PERFORMANCE_OPTIMIZATION.md` - Performance considerations

---

## 🔄 Recent Organization Changes (January 2025)

### Consolidated Files

- **Deployment**: Combined `DEPLOY_TO_VERCEL.md`, `VERCEL_DEPLOYMENT_2025.md`, and `DEPLOY.md` into `deployment/VERCEL_DEPLOYMENT.md`
- **Security Audits**: Combined multiple audit files into `security/SECURITY_AUDITS.md`
- **MCP Setup**: Combined MCP files into `mcp/MCP_SETUP.md`

### Organized by Category

- **Deployment guides** → `/deployment`
- **Security audits** → `/security`
- **MCP setup** → `/mcp`
- **Database scripts** → `/database`

---

## 📞 Questions?

For questions about:
- **Documentation**: Check this README and relevant files
- **Code**: See `CODEBASE_STRUCTURE.md`
- **Setup Issues**: See `ENVIRONMENT_SETUP.md` or `ERRORS.md`
- **Security**: See `SECURITY.md` or `security/SECURITY_AUDITS.md`
