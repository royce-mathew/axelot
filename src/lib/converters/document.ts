import {
  collection,
  doc,
  DocumentData,
  FirestoreDataConverter,
  query,
  QueryDocumentSnapshot,
  SnapshotOptions,
  where,
} from "firebase/firestore"

import { Document } from "@/types/document"
import { db } from "@/lib/firebase/client"

const documentConverter: FirestoreDataConverter<Document> = {
  fromFirestore(
    snapshot: QueryDocumentSnapshot<DocumentData>,
    options: SnapshotOptions
  ): Document {
    const data = snapshot.data(options)
    return {
      id: snapshot.id,
      ref: snapshot.ref,
      owner: data.owner,
      writeAccess: data.writeAccess,
      readAccess: data.readAccess,
      content: data.content,
      metadata: {
        title: data.metadata.title,
        created: data.metadata.created,
        lastUpdated: data.metadata.lastUpdated,
        lastUpdatedBy: data.metadata.lastUpdatedBy,
        lastOpened: data.metadata.lastOpened,
      },
    }
  },
  toFirestore(document: Document): DocumentData {
    const doc: Document = {
      content: document.content,
      owner: document.owner,
      writeAccess: document.writeAccess,
      readAccess: document.readAccess,
      metadata: {
        title: document.metadata.title,
        created: document.metadata.created,
        lastUpdated: document.metadata.lastUpdated,
        lastUpdatedBy: document.metadata.lastUpdatedBy,
        lastOpened: document.metadata.lastOpened,
      },
    }
    return doc
  },
}

export const documentRef = (documentId?: string) =>
  doc(db, `documents/${documentId}`).withConverter(documentConverter)

export const documentsByOwnerRef = (ownerId: string) =>
  query(
    collection(db, "documents"),
    where("owner", "==", ownerId)
  ).withConverter(documentConverter)

export const allDocumentsRef = () =>
  collection(db, "documents").withConverter(documentConverter)
