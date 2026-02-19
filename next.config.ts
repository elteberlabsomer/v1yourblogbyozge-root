import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [320, 360, 384, 412, 430, 512, 640, 750, 828, 960, 1080, 1200, 1440],
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
