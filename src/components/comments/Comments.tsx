"use client"

import { useEffect, useMemo, useState } from "react"
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material"
import {
  addDoc,
  limit,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
} from "firebase/firestore"
import { CommentItem } from "./CommentItem"
import { useAuth } from "@/hooks/use-auth"
import { storyCommentsCollection, topLevelCommentsQuery } from "@/lib/converters/comment"

export function Comments({ storyId }: { storyId: string }) {
  const { user, isAuthenticated } = useAuth()
  const [comment, setComment] = useState("")
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState<any[]>([])

  useEffect(() => {
    setLoading(true)
    const q = query(topLevelCommentsQuery(storyId), orderBy("createdAt", "asc"), limit(50))
    const unsub = onSnapshot(q, (snap) => {
      const arr = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }))
      setItems(arr)
      setLoading(false)
    })
    return () => unsub()
  }, [storyId])

  const addComment = async () => {
    if (!user?.id || !comment.trim()) return
    await addDoc(storyCommentsCollection(storyId), {
      storyId,
      parentId: null,
      authorId: user.id,
      authorName: user.name ?? "",
      authorImage: user.image ?? "",
      content: comment.trim(),
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      likeCount: 0,
      replyCount: 0,
    })
    setComment("")
  }

  return (
    <Paper elevation={0} sx={{ p: 3, mt: 4, border: 1, borderColor: "divider" }}>
      <Typography variant="h6" fontWeight={700} gutterBottom>
        Comments
      </Typography>
      {!isAuthenticated ? (
        <Alert severity="info" sx={{ mb: 2 }}>
          Sign in to write a comment.
        </Alert>
      ) : (
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Write a comment..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                addComment()
              }
            }}
          />
          <Button variant="contained" onClick={addComment} disabled={!comment.trim()}>
            Post
          </Button>
        </Stack>
      )}

      <Divider sx={{ my: 2 }} />
      {loading ? (
        <Box sx={{ py: 3, display: "flex", alignItems: "center", gap: 1 }}>
          <CircularProgress size={18} />
          <Typography variant="body2" color="text.secondary">
            Loading comments...
          </Typography>
        </Box>
      ) : items.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          Be the first to comment.
        </Typography>
      ) : (
        <Stack spacing={2}>
          {items.map((c) => (
            <CommentItem key={c.id} storyId={storyId} comment={c} />
          ))}
        </Stack>
      )}
    </Paper>
  )
}

export default Comments
