/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Point to the frontend directory for pages and components
  pageExtensions: ['ts', 'tsx', 'js', 'jsx'],
  // Removed deprecated options: swcMinify and experimental.appDir
  // swcMinify is enabled by default in Next.js 13+
  // appDir is now stable and enabled by default
}

module.exports = nextConfig 