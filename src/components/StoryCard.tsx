import Link from "next/link"
import {
  Card,
  CardContent,
  CardActionArea,
  Typography,
  Box,
  Stack,
} from "@mui/material"
import { Visibility as VisibilityIcon } from "@mui/icons-material"
import { timeAgo } from "@/lib/utils"
import { Timestamp } from "firebase/firestore"

export interface StoryCardProps {
  id: string
  title: string
  slug: string
  owner: string
  authorNames: string[]
  viewCount: number
  created: Timestamp
  lastUpdated: Timestamp
  preview?: string
  variant?: "hero" | "standard"
}

export function StoryCard({
  id,
  title,
  slug,
  owner,
  authorNames,
  viewCount,
  created,
  preview,
  variant = "standard",
}: StoryCardProps) {
  const storyUrl = `/u/${owner}/${id}-${slug}`
  const isHero = variant === "hero"

  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        border: 1,
        borderColor: "divider",
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          borderColor: "primary.main",
          transform: "translateY(-2px)",
          boxShadow: 2,
        },
      }}
    >
      <CardActionArea
        component={Link}
        href={storyUrl}
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
        }}
      >
        <CardContent
          sx={{
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            gap: 1.5,
          }}
        >
          {/* Title */}
          <Typography
            variant={isHero ? "h4" : "h6"}
            component="h2"
            sx={{
              fontWeight: 700,
              lineHeight: 1.3,
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: isHero ? 3 : 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            {title || "Untitled Story"}
          </Typography>

          {/* Preview Text */}
          {preview && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
                mb: 1,
              }}
            >
              {preview}
            </Typography>
          )}

          {/* Author and metadata */}
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{ mt: "auto", flexWrap: "wrap" }}
          >
            {/* Author name */}
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                maxWidth: "40%",
              }}
            >
              {authorNames[0] || "Anonymous"}
              {authorNames.length > 1 && ` +${authorNames.length - 1} Others`}
            </Typography>

            <Box
              sx={{
                flex: 1,
                minWidth: 0,
                display: "flex",
                justifyContent: "flex-end", // Aligns content to the right
                alignItems: "center",
                gap: 1,
              }}
            >
              {/* Time */}
              <Typography variant="caption" color="text.secondary">
                {timeAgo(created)}
              </Typography>

              <Typography variant="caption" color="text.secondary">
                •
              </Typography>

              {/* Views */}
              <Stack direction="row" spacing={0.5} alignItems="center">
                <VisibilityIcon
                  sx={{ fontSize: "0.875rem", color: "text.secondary" }}
                />
                <Typography variant="caption" color="text.secondary">
                  {viewCount.toLocaleString()}
                </Typography>
              </Stack>
            </Box>
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  )
}
