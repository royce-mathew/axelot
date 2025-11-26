import { NextRequest, NextResponse } from "next/server"
import { firebaseAdminFirestore } from "@/lib/firebase/server"
import { type Document } from "@/types/document"
import { Timestamp } from "firebase-admin/firestore"

import * as Y from "yjs"

// GET /api/stories/discover
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const sort = searchParams.get("sort") || "trending" // trending, recent, all
    const limit = parseInt(searchParams.get("limit") || "20")
    const search = searchParams.get("search") || ""

    // Fetch all public stories
    const storiesQuery = firebaseAdminFirestore
      .collection("stories")
      .where("isPublic", "==", true)

    // Execute query
    const snapshot = await storiesQuery.get()

    if (snapshot.empty) {
      console.log("No public stories found")
      return NextResponse.json({ stories: [], total: 0 })
    }

    console.log(`Found ${snapshot.docs.length} public stories`)

    // Map firestore docs to story objects and filter out archived
    const stories = snapshot.docs
      .filter((doc) => !doc.data().isArchived) // Filter archived in memory
      .map((doc) => {
        const data: Document = doc.data() as Document

        // Extract preview from Yjs content if available
        let preview = ""
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const content = (data as any).content

        if (content) {
          try {
            // Convert Firestore Bytes to Uint8Array
            // Note: firebase-admin returns Buffer for Bytes, which Yjs handles
            const update = content.toUint8Array
              ? content.toUint8Array()
              : content

            const ydoc = new Y.Doc()
            Y.applyUpdate(ydoc, update)

            // Extract text from default fragment (Tiptap standard)
            // We use XML fragment to get the structure
            const fragment = ydoc.getXmlFragment("default")
            const xmlString = fragment.toString()

            // Strip XML tags to get plain text
            const plainText = xmlString.replace(/<[^>]+>/g, " ")

            // Clean up whitespace and slice
            preview = plainText.replace(/\s+/g, " ").trim().slice(0, 300)
          } catch (e) {
            console.error(`Error extracting preview for story ${doc.id}:`, e)
          }
        }

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
          preview, // Add preview to response
        }
      })

    // Filter by search if provided
    let filteredStories = stories
    if (search) {
      const searchLower = search.toLowerCase()
      filteredStories = stories.filter((story) =>
        story.title.toLowerCase().includes(searchLower)
      )
    }

    // Sort based on sort parameter
    let sortedStories = [...filteredStories]

    if (sort === "trending") {
      // Sort by pre-calculated trending score from cronjob
      sortedStories.sort((a, b) => b.trendingScore - a.trendingScore)
    } else if (sort === "recent") {
      // Sort by creation date (Timestamp comparison works directly)
      sortedStories.sort((a, b) => {
        if (!a.created) return 1
        if (!b.created) return -1
        if (
          !(a.created instanceof Timestamp) ||
          !(b.created instanceof Timestamp)
        )
          return 0
        return b.created.toMillis() - a.created.toMillis()
      })
    } else {
      // "all" - sort by last updated
      sortedStories.sort((a, b) => {
        if (!a.lastUpdated) return 1
        if (!b.lastUpdated) return -1
        if (
          !(a.lastUpdated instanceof Timestamp) ||
          !(b.lastUpdated instanceof Timestamp)
        )
          return 0
        return b.lastUpdated.toMillis() - a.lastUpdated.toMillis()
      })
    }

    // Apply limit
    const paginatedStories = sortedStories.slice(0, limit)

    return NextResponse.json({
      stories: paginatedStories,
      total: filteredStories.length,
    })
  } catch (error) {
    console.error("Error fetching discover stories:", error)
    return NextResponse.json(
      { error: "Failed to fetch stories" },
      { status: 500 }
    )
  }
}
