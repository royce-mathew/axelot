import type { Metadata, Viewport } from "next"
import { DM_Sans, Outfit } from "next/font/google"
import InitColorSchemeScript from "@mui/material/InitColorSchemeScript"
import { GoogleAnalytics } from "@next/third-parties/google"
import { Providers } from "@/components/Providers"
import "@/styles/globals.css"

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
})

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
})

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
}

export const metadata: Metadata = {
  title: "Axelot",
  description: "A place to read, write, and deepen your understanding",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body
        className={`${dmSans.variable} ${outfit.variable}`}
        style={{
          minHeight: "100vh",
          backgroundColor: "var(--mui-palette-background-default)",
        }}
      >
        <InitColorSchemeScript attribute="class" />
        <Providers>{children}</Providers>
      </body>
      {/* Google Analytics */}
      {process.env.NODE_ENV === "production" &&
        process.env.NEXT_PUBLIC_ANALYTICS_ID && (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_ANALYTICS_ID} />
        )}
    </html>
  )
}
