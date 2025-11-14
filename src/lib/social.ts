import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  setDoc,
  Timestamp,
  writeBatch,
} from "firebase/firestore"
import { db } from "@/lib/firebase/client"

export async function isFollowing(followerId: string, targetUserId: string) {
  const followingDoc = doc(db, `users/${followerId}/following/${targetUserId}`)
  const snap = await getDoc(followingDoc)
  return snap.exists()
}

export async function followUser(followerId: string, targetUserId: string, followerName?: string, followerImage?: string, targetName?: string, targetImage?: string) {
  if (followerId === targetUserId) return
  const batch = writeBatch(db)

  const followerFollowingRef = doc(db, `users/${followerId}/following/${targetUserId}`)
  const targetFollowersRef = doc(db, `users/${targetUserId}/followers/${followerId}`)

  batch.set(followerFollowingRef, {
    userId: targetUserId,
    userName: targetName ?? "",
    userImage: targetImage ?? "",
    createdAt: Timestamp.now(),
  })

  batch.set(targetFollowersRef, {
    userId: followerId,
    userName: followerName ?? "",
    userImage: followerImage ?? "",
    createdAt: Timestamp.now(),
  })

  await batch.commit()
}

export async function unfollowUser(followerId: string, targetUserId: string) {
  if (followerId === targetUserId) return
  const batch = writeBatch(db)
  batch.delete(doc(db, `users/${followerId}/following/${targetUserId}`))
  batch.delete(doc(db, `users/${targetUserId}/followers/${followerId}`))
  await batch.commit()
}

export function followersCollection(userId: string) {
  return collection(db, `users/${userId}/followers`)
}

export function followingCollection(userId: string) {
  return collection(db, `users/${userId}/following`)
}
