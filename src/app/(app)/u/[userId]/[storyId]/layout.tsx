import type { Metadata } from "next"
import { auth } from "@/auth"
import { firebaseAdminFirestore } from "@/lib/firebase/server"
import { SerializableDocument } from "@/types/document"
import { serializeDocument } from "@/lib/serializers/document"

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"

// Memoized function to fetch story data - prevents duplicate requests
async function getStory(storyId: string): Promise<SerializableDocument | null> {
  "use cache"
  try {
    const docSnap = await firebaseAdminFirestore
      .collection("stories")
      .doc(storyId)
      .get()

    if (!docSnap.exists) {
      return null
    }

    const data = docSnap.data()
    if (!data) return null

    // Use the centralized serializer
    return serializeDocument(docSnap.id, data)
  } catch (error) {
    console.error("Error fetching story for metadata:", error)
    return null
  }
}

type Props = {
  params: Promise<{ userId: string; storyId: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { userId, storyId: storyIdWithSlug } = await params

  // Extract storyId from the URL format: storyId-slug-text-here
  const storyId = storyIdWithSlug.includes("-")
    ? storyIdWithSlug.split("-")[0]
    : storyIdWithSlug

  const story = await getStory(storyId)

  // If story doesn't exist, return basic metadata
  if (!story) {
    return {
      title: "Story Not Found",
      description: "This story does not exist.",
      robots: {
        index: false,
        follow: false,
      },
    }
  }

  // Check if the story is private and user has access
  if (!story.isPublic) {
    // Get current user session
    const session = await auth()
    const currentUserId = session?.user?.id

    // Check if user has access to this private story
    const hasAccess =
      currentUserId &&
      (story.owner === currentUserId ||
        story.readAccess?.includes(currentUserId) ||
        story.writeAccess?.includes(currentUserId))

    // If user doesn't have access, return "not found" metadata
    if (!hasAccess) {
      return {
        title: "Story Not Found",
        description: "This story is private or does not exist.",
        robots: {
          index: false,
          follow: false,
        },
      }
    }

    // User has access to private story - show metadata but don't index
    const title = story.title || "Untitled Story"
    const description =
      story.description ||
      story.preview ||
      `Read "${title}" on Axelot - A collaborative storytelling platform.`

    return {
      title,
      description,
      robots: {
        index: false, // Don't index private stories
        follow: false,
      },
    }
  }

  const title = story.title || "Untitled Story"
  const description =
    story.description ||
    story.preview ||
    `Read "${title}" on Axelot - A collaborative storytelling platform.`
  const authors =
    story.authorNames && story.authorNames.length > 0
      ? story.authorNames.join(", ")
      : "Axelot Community"
  const slug = story.slug || "untitled"
  const url = `${BASE_URL}/u/${userId}/${storyId}-${slug}`

  return {
    title,
    description,
    authors: story.authorNames?.map((name) => ({ name })) || [
      { name: "Axelot Community" },
    ],
    openGraph: {
      title,
      description,
      type: "article",
      url,
      siteName: "Axelot",
      publishedTime: story.created?.toISOString(),
      modifiedTime: story.lastUpdated?.toISOString(),
      authors: story.authorNames || ["Axelot Community"],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}

export default function StoryLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
