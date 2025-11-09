
import { useEffect, useRef } from 'react';
import { useAuth } from './use-auth';

/**
 * Hook to track document views for trending algorithm
 * Increments view count when a user views a document
 * Uses a ref to track if we've already counted this view in the current session
 */
// Pass firebaseToken from useSession to this hook
export function useDocumentView(documentId: string | undefined, userId: string | undefined) {
  const hasTrackedView = useRef(false);
  const { session } = useAuth();

  useEffect(() => {
    // Only track once per session
    if (!session?.firebaseToken) {
      return;
    }
    if (!documentId || hasTrackedView.current) {
      return;
    }


    const trackView = async () => {
      try {
        await fetch('/api/document/view', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(session?.firebaseToken ? { Authorization: `Bearer ${session.firebaseToken}` } : {}),
          },
          body: JSON.stringify({ documentId }),
        });
        console.log('Document view tracked successfully');
        hasTrackedView.current = true;
      } catch (error) {
        // Silently fail - view tracking is not critical
        console.debug('Failed to track view', error);
      }
    };

    // Small delay to avoid tracking accidental clicks/rapid navigation
    const timer = setTimeout(trackView, 10000); // 10 seconds

    return () => clearTimeout(timer);
  }, [documentId, userId, session?.firebaseToken]);
}
