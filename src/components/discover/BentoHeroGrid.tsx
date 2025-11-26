"use client"

import Link from "next/link"
import { Box, Typography, Stack, alpha } from "@mui/material"
import { Visibility as VisibilityIcon } from "@mui/icons-material"
import { StoryCardProps } from "@/components/StoryCard"
import { getGradientStyle } from "@/lib/gradient-generator"
import { timeAgo } from "@/lib/utils"

interface BentoHeroGridProps {
  stories: StoryCardProps[]
}

export function BentoHeroGrid({ stories }: BentoHeroGridProps) {
  if (stories.length === 0) return null

  const topStory = stories[0]
  const sideStories = stories.slice(1, 5)

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
        gap: 2,
        mb: 4,
      }}
    >
      {/* #1 Story - Left 50% */}
      <HeroCard story={topStory} variant="large" />

      {/* #2-5 Stories - Right 50% in 2x2 grid */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
          gap: 2,
        }}
      >
        {sideStories.map((story) => (
          <HeroCard key={story.id} story={story} variant="small" />
        ))}
      </Box>
    </Box>
  )
}

interface HeroCardProps {
  story: StoryCardProps
  variant: "large" | "small"
}

function HeroCard({ story, variant }: HeroCardProps) {
  const isLarge = variant === "large"
  const storyUrl = `/u/${story.owner}/${story.id}-${story.slug}`

  return (
    <Box
      component={Link}
      href={storyUrl}
      sx={{
        position: "relative",
        height: isLarge ? { xs: 300, md: 500 } : { xs: 200, sm: 240 },
        borderRadius: 2,
        overflow: "hidden",
        textDecoration: "none",
        transition: "transform 0.2s ease-in-out",
        "&:hover": {
          transform: "scale(1.02)",
        },
      }}
    >
      {/* Gradient Background */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          ...getGradientStyle(story.id),
        }}
      />

      {/* Overlay */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(to top, ${alpha("#000", 0.8)} 0%, ${alpha("#000", 0.3)} 50%, ${alpha("#000", 0.1)} 100%)`,
        }}
      />

      {/* Content */}
      <Stack
        spacing={1}
        sx={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          p: isLarge ? 3 : 2,
          color: "white",
        }}
      >
        <Typography
          variant={isLarge ? "h4" : "h6"}
          sx={{
            fontWeight: 700,
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: isLarge ? 3 : 2,
            WebkitBoxOrient: "vertical",
          }}
        >
          {story.title || "Untitled Story"}
        </Typography>

        {isLarge && story.preview && (
          <Typography
            variant="body2"
            sx={{
              opacity: 0.9,
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            {story.preview}
          </Typography>
        )}

        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          sx={{ opacity: 0.8 }}
        >
          <Typography variant="caption">
            {story.authorNames[0] || "Anonymous"}
          </Typography>
          <Typography variant="caption">•</Typography>
          <Typography variant="caption">{timeAgo(story.created)}</Typography>
          <Typography variant="caption">•</Typography>
          <Stack direction="row" spacing={0.5} alignItems="center">
            <VisibilityIcon sx={{ fontSize: "0.875rem" }} />
            <Typography variant="caption">
              {(story.viewCount || 0).toLocaleString()}
            </Typography>
          </Stack>
        </Stack>
      </Stack>
    </Box>
  )
}
