"use server"

import { Timestamp } from "firebase/firestore"
import { firebaseAdminFirestore } from "@/lib/firebase/server"

interface StoryData {
  id: string
  owner: string
  authorNames?: string[]
  title: string
  description?: string
  slug?: string
  created: Timestamp
  lastUpdated: Timestamp
  tags?: string[]
  viewCount?: number
  trendingScore?: number
  isPublic: boolean
  readAccess: string[]
  writeAccess: string[]
  lastUpdatedBy: string
  isArchived: boolean
}

export async function getHomepageStories() {
  try {
    const storiesRef = firebaseAdminFirestore.collection("stories")

    // Fetch recently published public stories
    const recentSnapshot = await storiesRef
      .where("isPublic", "==", true)
      .orderBy("created", "desc")
      .limit(6)
      .get()

    // Fetch trending stories (pre-computed by cron job)
    // The cron job updates trendingScore field periodically
    const trendingSnapshot = await storiesRef
      .where("isPublic", "==", true)
      .orderBy("trendingScore", "desc")
      .limit(6)
      .get()

    const recentDocs = recentSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as StoryData[]

    const trendingDocs = trendingSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as StoryData[]

    return {
      recent: recentDocs,
      trending: trendingDocs,
    }
  } catch (error) {
    console.error("Error fetching homepage stories:", error)
    return {
      recent: [],
      trending: [],
    }
  }
}
