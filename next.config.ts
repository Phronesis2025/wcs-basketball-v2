const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value:
      "default-src 'self'; " +
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'; " +
      "style-src 'self' 'unsafe-inline'; " +
      "font-src 'self' data:; " +
      "img-src 'self' data: https://*.supabase.co; " +
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co;",
  },
  { key: "X-Frame-Options", value: "DENY" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains; preload",
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-XSS-Protection", value: "1; mode=block" }, // Added for XSS prevention
];

module.exports = {
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
  images: {
    domains: ["*.supabase.co"],
  },
  sentry: {
    hideSourceMaps: true,
    autoInstrumentServerFunctions: true,
    autoInstrumentClientSide: true,
  },
};
