import { DocumentMetadata } from "@/types/document"

export interface User {
  // The unique identifier of the document
  email: string
  emailVerified: boolean
  name: string

  // List of documents owned by the user
  ownedDocuments: DocumentMetadata[]
}
