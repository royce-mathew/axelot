"use client"

import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Add as AddIcon,
  Archive as ArchiveIcon,
  Article as ArticleIcon,
  MoreVert as MoreVertIcon,
  Public as PublicIcon,
  Settings as SettingsIcon,
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
} from "@mui/material"
import { getDoc, getDocs, orderBy, query, where } from "firebase/firestore"
import { Document } from "@/types/document"
import { User } from "@/types/user"
import { allDocumentsRef } from "@/lib/converters/document"
import { userRef } from "@/lib/converters/user"
import {
  getUserIdByUsername,
  isUsernameParam,
  stripUsernamePrefix,
} from "@/lib/username-utils"
import { timeAgo } from "@/lib/utils"
import { useAuth } from "@/hooks/use-auth"
import FollowButton from "@/components/social/FollowButton"
import FollowersDialog from "@/components/social/FollowersDialog"
import { followersCollection, followingCollection } from "@/lib/social"
import { onSnapshot } from "firebase/firestore"

export default function UserProfilePage(props: {
  params: Promise<{ userId: string }>
}) {
  const params = use(props.params)
  const { user: currentUser } = useAuth()
  const router = useRouter()
  const [documents, setDocuments] = useState<Document[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [userLoading, setUserLoading] = useState(true)
  const [actualUserId, setActualUserId] = useState<string>("")
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const menuOpen = Boolean(anchorEl)
  const [followersCount, setFollowersCount] = useState(0)
  const [followingCount, setFollowingCount] = useState(0)
  const [connectionsOpen, setConnectionsOpen] = useState(false)

  const isOwnProfile = currentUser?.id === actualUserId

  // Get display username (with @ if it's a username param)
  const displayParam = isUsernameParam(params.userId)
    ? params.userId
    : user?.username
      ? `@${user.username}`
      : params.userId

  // Resolve username or Firebase ID to actual user ID
  useEffect(() => {
    const resolveUser = async () => {
      try {
        // Decode the parameter in case it's URL-encoded (%40masq -> @masq)
        const paramId = decodeURIComponent(params.userId)

        // Check if it starts with @ (username format)
        if (isUsernameParam(paramId)) {
          // It's a username with @ prefix, resolve it (cached)
          const username = stripUsernamePrefix(paramId)
          // Skip cache for debugging
          const resolvedId = await getUserIdByUsername(username)
          if (resolvedId) {
            setActualUserId(resolvedId)
          } else {
            // Not found
            setActualUserId("")
            setUserLoading(false)
            setLoading(false)
          }
        } else {
          // No @ prefix means it's a Firebase ID, use directly (0 reads!)
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

  // Fetch user profile
  useEffect(() => {
    if (!actualUserId) return

    const loadUser = async () => {
      try {
        const userSnap = await getDoc(userRef(actualUserId))
        if (userSnap.exists()) {
          setUser(userSnap.data())
        }
      } catch (error) {
        console.error("Error fetching user:", error)
      } finally {
        setUserLoading(false)
      }
    }

    loadUser()
  }, [actualUserId])

  // Fetch user's public documents
  useEffect(() => {
    if (!actualUserId) return

    const loadDocuments = async () => {
      try {
        // Query just by owner, then filter in memory to avoid composite index
        const q = query(
          allDocumentsRef(),
          where("owner", "==", actualUserId),
          where("isPublic", "==", true),
          orderBy("lastUpdated", "desc")
        )

        const snapshot = await getDocs(q)
        const allDocs = snapshot.docs.map((doc) => doc.data())

        // Filter for public stories only
        const docs = allDocs.filter((doc) => doc.isPublic === true)
        setDocuments(docs)
      } catch (error) {
        console.error("Error fetching user documents:", error)
      } finally {
        setLoading(false)
      }
    }

    loadDocuments()
  }, [actualUserId])

  // Live followers/following counts
  useEffect(() => {
    if (!actualUserId) return
    const unsub1 = onSnapshot(followersCollection(actualUserId), (snap) => {
      setFollowersCount(snap.size)
    })
    const unsub2 = onSnapshot(followingCollection(actualUserId), (snap) => {
      setFollowingCount(snap.size)
    })
    return () => {
      unsub1()
      unsub2()
    }
  }, [actualUserId])

  const handleCardClick = (doc: Document) => {
    if (doc.id && doc.slug && user?.username) {
      router.push(`/u/@${user.username}/${doc.id}-${doc.slug}`)
    } else if (doc.id && user?.username) {
      router.push(`/u/@${user.username}/${doc.id}`)
    } else if (doc.id) {
      router.push(`/u/${params.userId}/${doc.id}`)
    }
  }

  const getInitials = (name?: string, userId?: string) => {
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
        <Container maxWidth="md" sx={{ py: 6, textAlign: "center" }}>
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
      <Container maxWidth="md" sx={{ py: 6 }}>
        {/* User Profile Header */}
        <Stack spacing={3} sx={{ mb: 3 }}>
          {userLoading ? (
            <Stack direction="row" spacing={2} alignItems="center">
              <Skeleton variant="circular" width={80} height={80} />
              <Box sx={{ flex: 1 }}>
                <Skeleton variant="text" width={200} height={40} />
                <Skeleton variant="text" width={150} height={24} />
              </Box>
            </Stack>
          ) : (
            <>
              <Stack
                direction="row"
                spacing={2}
                alignItems="center"
                justifyContent="space-between"
              >
                <Stack
                  direction="row"
                  spacing={2}
                  alignItems="center"
                  sx={{ flex: 1 }}
                >
                  <Avatar
                    src={user?.image || undefined}
                    sx={{
                      width: 80,
                      height: 80,
                      fontSize: "2rem",
                      bgcolor: "primary.main",
                    }}
                  >
                    {!user?.image && getInitials(user?.name, params.userId)}
                  </Avatar>
                  <Box>
                    <Typography variant="h4" fontWeight={700}>
                      {displayName}
                    </Typography>
                    {user?.username && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 0.5 }}
                      >
                        @{user.username}
                      </Typography>
                    )}
                    <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                      <Button size="small" variant="text" onClick={() => setConnectionsOpen(true)}>
                        {followersCount} Followers
                      </Button>
                      <Button size="small" variant="text" onClick={() => setConnectionsOpen(true)}>
                        {followingCount} Following
                      </Button>
                    </Stack>
                    {user?.bio && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 1 }}
                      >
                        {user.bio}
                      </Typography>
                    )}
                  </Box>
                </Stack>
                {isOwnProfile ? (
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
                ) : (
                  <FollowButton targetUserId={actualUserId} targetName={user?.name ?? undefined} targetImage={user?.image ?? undefined} />
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
          sx={{ mt: 2, mb: 2 }}
        >
          <Typography variant="h5" fontWeight={600}>
            Public Stories
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <ArticleIcon fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              {documents.length} {documents.length === 1 ? "story" : "stories"}
            </Typography>
          </Stack>
        </Stack>

        {/* Stories List */}
        {loading ? (
          <Stack spacing={3}>
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent>
                  <Skeleton variant="text" width="60%" height={40} />
                  <Skeleton variant="text" width="80%" />
                  <Skeleton variant="text" width="40%" />
                </CardContent>
              </Card>
            ))}
          </Stack>
        ) : documents.length === 0 ? (
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
          <Stack spacing={3}>
            {documents.map((doc) => (
              <Card
                key={doc.id}
                sx={{
                  transition: "all 0.2s",
                  "&:hover": {
                    boxShadow: 4,
                    transform: "translateY(-2px)",
                  },
                }}
              >
                <CardActionArea onClick={() => handleCardClick(doc)}>
                  <CardContent>
                    <Typography variant="h5" fontWeight={600} gutterBottom>
                      {doc.title}
                    </Typography>
                    {doc.description && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          mb: 2,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                        }}
                      >
                        {doc.description}
                      </Typography>
                    )}
                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                      flexWrap="wrap"
                    >
                      <Chip
                        icon={<PublicIcon />}
                        label="Public"
                        size="small"
                        color="success"
                      />
                      {doc.isArchived && (
                        <Chip
                          icon={<ArchiveIcon />}
                          label="Archived"
                          size="small"
                          color="default"
                        />
                      )}
                      {doc.tags &&
                        doc.tags
                          .slice(0, 3)
                          .map((tag, index) => (
                            <Chip key={index} label={tag} size="small" />
                          ))}
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ ml: "auto" }}
                      >
                        {timeAgo(doc.lastUpdated)}
                      </Typography>
                    </Stack>
                  </CardContent>
                </CardActionArea>
              </Card>
            ))}
          </Stack>
        )}
      </Container>
      <FollowersDialog userId={actualUserId} open={connectionsOpen} onClose={() => setConnectionsOpen(false)} />
    </Box>
  )
}
