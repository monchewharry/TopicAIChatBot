import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    ppr: true,
  },
  serverExternalPackages: ["pdf-parse"],
  images: {
    remotePatterns: [
      { hostname: 'avatar.vercel.sh' },
      {
        hostname: 'ycanbc2bciwbhqgv.public.blob.vercel-storage.com',
      },
    ],
  },
};

export default nextConfig;
