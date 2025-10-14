import {
  collection,
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
      ownedDocuments: data.ownedDocuments,
    }
  },
  toFirestore(document: User): DocumentData {
    const doc: User = {
      email: document.email,
      emailVerified: document.emailVerified,
      name: document.name,
      ownedDocuments: document.ownedDocuments,
    }
    return doc
  },
}

export const userRef = (userId: string) =>
  doc(db, `users/${userId}`).withConverter(userDataConverter)
