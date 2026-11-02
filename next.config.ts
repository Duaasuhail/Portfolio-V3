import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [{ source: "/felt.", destination: "/felt" }];
  },
};

export default nextConfig;
