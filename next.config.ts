import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  reactStrictMode: true,
  typescript: {
    tsconfigPath: "./tsconfig.json",
  },
  images: {
    remotePatterns: [
      { hostname: "cdn.shadcnstudio.com" },
      {
        hostname: "encrypted-tbn3.gstatic.com",
      },
    ],
  },
};

export default nextConfig;
