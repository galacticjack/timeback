/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'web.archive.org',
      },
    ],
  },
  async rewrites() {
    return [
      {
        // Proxy CDX API to avoid CORS issues
        source: '/api/cdx/:path*',
        destination: 'https://web.archive.org/cdx/search/:path*',
      },
    ]
  },
}

module.exports = nextConfig
