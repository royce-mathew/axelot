"use client"

import {
  AppBar,
  Toolbar,
  Box,
  IconButton,
  useColorScheme,
  Fab,
  Zoom,
  useTheme,
  useMediaQuery,
  useScrollTrigger,
} from "@mui/material"
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp"
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
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault()
    if (!isLoading) {
      router.push(isAuthenticated ? "/discover" : "/")
    }
  }

  return (
    <>
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
              <Box
                sx={[
                  {
                    "& img": {
                      filter: "brightness(0.25)",
                      maxWidth: "100%",
                      height: "auto",
                    },
                  },
                  (theme) =>
                    theme.applyStyles("dark", {
                      "& img": {
                        filter: "brightness(1.8)",
                      },
                    }),
                ]}
              >
                <Image
                  src="/axolotl.svg"
                  alt="Axelot Logo"
                  width={50}
                  height={50}
                  priority
                />
              </Box>
            </IconButton>
            <SearchBar />
          </Box>

          <Box sx={{ display: "flex", alignItems: "center" }}>
            <DesktopNav />
            <MobileNav />
          </Box>
        </Toolbar>
      </AppBar>

      {/* Scroll-to-top FAB for mobile */}
      {isMobile && <ScrollTopFab />}
    </>
  )
}

function ScrollTopFab() {
  const trigger = useScrollTrigger({ threshold: 200 })
  const handleClick = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  return (
    <Zoom in={trigger}>
      <Box
        onClick={handleClick}
        role="presentation"
        sx={(theme) => ({
          position: "fixed",
          bottom: 16,
          right: 16,
          zIndex: theme.zIndex.appBar + 1,
        })}
      >
        <Fab color="primary" size="small" aria-label="scroll back to top">
          <KeyboardArrowUpIcon />
        </Fab>
      </Box>
    </Zoom>
  )
}
