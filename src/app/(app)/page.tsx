import type { Metadata } from "next"
import { Box } from "@mui/material"
import { FeaturesSection } from "@/components/home/FeaturesSection"
import { Footer } from "@/components/home/Footer"
import { HeroSection } from "@/components/home/HeroSection"

export const metadata: Metadata = {
  title: "Home",
  description:
    "Discover Axelot, a collaborative storytelling platform where you can read, write, and deepen your understanding. Create and share stories with real-time collaboration.",
  openGraph: {
    title: "Axelot - Collaborative Storytelling Platform",
    description:
      "Read, write, and deepen your understanding with Axelot's collaborative storytelling platform.",
    type: "website",
  },
}

export default function Home() {
  return (
    <Box sx={{ minHeight: "100vh" }}>
      <HeroSection />
      <FeaturesSection />
      <Footer />
    </Box>
  )
}
