"use client"

import React, { useState } from "react"
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Tooltip,
  Avatar,
} from "@mui/material"
import Link from "next/link"
import LogoutIcon from "@mui/icons-material/Logout"
import LightModeIcon from "@mui/icons-material/LightMode"
import DarkModeIcon from "@mui/icons-material/DarkMode"
import DescriptionIcon from "@mui/icons-material/Description"
import PersonIcon from "@mui/icons-material/Person"
import ThemeToggle from "@/components/ThemeToggle"
import { useAuth } from "@/hooks/use-auth"
import { signIn, signOut } from "next-auth/react"

export const DesktopNav = () => {
  const { isAuthenticated, isLoading, user } = useAuth()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)

  const handleSignIn = () => {
    signIn()
  }

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleSignOut = async () => {
    handleMenuClose()
    await signOut()
  }

  const getInitials = (email?: string | null) => {
    if (!email) return "?"
    return email.charAt(0).toUpperCase()
  }

  return (
    <Box
      sx={{ display: { xs: "none", md: "flex" }, alignItems: "center", gap: 2 }}
    >
      {isLoading ? (
        <CircularProgress size={24} />
      ) : isAuthenticated ? (
        <>
          <Button
            component={Link}
            href="/stories"
            variant="outlined"
            color="primary"
            startIcon={<DescriptionIcon />}
            sx={{
              textTransform: "none",
            }}
          >
            My Stories
          </Button>
          <Tooltip title="Account" arrow>
            <IconButton
              onClick={handleMenuOpen}
              size="small"
              aria-controls={open ? "account-menu" : undefined}
              aria-haspopup="true"
              aria-expanded={open ? "true" : undefined}
              sx={{ ml: 1 }}
            >
              <Avatar
                src={user?.image || undefined}
                alt={user?.name || user?.email || "User Avatar"}
                sx={{
                  width: 38,
                  height: 38,
                  fontSize: "0.875rem",
                }}
              >
                {getInitials(user?.email)}
              </Avatar>
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={anchorEl}
            id="account-menu"
            open={open}
            onClose={handleMenuClose}
            slotProps={{
              paper: {
                elevation: 3,
                sx: {
                  minWidth: 200,
                  mt: 1.5,
                },
              },
            }}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          >
            <MenuItem
              component={Link}
              href={user?.username ? `/u/@${user.username}` : `/u/${user?.id}`}
              onClick={handleMenuClose}
            >
              <ListItemIcon>
                <PersonIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>My Profile</ListItemText>
            </MenuItem>
            <Divider />
            <MenuItem
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <ListItemIcon>
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
                      (theme) => theme.applyStyles("dark", { display: "none" }),
                    ]}
                  />
                </ListItemIcon>
                <ListItemText>Theme</ListItemText>
              </Box>
              <ThemeToggle />
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleSignOut}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Sign Out</ListItemText>
            </MenuItem>
          </Menu>
        </>
      ) : (
        <Button
          variant="contained"
          sx={{ borderRadius: 2, textTransform: "none" }}
          onClick={handleSignIn}
        >
          Get Started
        </Button>
      )}
    </Box>
  )
}
