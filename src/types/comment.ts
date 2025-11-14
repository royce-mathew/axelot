import { DocumentReference, Timestamp } from "firebase/firestore"

export interface CommentDoc {
  id?: string
  ref?: DocumentReference
  storyId: string
  parentId: string | null
  authorId: string
  authorName: string
  authorImage?: string
  content: string
  createdAt: Timestamp
  updatedAt: Timestamp
  likeCount: number
  replyCount: number
}
