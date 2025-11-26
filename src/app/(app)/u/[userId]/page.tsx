"use client"

import { use, useEffect, useState, Suspense } from "react"
import { useRouter } from "next/navigation"
import {
  Add as AddIcon,
  Archive as ArchiveIcon,
  Article as ArticleIcon,
  MoreVert as MoreVertIcon,
  Settings as SettingsIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material"
import {
  Avatar,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Container,
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Skeleton,
  Stack,
  Typography,
  CircularProgress,
} from "@mui/material"
import {
  getUserIdByUsername,
  isUsernameParam,
  stripUsernamePrefix,
} from "@/lib/username-utils"
import { timeAgo } from "@/lib/utils"
import { useAuth } from "@/hooks/use-auth"
import { SerializableDocument } from "@/types/document"

interface UserProfile {
  id: string
  name: string | null
  username: string | null
  bio: string | null
  image: string | null
}


export default function UserProfilePage(props: {
  params: Promise<{ userId: string }>
}) {
  return (
    <Suspense fallback={
      <Box sx={{ minHeight: "100vh", bgcolor: "background.default", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <CircularProgress />
      </Box>
    }>
      <UserProfilePageInner {...props} />
    </Suspense>
  )
}

function UserProfilePageInner(props: {
  params: Promise<{ userId: string }>
}) {
  const params = use(props.params)
  const { user: currentUser } = useAuth()
  const router = useRouter()
  const [stories, setStories] = useState<SerializableDocument[]>([])
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [userLoading, setUserLoading] = useState(true)
  const [actualUserId, setActualUserId] = useState<string>("")
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const menuOpen = Boolean(anchorEl)

  const isOwnProfile = currentUser?.id === actualUserId

  // Get display username
  const displayParam = isUsernameParam(params.userId)
    ? params.userId
    : user?.username
      ? `@${user.username}`
      : params.userId

  // Resolve username or Firebase ID to actual user ID
  useEffect(() => {
    const resolveUser = async () => {
      try {
        const paramId = decodeURIComponent(params.userId)

        if (isUsernameParam(paramId)) {
          const username = stripUsernamePrefix(paramId)
          const resolvedId = await getUserIdByUsername(username)
          if (resolvedId) {
            setActualUserId(resolvedId)
          } else {
            setActualUserId("")
            setUserLoading(false)
            setLoading(false)
          }
        } else {
          setActualUserId(paramId)
        }
      } catch (error) {
        console.error("Error resolving user:", error)
        setActualUserId("")
        setUserLoading(false)
        setLoading(false)
      }
    }

    resolveUser()
  }, [params.userId])

  // Fetch user profile from API
  useEffect(() => {
    if (!actualUserId) return

    const loadUser = async () => {
      try {
        const res = await fetch(`/api/users/${actualUserId}/profile`)
        if (!res.ok) throw new Error("Failed to fetch user")

        const data = await res.json()
        setUser(data.profile)
      } catch (error) {
        console.error("Error fetching user:", error)
      } finally {
        setUserLoading(false)
      }
    }

    loadUser()
  }, [actualUserId])

  // Fetch user's stories from API
  useEffect(() => {
    if (!actualUserId) return

    const loadStories = async () => {
      try {
        const res = await fetch(
          `/api/users/${actualUserId}/stories?page=0&pageSize=20`
        )
        if (!res.ok) throw new Error("Failed to fetch stories")

        const data = await res.json()
        setStories(data.stories || [])
      } catch (error) {
        console.error("Error fetching stories:", error)
      } finally {
        setLoading(false)
      }
    }

    loadStories()
  }, [actualUserId])

  const handleCardClick = (story: SerializableDocument) => {
    if (story.id && story.slug && user?.username) {
      router.push(`/u/@${user.username}/${story.id}-${story.slug}`)
    } else if (story.id && user?.username) {
      router.push(`/u/@${user.username}/${story.id}`)
    } else if (story.id) {
      router.push(`/u/${params.userId}/${story.id}`)
    }
  }

  const getInitials = (name?: string | null, userId?: string) => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2)
    }
    return (userId || "U").substring(0, 2).toUpperCase()
  }

  const displayName = user?.name || params.userId

  // Not found state
  if (!userLoading && !actualUserId) {
    return (
      <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
        <Container maxWidth="lg" sx={{ py: 6, textAlign: "center" }}>
          <Typography variant="h4" gutterBottom>
            User Not Found
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            The user {displayParam} could not be found.
          </Typography>
          <Button variant="contained" onClick={() => router.push("/")}>
            Go Home
          </Button>
        </Container>
      </Box>
    )
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <Container maxWidth="lg" sx={{ py: 6 }}>
        {/* User Profile Header */}
        <Stack spacing={3} sx={{ mb: 4 }}>
          {userLoading ? (
            <Stack direction="row" spacing={2} alignItems="center">
              <Skeleton variant="circular" width={96} height={96} />
              <Box sx={{ flex: 1 }}>
                <Skeleton variant="text" width={200} height={40} />
                <Skeleton variant="text" width={150} height={24} />
              </Box>
            </Stack>
          ) : (
            <>
              <Stack
                direction="row"
                spacing={3}
                alignItems="center"
                justifyContent="space-between"
              >
                <Stack
                  direction="row"
                  spacing={3}
                  alignItems="center"
                  sx={{ flex: 1 }}
                >
                  <Avatar
                    src={user?.image || undefined}
                    sx={{
                      width: 96,
                      height: 96,
                      fontSize: "2.5rem",
                      bgcolor: "primary.main",
                    }}
                  >
                    {!user?.image && getInitials(user?.name, params.userId)}
                  </Avatar>
                  <Box>
                    <Typography variant="h3" fontWeight={700}>
                      {displayName}
                    </Typography>
                    {user?.username && (
                      <Typography
                        variant="body1"
                        color="text.secondary"
                        sx={{ mt: 0.5 }}
                      >
                        @{user.username}
                      </Typography>
                    )}
                    {user?.bio && (
                      <Typography
                        variant="body1"
                        color="text.secondary"
                        sx={{ mt: 1.5, maxWidth: 600 }}
                      >
                        {user.bio}
                      </Typography>
                    )}
                  </Box>
                </Stack>
                {isOwnProfile && (
                  <>
                    <IconButton
                      onClick={(e) => setAnchorEl(e.currentTarget)}
                      sx={{ alignSelf: "flex-start" }}
                    >
                      <MoreVertIcon />
                    </IconButton>
                    <Menu
                      anchorEl={anchorEl}
                      open={menuOpen}
                      onClose={() => setAnchorEl(null)}
                      anchorOrigin={{
                        vertical: "bottom",
                        horizontal: "right",
                      }}
                      transformOrigin={{
                        vertical: "top",
                        horizontal: "right",
                      }}
                    >
                      <MenuItem
                        onClick={() => {
                          setAnchorEl(null)
                          router.push("/stories")
                        }}
                      >
                        <ListItemIcon>
                          <AddIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>New Story</ListItemText>
                      </MenuItem>
                      <MenuItem
                        onClick={() => {
                          setAnchorEl(null)
                          router.push("/settings")
                        }}
                      >
                        <ListItemIcon>
                          <SettingsIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>Settings</ListItemText>
                      </MenuItem>
                    </Menu>
                  </>
                )}
              </Stack>
            </>
          )}
          <Divider />
        </Stack>

        {/* Public Stories Header */}
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          justifyContent="space-between"
          sx={{ mb: 3 }}
        >
          <Typography variant="h5" fontWeight={600}>
            Public Stories
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <ArticleIcon fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              {stories.length} {stories.length === 1 ? "story" : "stories"}
            </Typography>
          </Stack>
        </Stack>

        {/* Stories Grid */}
        {loading ? (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                md: "repeat(3, 1fr)",
              },
              gap: 3,
            }}
          >
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent>
                  <Skeleton variant="text" width="80%" height={32} />
                  <Skeleton variant="text" width="100%" />
                  <Skeleton variant="text" width="60%" />
                </CardContent>
              </Card>
            ))}
          </Box>
        ) : stories.length === 0 ? (
          <Card
            sx={{
              textAlign: "center",
              py: 8,
              bgcolor: "background.paper",
            }}
          >
            <ArticleIcon sx={{ fontSize: 80, color: "text.disabled", mb: 2 }} />
            <Typography variant="h5" gutterBottom color="text.secondary">
              No published stories yet
            </Typography>
            <Typography variant="body1" color="text.secondary">
              This user hasn&apos;t published any public stories.
            </Typography>
          </Card>
        ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                md: "repeat(3, 1fr)",
              },
              gap: 3,
            }}
          >
            {stories.map((story) => (
              <Card
                key={story.id}
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  transition: "all 0.2s",
                  "&:hover": {
                    boxShadow: 6,
                    transform: "translateY(-4px)",
                  },
                }}
              >
                <CardActionArea
                  onClick={() => handleCardClick(story)}
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <CardContent sx={{ flexGrow: 1, width: "100%" }}>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      {story.title}
                    </Typography>
                    {story.preview && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          mb: 2,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          display: "-webkit-box",
                          WebkitLineClamp: 3,
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
                      flexWrap="wrap"
                      sx={{ mt: "auto" }}
                    >
                      {story.isArchived && (
                        <Chip
                          icon={<ArchiveIcon />}
                          label="Archived"
                          size="small"
                          color="default"
                        />
                      )}
                      <Stack
                        direction="row"
                        spacing={0.5}
                        alignItems="center"
                        sx={{ ml: "auto" }}
                      >
                        <VisibilityIcon
                          sx={{ fontSize: "1rem", color: "text.secondary" }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {(story.viewCount ?? 0).toLocaleString()}
                        </Typography>
                      </Stack>
                      <Typography variant="caption" color="text.secondary">
                        •
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {timeAgo(story.lastUpdated)}
                      </Typography>
                    </Stack>
                  </CardContent>
                </CardActionArea>
              </Card>
            ))}
          </Box>
        )}
      </Container>
    </Box>
  )
}
