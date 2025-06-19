/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Point to the frontend directory for pages and components
  pageExtensions: ['ts', 'tsx', 'js', 'jsx'],
  experimental: {
    appDir: true // Enable App Router
  }
}

module.exports = nextConfig 