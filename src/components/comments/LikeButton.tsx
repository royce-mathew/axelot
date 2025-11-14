"use client"

import { useEffect, useRef, useState } from "react"
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder"
import FavoriteIcon from "@mui/icons-material/Favorite"
import {
  Avatar,
  Badge,
  Box,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Popover,
  Tooltip,
  Typography,
} from "@mui/material"
import {
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  increment,
  onSnapshot,
  setDoc,
  updateDoc,
} from "firebase/firestore"
import { useAuth } from "@/hooks/use-auth"
import { commentDocRef, likesCollection } from "@/lib/converters/comment"
import { db } from "@/lib/firebase/client"

type Props = {
  storyId: string
  commentId: string
  likeCount: number
}

export function LikeButton({ storyId, commentId, likeCount }: Props) {
  const { user } = useAuth()
  const [liked, setLiked] = useState(false)
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const pressTimerRef = useRef<number | null>(null)

  // Listen for whether current user liked
  useEffect(() => {
    if (!user?.id) return
    const likeDoc = doc(db, `stories/${storyId}/comments/${commentId}/likes/${user.id}`)
    getDoc(likeDoc).then((d) => setLiked(d.exists()))
  }, [storyId, commentId, user?.id])

  const toggleLike = async () => {
    if (!user?.id) return
    const likeDoc = doc(db, `stories/${storyId}/comments/${commentId}/likes/${user.id}`)
    const commentRef = commentDocRef(storyId, commentId)
    const snap = await getDoc(likeDoc)
    if (snap.exists()) {
      await deleteDoc(likeDoc)
      await updateDoc(commentRef, { likeCount: increment(-1) })
      setLiked(false)
    } else {
      await setDoc(likeDoc, {
        userId: user.id,
        userName: user.name ?? "",
        userImage: user.image ?? "",
        createdAt: new Date(),
      })
      await updateDoc(commentRef, { likeCount: increment(1) })
      setLiked(true)
    }
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLElement>) => {
    if (!user) return
    pressTimerRef.current = window.setTimeout(() => {
      setAnchorEl(e.currentTarget)
    }, 450)
  }

  const handleMouseUp = () => {
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current)
      pressTimerRef.current = null
    }
  }

  const open = Boolean(anchorEl)

  return (
    <>
      <Tooltip title={liked ? "Unlike" : "Like"}>
        <Badge badgeContent={likeCount} color="error">
          <IconButton
            size="small"
            color={liked ? "error" : "default"}
            onClick={toggleLike}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {liked ? <FavoriteIcon fontSize="small" /> : <FavoriteBorderIcon fontSize="small" />}
          </IconButton>
        </Badge>
      </Tooltip>
      <LikesPopover
        storyId={storyId}
        commentId={commentId}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
      />
    </>
  )
}

function LikesPopover({
  storyId,
  commentId,
  anchorEl,
  onClose,
}: {
  storyId: string
  commentId: string
  anchorEl: HTMLElement | null
  onClose: () => void
}) {
  const open = Boolean(anchorEl)
  const [likers, setLikers] = useState<Array<{ userId: string; userName: string; userImage?: string }>>([])

  useEffect(() => {
    if (!open) return
    let unsub = onSnapshot(likesCollection(storyId, commentId), async (snap) => {
      const items = snap.docs.slice(0, 50).map((d) => ({
        userId: d.get("userId") as string,
        userName: (d.get("userName") as string) || "",
        userImage: (d.get("userImage") as string) || "",
      }))
      setLikers(items)
    })
    return () => unsub()
  }, [open, storyId, commentId])

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      transformOrigin={{ vertical: "top", horizontal: "left" }}
      PaperProps={{ sx: { width: 280, maxHeight: 360 } }}
    >
      <Box sx={{ p: 2, pb: 0 }}>
        <Typography variant="subtitle2">Liked by</Typography>
      </Box>
      <List dense sx={{ py: 0 }}>
        {likers.length === 0 ? (
          <ListItem>
            <ListItemText primary={<Typography variant="body2">No likes yet</Typography>} />
          </ListItem>
        ) : (
          likers.map((u) => (
            <ListItem key={u.userId}>
              <ListItemAvatar>
                <Avatar src={u.userImage} sx={{ width: 28, height: 28 }} />
              </ListItemAvatar>
              <ListItemText primary={<Typography variant="body2">{u.userName || u.userId}</Typography>} />
            </ListItem>
          ))
        )}
      </List>
    </Popover>
  )
}
