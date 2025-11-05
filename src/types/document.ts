import { DocumentReference, Timestamp } from "firebase/firestore"

/**
 * Version history entry
 */
export interface VersionEntry {
  version: number
  timestamp: Timestamp
  userId: string
  userName: string
  changes?: string
}

/**
 * Document/Story interface - for collaborative writing
 * Flattened structure for optimal Firestore performance
 */
export interface Document {
  id?: string
  ref?: DocumentReference

  // Ownership and access control
  owner: string
  readAccess: string[]
  writeAccess: string[]

  // Denormalized author data (names of all users with write access)
  authorNames?: string[]    // Display names of owner + writeAccess users

  // Public/private visibility
  isPublic: boolean

  // Basic information
  title: string
  description?: string
  slug?: string // URL-friendly version of title

  // Timestamps
  created: Timestamp
  lastUpdated: Timestamp
  lastUpdatedBy: string

  // Categorization
  tags?: string[]

  // Archive status
  isArchived: boolean

  // Version control (optional for future use)
  version?: number

  // Engagement metrics for trending algorithm
  viewCount?: number
  lastViewed?: Timestamp
  trendingScore?: number // Computed field for efficient queries
  trendingLastComputed?: Timestamp
}
