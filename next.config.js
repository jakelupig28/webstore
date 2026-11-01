/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.shopify.com' },
      { protocol: 'https', hostname: 'tmptempcloudstorage.io' }
    ]
  },
  async rewrites() {
    return [
      { source: '/collections', destination: '/Collections' },
      { source: '/collections/:handle', destination: '/Collections/:handle' },
      { source: '/lookbook', destination: '/Lookbook' },
      { source: '/studio', destination: '/Thrdwrldprblmz' },
      { source: '/Studio', destination: '/Thrdwrldprblmz' },
      { source: '/cart', destination: '/Cart' }
    ];
  }
};

module.exports = nextConfig;
