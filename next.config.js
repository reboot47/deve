/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // 最新版Next.jsとの互換性問題を修正
    serverActions: true,
    serverComponentsExternalPackages: ['bcrypt'],
    esmExternals: 'loose',
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, must-revalidate',
          },
          {
            key: 'Connection',
            value: 'keep-alive',
          },
        ],
      },
    ];
  },
  httpAgentOptions: {
    keepAlive: true,
  },
  webpack: (config) => {
    config.externals = [...(config.externals || []), 'bcrypt'];
    return config;
  },
  // 静的ファイルへのアクセスを許可
  images: {
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/uploads/**',
      },
    ],
    unoptimized: true,
  },
};

module.exports = nextConfig;
