import { NextRequest, NextResponse } from "next/server"
import { firebaseAdminFirestore } from "@/lib/firebase/server"
import { SerializableDocument } from "@/types/document"
import { extractPreview } from "@/lib/utils"
import { serializeDocument } from "@/lib/serializers/document"

// Cached function to fetch trending stories with pagination
async function getTrendingStories(page: number, pageSize: number) {
  "use cache"
  const offset = page * pageSize

  // Fetch with Firestore ordering and limit
  const snapshot = await firebaseAdminFirestore
    .collection("stories")
    .where("isPublic", "==", true)
    .where("isArchived", "==", false)
    .orderBy("trendingScore", "desc")
    .limit(pageSize)
    .offset(offset)
    .get()

  if (snapshot.empty) {
    return []
  }

  // Map and process stories
  return snapshot.docs.map((doc) => {
    const data = doc.data()
    const serializedData = serializeDocument(doc.id, data)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const preview = extractPreview((data as any).content)

    return {
      ...serializedData,
      preview,
    }
  })
}

// GET /api/stories/trending
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get("page") || "0")
    const pageSize = parseInt(searchParams.get("pageSize") || "20")

    const stories = await getTrendingStories(page, pageSize)

    return NextResponse.json(
      {
        stories,
        hasMore: stories.length === pageSize,
      },
      {
        headers: {
          "Cache-Control": "s-maxage=600, stale-while-revalidate",
        },
      }
    )
  } catch (error) {
    console.error("Error fetching trending stories:", error)
    return NextResponse.json(
      { error: "Failed to fetch trending stories" },
      { status: 500 }
    )
  }
}
