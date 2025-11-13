"use client"

import { useEffect } from "react"
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Chip,
  Stack,
  Skeleton,
  Fab,
  Fade,
} from "@mui/material"
import {
  TrendingUp as TrendingUpIcon,
  AccessTime as AccessTimeIcon,
  Visibility as VisibilityIcon,
  Refresh as RefreshIcon,
  Person as PersonIcon,
  Add as AddIcon,
  Description as DescriptionIcon,
} from "@mui/icons-material"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { getDocs, query, where, orderBy, limit } from "firebase/firestore"
import { allDocumentsRef } from "@/lib/converters/document"
import type { Document } from "@/types/document"
import { timeAgo } from "@/lib/utils"
import { useStoriesCache } from "@/hooks/use-stories-cache"

export default function DashboardPage() {
  const { isAuthenticated, isLoading, user } = useAuth()
  const router = useRouter()

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/")
    }
  }, [isAuthenticated, isLoading, router])

  // Use caching hook to fetch stories
  const {
    data: storiesData,
    loading: loadingStories,
    refresh: refreshStories,
  } = useStoriesCache(
    async () => {
      const recentQuery = query(allDocumentsRef(), where("isPublic", "==", true), orderBy("created", "desc"), limit(6))

      const trendingQuery = query(
        allDocumentsRef(),
        where("isPublic", "==", true),
        orderBy("trendingScore", "desc"),
        limit(6),
      )

      const [recentSnapshot, trendingSnapshot] = await Promise.all([getDocs(recentQuery), getDocs(trendingQuery)])

      return {
        recent: recentSnapshot.docs.map((doc) => doc.data()),
        trending: trendingSnapshot.docs.map((doc) => doc.data()),
      }
    },
    [user?.id],
    "dashboard-stories",
  )

  const recentStories = storiesData?.recent ?? []
  const trendingStories = storiesData?.trending ?? []
  // Dedupe: remove items from Recent that already appear in Trending
  const trendingIds = new Set(trendingStories.map((d: Document) => d.id))
  const recentFiltered = recentStories.filter((d: Document) => !trendingIds.has(d.id))

  const handleCardClick = (doc: Document) => {
    router.push(`/u/${doc.owner}/${doc.id}`)
  }

  const handleCreateNew = () => {
    router.push("/stories")
  }

  // Show loading state while checking auth
  if (isLoading || !isAuthenticated) {
    return (
      <Box sx={{ minHeight: "100vh" }}>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Skeleton variant="text" width="40%" height={60} sx={{ mb: 2 }} />
          <Skeleton variant="text" width="30%" height={30} sx={{ mb: 4 }} />
        </Container>
      </Box>
    )
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Fade in timeout={400}>
          <Box
            sx={{
              mb: 6,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            <Box>
              <Typography variant="h4" fontWeight={700} gutterBottom>
                Welcome back, {user?.name?.split(" ")[0] || "there"}! 👋
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Discover new stories and continue where you left off
              </Typography>
            </Box>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={refreshStories}
              disabled={loadingStories}
              sx={{
                borderRadius: 2,
                transition: "all 0.2s",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: 2,
                },
              }}
            >
              Refresh
            </Button>
          </Box>
        </Fade>

        {loadingStories ? (
          <Stack spacing={4}>
            {[1, 2, 3].map((i) => (
              <Box key={i}>
                <Skeleton variant="text" width="30%" height={40} sx={{ mb: 2 }} />
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" },
                    gap: 3,
                  }}
                >
                  {[1, 2, 3].map((j) => (
                    <Card key={j}>
                      <CardContent>
                        <Skeleton variant="text" width="80%" height={30} />
                        <Skeleton variant="text" width="60%" />
                        <Skeleton variant="text" width="40%" />
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              </Box>
            ))}
          </Stack>
        ) : (
          <Stack spacing={6}>
            {/* Trending Stories */}
            {trendingStories.length > 0 && (
              <Box>
                <Fade in timeout={600}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      mb: 3,
                      pb: 2,
                      borderBottom: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 36,
                        height: 36,
                        borderRadius: 1.5,
                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)",
                      }}
                    >
                      <TrendingUpIcon sx={{ color: "white", fontSize: 20 }} />
                    </Box>
                    <Typography variant="h5" fontWeight={600}>
                      Trending Stories
                    </Typography>
                  </Box>
                </Fade>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" },
                    gap: 3,
                  }}
                >
                  {trendingStories.slice(0, 6).map((doc: Document, index: number) => (
                    <Fade key={doc.id} in timeout={800 + index * 100}>
                      <Card
                        sx={{
                          cursor: "pointer",
                          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                          border: "1px solid",
                          borderColor: "divider",
                          "&:hover": {
                            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                            transform: "translateY(-4px)",
                            borderColor: "primary.main",
                          },
                        }}
                        onClick={() => handleCardClick(doc)}
                      >
                        <CardContent sx={{ pb: 1 }}>
                          <Typography variant="h6" fontWeight={600} gutterBottom noWrap sx={{ mb: 1.5 }}>
                            {doc.title}
                          </Typography>
                          {doc.description && (
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{
                                mb: 2.5,
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                                lineHeight: 1.6,
                              }}
                            >
                              {doc.description}
                            </Typography>
                          )}
                          <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                            <Chip
                              icon={<PersonIcon />}
                              label={doc.authorNames?.[0] || "Anonymous"}
                              size="small"
                              sx={{
                                fontWeight: 500,
                                transition: "all 0.2s",
                                "&:hover": {
                                  transform: "scale(1.05)",
                                },
                              }}
                            />
                            <Chip
                              icon={<VisibilityIcon />}
                              label={`${(doc.viewCount || 0).toLocaleString()} views`}
                              size="small"
                              variant="outlined"
                              sx={{
                                fontWeight: 500,
                                transition: "all 0.2s",
                                "&:hover": {
                                  transform: "scale(1.05)",
                                },
                              }}
                            />
                          </Stack>
                        </CardContent>
                        <CardActions sx={{ px: 2, pb: 2, pt: 0.5 }}>
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                            Updated {timeAgo(doc.lastUpdated)}
                          </Typography>
                        </CardActions>
                      </Card>
                    </Fade>
                  ))}
                </Box>
              </Box>
            )}

            {/* Recently Published */}
            {recentFiltered.length > 0 && (
              <Box>
                <Fade in timeout={trendingStories.length > 0 ? 1400 : 600}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      mb: 3,
                      pb: 2,
                      borderBottom: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 36,
                        height: 36,
                        borderRadius: 1.5,
                        background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                        boxShadow: "0 4px 12px rgba(240, 147, 251, 0.3)",
                      }}
                    >
                      <AccessTimeIcon sx={{ color: "white", fontSize: 20 }} />
                    </Box>
                    <Typography variant="h5" fontWeight={600}>
                      Recently Published
                    </Typography>
                  </Box>
                </Fade>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" },
                    gap: 3,
                  }}
                >
                  {recentFiltered.slice(0, 6).map((doc: Document, index: number) => (
                    <Fade key={doc.id} in timeout={(trendingStories.length > 0 ? 1600 : 800) + index * 100}>
                      <Card
                        sx={{
                          cursor: "pointer",
                          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                          border: "1px solid",
                          borderColor: "divider",
                          "&:hover": {
                            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                            transform: "translateY(-4px)",
                            borderColor: "primary.main",
                          },
                        }}
                        onClick={() => handleCardClick(doc)}
                      >
                        <CardContent sx={{ pb: 1 }}>
                          <Typography variant="h6" fontWeight={600} gutterBottom noWrap sx={{ mb: 1.5 }}>
                            {doc.title}
                          </Typography>
                          {doc.description && (
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{
                                mb: 2.5,
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                                lineHeight: 1.6,
                              }}
                            >
                              {doc.description}
                            </Typography>
                          )}
                          <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                            <Chip
                              icon={<PersonIcon />}
                              label={doc.authorNames?.[0] || "Anonymous"}
                              size="small"
                              sx={{
                                fontWeight: 500,
                                transition: "all 0.2s",
                                "&:hover": {
                                  transform: "scale(1.05)",
                                },
                              }}
                            />
                            <Chip
                              icon={<VisibilityIcon />}
                              label={`${(doc.viewCount || 0).toLocaleString()} views`}
                              size="small"
                              variant="outlined"
                              sx={{
                                fontWeight: 500,
                                transition: "all 0.2s",
                                "&:hover": {
                                  transform: "scale(1.05)",
                                },
                              }}
                            />
                          </Stack>
                        </CardContent>
                        <CardActions sx={{ px: 2, pb: 2, pt: 0.5 }}>
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                            Published {timeAgo(doc.created)}
                          </Typography>
                        </CardActions>
                      </Card>
                    </Fade>
                  ))}
                </Box>
              </Box>
            )}

            {/* Empty State */}
            {recentFiltered.length === 0 && trendingStories.length === 0 && (
              <Fade in timeout={600}>
                <Card
                  sx={{
                    textAlign: "center",
                    py: 8,
                    bgcolor: "background.paper",
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 2,
                  }}
                >
                  <DescriptionIcon sx={{ fontSize: 80, color: "text.disabled", mb: 2 }} />
                  <Typography variant="h5" gutterBottom color="text.secondary" fontWeight={600}>
                    No stories yet
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                    Create your first story to get started
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleCreateNew}
                    sx={{
                      px: 3,
                      py: 1.5,
                      borderRadius: 2,
                      transition: "all 0.2s",
                      "&:hover": {
                        transform: "translateY(-2px)",
                        boxShadow: 4,
                      },
                    }}
                  >
                    Create Story
                  </Button>
                </Card>
              </Fade>
            )}
          </Stack>
        )}
      </Container>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{
          position: "fixed",
          bottom: 24,
          right: 24,
          display: { xs: "flex", sm: "none" },
          transition: "all 0.2s",
          "&:hover": {
            transform: "scale(1.1)",
          },
        }}
        onClick={handleCreateNew}
      >
        <AddIcon />
      </Fab>
    </Box>
  )
}
