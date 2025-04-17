import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  devIndicators: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  // Vercel部署优化配置
  poweredByHeader: false,
  compress: true,
  reactStrictMode: true,
  // 输出优化
  output: "standalone",
  // 缓存优化
  experimental: {
    edgeRuntime: true,
    runtime: "experimental-edge",
    optimizePackageImports: ["@/components", "@/lib"],
  },
};

export default nextConfig;
