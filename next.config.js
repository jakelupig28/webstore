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
      { source: '/studio', destination: '/Studio' },
      { source: '/thrdwrldprblmz', destination: '/Studio' },
      { source: '/Thrdwrldprblmz', destination: '/Studio' },
      { source: '/cart', destination: '/Cart' }
    ];
  }
};

module.exports = nextConfig;
