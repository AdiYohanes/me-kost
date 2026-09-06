import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "100.120.220.47",
    "192.168.18.106",
    "127.0.0.1",
    "*.ts.net",
  ],
};

export default nextConfig;
