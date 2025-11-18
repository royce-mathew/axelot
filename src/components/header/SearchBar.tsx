"use client"

import React, { useState, useRef, useEffect } from "react"
import {
  Box,
  InputBase,
  Paper,
  List,
  ListItem,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  Divider,
  alpha,
  useColorScheme,
} from "@mui/material"
import SearchIcon from "@mui/icons-material/Search"
import DescriptionIcon from "@mui/icons-material/Description"
import PersonIcon from "@mui/icons-material/Person"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { db } from "@/lib/firebase/client"
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from "firebase/firestore"
import type { Document as Story } from "@/types/document"
import type { User } from "@/types/user"
import { timeAgo } from "@/lib/utils"

interface SearchResultState {
  documents: Array<Story & { id: string }>
  users: Array<User & { id: string }>
}

export const SearchBar = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const [showResults, setShowResults] = useState(false)
  const [results, setResults] = useState<SearchResultState>({
    documents: [],
    users: [],
  })
  const [loading, setLoading] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [isFocused, setIsFocused] = useState(false)
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const hasResults = results.documents.length > 0 || results.users.length > 0
  const isMac =
    typeof navigator !== "undefined" &&
    /Mac|iPod|iPhone|iPad/.test(navigator.platform)
  const { mode } = useColorScheme()
  const isDark = mode === "dark"

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowResults(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Global keyboard shortcuts: Ctrl/⌘+K to focus search (even in TipTap), Esc to close
  useEffect(() => {
    const isBlockedContext = (target: EventTarget | null) => {
      if (!target || !(target as Element)) return false
      const el = target as HTMLElement
      const tag = (el.tagName || "").toUpperCase()
      // Allow inside TipTap editor explicitly
      if (el.closest && el.closest(".tiptap-editor-content")) return false
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true
      if (el.isContentEditable) return true
      return false
    }

    const onKeyDown = (e: KeyboardEvent) => {
      const isK = e.key?.toLowerCase() === "k"
      const hasMod = e.ctrlKey || e.metaKey
      if (isK && hasMod) {
        if (isBlockedContext(e.target)) return
        e.preventDefault()
        inputRef.current?.focus()
        // Keep current open logic; do not force open on empty query
        return
      }

      if (e.key === "Escape") {
        // Close results and blur only if our input is active
        if (document.activeElement === inputRef.current) {
          setShowResults(false)
          ;(document.activeElement as HTMLElement)?.blur()
        }
      }
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
      setShowResults(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value
    setSearchQuery(q)
    setShowResults(q.trim().length > 0)
  }

  // Real search for authenticated users; keep preview look for guests
  useEffect(() => {
    let cancelled = false
    const run = async () => {
      const q = searchQuery.trim()
      if (!q || !isAuthenticated) {
        // guests or empty query: show no real results
        setResults({ documents: [], users: [] })
        return
      }
      setLoading(true)
      try {
        // Fetch candidates and filter client-side
        const [docSnap, userSnap] = await Promise.all([
          getDocs(
            query(
              collection(db, "stories"),
              where("isPublic", "==", true),
              orderBy("lastUpdated", "desc"),
              limit(30)
            )
          ),
          getDocs(query(collection(db, "users"), orderBy("name"), limit(30))),
        ])

        if (cancelled) return

        const docs = docSnap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Story),
        })) as Array<Story & { id: string }>
        const filteredDocs = docs
          .filter((d) =>
            (d.title || "").toLowerCase().includes(q.toLowerCase())
          )
          .slice(0, 8)

        const users = userSnap.docs.map((u) => ({
          id: u.id,
          ...(u.data() as User),
        })) as Array<User & { id: string }>
        // Only index users who have a configured username
        const withUsername = users.filter(
          (u) => typeof u.username === "string" && u.username.trim().length > 0
        )
        const filteredUsers = withUsername
          .filter(
            (u) =>
              u.name?.toLowerCase().includes(q.toLowerCase()) ||
              (u.username || "").toLowerCase().includes(q.toLowerCase())
          )
          .slice(0, 6)

        setResults({ documents: filteredDocs, users: filteredUsers })
      } catch (e) {
        console.error("Search error:", e)
        if (!cancelled) setResults({ documents: [], users: [] })
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    const t = setTimeout(run, 300)
    return () => {
      cancelled = true
      clearTimeout(t)
    }
  }, [searchQuery, isAuthenticated])

  const handleResultClick = (
    type: "document" | "user",
    id: string,
    payload?: (Story & { id: string }) | (User & { id: string })
  ) => {
    setShowResults(false)
    setSearchQuery("")

    if (!payload) return

    if (type === "document") {
      const story = payload as Story & { id: string }
      const slug = story.slug ?? "untitled"
      router.push(`/u/${story.owner}/${story.id}-${slug}`)
      return
    }

    const user = payload as User & { id: string }
    if (user.username) {
      router.push(`/u/@${user.username}`)
    }
  }

  return (
    <Box
      sx={{ flex: 1, maxWidth: 512, mx: 2, position: "relative" }}
      ref={searchRef}
    >
      <Paper
        component="form"
        onSubmit={handleSearch}
        sx={{
          display: "flex",
          alignItems: "center",
          height: "40px",
          borderRadius: "20px",
          backgroundColor: (theme) =>
            alpha(theme.palette.background.paper, 0.15),
          backdropFilter: "blur(8px)",
          border: "1px solid",
          borderColor: (theme) => alpha(theme.palette.divider, 0.1),
          "&:hover": {
            backgroundColor: (theme) =>
              alpha(theme.palette.background.paper, 0.25),
          },
          "&:focus-within": {
            backgroundColor: (theme) =>
              alpha(theme.palette.background.paper, 0.3),
            borderColor: (theme) => alpha(theme.palette.primary.main, 0.5),
          },
        }}
        elevation={0}
      >
        <SearchIcon
          sx={{ ml: 2, color: "inherit", opacity: 0.7 }}
          fontSize="small"
        />
        <InputBase
          sx={{
            ml: 1,
            flex: 1,
            fontSize: "0.875rem",
            color: "inherit",
          }}
          placeholder="Search..."
          value={searchQuery}
          onChange={handleInputChange}
          inputProps={{ "aria-label": "search" }}
          inputRef={inputRef}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setShowResults(false)
              ;(e.target as HTMLElement)?.blur()
            }
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />

        {/* Shortcut badge (Ctrl/⌘ K) */}
        <Box
          sx={(theme) => ({
            mr: 1.5,
            px: 1,
            py: 0.25,
            borderRadius: 1,
            border: "1px solid",
            borderColor: isDark
              ? alpha(theme.palette.common.white, 0.2)
              : alpha(theme.palette.text.primary, 0.15),
            bgcolor: isDark
              ? alpha(theme.palette.common.white, 0.08)
              : alpha(theme.palette.text.primary, 0.06),
            color: isDark
              ? alpha(theme.palette.common.white, 0.85)
              : alpha(theme.palette.text.primary, 0.8),
            fontSize: "0.7rem",
            lineHeight: 1,
            display: { xs: "none", sm: "inline-flex" },
            alignItems: "center",
            gap: 0.5,
            pointerEvents: "none",
          })}
          aria-hidden
        >
          {isFocused && showResults ? "Esc" : isMac ? "⌘ K" : "Ctrl K"}
        </Box>
      </Paper>

      {/* Search Results Popup */}
      {showResults && (
        <Paper
          sx={{
            position: "absolute",
            top: "48px",
            left: 0,
            right: 0,
            maxHeight: "400px",
            overflowY: "auto",
            zIndex: (theme) => theme.zIndex.modal + 1,
            boxShadow: (theme) => theme.shadows[8],
          }}
          elevation={8}
        >
          {isAuthenticated ? (
            <>
              {results.documents.length > 0 && (
                <>
                  <Box sx={{ px: 2, py: 1, backgroundColor: "action.hover" }}>
                    <Typography
                      variant="caption"
                      fontWeight="bold"
                      color="text.secondary"
                    >
                      DOCUMENTS
                    </Typography>
                  </Box>
                  <List disablePadding>
                    {results.documents.map((doc) => (
                      <ListItem key={doc.id} disablePadding>
                        <ListItemButton
                          onClick={() =>
                            handleResultClick("document", doc.id, doc)
                          }
                        >
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: "primary.main" }}>
                              <DescriptionIcon fontSize="small" />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Box>
                                <Typography variant="body2">
                                  {doc.title || "Untitled Story"}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  Updated {timeAgo(doc.lastUpdated)}
                                </Typography>
                              </Box>
                            }
                          />
                        </ListItemButton>
                      </ListItem>
                    ))}
                  </List>
                </>
              )}

              {results.users.length > 0 && (
                <>
                  {results.documents.length > 0 && <Divider />}
                  <Box sx={{ px: 2, py: 1, backgroundColor: "action.hover" }}>
                    <Typography
                      variant="caption"
                      fontWeight="bold"
                      color="text.secondary"
                    >
                      USERS
                    </Typography>
                  </Box>
                  <List disablePadding>
                    {results.users.map((user) => (
                      <ListItem key={user.id} disablePadding>
                        <ListItemButton
                          onClick={() =>
                            handleResultClick("user", user.id, user)
                          }
                        >
                          <ListItemAvatar>
                            <Avatar
                              src={user.image || undefined}
                              alt={user.name || user.username || "User"}
                              sx={{ bgcolor: "secondary.main" }}
                            >
                              <PersonIcon fontSize="small" />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Box>
                                <Typography variant="body2">
                                  {user.name}
                                </Typography>
                                {user.username && (
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    @{user.username}
                                  </Typography>
                                )}
                              </Box>
                            }
                          />
                        </ListItemButton>
                      </ListItem>
                    ))}
                  </List>
                </>
              )}
              {/* Empty authenticated state */}
              {isAuthenticated && !loading && !hasResults && (
                <Box sx={{ px: 2, py: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    No results
                  </Typography>
                </Box>
              )}
            </>
          ) : (
            // Guest preview with CTA
            <Box sx={{ px: 2, py: 2 }}>
              <Typography variant="body2" sx={{ mb: 0.5 }}>
                Sign in to search real documents and users.
              </Typography>
              <Typography
                variant="body2"
                color="primary"
                sx={{ cursor: "pointer" }}
                onClick={() => router.push("/auth/sign-in")}
              >
                Sign in or create an account
              </Typography>
            </Box>
          )}
        </Paper>
      )}
    </Box>
  )
}
