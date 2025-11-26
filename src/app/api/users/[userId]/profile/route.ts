import { NextRequest, NextResponse } from "next/server"
import { firebaseAdminFirestore } from "@/lib/firebase/server"

// Cached function to fetch user profile
async function getUserProfile(userId: string) {
  "use cache"
  const userDoc = await firebaseAdminFirestore
    .collection("users")
    .doc(userId)
    .get()

  if (!userDoc.exists) {
    return null
  }

  const data = userDoc.data()
  return {
    id: userDoc.id,
    name: data?.name || null,
    username: data?.username || null,
    bio: data?.bio || null,
    image: data?.image || null,
    email: data?.email || null,
  }
}

// GET /api/users/[userId]/profile
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params

    const profile = await getUserProfile(userId)

    if (!profile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(
      { profile },
      {
        headers: {
          "Cache-Control": "s-maxage=600, stale-while-revalidate",
        },
      }
    )
  } catch (error) {
    console.error("Error fetching user profile:", error)
    return NextResponse.json(
      { error: "Failed to fetch user profile" },
      { status: 500 }
    )
  }
}
