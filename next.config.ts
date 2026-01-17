import type { NextConfig } from "next";

const nextConfig = {
  serverActions: {
    bodySizeLimit: '5mb',
  },
} as any;

export default nextConfig;
