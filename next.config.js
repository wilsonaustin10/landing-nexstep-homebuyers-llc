/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  env: {
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  },
  // Enable static optimization
  reactStrictMode: true,
  poweredByHeader: false,
  
  // Performance optimizations
  compress: true,
  optimizeFonts: true,
  swcMinify: true,
  
  // Experimental performance features
  experimental: {
    optimizePackageImports: ['@heroicons/react'],
  },
  // Configure image domains if needed
  images: {
    domains: ['localhost', 'offer.goservebig.com', 'firebasestorage.googleapis.com'],
  },
  // Add domain for Maps API
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: `frame-ancestors 'self' https://offer.goservebig.com`
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      }
    ]
  }
}

module.exports = nextConfig