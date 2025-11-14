# Unused Components

This folder contains components, pages, and files that are not currently being used in the active codebase but are kept for reference or potential future use.

**Last Updated**: November 14, 2025

## Components

### ValuesSection.tsx

- **Original Location**: `src/components/ValuesSection.tsx`
- **Status**: Not imported or used anywhere in the codebase
- **Features**: Interactive 3-card carousel with Framer Motion animations
- **Reason for Removal**: Not actively used, was optimized for performance but had no impact since it's unused
- **Last Modified**: January 2025

### NewsCarousel.tsx

- **Original Location**: `src/components/NewsCarousel.tsx`
- **Status**: Deleted (was using Swiper library)
- **Features**: News carousel with Swiper.js
- **Reason for Removal**: Unused component, Swiper dependency removed for bundle size optimization
- **Last Modified**: January 2025

### Teams.tsx

- **Original Location**: `src/components/Teams.tsx`
- **Status**: Deprecated - marked with `@deprecated` tag
- **Features**: Server component wrapper for teams listing
- **Reason for Removal**: Redundant - functionality replaced by `src/app/teams/page.tsx` which uses `ClientTeams` directly
- **Moved**: November 14, 2025

## Test Pages

### test-admin-view/

- **Original Location**: `src/app/test-admin-view/page.tsx`
- **Status**: Test page for admin view demonstration
- **Features**: Mock admin interface for testing `AdminOverviewContent` component
- **Reason for Removal**: Test/development page, not needed in production
- **Moved**: November 14, 2025

### test-coach-view/

- **Original Location**: `src/app/test-coach-view/page.tsx`
- **Status**: Test page for coach view demonstration
- **Features**: Mock coach interface for testing `CoachPlayersView` component
- **Reason for Removal**: Test/development page, not needed in production
- **Moved**: November 14, 2025

### test-auth/

- **Original Location**: `src/app/test-auth/page.tsx`
- **Status**: Test page for authentication testing
- **Features**: CSRF token testing, authentication flow testing
- **Reason for Removal**: Test/development page, blocked in production environment
- **Moved**: November 14, 2025

### sentry-example-page/

- **Original Location**: `src/app/sentry-example-page/page.tsx`
- **Status**: Sentry error monitoring test page
- **Features**: Frontend error testing for Sentry integration
- **Reason for Removal**: Test/example page for Sentry setup, not needed in production
- **Moved**: November 14, 2025

## Documentation Files

### ModalTemplate.md

- **Original Location**: `src/components/ui/ModalTemplate.md`
- **Status**: Documentation file for ModalTemplate component
- **Features**: Comprehensive documentation and usage examples
- **Reason for Removal**: Documentation file, not a component. Component (`ModalTemplate.tsx`) is still active
- **Moved**: November 14, 2025

## Backup Files

This directory also contains various backup files:
- `coaches-dashboard.tsx` - Old dashboard implementation
- `page.tsx.backup` / `page.tsx.backup2` - Backup versions of admin pages
- `MessageBoard.tsx.backup2` - Backup of message board component
- `CoachProfile.tsx.backup` - Backup of coach profile component
- `layout.tsx.backup` - Backup of layout file
- `messageActions.ts.backup2` - Backup of message actions

## HTML/Template Files

Various HTML template files for reference:
- Email templates
- Handout templates
- Website structure documentation
- Cost estimate files

## Notes

- These components were identified during codebase cleanup and CodeRabbit review
- They can be restored if needed in the future
- Test pages are kept for development reference
- Backup files are preserved for historical reference
- All files moved on November 14, 2025 as part of comprehensive codebase cleanup
