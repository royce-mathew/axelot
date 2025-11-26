export interface User {
  // The unique identifier of the document (Firebase Auth ID)
  email: string
  emailVerified: boolean
  name: string
  image?: string // Profile image URL
  username?: string // Unique username for profile URLs (e.g., @username)
  bio?: string // User bio/description
  created?: Date
  updated?: Date
}
