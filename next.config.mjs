import { createMDX } from "fumadocs-mdx/next"

// Added for Docker (standalone runtime):
// Setting output to "standalone" allows the Dockerfile to copy the
// minimal server files from .next/standalone for a slimmer image.
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  cacheComponents: true,
}

const withMDX = createMDX()

export default withMDX(nextConfig)
