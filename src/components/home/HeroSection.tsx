"use client"

import ArrowForwardIcon from "@mui/icons-material/ArrowForward"
import FormatBoldIcon from "@mui/icons-material/FormatBold"
import FormatItalicIcon from "@mui/icons-material/FormatItalic"
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted"
import CodeIcon from "@mui/icons-material/Code"
import LinkIcon from "@mui/icons-material/Link"
import { Box, Button, Container, Stack, Typography } from "@mui/material"

const FloatingIcon = ({
  icon,
  delay,
  top,
  left,
  right,
  bottom,
}: {
  icon: React.ReactNode
  delay: number
  top?: string
  left?: string
  right?: string
  bottom?: string
}) => {
  return (
    <Box
      sx={{
        position: "absolute",
        top,
        left,
        right,
        bottom,
        color: "text.secondary",
        opacity: 0.2,
        animation: "float 8s ease-in-out infinite",
        animationDelay: `${delay}s`,
        "@keyframes float": {
          "0%, 100%": { transform: "translate(0, 0) rotate(0deg)" },
          "25%": { transform: "translate(10px, -10px) rotate(5deg)" },
          "50%": { transform: "translate(0, -20px) rotate(0deg)" },
          "75%": { transform: "translate(-10px, -10px) rotate(-5deg)" },
        },
        "& svg": {
          fontSize: "3rem",
        },
      }}
    >
      {icon}
    </Box>
  )
}

export const HeroSection = () => {
  return (
    <Box
      sx={[
        {
          position: "relative",
          minHeight: "90vh",
          display: "flex",
          alignItems: "center",
          overflow: "hidden",
          bgcolor: "background.default",
          // Notetaking aesthetic: notebook lines
          backgroundImage:
            "linear-gradient(rgba(0, 0, 0, 0.05) 1px, transparent 2px)",
          backgroundSize: "100% 40px",
        },
        (theme) =>
          theme.applyStyles("dark", {
            backgroundImage:
              "linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1.5px)",
          }),
      ]}
    >
      {/* Floating Icons */}
      <FloatingIcon icon={<FormatBoldIcon />} delay={0} top="15%" left="10%" />
      <FloatingIcon
        icon={<FormatItalicIcon />}
        delay={2}
        top="20%"
        right="15%"
      />
      <FloatingIcon icon={<CodeIcon />} delay={4} bottom="20%" left="15%" />
      <FloatingIcon
        icon={<FormatListBulletedIcon />}
        delay={1}
        bottom="25%"
        right="10%"
      />
      <FloatingIcon icon={<LinkIcon />} delay={3} top="40%" left="5%" />

      <Container
        maxWidth="lg"
        sx={{
          position: "relative",
          zIndex: 1,
          pt: { xs: 8, sm: 10 },
        }}
      >
        <Stack spacing={5} alignItems="center" textAlign="center">
          <Box
            sx={{
              animation: "fadeInUp 0.8s ease-out",
              animationFillMode: "both",
            }}
          >
            <Typography
              variant="h1"
              sx={{
                fontFamily: "var(--font-eb-garamond)",
                fontSize: { xs: "3.5rem", sm: "4.5rem", md: "6rem" },
                fontWeight: 500,
                lineHeight: 1.1,
                letterSpacing: "-0.02em",
                maxWidth: 1000,
                color: "text.primary",
                mb: 2,
              }}
            >
              Write, Share, & Showcase Your Work
            </Typography>
          </Box>

          <Box
            sx={{
              animation: "fadeInUp 0.8s ease-out",
              animationDelay: "0.2s",
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
                fontFamily: "var(--font-dm-sans)",
              }}
            >
              The all-in-one platform for developers to document their journey,
              collaborate in real-time, and build a stunning portfolio.
            </Typography>
          </Box>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            sx={{
              pt: 2,
              animation: "fadeInUp 0.8s ease-out",
              animationDelay: "0.4s",
              animationFillMode: "both",
            }}
          >
            <Button
              variant="contained"
              size="large"
              endIcon={<ArrowForwardIcon />}
              href="/auth/sign-up"
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: "8px",
                textTransform: "none",
                fontSize: "1.1rem",
                fontWeight: 500,
                boxShadow: "none",
                border: "1px solid",
                borderColor: "primary.main",
                "&:hover": {
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                },
              }}
            >
              Start Writing Free
            </Button>
            <Button
              variant="outlined"
              size="large"
              href="https://r0yce.com/projects/axelot"
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: "8px",
                textTransform: "none",
                fontSize: "1.1rem",
                fontWeight: 500,
                borderWidth: 1,
                "&:hover": {
                  borderWidth: 1,
                  bgcolor: "action.hover",
                },
              }}
            >
              Documentation
            </Button>
          </Stack>
        </Stack>
      </Container>
    </Box>
  )
}
