/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' https: data:; connect-src 'self' https://api.mainnet-beta.solana.com https://*.helius-rpc.com https://api.dexscreener.com;"
          }
        ]
      }
    ]
  }
}

export default nextConfig
