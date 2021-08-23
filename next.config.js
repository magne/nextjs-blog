const withPlugins = require('next-compose-plugins')
const withPWA = require('next-pwa')
const runtimeCaching = require('next-pwa/cache')
const withImages = require('next-images')

/** @type {import('next').NextConfig} */
const nextConfig = {
  target: 'serverless',
  reactStrictMode: true
  // Prefer loading of ES Modules over CommonJS
  // experimental: { esmExternals: true }
}

const config = withPlugins(
  [
    [
      withImages,
      {
        name: '[name]-[hash].[ext]',
        esModule: true
      }
    ],
    [
      withPWA,
      {
        pwa: {
          disable: process.env.NODE_ENV === 'development',
          dest: 'public',
          runtimeCaching
        }
      }
    ]
  ],
  nextConfig
)

module.exports = config
