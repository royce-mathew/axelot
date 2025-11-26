import type { Metadata, Viewport } from "next"
import { DM_Sans, Outfit, EB_Garamond } from "next/font/google"
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

const ebGaramond = EB_Garamond({
  subsets: ["latin"],
  variable: "--font-eb-garamond",
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
  title: {
    default: "Axelot - Read, Write, and Deepen Your Understanding",
    template: "%s | Axelot",
  },
  description:
    "A collaborative storytelling platform where you can read, write, and deepen your understanding. Create and share stories with real-time collaboration.",
  keywords: [
    "collaborative writing",
    "storytelling",
    "real-time collaboration",
    "writing platform",
    "content creation",
    "stories",
    "creative writing",
  ],
  authors: [{ name: "Axelot" }],
  creator: "Axelot",
  publisher: "Axelot",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
  ),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Axelot",
    title: "Axelot - Read, Write, and Deepen Your Understanding",
    description:
      "A collaborative storytelling platform where you can read, write, and deepen your understanding. Create and share stories with real-time collaboration.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Axelot - Read, Write, and Deepen Your Understanding",
    description:
      "A collaborative storytelling platform where you can read, write, and deepen your understanding.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
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
        className={`${dmSans.variable} ${outfit.variable} ${ebGaramond.variable}`}
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
