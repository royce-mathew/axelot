"use client"

import CodeIcon from "@mui/icons-material/Code"
import FolderIcon from "@mui/icons-material/Folder"
import StarIcon from "@mui/icons-material/Star"
import { Box, Card, Container, Stack, Typography } from "@mui/material"

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

export const FeaturesSection = () => {
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
      description:
        "Keep all your documentation, notes, and projects organized in one beautiful, accessible space.",
    },
    {
      icon: <StarIcon />,
      title: "Public Portfolios",
      description:
        "Showcase your best work to the world. Share your knowledge and build your developer brand.",
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
          background:
            "radial-gradient(circle, rgba(139, 92, 246, 0.08) 0%, transparent 70%)",
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
              Professional tools designed for developers who want to create,
              share, and grow
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
