import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The app is intentionally exposed to this LAN address during development.
  // This also permits Next's development-only HMR WebSocket origin check.
  allowedDevOrigins: ["192.168.1.32"],
};

export default nextConfig;
