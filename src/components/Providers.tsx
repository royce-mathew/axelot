"use client"

import { useEffect } from "react"
import { signInWithCustomToken } from "firebase/auth"
import { Session } from "next-auth"
import { SessionProvider, useSession } from "next-auth/react"
import { ThemeProvider } from "@mui/material/styles"
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter"
import { CssBaseline } from "@mui/material"
import theme from "@/theme"
import { auth } from "@/lib/firebase/client"

async function syncFirebaseAuth(session: Session | null) {
  if (session && session.firebaseToken) {
    try {
      await signInWithCustomToken(auth, session.firebaseToken)
    } catch (error) {
      console.error("Error signing in with custom token:", error)
    }
  } else if (session === null && auth.currentUser) {
    await auth.signOut()
  }
}

function FirebaseAuthSynchronize() {
  const { data: session } = useSession()

  useEffect(() => {
    if (!session) return
    syncFirebaseAuth(session)
  }, [session])

  return null
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AppRouterCacheProvider options={{ enableCssLayer: true }}>
      <ThemeProvider theme={theme} defaultMode="system">
        <SessionProvider>
          <FirebaseAuthSynchronize />
          <CssBaseline />
          {children}
        </SessionProvider>
      </ThemeProvider>
    </AppRouterCacheProvider>
  )
}
