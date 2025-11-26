"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import {
  Box,
  Container,
  Typography,
  Stack,
  CircularProgress,
} from "@mui/material"
import { BentoHeroGrid } from "@/components/discover/BentoHeroGrid"
import {
  DiscoverNavigation,
  DiscoverMode,
} from "@/components/discover/DiscoverNavigation"
import { StoryCard, StoryCardProps } from "@/components/StoryCard"

export default function DiscoverPage() {
  const [mode, setMode] = useState<DiscoverMode>("all")
  const [stories, setStories] = useState<StoryCardProps[]>([])
  const [heroStories, setHeroStories] = useState<StoryCardProps[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(0)
  const [heroLoaded, setHeroLoaded] = useState(false)

  // Client-side cache for each tab's data
  const tabCache = useRef<Record<DiscoverMode, StoryCardProps[] | null>>({
    all: null,
    foryou: null,
    fresh: null,
  })

  // Track which tabs have been loaded
  const tabsLoaded = useRef<Record<DiscoverMode, boolean>>({
    all: false,
    foryou: false,
    fresh: false,
  })

  // Fetch hero stories once on mount
  useEffect(() => {
    const fetchHero = async () => {
      try {
        const res = await fetch("/api/stories/trending?page=0&pageSize=5")
        if (!res.ok) throw new Error("Failed to fetch hero stories")

        const data = await res.json()
        setHeroStories(data.stories || [])
        setHeroLoaded(true)
      } catch (err) {
        console.error("Error fetching hero stories:", err)
        setHeroLoaded(true)
      }
    }

    fetchHero()
  }, [])

  // Fetch stories for current mode
  const fetchStories = useCallback(
    async (currentPage: number, reset = false) => {
      // If resetting and we have cached data for this mode, use it
      if (reset && tabCache.current[mode]) {
        setStories(tabCache.current[mode]!)
        setLoading(false)
        setHasMore(false) // Already loaded all for this tab
        return
      }

      if (reset) {
        setLoading(true)
      } else {
        setLoadingMore(true)
      }

      try {
        const params = new URLSearchParams({
          mode,
          page: currentPage.toString(),
          pageSize: "20",
        })

        const res = await fetch(`/api/stories/discover?${params}`)
        if (!res.ok) throw new Error("Failed to fetch stories")

        const data = await res.json()
        const fetchedStories = data.stories || []

        if (reset) {
          setStories(fetchedStories)
          // Cache the first page for this tab
          tabCache.current[mode] = fetchedStories
          tabsLoaded.current[mode] = true
        } else {
          const newStories = [...stories, ...fetchedStories]
          setStories(newStories)
          // Update cache with accumulated stories
          tabCache.current[mode] = newStories
        }

        setHasMore(data.hasMore || false)
      } catch (err) {
        console.error("Error fetching stories:", err)
      } finally {
        setLoading(false)
        setLoadingMore(false)
      }
    },
    [mode, stories]
  )

  // Load stories when mode changes
  useEffect(() => {
    setPage(0)
    setHasMore(true)
    fetchStories(0, true)
  }, [mode])

  // Handle mode change
  const handleModeChange = (newMode: DiscoverMode) => {
    setMode(newMode)
  }

  // Load more for infinite scroll
  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      const nextPage = page + 1
      setPage(nextPage)
      fetchStories(nextPage, false)
    }
  }, [page, loadingMore, hasMore, fetchStories])

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Hero Bento Grid - Only renders once on mount */}
        {heroLoaded && heroStories.length > 0 && (
          <Box sx={{ mb: 4 }}>
            <BentoHeroGrid stories={heroStories} />
          </Box>
        )}

        {/* Sticky Navigation */}
        <DiscoverNavigation value={mode} onChange={handleModeChange} />

        {/* Content with top spacing */}
        <Box sx={{ mt: 3 }}>
          {/* Loading state - only show on initial load, not when switching tabs */}
          {loading && !tabsLoaded.current[mode] && (
            <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
              <CircularProgress />
            </Box>
          )}

          {/* Empty state */}
          {!loading && stories.length === 0 && (
            <Box sx={{ textAlign: "center", py: 8 }}>
              <Typography variant="h5" color="text.secondary" gutterBottom>
                No stories found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Be the first to publish a public story!
              </Typography>
            </Box>
          )}

          {/* Story Feed with Infinite Scroll */}
          {stories.length > 0 && (
            <Box>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "repeat(2, 1fr)",
                    md: "repeat(3, 1fr)",
                  },
                  gap: 2,
                  mb: 3,
                }}
              >
                {stories.map((story) => (
                  <StoryCard key={story.id} {...story} />
                ))}
              </Box>

              {/* Load more indicator */}
              {loadingMore && (
                <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
                  <CircularProgress size={24} />
                </Box>
              )}

              {/* End of results */}
              {!hasMore && stories.length > 0 && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  textAlign="center"
                  sx={{ py: 2 }}
                >
                  No more stories
                </Typography>
              )}

              {/* Intersection observer for infinite scroll */}
              {hasMore && !loadingMore && (
                <Box
                  ref={(el: HTMLDivElement | null) => {
                    if (!el) return

                    const observer = new IntersectionObserver(
                      (entries) => {
                        if (entries[0]?.isIntersecting) {
                          loadMore()
                        }
                      },
                      { threshold: 0.5 }
                    )

                    observer.observe(el)

                    // Cleanup
                    return () => {
                      observer.disconnect()
                    }
                  }}
                  sx={{ height: 20 }}
                />
              )}
            </Box>
          )}
        </Box>
      </Container>
    </Box>
  )
}
