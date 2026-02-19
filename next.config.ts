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
  async headers() {
    return [
      {
        source: "/blog/:slug*",
        headers: [
          {
            key: "X-Frame-Options",
            value: "ALLOW-FROM https://cms.yourblogbyosge.com",
          },
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors 'self' https://cms.yourblogbyosge.com",
          },
        ],
      },
    ];
  },
};

export default nextConfig;