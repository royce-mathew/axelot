"use client"

import { useState, useEffect, useRef } from "react"
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  Grid,
  Alert,
  Stack,
} from "@mui/material"
import { Search as SearchIcon } from "@mui/icons-material"
import { StoryCard, StoryCardProps } from "@/components/StoryCard"
import { StoryCardSkeleton } from "@/components/StoryCardSkeleton"

type SortMode = "trending" | "recent" | "all"

export default function DiscoverPage() {
  const [sortMode, setSortMode] = useState<SortMode>("trending")
  const [searchQuery, setSearchQuery] = useState("")
  const [stories, setStories] = useState<StoryCardProps[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Cache for stories by sort mode
  const storiesCache = useRef<Record<SortMode, StoryCardProps[] | null>>({
    trending: null,
    recent: null,
    all: null,
  })

  // Fetch stories whenever sort mode or search changes
  useEffect(() => {
    const fetchStories = async () => {
      // If we have cached data for this sort mode and no search query, use it immediately
      if (!searchQuery && storiesCache.current[sortMode]) {
        setStories(storiesCache.current[sortMode]!)
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      try {
        const params = new URLSearchParams({
          sort: sortMode,
          limit: "20",
          ...(searchQuery ? { search: searchQuery } : {}),
        })

        const res = await fetch(`/api/stories/discover?${params}`)
        if (!res.ok) throw new Error("Failed to fetch stories")

        const data = await res.json()
        const fetchedStories = data.stories || []

        setStories(fetchedStories)

        // Update cache if not searching
        if (!searchQuery) {
          storiesCache.current[sortMode] = fetchedStories
        }
      } catch (err) {
        console.error("Error fetching stories:", err)
        setError("Failed to load stories. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    // Debounce search
    const timer = setTimeout(fetchStories, searchQuery ? 500 : 0)
    return () => clearTimeout(timer)
  }, [sortMode, searchQuery])

  const handleTabChange = (
    _event: React.SyntheticEvent,
    newValue: SortMode
  ) => {
    setSortMode(newValue)
  }

  const heroStory = stories[0]
  const gridStories = stories.slice(1)

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", py: 4 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Stack spacing={3} sx={{ mb: 4 }}>
          <Typography
            variant="h3"
            component="h1"
            fontWeight="bold"
            sx={{ fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" } }}
          >
            Discover Stories
          </Typography>

          {/* Tabs and Search */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            alignItems={{ xs: "stretch", sm: "center" }}
            justifyContent="space-between"
          >
            <Tabs
              value={sortMode}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                "& .MuiTabs-indicator": {
                  height: 3,
                },
              }}
            >
              <Tab label="🔥 Trending" value="trending" />
              <Tab label="🕒 Recent" value="recent" />
              <Tab label="📚 All" value="all" />
            </Tabs>

            <TextField
              size="small"
              placeholder="Search stories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{
                minWidth: { xs: "100%", sm: 250 },
              }}
            />
          </Stack>
        </Stack>

        {/* Error state */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Loading state */}
        {loading && (
          <Box>
            {/* Hero skeleton */}
            <Box sx={{ mb: 4 }}>
              <StoryCardSkeleton variant="hero" />
            </Box>

            {/* Grid skeletons */}
            <Grid container spacing={3}>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
                  <StoryCardSkeleton />
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* Empty state */}
        {!loading && stories.length === 0 && (
          <Box
            sx={{
              textAlign: "center",
              py: 8,
            }}
          >
            <Typography variant="h5" color="text.secondary" gutterBottom>
              {searchQuery ? "No stories found" : "No public stories yet"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {searchQuery
                ? "Try adjusting your search query"
                : "Be the first to publish a public story!"}
            </Typography>
          </Box>
        )}

        {/* Content */}
        {!loading && stories.length > 0 && (
          <Box>
            {/* Hero story */}
            {heroStory && (
              <Box sx={{ mb: 4 }}>
                <StoryCard {...heroStory} variant="hero" />
              </Box>
            )}

            {/* Story grid */}
            <Grid container spacing={3}>
              {gridStories.map((story) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={story.id}>
                  <StoryCard {...story} />
                </Grid>
              ))}
            </Grid>

            {/* Footer message */}
            {stories.length > 0 && (
              <Typography
                variant="body2"
                color="text.secondary"
                textAlign="center"
                sx={{ mt: 4 }}
              >
                Showing {stories.length}{" "}
                {stories.length === 1 ? "story" : "stories"}
              </Typography>
            )}
          </Box>
        )}
      </Container>
    </Box>
  )
}
