# WCSv2.0 Security

## Security Measures

- **Content-Security-Policy (CSP)**: Restricts scripts, styles, fonts, images, and connections to trusted sources (self, Supabase).
- **X-Frame-Options**: DENY prevents clickjacking.
- **Strict-Transport-Security (HSTS)**: Enforces HTTPS for 1 year, subdomains, preload.
- **X-Content-Type-Options**: nosniff blocks MIME type sniffing.
- **X-XSS-Protection**: 1; mode=block mitigates XSS attacks.

## Security Headers
- **Content-Security-Policy (CSP)**: Restricts scripts, styles, fonts, images, and connections to trusted sources (self, Supabase).
- **X-Frame-Options**: DENY prevents clickjacking.
- **Strict-Transport-Security (HSTS)**: Enforces HTTPS for 1 year, subdomains, preload.
- **X-Content-Type-Options**: nosniff blocks MIME type sniffing.
- **X-XSS-Protection**: 1; mode=block mitigates XSS attacks.

## Future Plans

- **Supabase RLS**: Restrict data access (e.g., coach-only teams).
- **Input Sanitization**: Use sanitize-html for user inputs.
- **COPPA Compliance**: Add consent forms for minors.
- **Vulnerability Reporting**: Email phronesis2025@example.com for issues.

## Current Status

- Headers applied, no known vulnerabilities.
