import type { NextConfig } from "next"

// Added for Docker (standalone runtime):
// Setting output to "standalone" allows the Dockerfile to copy the
// minimal server files from .next/standalone for a slimmer image.
const nextConfig: NextConfig = {
  output: "standalone",
}

export default nextConfig
