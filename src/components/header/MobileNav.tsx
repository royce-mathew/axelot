"use client"

import React, { useState } from "react"
import {
  Box,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Button,
  CircularProgress,
  Typography,
  Avatar,
  ListItemIcon,
  useTheme,
} from "@mui/material"
import Link from "next/link"
import MenuIcon from "@mui/icons-material/Menu"
import CloseIcon from "@mui/icons-material/Close"
import LogoutIcon from "@mui/icons-material/Logout"
import LightModeIcon from "@mui/icons-material/LightMode"
import DarkModeIcon from "@mui/icons-material/DarkMode"
import DescriptionIcon from "@mui/icons-material/Description"
import PersonIcon from "@mui/icons-material/Person"
import ThemeToggle from "@/components/ThemeToggle"
import { useAuth } from "@/hooks/use-auth"
import { signIn, signOut } from "next-auth/react"

export const MobileNav = () => {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const { isAuthenticated, isLoading, user } = useAuth()
  const theme = useTheme() // Still needed for palette colors

  const handleSignIn = () => {
    setDrawerOpen(false)
    signIn()
  }

  const handleSignOut = async () => {
    setDrawerOpen(false)
    await signOut()
  }

  const toggleDrawer = (open: boolean) => () => {
    setDrawerOpen(open)
  }

  const getInitials = (email?: string | null) => {
    if (!email) return "?"
    return email.charAt(0).toUpperCase()
  }

  return (
    <Box
      sx={{ display: { xs: "flex", md: "none" }, alignItems: "center", gap: 1 }}
    >
      {isLoading ? (
        <CircularProgress size={24} />
      ) : isAuthenticated ? (
        <IconButton onClick={toggleDrawer(true)} size="small" color="primary">
          <Avatar
            src={user?.image || undefined}
            alt={user?.name || user?.email || "User Avatar"}
            sx={{
              width: 32,
              height: 32,
              bgcolor: theme.palette.primary.main,
              fontSize: "0.875rem",
            }}
          >
            {getInitials(user?.email)}
          </Avatar>
        </IconButton>
      ) : (
        <IconButton
          edge="end"
          aria-label="menu"
          onClick={toggleDrawer(true)}
          color="primary"
        >
          <MenuIcon />
        </IconButton>
      )}

      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={toggleDrawer(false)}
        PaperProps={{
          sx: { width: 256, bgcolor: "background.paper" },
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              p: 2,
              borderBottom: 1,
              borderColor: "divider",
            }}
          >
            <Typography
              variant="h6"
              color="text.primary"
              sx={{ fontWeight: 700 }}
            >
              Menu
            </Typography>
            <IconButton onClick={toggleDrawer(false)} color="primary">
              <CloseIcon />
            </IconButton>
          </Box>

          <List sx={{ flex: 1, p: 2 }}>
            {isLoading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
                <CircularProgress size={24} />
              </Box>
            ) : isAuthenticated ? (
              <>
                <ListItem disablePadding>
                  <ListItemButton
                    component={Link}
                    href={
                      user?.username ? `/u/@${user.username}` : `/u/${user?.id}`
                    }
                    onClick={toggleDrawer(false)}
                  >
                    <ListItemIcon>
                      <PersonIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="My Profile" />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton
                    component={Link}
                    href="/stories"
                    onClick={toggleDrawer(false)}
                  >
                    <ListItemIcon>
                      <DescriptionIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="My Stories" />
                  </ListItemButton>
                </ListItem>
                <ListItem
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    px: 2,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <ListItemIcon sx={{ minWidth: "30px" }}>
                      <DarkModeIcon
                        fontSize="small"
                        sx={[
                          { display: "none" },
                          (theme) =>
                            theme.applyStyles("dark", { display: "block" }),
                        ]}
                      />
                      <LightModeIcon
                        fontSize="small"
                        sx={[
                          { display: "block" },
                          (theme) =>
                            theme.applyStyles("dark", { display: "none" }),
                        ]}
                      />
                    </ListItemIcon>
                    <Typography variant="body2">Theme</Typography>
                  </Box>
                  <ThemeToggle />
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton onClick={handleSignOut}>
                    <ListItemIcon>
                      <LogoutIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="Sign Out" />
                  </ListItemButton>
                </ListItem>
              </>
            ) : (
              <>
                <ListItem disablePadding>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={handleSignIn}
                    sx={{ justifyContent: "flex-start" }}
                  >
                    Get Started
                  </Button>
                </ListItem>
              </>
            )}
          </List>
        </Box>
      </Drawer>
    </Box>
  )
}
