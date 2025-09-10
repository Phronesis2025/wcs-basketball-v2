# WCSv2.0 Security

## Security Measures

- **Content-Security-Policy (CSP)**: Restricts scripts, styles, fonts to 'self', allows Supabase (see `next.config.ts`).
- **X-Frame-Options**: DENY to prevent clickjacking.
- **HSTS**: 1 year, subdomains, preload for HTTPS.
- **X-Content-Type-Options**: nosniff to prevent MIME type sniffing.

## Future Plans

- **Supabase RLS**: Restrict data access (e.g., coach-only teams).
- **Input Sanitization**: Use sanitize-html for user inputs.
- **COPPA Compliance**: Add consent forms for minors.
- **Vulnerability Reporting**: Email phronesis2025@example.com for issues.

## Current Status

- Headers applied, no known vulnerabilities.
