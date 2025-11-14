"use client"

import React from "react"
import { Box, useTheme } from "@mui/material"
import { LightMode, DarkMode } from "@mui/icons-material"
import { useColorScheme } from "@mui/material/styles"

const ThemeToggle: React.FC = () => {
  const { mode, setMode } = useColorScheme()
  const theme = useTheme()
  const isDark = mode === "dark"

  // The mode is always undefined on first render, so make sure to handle this case as shown in the demo below—otherwise you may encounter a hydration mismatch error.
  if (!mode) {
    return (
      <Box
        sx={{
          display: "inline-flex",
          alignItems: "center",
          bgcolor: "action.hover",
          borderRadius: "20px",
          p: 0.5,
          width: 68,
          height: 36,
        }}
      >
        <Box
          sx={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            bgcolor: "background.paper",
            boxShadow: 1,
          }}
        />
      </Box>
    )
  }

  const handleToggle = () => {
    setMode(isDark ? "light" : "dark")
  }

  return (
    <Box
      onClick={handleToggle}
      sx={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        bgcolor: isDark
          ? "rgba(144, 202, 249, 0.16)"
          : "rgba(255, 193, 7, 0.16)",
        borderRadius: "20px",
        p: 0.5,
        width: 68,
        height: 36,
        cursor: "pointer",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        "&:hover": {
          bgcolor: isDark
            ? "rgba(144, 202, 249, 0.24)"
            : "rgba(255, 193, 7, 0.24)",
        },
      }}
      role="button"
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          handleToggle()
        }
      }}
    >
      {/* Icons */}
      <LightMode
        sx={{
          position: "absolute",
          left: 8,
          fontSize: 16,
          color: isDark ? "text.disabled" : "warning.main",
          transition: "all 0.3s",
          opacity: isDark ? 0.3 : 1,
        }}
      />
      <DarkMode
        sx={{
          position: "absolute",
          right: 8,
          fontSize: 16,
          color: isDark ? "info.light" : "text.disabled",
          transition: "all 0.3s",
          opacity: isDark ? 1 : 0.3,
        }}
      />

      {/* Sliding knob */}
      <Box
        sx={{
          position: "absolute",
          width: 28,
          height: 28,
          borderRadius: "50%",
          bgcolor: "background.paper",
          boxShadow: theme.shadows[2],
          transform: isDark ? "translateX(32px)" : "translateX(0)",
          transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {isDark ? (
          <DarkMode sx={{ fontSize: 16, color: "info.main" }} />
        ) : (
          <LightMode sx={{ fontSize: 16, color: "warning.main" }} />
        )}
      </Box>
    </Box>
  )
}

export default ThemeToggle
