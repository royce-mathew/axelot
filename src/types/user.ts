export interface User {
  // The unique identifier of the document
  email: string
  emailVerified: boolean
  name: string
  image?: string // Profile image URL
}
