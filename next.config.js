/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ensure static files are served correctly
  output: 'standalone',
  
  // Optimize images
  images: {
    domains: [],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  
  // Ensure proper handling of static assets
  experimental: {
    optimizePackageImports: ['framer-motion'],
  },
};

module.exports = nextConfig;

