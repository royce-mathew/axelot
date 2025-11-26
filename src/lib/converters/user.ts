import {
  doc,
  collection,
  DocumentData,
  FirestoreDataConverter,
  QueryDocumentSnapshot,
  SnapshotOptions,
} from "firebase/firestore"

import { User } from "@/types/user"
import { db } from "@/lib/firebase/client"

const userDataConverter: FirestoreDataConverter<User> = {
  fromFirestore(
    snapshot: QueryDocumentSnapshot<DocumentData>,
    options: SnapshotOptions
  ): User {
    const data: DocumentData = snapshot.data(options)
    return {
      email: data.email,
      emailVerified: data.emailVerified,
      name: data.name,
      image: data.image,
      username: data.username,
      bio: data.bio,
      created: data.created?.toDate(),
      updated: data.updated?.toDate(),
    }
  },
  toFirestore(document: User): DocumentData {
    const doc: Partial<User> = {
      email: document.email,
      emailVerified: document.emailVerified,
      name: document.name,
      updated: new Date(),
    }
    if (document.image) {
      doc.image = document.image
    }
    if (document.username) {
      doc.username = document.username
    }
    if (document.bio) {
      doc.bio = document.bio
    }
    if (document.created) {
      doc.created = document.created
    }
    return doc
  },
}

export const userRef = (userId: string) =>
  doc(db, `users/${userId}`).withConverter(userDataConverter)

export const usersCollectionRef = () =>
  collection(db, "users").withConverter(userDataConverter)
