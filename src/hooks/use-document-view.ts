import { useEffect, useRef } from "react"
import { auth } from "@/lib/firebase/client"
import { useAuth } from "./use-auth"

/**
 * Hook to track document views for trending algorithm
 * Increments view count when an authenticated user views a document
 * Uses a ref to track if we've already counted this view in the current session
 * Only tracks views for authenticated users to prevent spam/abuse
 */
export function useDocumentView(documentId: string | undefined) {
  const hasTrackedView = useRef(false)
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    // Only track for authenticated users
    if (!isAuthenticated || !documentId || !auth.currentUser) {
      return
    }

    // Only track once per session
    if (hasTrackedView.current) {
      return
    }

    const trackView = async () => {
      try {
        // Get the Firebase ID token from the current user
        const idToken = await auth.currentUser?.getIdToken()

        if (!idToken) {
          console.debug("No ID token available")
          return
        }

        await fetch("/api/document/view", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({ documentId }),
        })
        console.log("Document view tracked successfully")
        hasTrackedView.current = true
      } catch (error) {
        // Silently fail - view tracking is not critical
        console.debug("Failed to track view", error)
      }
    }

    // Small delay to avoid tracking accidental clicks/rapid navigation
    const timer = setTimeout(trackView, 10000) // 10 seconds

    return () => clearTimeout(timer)
  }, [documentId, isAuthenticated])
}
