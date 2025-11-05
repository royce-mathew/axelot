"use client"

import { ErrorBoundary } from "@/components/Error"
import { Providers } from "@/components/Providers"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <head />
      <body
        style={{ 
          minHeight: '100vh', 
          backgroundColor: 'var(--mui-palette-background-default)',
        }}
      >
        <Providers>
          <ErrorBoundary error={error} reset={reset} />
        </Providers>
      </body>
    </html>
  )
}
