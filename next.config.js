/**
 * Content-Security-Policy for this dashboard.
 *
 * `'unsafe-inline'` on script-src is unavoidable: Next injects inline bootstrap
 * scripts. Removing it would need a nonce threaded through the document via
 * middleware. Stating the reason rather than implying the policy is stricter
 * than it is.
 *
 * `img-src` allows OpenWeatherMap's icon CDN and CryptoCompare's article
 * images; `connect-src` is 'self' only, because every upstream call goes
 * through this app's own /api route handlers.
 */
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https://openweathermap.org https://*.cryptocompare.com https://assets.coingecko.com",
  "font-src 'self' data:",
  "connect-src 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "base-uri 'none'",
  "object-src 'none'",
  'upgrade-insecure-requests',
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: csp },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
  // No feature in this dashboard needs any of these.
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Responses already say what they are; this header only aids fingerprinting.
  poweredByHeader: false,
  // API keys are read server-side in route handlers
  // (process.env.OPENWEATHER_API_KEY); nothing secret is inlined into the
  // client bundle, and CI asserts that by grepping the built output.
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

module.exports = nextConfig;
