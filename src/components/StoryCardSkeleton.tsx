import { Card, CardContent, Skeleton, Stack, Box } from "@mui/material"

export function StoryCardSkeleton({
  variant = "standard",
}: {
  variant?: "hero" | "standard"
}) {
  const isHero = variant === "hero"

  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        border: 1,
        borderColor: "divider",
      }}
    >
      <CardContent sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
        {/* Title skeleton */}
        <Skeleton variant="text" width="90%" height={isHero ? 40 : 32} />
        <Skeleton variant="text" width="70%" height={isHero ? 40 : 32} />

        {/* Author and metadata skeleton */}
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mt: 2 }}>
          <Skeleton variant="circular" width={28} height={28} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="60%" />
            <Skeleton variant="text" width="40%" />
          </Box>
        </Stack>
      </CardContent>
    </Card>
  )
}
