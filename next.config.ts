import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cms.yourblogbyosge.com",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "8055",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "8055",
      },
    ],
  },
};

export default nextConfig;
