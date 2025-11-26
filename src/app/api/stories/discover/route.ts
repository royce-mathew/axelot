import { NextRequest, NextResponse } from "next/server"
import { firebaseAdminFirestore } from "@/lib/firebase/server"
import { SerializableDocument, type Document } from "@/types/document"
import { extractPreview } from "@/lib/utils"
import { serializeDocument } from "@/lib/serializers/document"

// Cache duration based on mode (in seconds)
const CACHE_DURATION = {
  all: 600, // 10 minutes
  foryou: 600, // 10 minutes (trending)
  fresh: 120, // 2 minutes
}

// Cached function to fetch stories based on mode with pagination
async function getCachedStories(mode: string, page: number, pageSize: number) {
  "use cache"
  const offset = page * pageSize

  let query = firebaseAdminFirestore
    .collection("stories")
    .where("isPublic", "==", true)
    .where("isArchived", "==", false)

  // Apply ordering based on mode
  if (mode === "fresh") {
    query = query.orderBy("created", "desc")
  } else if (mode === "foryou") {
    query = query.orderBy("trendingScore", "desc")
  } else {
    query = query.orderBy("lastUpdated", "desc")
  }

  // Apply pagination
  const snapshot = await query.limit(pageSize).offset(offset).get()

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

// GET /api/stories/discover
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const mode = searchParams.get("mode") || "all"
    const page = parseInt(searchParams.get("page") || "0")
    const pageSize = parseInt(searchParams.get("pageSize") || "20")
    const search = searchParams.get("search") || ""

    // If searching, handle differently (fetch more, filter client-side)
    if (search) {
      // For search, we need to fetch more and filter
      // This is less efficient but necessary without a search index
      const allStories = await getCachedStories(mode, 0, 100) // Fetch first 100

      const searchLower = search.toLowerCase()
      const filteredStories = allStories.filter((story) =>
        story.title.toLowerCase().includes(searchLower)
      )

      const startIndex = page * pageSize
      const paginatedStories = filteredStories.slice(
        startIndex,
        startIndex + pageSize
      )

      return NextResponse.json({
        stories: paginatedStories,
        total: filteredStories.length,
        hasMore: startIndex + pageSize < filteredStories.length,
      })
    }

    // Normal pagination
    const stories = await getCachedStories(mode, page, pageSize)

    const result = {
      stories,
      hasMore: stories.length === pageSize,
    }

    // Set revalidate header based on mode
    const revalidate =
      CACHE_DURATION[mode as keyof typeof CACHE_DURATION] || CACHE_DURATION.all

    return NextResponse.json(result, {
      headers: {
        "Cache-Control": `s-maxage=${revalidate}, stale-while-revalidate`,
      },
    })
  } catch (error) {
    console.error("Error fetching discover stories:", error)
    return NextResponse.json(
      { error: "Failed to fetch stories" },
      { status: 500 }
    )
  }
}
