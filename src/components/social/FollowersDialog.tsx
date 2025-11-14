"use client"

import { useEffect, useState } from "react"
import {
  Avatar,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Tab,
  Tabs,
  Typography,
} from "@mui/material"
import CloseIcon from "@mui/icons-material/Close"
import { onSnapshot, orderBy, query } from "firebase/firestore"
import { followersCollection, followingCollection } from "@/lib/social"

export default function FollowersDialog({
  userId,
  open,
  onClose,
}: {
  userId: string
  open: boolean
  onClose: () => void
}) {
  const [tab, setTab] = useState<0 | 1>(0)
  const [followers, setFollowers] = useState<any[]>([])
  const [following, setFollowing] = useState<any[]>([])

  useEffect(() => {
    if (!open) return
    const unsub1 = onSnapshot(query(followersCollection(userId)), (snap) => {
      setFollowers(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    })
    const unsub2 = onSnapshot(query(followingCollection(userId)), (snap) => {
      setFollowing(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    })
    return () => {
      unsub1()
      unsub2()
    }
  }, [open, userId])

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Typography variant="h6">Connections</Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} centered>
        <Tab label={`Followers (${followers.length})`} />
        <Tab label={`Following (${following.length})`} />
      </Tabs>
      <DialogContent dividers>
        {tab === 0 ? (
          <List dense>
            {followers.length === 0 ? (
              <Typography variant="body2" color="text.secondary">No followers yet</Typography>
            ) : (
              followers.map((u) => (
                <ListItem key={u.userId}>
                  <ListItemAvatar>
                    <Avatar src={u.userImage} />
                  </ListItemAvatar>
                  <ListItemText primary={u.userName || u.userId} />
                </ListItem>
              ))
            )}
          </List>
        ) : (
          <List dense>
            {following.length === 0 ? (
              <Typography variant="body2" color="text.secondary">Not following anyone</Typography>
            ) : (
              following.map((u) => (
                <ListItem key={u.userId}>
                  <ListItemAvatar>
                    <Avatar src={u.userImage} />
                  </ListItemAvatar>
                  <ListItemText primary={u.userName || u.userId} />
                </ListItem>
              ))
            )}
          </List>
        )}
      </DialogContent>
    </Dialog>
  )
}
