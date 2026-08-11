import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "zwozrghopacfmdbxokmk.supabase.co",
      },
    ],
  },
};

export default nextConfig;