"use client"

import { AppBar, Toolbar, Box, IconButton, useColorScheme } from "@mui/material"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { DesktopNav } from "./DesktopNav"
import { MobileNav } from "./MobileNav"
import { SearchBar } from "./SearchBar"
import { useAuth } from "@/hooks/use-auth"

export const Header = () => {
  const { mode } = useColorScheme()
  const isDark = mode === "dark"
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault()
    if (!isLoading) {
      router.push(isAuthenticated ? "/dashboard" : "/")
    }
  }

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        boxShadow: 3,
        bgcolor: "background.paper",
        borderBottom: 1,
        borderColor: "divider",
      }}
    >
      <Toolbar
        sx={{
          maxWidth: 1200,
          mx: "auto",
          width: "100%",
          px: { xs: 2, sm: 3 },
          justifyContent: "space-between",
          minHeight: { xs: 56, sm: 64 },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            width: "100%",
            maxWidth: 448,
          }}
        >
          <IconButton
            onClick={handleLogoClick}
            sx={{
              width: 50,
              height: 50,
              p: 0.5,
              borderRadius: 1,
              "&:hover": {
                bgcolor: "action.hover",
              },
            }}
          >
            <Image
              src="/axolotl.svg"
              alt="Axelot Logo"
              width={50}
              height={50}
              priority
              style={{
                filter: isDark ? "brightness(1.8)" : "brightness(0.25)",
                maxWidth: "100%",
                height: "auto",
              }}
            />
          </IconButton>
          <SearchBar />
        </Box>

        <Box sx={{ display: "flex", alignItems: "center" }}>
          <DesktopNav />
          <MobileNav />
        </Box>
      </Toolbar>
    </AppBar>
  )
}
