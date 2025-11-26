import type { MetadataRoute } from "next"

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/settings",
          "/auth/sign-in",
          "/auth/sign-up",
          "/auth/verify-email",
          "/stories", // Private user stories page
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  }
}
