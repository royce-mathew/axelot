import {
  doc,
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
    }
  },
  toFirestore(document: User): DocumentData {
    const doc: Partial<User> = {
      email: document.email,
      emailVerified: document.emailVerified,
      name: document.name,
    }
    if (document.image) {
      doc.image = document.image
    }
    return doc
  },
}

export const userRef = (userId: string) =>
  doc(db, `users/${userId}`).withConverter(userDataConverter)
