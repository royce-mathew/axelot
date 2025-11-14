"use client"

import { useEffect, useState } from "react"
import { Button } from "@mui/material"
import { useAuth } from "@/hooks/use-auth"
import { followUser, isFollowing, unfollowUser } from "@/lib/social"

export default function FollowButton({ targetUserId, targetName, targetImage }: { targetUserId: string; targetName?: string; targetImage?: string }) {
  const { user } = useAuth()
  const [following, setFollowing] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    const run = async () => {
      if (!user?.id || !targetUserId || user.id === targetUserId) {
        setLoading(false)
        return
      }
      const isF = await isFollowing(user.id, targetUserId)
      if (mounted) {
        setFollowing(isF)
        setLoading(false)
      }
    }
    run()
    return () => {
      mounted = false
    }
  }, [user?.id, targetUserId])

  const toggle = async () => {
    if (!user?.id || user.id === targetUserId) return
    setLoading(true)
    if (following) {
      await unfollowUser(user.id, targetUserId)
      setFollowing(false)
    } else {
      await followUser(user.id, targetUserId, user.name ?? "", user.image ?? "", targetName, targetImage)
      setFollowing(true)
    }
    setLoading(false)
  }

  if (!user?.id || user.id === targetUserId) return null

  return (
    <Button variant={following ? "outlined" : "contained"} onClick={toggle} disabled={loading}>
      {following ? "Following" : "Follow"}
    </Button>
  )
}
