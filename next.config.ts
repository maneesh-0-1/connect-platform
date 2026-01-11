import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Suppress "Cross origin request detected" warning for local network access
    // @ts-ignore
    allowedDevOrigins: ["localhost:3000", "192.168.1.1:3000", "192.168.29.246:3000"],
  },
};

export default nextConfig;
