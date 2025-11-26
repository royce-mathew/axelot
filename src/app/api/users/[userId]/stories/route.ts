import { connection, NextRequest, NextResponse } from "next/server"
import { firebaseAdminFirestore } from "@/lib/firebase/server"
import { extractPreview } from "@/lib/utils"
import { serializeDocument } from "@/lib/serializers/document"

// Cached function to fetch user's public stories
async function getUserStories(userId: string, page: number, pageSize: number) {
  "use cache"
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

// GET /api/users/[userId]/stories
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  await connection() // Exclude From PPR
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
