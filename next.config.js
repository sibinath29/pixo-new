/** @type {import('next').NextConfig} */
const nextConfig = {
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

