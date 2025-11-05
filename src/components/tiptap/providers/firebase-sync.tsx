import { FirebaseApp } from "firebase/app"
import * as Y from "yjs"

import { FireProvider } from "@/lib/y-fire"

export type yProviderProps = {
  firebaseApp: FirebaseApp
  path: string
  ydoc?: Y.Doc
}

export const yProvider = ({ firebaseApp, path, ydoc }: yProviderProps) => {
  const doc = ydoc ?? new Y.Doc()

  return new FireProvider({
    firebaseApp: firebaseApp,
    path: path,
    ydoc: doc,
  })
}
