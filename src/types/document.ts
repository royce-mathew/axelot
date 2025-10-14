import { DocumentData, DocumentReference, Timestamp } from "firebase/firestore"

export interface DocumentMetadata {
  title: string
  created: Timestamp
  lastOpened: Timestamp
  lastUpdated: Timestamp
  lastUpdatedBy: string
}

export interface Document {
  id?: string // ID of the document

  // The unique identifier of the document
  ref?: DocumentReference // The reference to the document

  // Ownerhsip and sharing information
  owner: string
  readAccess: string[]
  writeAccess: string[]

  // Metadata of the document
  metadata: DocumentMetadata

  // The data of the document
  content: object | null
}
