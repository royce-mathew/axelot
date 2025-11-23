import { Box } from "@mui/material"
import { FeaturesSection } from "@/components/home/FeaturesSection"
import { Footer } from "@/components/home/Footer"
import { HeroSection } from "@/components/home/HeroSection"

export default function Home() {
  return (
    <Box sx={{ minHeight: "100vh" }}>
      <HeroSection />
      <FeaturesSection />
      <Footer />
    </Box>
  )
}
