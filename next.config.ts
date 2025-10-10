import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  // ✅ Ignore ESLint errors during production build
  eslint: {
    ignoreDuringBuilds: true, // ignore ESLint errors
  },
  typescript: {
    ignoreBuildErrors: true, // IGNORE TS errors during build
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatarfiles.alphacoders.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com', // if using Google avatars
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'your-supabase-bucket-url.supabase.co', // if using Supabase storage
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
