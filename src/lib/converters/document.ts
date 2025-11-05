import {
  collection,
  doc,
  DocumentData,
  FirestoreDataConverter,
  or,
  query,
  QueryDocumentSnapshot,
  SnapshotOptions,
  where,
} from "firebase/firestore"

import { Document } from "@/types/document"
import { db } from "@/lib/firebase/client"

/**
 * Firestore converter for Story/Document
 * Uses flattened structure for optimal query performance
 */
const documentConverter: FirestoreDataConverter<Document> = {
  fromFirestore(
    snapshot: QueryDocumentSnapshot<DocumentData>,
    options: SnapshotOptions
  ): Document {
    const data = snapshot.data(options)
    return {
      id: snapshot.id,
      ref: snapshot.ref,
      owner: data.owner,
      writeAccess: data.writeAccess || [],
      readAccess: data.readAccess || [],
      isPublic: data.isPublic ?? false,
      title: data.title || "Untitled",
      description: data.description,
      slug: data.slug,
      created: data.created,
      lastUpdated: data.lastUpdated,
      lastUpdatedBy: data.lastUpdatedBy,
      tags: data.tags || [],
      isArchived: data.isArchived ?? false,
      version: data.version || 1,
      // Denormalized author names
      authorNames: data.authorNames || [],
      // Trending algorithm fields
      viewCount: data.viewCount,
      lastViewed: data.lastViewed,
      trendingScore: data.trendingScore,
      trendingLastComputed: data.trendingLastComputed,
    }
  },
  toFirestore(document: Document): DocumentData {
    const data: DocumentData = {
      owner: document.owner,
      writeAccess: document.writeAccess,
      readAccess: document.readAccess,
      isPublic: document.isPublic,
      title: document.title,
      created: document.created,
      lastUpdated: document.lastUpdated,
      lastUpdatedBy: document.lastUpdatedBy,
      tags: document.tags || [],
      isArchived: document.isArchived,
      version: document.version || 1,
    }

    // Optional fields - only include if defined
    if (document.slug !== undefined) {
      data.slug = document.slug
    }
    
    if (document.description !== undefined) {
      data.description = document.description
    }

    // Trending fields - only include if defined
    if (document.viewCount !== undefined) {
      data.viewCount = document.viewCount
    }

    if (document.lastViewed !== undefined) {
      data.lastViewed = document.lastViewed
    }

    if (document.trendingScore !== undefined) {
      data.trendingScore = document.trendingScore
    }

    if (document.trendingLastComputed !== undefined) {
      data.trendingLastComputed = document.trendingLastComputed
    }

    // Denormalized author names - only include if defined
    if (document.authorNames !== undefined) {
      data.authorNames = document.authorNames
    }
    
    return data
  },
}

/**
 * Get a reference to a specific story/document
 */
export const documentRef = (documentId?: string) =>
  doc(db, `stories/${documentId}`).withConverter(documentConverter)

/**
 * Get a query for all stories/documents owned by a user or shared with them
 */
export const documentsByOwnerRef = (ownerId: string) =>
  query(
    collection(db, "stories"),
    or(
      where("owner", "==", ownerId),
      where("writeAccess", "array-contains", ownerId)
    )
  ).withConverter(documentConverter)

/**
 * Get a query for all published public stories/documents
 */
export const publicDocumentsRef = () =>
  query(
    collection(db, "stories"),
    where("isPublic", "==", true)
  ).withConverter(documentConverter)

/**
 * Get a reference to all stories/documents collection
 */
export const allDocumentsRef = () =>
  collection(db, "stories").withConverter(documentConverter)
