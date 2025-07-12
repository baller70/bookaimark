/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Disabled for better dev performance
  pageExtensions: ['ts', 'tsx', 'js', 'jsx'],
  
  // Production output configuration for Docker
  output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined,
  
  // Development performance optimizations
  experimental: {
    serverMinification: process.env.NODE_ENV === 'production',
    optimizeCss: process.env.NODE_ENV === 'production',
  },
  
  // Disable problematic features in development
  compress: false,
  poweredByHeader: false,
  
  // Webpack optimizations for faster dev builds
  webpack: (config, { dev }) => {
    if (dev) {
      // Faster builds in development
      config.optimization.splitChunks = false;
      config.optimization.providedExports = false;
      config.optimization.usedExports = false;
      
      // Faster file watching
      config.watchOptions = {
        poll: false,
        aggregateTimeout: 300,
      };
    }
    
    return config;
  },
  
  // Image optimization
  images: {
    formats: ['image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  typescript: {
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig;
