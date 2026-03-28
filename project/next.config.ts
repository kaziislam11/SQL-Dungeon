import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Prevent sql.js from being bundled server-side
  serverExternalPackages: ['sql.js'],
}

export default nextConfig
