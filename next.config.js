/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // API keys are read server-side in route handlers (process.env.OPENWEATHER_API_KEY);
  // nothing secret is inlined into the client bundle.
};

module.exports = nextConfig;
