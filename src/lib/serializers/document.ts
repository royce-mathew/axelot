import { Document, SerializableDocument } from "@/types/document"
import { Timestamp } from "firebase/firestore"

/**
 * Serializes a Firestore Document to a SerializableDocument
 * Converts all Timestamp fields to Date objects
 */
export function serializeDocument(
  docId: string,
  data: Document | any
): SerializableDocument {
  return {
    id: docId,
    owner: data.owner || "",
    readAccess: data.readAccess || [],
    writeAccess: data.writeAccess || [],
    authorNames: data.authorNames || [],
    isPublic: data.isPublic || false,
    title: data.title || "",
    description: data.description || "",
    slug: data.slug || "",
    // Convert Timestamps to Dates
    created:
      data.created instanceof Timestamp
        ? data.created.toDate()
        : data.created?.toDate?.() || new Date(data.created || Date.now()),
    lastUpdated:
      data.lastUpdated instanceof Timestamp
        ? data.lastUpdated.toDate()
        : data.lastUpdated?.toDate?.() ||
          new Date(data.lastUpdated || Date.now()),
    lastUpdatedBy: data.lastUpdatedBy || "",
    tags: data.tags || [],
    isArchived: data.isArchived || false,
    version: data.version,
    viewCount: data.viewCount || 0,
    lastViewed:
      data.lastViewed instanceof Timestamp
        ? data.lastViewed.toDate()
        : data.lastViewed?.toDate?.() ||
          (data.lastViewed ? new Date(data.lastViewed) : undefined),
    trendingScore: data.trendingScore,
    trendingLastComputed:
      data.trendingLastComputed instanceof Timestamp
        ? data.trendingLastComputed.toDate()
        : data.trendingLastComputed?.toDate?.() ||
          (data.trendingLastComputed
            ? new Date(data.trendingLastComputed)
            : undefined),
    preview: data.preview,
  }
}
