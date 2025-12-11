import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  reactStrictMode: true,
  typescript: {
    tsconfigPath: "./tsconfig.json",
  },
  allowedDevOrigins: [
    "http://localhost:3000",
    "https://814c3f9da701.ngrok-free.app",
  ],
  images: {
    remotePatterns: [
      { hostname: "cdn.shadcnstudio.com" },
      { hostname: "encrypted-tbn3.gstatic.com" },
      { hostname: "images.samsung.com" },
      { hostname: "cdn.shopify.com" },
      { hostname: "resource.logitech.com" },
      { hostname: "media.kabum.com.br" },
      { hostname: "cdn.labatida.com.br" },
      { hostname: "logi.place" },
      { hostname: "pisces.bbystatic.com" },
      { hostname: "static.tp-link.com" },
      { hostname: "media.kingston.com" },
    ],
  },
};

export default nextConfig;
