/**
 * Utility functions for content operations
 */

import { Timestamp } from "firebase/firestore"
import { Document } from "@/types/document"

/**
 * Generate a URL-friendly slug from a title
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
    .substring(0, 100) // Limit length
}

/**
 * Create initial document data for new content
 */
export function createInitialDocument(
  title: string,
  userId: string
): Partial<Document> {
  const now = Timestamp.now()
  return {
    title,
    slug: generateSlug(title),
    created: now,
    lastUpdated: now,
    lastUpdatedBy: userId,
    isArchived: false,
    version: 1,
    tags: [],
    owner: userId,
    writeAccess: [],
    readAccess: [],
    isPublic: false,
  }
}

/**
 * Check if user has write access to content
 */
export function hasWriteAccess(document: Document, userId: string): boolean {
  return document.owner === userId || document.writeAccess.includes(userId)
}

/**
 * Check if user has read access to content
 */
export function hasReadAccess(document: Document, userId: string): boolean {
  return (
    document.isPublic ||
    document.owner === userId ||
    document.writeAccess.includes(userId) ||
    document.readAccess.includes(userId)
  )
}

/**
 * Check if user has comment access to content
 */
export function hasCommentAccess(document: Document, userId: string): boolean {
  return (
    document.owner === userId ||
    document.writeAccess.includes(userId) ||
    document.readAccess.includes(userId)
  )
}

/**
 * Update document with new changes
 */
export function updateDocument(
  document: Document,
  userId: string,
  changes?: Partial<Document>
): Partial<Document> {
  const now = Timestamp.now()
  return {
    ...changes,
    lastUpdated: now,
    lastUpdatedBy: userId,
  }
}
