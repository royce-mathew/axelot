"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Typography, Button, Container, Box, Stack, Link as MuiLink } from "@mui/material"
import { useRouter } from "next/navigation"
import ArrowForwardIcon from "@mui/icons-material/ArrowForward"
import CodeIcon from "@mui/icons-material/Code"
import FolderIcon from "@mui/icons-material/Folder"
import StarIcon from "@mui/icons-material/Star"
import GitHubIcon from "@mui/icons-material/GitHub"
import NumberFlow, { continuous } from "@number-flow/react"
import { Card } from "@mui/material"
import { useAuth } from "@/hooks/use-auth"

const HeroSection = () => {
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const [animatedStories, setAnimatedStories] = useState(0)
  const [animatedUsers, setAnimatedUsers] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedStories(1000)
      setAnimatedUsers(100)
    }, 50)
    return () => clearTimeout(timer)
  }, [])

  return (
    <Box
      sx={{
        position: "relative",
        minHeight: "90vh",
        display: "flex",
        alignItems: "center",
        overflow: "hidden",
        background: (theme) =>
          theme.palette.mode === "dark"
            ? "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(120, 119, 198, 0.3), transparent), linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.05) 100%)"
            : "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(120, 119, 198, 0.15), transparent)",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: "10%",
          left: "10%",
          width: 400,
          height: 400,
          background: "radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)",
          borderRadius: "50%",
          animation: "float 6s ease-in-out infinite",
          "@keyframes float": {
            "0%, 100%": { transform: "translateY(0px)" },
            "50%": { transform: "translateY(-20px)" },
          },
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: "10%",
          right: "10%",
          width: 300,
          height: 300,
          background: "radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 70%)",
          borderRadius: "50%",
          animation: "float 8s ease-in-out infinite",
          animationDelay: "1s",
        }}
      />

      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
        <Stack spacing={5} alignItems="center" textAlign="center">
          <Box
            sx={{
              animation: "fadeInUp 0.6s ease-out",
              animationDelay: "0.1s",
              animationFillMode: "both",
              "@keyframes fadeInUp": {
                "0%": { opacity: 0, transform: "translateY(20px)" },
                "100%": { opacity: 1, transform: "translateY(0)" },
              },
            }}
          >
            <Typography
              component="span"
              sx={{
                display: "inline-block",
                px: 2,
                py: 0.5,
                mb: { xs: 6, sm: 3 },
                borderRadius: "20px",
                bgcolor: "primary.main",
                color: "primary.contrastText",
                fontSize: "0.875rem",
                fontWeight: 600,
              }}
            >
              ✨ The future of developer documentation
            </Typography>
          </Box>

          <Box
            sx={{
              animation: "fadeInUp 0.6s ease-out",
              animationDelay: "0.2s",
              animationFillMode: "both",
            }}
          >
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: "2.5rem", sm: "3.5rem", md: "5rem" },
                fontWeight: 800,
                lineHeight: 1.1,
                letterSpacing: "-0.02em",
                maxWidth: 900,
                background: (theme) =>
                  theme.palette.mode === "dark"
                    ? "linear-gradient(135deg, #ffffff 0%, #a0a0a0 100%)"
                    : "linear-gradient(135deg, #1e40af 0%, #7c3aed 50%, #ec4899 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Write, Share, & Showcase Your Work
            </Typography>
          </Box>

          <Box
            sx={{
              animation: "fadeInUp 0.6s ease-out",
              animationDelay: "0.3s",
              animationFillMode: "both",
            }}
          >
            <Typography
              variant="h5"
              sx={{
                fontSize: { xs: "1.1rem", sm: "1.3rem", md: "1.5rem" },
                fontWeight: 400,
                lineHeight: 1.7,
                color: "text.secondary",
                maxWidth: "700px",
              }}
            >
              The all-in-one platform for developers to document their journey, collaborate in real-time, and build a
              stunning portfolio.
            </Typography>
          </Box>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            sx={{
              pt: 2,
              animation: "fadeInUp 0.6s ease-out",
              animationDelay: "0.4s",
              animationFillMode: "both",
            }}
          >
            <Button
              variant="contained"
              size="large"
              endIcon={<ArrowForwardIcon />}
              onClick={() => {
                // If already signed in, take the user to create/browse stories instead of auth
                if (isAuthenticated) {
                  router.push("/stories")
                } else {
                  router.push("/auth/sign-up")
                }
              }}
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: "12px",
                textTransform: "none",
                fontSize: "1.1rem",
                fontWeight: 600,
                boxShadow: "0 8px 24px rgba(59, 130, 246, 0.3)",
                "&:hover": {
                  boxShadow: "0 12px 32px rgba(59, 130, 246, 0.4)",
                },
              }}
            >
              Start Writing Free
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => router.push("/search")}
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: "12px",
                textTransform: "none",
                fontSize: "1.1rem",
                fontWeight: 600,
                borderWidth: 2,
                "&:hover": {
                  borderWidth: 2,
                },
              }}
            >
              Explore Stories
            </Button>
          </Stack>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={6}
            sx={{
              pt: 4,
              opacity: 0.8,
              animation: "fadeInUp 0.6s ease-out",
              animationDelay: "0.5s",
              animationFillMode: "both",
              "@keyframes fadeInUp": {
                "0%": { opacity: 0, transform: "translateY(20px)" },
                "100%": { opacity: 1, transform: "translateY(0)" },
              },
            }}
          >
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="h4" fontWeight={700} sx={{ fontVariantNumeric: "tabular-nums" }}>
                <NumberFlow value={animatedUsers} format={{ notation: "compact" }} plugins={[continuous]} />+
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active Writers
              </Typography>
            </Box>
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="h4" fontWeight={700} sx={{ fontVariantNumeric: "tabular-nums" }}>
                <NumberFlow value={animatedStories} format={{ notation: "compact" }} plugins={[continuous]} />+
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Stories Published
              </Typography>
            </Box>
          </Stack>
        </Stack>
      </Container>
    </Box>
  )
}

const FeatureCard = ({
  icon,
  title,
  description,
  index,
}: {
  icon: React.ReactNode
  title: string
  description: string
  index: number
}) => {
  return (
    <Card
      elevation={0}
      sx={{
        p: 3,
        height: "100%",
        borderRadius: 3,
        border: 1,
        borderColor: "divider",
        transition: "all 0.3s ease",
        animation: "fadeInUp 0.6s ease-out",
        animationDelay: `${0.6 + index * 0.1}s`,
        animationFillMode: "both",
        "@keyframes fadeInUp": {
          "0%": { opacity: 0, transform: "translateY(20px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        "&:hover": {
          borderColor: "primary.main",
          boxShadow: 3,
          transform: "translateY(-4px)",
        },
      }}
    >
      <Box
        className="feature-icon"
        sx={{
          mb: 3,
          width: 64,
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 3,
          background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
          color: "white",
          boxShadow: "0 8px 24px rgba(59, 130, 246, 0.3)",
          transition: "all 0.4s ease",
          "& svg": {
            fontSize: "2rem",
          },
        }}
      >
        {icon}
      </Box>
      <Typography
        variant="h5"
        sx={{
          fontWeight: 800,
          mb: 2,
          fontSize: "1.4rem",
          letterSpacing: "-0.01em",
        }}
      >
        {title}
      </Typography>
      <Typography
        variant="body1"
        sx={{
          color: "text.secondary",
          lineHeight: 1.8,
          fontSize: "1rem",
        }}
      >
        {description}
      </Typography>
    </Card>
  )
}

const FeaturesSection = () => {
  const features = [
    {
      icon: <CodeIcon />,
      title: "Rich Editor",
      description:
        "Write with a powerful editor supporting Markdown, syntax highlighting, tables, and real-time collaboration.",
    },
    {
      icon: <FolderIcon />,
      title: "Organized Workspace",
      description: "Keep all your documentation, notes, and projects organized in one beautiful, accessible space.",
    },
    {
      icon: <StarIcon />,
      title: "Public Portfolios",
      description: "Showcase your best work to the world. Share your knowledge and build your developer brand.",
    },
  ]

  return (
    <Box
      sx={{
        py: { xs: 12, md: 16 },
        bgcolor: "background.default",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: "20%",
          right: "-10%",
          width: 400,
          height: 400,
          background: "radial-gradient(circle, rgba(139, 92, 246, 0.08) 0%, transparent 70%)",
          borderRadius: "50%",
          filter: "blur(60px)",
          pointerEvents: "none",
        }}
      />

      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
        <Stack spacing={10}>
          <Box textAlign="center" sx={{ maxWidth: 850, mx: "auto" }}>
            <Typography
              component="span"
              sx={{
                display: "inline-block",
                px: 3,
                py: 1,
                mb: 3,
                borderRadius: "50px",
                border: 2,
                borderColor: "primary.main",
                color: "primary.main",
                fontSize: "0.875rem",
                fontWeight: 700,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
              }}
            >
              Features
            </Typography>
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: "2.25rem", sm: "3rem", md: "4rem" },
                fontWeight: 900,
                mb: 3,
                letterSpacing: "-0.02em",
                lineHeight: 1.1,
              }}
            >
              Everything you need to succeed
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: "text.secondary",
                fontWeight: 400,
                lineHeight: 1.75,
                fontSize: { xs: "1.1rem", md: "1.25rem" },
                letterSpacing: "-0.01em",
              }}
            >
              Professional tools designed for developers who want to create, share, and grow
            </Typography>
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
              gap: 4,
            }}
          >
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                index={index}
              />
            ))}
          </Box>
        </Stack>
      </Container>
    </Box>
  )
}

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 8,
        borderTop: "2px solid",
        borderColor: "divider",
        bgcolor: (theme) => (theme.palette.mode === "dark" ? "rgba(0, 0, 0, 0.2)" : "rgba(0, 0, 0, 0.02)"),
      }}
    >
      <Container maxWidth="lg" sx={{ position: "relative" }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          alignItems="center"
          justifyContent="center"
          spacing={{ xs: 2, sm: 0 }}
          sx={{ position: "relative" }}
        >
          <Box sx={{ position: { xs: "static", sm: "absolute" }, right: { sm: 8 }, top: { sm: 8 } }}>
            <MuiLink
              href="https://github.com/royce-mathew/axelot"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub repository"
              color="inherit"
              sx={{ display: "inline-flex", alignItems: "center", opacity: 0.8, "&:hover": { opacity: 1 } }}
            >
              <GitHubIcon fontSize="small" />
            </MuiLink>
          </Box>
          <Typography
            variant="body1"
            align="center"
            sx={{
              color: "text.secondary",
              fontSize: "0.95rem",
              fontWeight: 500,
              letterSpacing: "-0.01em",
            }}
          >
            © 2025 {" "}
            <MuiLink
              href="https://www.linkedin.com/in/royce-mathew/"
              target="_blank"
              rel="noopener noreferrer"
              underline="hover"
              color="inherit"
              sx={{ fontWeight: 600 }}
            >
              Royce Mathew
            </MuiLink>
            {" "} & {""}
            <MuiLink
              href="https://www.linkedin.com/in/sunny-patel-30b460204/"
              target="_blank"
              rel="noopener noreferrer"
              underline="hover"
              color="inherit"
              sx={{ fontWeight: 600 }}
            >
              Sunny Patel
            </MuiLink>
            . Built with{" "}
            <Box
              component="span"
              sx={{
                color: "#ec4899",
                display: "inline-block",
                animation: "heartbeat 1.5s ease-in-out infinite",
                "@keyframes heartbeat": {
                  "0%, 100%": { transform: "scale(1)" },
                  "10%, 30%": { transform: "scale(1.1)" },
                  "20%, 40%": { transform: "scale(1)" },
                },
              }}
            >
              ❤️
            </Box>{" "}
            for developers.
          </Typography>
        </Stack>
      </Container>
    </Box>
  )
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
