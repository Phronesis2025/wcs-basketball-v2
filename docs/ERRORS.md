# WCSv2.0 Errors Log

## Last Updated

September 09, 2025, 07:12 PM CDT

## Recorded Issues

- **Tailwind Export Error**:
  - **Date**: September 2025 (initial setup).
  - **Description**: "Package path ./components is not exported from package .../node_modules/tailwindcss" during `npm run build`.
  - **Cause**: Tailwind v4+ export restrictions, possibly from plugins.
  - **Fix**: Downgraded to Tailwind 3.3.3, removed `tailwindcss-animate`.
  - **Status**: Resolved in fresh setup.
- **Geist Font Error**:
  - **Date**: September 2025.
  - **Description**: "Unknown font `Geist`" in `layout.tsx`, 500 error on `/`.
  - **Cause**: Next.js default template or cache clash with local fonts.
  - **Fix**: Cleared cache, removed `next/font` references.
  - **Status**: Resolved.
- **Hydration Mismatch**:
  - **Date**: September 2025.
  - **Description**: Browser extension added `className="translated-ltr"` to `<html>`, breaking SSR.
  - **Fix**: Tested in incognito, suggested disabling extensions.
  - **Status**: Resolved.
- **EBUSY Error**:
  - **Date**: September 2025.
  - **Description**: "EBUSY: resource busy or locked" during build cleanup.
  - **Cause**: File lock in .next/export (Explorer/antivirus).
  - **Fix**: Manually delete .next, restart PC.
  - **Status**: Resolved.
- **Build Lock Warning**:
  - **Date**: September 2025.
  - **Description**: npm cleanup failed for @unrs/resolver-binding-linux-arm-gnueabihf.
  - **Cause**: Resource lock during install.
  - **Fix**: Restart, clear node_modules.
  - **Status**: Resolved.

## Notes

- Check console/network tab for new errors.
- Log any 404s (e.g., font files) or build failures here.
