"use client"

import { useEffect, useState } from "react"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "@/lib/firebase/client"

/**
 * Tracks whether Firebase client SDK auth state has been determined.
 * Resolves the race condition where NextAuth session loads before
 * Firebase signInWithCustomToken completes, causing Firestore
 * permission errors on queries/writes that require isSignedIn().
 */
export function useFirebaseReady() {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, () => {
      setReady(true)
    })
    return unsubscribe
  }, [])

  return ready
}
