/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    domains: [
      'localhost',
      'supabase.co',
    ],
    unoptimized: true,
  },
  // Fix for Vercel build trace collection stack overflow
  experimental: {
    outputFileTracingExcludes: {
      '*': [
        'node_modules/@swc/**',
        'node_modules/@esbuild/**',
        'node_modules/esbuild/**',
        'node_modules/terser/**',
        'node_modules/webpack/**',
      ],
    },
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig