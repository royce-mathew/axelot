import type { MetadataRoute } from "next"
import { firebaseAdminFirestore } from "@/lib/firebase/server"

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const sitemapEntries: MetadataRoute.Sitemap = []

  // Static routes
  sitemapEntries.push({
    url: BASE_URL,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 1,
  })

  sitemapEntries.push({
    url: `${BASE_URL}/discover`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 0.9,
  })

  // Dynamic routes - fetch all public stories using Firebase Admin SDK
  try {
    const storiesSnapshot = await firebaseAdminFirestore
      .collection("stories")
      .where("isPublic", "==", true)
      .get()

    storiesSnapshot.forEach((doc: FirebaseFirestore.QueryDocumentSnapshot) => {
      const data = doc.data()
      const slug = data.slug || "untitled"
      const userId = data.owner || "unknown"

      sitemapEntries.push({
        url: `${BASE_URL}/u/${userId}/${doc.id}-${slug}`,
        lastModified: data.lastUpdated?.toDate() || new Date(),
        changeFrequency: "weekly",
        priority: 0.7,
      })
    })
  } catch (error) {
    console.error("Error fetching public stories for sitemap:", error)
  }

  return sitemapEntries
}
