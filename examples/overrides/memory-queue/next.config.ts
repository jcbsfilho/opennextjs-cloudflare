import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/azion";

initOpenNextCloudflareForDev();

const nextConfig: NextConfig = {
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
