import {
  addDoc,
  collection,
  doc,
  DocumentData,
  FirestoreDataConverter,
  query,
  QueryDocumentSnapshot,
  SnapshotOptions,
  where,
} from "firebase/firestore"

import { db } from "@/lib/firebase/client"
import { CommentDoc } from "@/types/comment"

const commentConverter: FirestoreDataConverter<CommentDoc> = {
  fromFirestore(
    snapshot: QueryDocumentSnapshot<DocumentData>,
    options: SnapshotOptions
  ): CommentDoc {
    const data = snapshot.data(options)
    return {
      id: snapshot.id,
      ref: snapshot.ref,
      storyId: data.storyId,
      parentId: data.parentId ?? null,
      authorId: data.authorId,
      authorName: data.authorName,
      authorImage: data.authorImage,
      content: data.content,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt ?? data.createdAt,
      likeCount: data.likeCount ?? 0,
      replyCount: data.replyCount ?? 0,
    }
  },
  toFirestore(c: CommentDoc): DocumentData {
    return {
      storyId: c.storyId,
      parentId: c.parentId ?? null,
      authorId: c.authorId,
      authorName: c.authorName,
      authorImage: c.authorImage,
      content: c.content,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
      likeCount: c.likeCount ?? 0,
      replyCount: c.replyCount ?? 0,
    }
  },
}

export const storyCommentsCollection = (storyId: string) =>
  collection(db, `stories/${storyId}/comments`).withConverter(commentConverter)

export const commentDocRef = (storyId: string, commentId: string) =>
  doc(db, `stories/${storyId}/comments/${commentId}`).withConverter(
    commentConverter
  )

export const topLevelCommentsQuery = (storyId: string) =>
  query(storyCommentsCollection(storyId), where("parentId", "==", null))

export const repliesQuery = (storyId: string, parentId: string) =>
  query(
    storyCommentsCollection(storyId),
    where("parentId", "==", parentId)
  )

export const likesCollection = (storyId: string, commentId: string) =>
  collection(db, `stories/${storyId}/comments/${commentId}/likes`)

export async function addCommentDoc(
  storyId: string,
  data: Omit<CommentDoc, "id" | "ref">
) {
  return addDoc(storyCommentsCollection(storyId), data)
}
