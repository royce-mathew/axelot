"use client"

import { useEffect, useState } from "react"
import ReplyIcon from "@mui/icons-material/Reply"
import {
  Avatar,
  Box,
  Button,
  Collapse,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material"
import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
} from "firebase/firestore"
import { LikeButton } from "./LikeButton"
import { useAuth } from "@/hooks/use-auth"
import { commentDocRef, repliesQuery } from "@/lib/converters/comment"
import { db } from "@/lib/firebase/client"
import { CommentDoc } from "@/types/comment"
import { timeAgo } from "@/lib/utils"

type Props = {
  storyId: string
  comment: CommentDoc
}

export function CommentItem({ storyId, comment }: Props) {
  const { user } = useAuth()
  const [replying, setReplying] = useState(false)
  const [replyText, setReplyText] = useState("")
  const [replies, setReplies] = useState<CommentDoc[]>([])
  const [openReplies, setOpenReplies] = useState(false)

  useEffect(() => {
    const q = query(repliesQuery(storyId, comment.id!), orderBy("createdAt", "asc"))
    const unsub = onSnapshot(q, (snap) => {
      const items = snap.docs.map((d) => ({ id: d.id, ...(d.data() as CommentDoc) }))
      setReplies(items)
    })
    return () => unsub()
  }, [storyId, comment.id])

  const addReply = async () => {
    if (!user?.id || !replyText.trim()) return
    await addDoc(collection(db, `stories/${storyId}/comments`), {
      storyId,
      parentId: comment.id!,
      authorId: user.id,
      authorName: user.name ?? "",
      authorImage: user.image ?? "",
      content: replyText.trim(),
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      likeCount: 0,
      replyCount: 0,
    })
    setReplyText("")
    setReplying(false)
    setOpenReplies(true)
  }

  return (
    <Box sx={{ display: "flex", gap: 1.5 }}>
      <Avatar src={comment.authorImage} sx={{ width: 32, height: 32 }} />
      <Box sx={{ flex: 1 }}>
        <Stack direction="row" spacing={1} alignItems="baseline" flexWrap="wrap">
          <Typography variant="subtitle2">{comment.authorName}</Typography>
          <Typography variant="caption" color="text.secondary">
            {timeAgo(comment.createdAt)}
          </Typography>
        </Stack>
        <Typography variant="body2" sx={{ mt: 0.5, whiteSpace: "pre-wrap" }}>
          {comment.content}
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
          <LikeButton
            storyId={storyId}
            commentId={comment.id!}
            likeCount={comment.likeCount || 0}
          />
          <IconButton size="small" onClick={() => setReplying((v) => !v)}>
            <ReplyIcon fontSize="small" />
          </IconButton>
          {replies.length > 0 && (
            <Button size="small" onClick={() => setOpenReplies((v) => !v)}>
              {openReplies ? "Hide replies" : `View replies (${replies.length})`}
            </Button>
          )}
        </Stack>

        <Collapse in={replying} unmountOnExit sx={{ mt: 1 }}>
          <Stack direction="row" spacing={1}>
            <TextField
              size="small"
              fullWidth
              placeholder="Write a reply..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  addReply()
                }
              }}
            />
            <Button variant="contained" onClick={addReply} disabled={!replyText.trim()}>
              Reply
            </Button>
          </Stack>
        </Collapse>

        <Collapse in={openReplies} unmountOnExit sx={{ mt: 1 }}>
          <Stack spacing={1} sx={{ pl: 4 }}>
            {replies.map((r) => (
              <CommentItem key={r.id} storyId={storyId} comment={r} />
            ))}
          </Stack>
        </Collapse>
      </Box>
    </Box>
  )
}
