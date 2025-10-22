'use client';

import { useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { Session } from 'next-auth';

export function useAuth(onChange?: (session: Session | null) => void) {
  const { data: session, status } = useSession();

  const isLoading = status === 'loading';
  const isAuthenticated = status === 'authenticated';

  // track previous session to detect changes
  const prevSessionRef = useRef(session);

  useEffect(() => {
    if (prevSessionRef.current !== session) {
      console.log('useAuth - session changed:', session);
      onChange?.(session ?? null);
      prevSessionRef.current = session;
    }
  }, [session, onChange]);

  return {
    user: session?.user ?? null,
    isAuthenticated,
    isLoading,
    session,
  };
}
