# Unused Components

This folder contains components that are not currently being used in the active codebase but are kept for reference or potential future use.

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

## Notes

- These components were identified during performance optimization
- They can be restored if needed in the future
- All optimizations made to these components were unnecessary since they weren't being used
- The main performance improvements came from optimizing active components (Hero.tsx, etc.)
