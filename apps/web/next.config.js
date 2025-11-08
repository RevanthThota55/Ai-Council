/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@ai-council/shared-types', '@ai-council/ui'],
  experimental: {
    typedRoutes: true,
  },
}

module.exports = nextConfig
