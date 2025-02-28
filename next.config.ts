import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "web.wetab.link",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
