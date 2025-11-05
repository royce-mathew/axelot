"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button, Box, Typography } from "@mui/material"

export type ErrorBoundaryProps = {
  error: (Error & { digest?: string }) | { message: string }
  reset?: () => void
  rerouteUrl?: string
}

export function ErrorBoundary({
  error,
  reset,
  rerouteUrl,
}: ErrorBoundaryProps) {
  const router = useRouter() // Use router for navigation

  function handleReset() {
    if (reset) {
      reset()
    } else {
      router.push(rerouteUrl || "/")
    }
  }

  return (
    <Box 
      component="main" 
      sx={{ 
        display: 'flex', 
        width: '100%', 
        height: '100vh',
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        gap: 2.5, 
        p: 2.5 
      }}
    >
      <Image
        title="Error"
        width={350}
        height={350}
        alt="Surprised Pikachu"
        style={{ borderRadius: '8px' }}
        src="/images/Error.gif"
        unoptimized
      />
      <Box sx={{ textAlign: 'center' }}>
        <Typography 
          variant="h1" 
          sx={{ 
            fontSize: { xs: '3rem', lg: '3rem' }, 
            fontWeight: 700,
            letterSpacing: '-0.02em'
          }}
        >
          Unexpected Error
        </Typography>
        <Typography 
          variant="body2" 
          sx={{ 
            fontSize: '0.75rem', 
            fontStyle: 'italic', 
            color: 'text.secondary' 
          }}
        >
          Please contact the developer regarding this error.
        </Typography>
        <Typography 
          variant="h3" 
          color="primary" 
          sx={{ 
            mt: 2, 
            letterSpacing: '-0.01em' 
          }}
        >
          {error.message || "Something went wrong - Undefined Error"}
        </Typography>
        <Button
          variant="outlined"
          color="primary"
          sx={{ mt: 2 }}
          onClick={handleReset}
        >
          Reset
        </Button>
      </Box>
    </Box>
  )
}
