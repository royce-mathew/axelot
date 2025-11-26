import { NextRequest, NextResponse } from "next/server"
import { firebaseAdminFirestore } from "@/lib/firebase/server"
import { type Document } from "@/types/document"
import { unstable_cache } from "next/cache"
import { extractPreview } from "@/lib/utils"

// Cached function to fetch user's public stories
const getUserStories = unstable_cache(
  async (userId: string, page: number, pageSize: number) => {
    const offset = page * pageSize

    const snapshot = await firebaseAdminFirestore
      .collection("stories")
      .where("owner", "==", userId)
      .where("isPublic", "==", true)
      .orderBy("lastUpdated", "desc")
      .limit(pageSize)
      .offset(offset)
      .get()

    if (snapshot.empty) {
      return []
    }

    return snapshot.docs.map((doc) => {
      const data: Document = doc.data() as Document
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const preview = extractPreview((data as any).content)

      return {
        id: doc.id,
        title: data.title || "Untitled",
        slug: data.slug || "",
        owner: data.owner,
        authorNames: data.authorNames || [],
        viewCount: data.viewCount || 0,
        trendingScore: data.trendingScore || 0,
        isPublic: data.isPublic,
        isArchived: data.isArchived,
        created: data.created,
        lastUpdated: data.lastUpdated,
        lastViewed: data.lastViewed,
        preview,
      }
    })
  },
  ["user-stories"],
  {
    tags: ["user-stories"],
  }
)

// GET /api/users/[userId]/stories
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get("page") || "0")
    const pageSize = parseInt(searchParams.get("pageSize") || "20")

    const stories = await getUserStories(userId, page, pageSize)

    return NextResponse.json(
      {
        stories,
        hasMore: stories.length === pageSize,
      },
      {
        headers: {
          "Cache-Control": "s-maxage=300, stale-while-revalidate",
        },
      }
    )
  } catch (error) {
    console.error("Error fetching user stories:", error)
    return NextResponse.json(
      { error: "Failed to fetch user stories" },
      { status: 500 }
    )
  }
}
