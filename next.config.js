const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['@sparticuz/chromium-min', 'puppeteer-core'],
  reactStrictMode: true,
  allowedDevOrigins: ['http://192.168.1.188:3000'],
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  webpack: (config, { isServer }) => {
    // Handle underscore dependency for mammoth
    config.resolve.fallback = {
      ...config.resolve.fallback,
      underscore: require.resolve('underscore'),
    }
    return config
  },
}

module.exports = withBundleAnalyzer(nextConfig);