import { useEffect, useRef } from 'react';
import { doc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';

/**
 * Hook to track document views for trending algorithm
 * Increments view count when a user views a document
 * Uses a ref to track if we've already counted this view in the current session
 */
export function useDocumentView(documentId: string | undefined, userId: string | undefined) {
  const hasTrackedView = useRef(false);

  useEffect(() => {
    // Only track once per session
    if (!documentId || hasTrackedView.current) {
      return;
    }

    const trackView = async () => {
      try {
        const docRef = doc(db, 'stories', documentId);
        
        await updateDoc(docRef, {
          viewCount: increment(1),
          lastViewed: serverTimestamp(),
        });

        hasTrackedView.current = true;
      } catch (error) {
        // Silently fail - view tracking is not critical
        console.debug('Failed to track view:', error);
      }
    };

    // Small delay to avoid tracking accidental clicks/rapid navigation
    const timer = setTimeout(trackView, 2000); // 2 seconds

    return () => clearTimeout(timer);
  }, [documentId, userId]);
}
