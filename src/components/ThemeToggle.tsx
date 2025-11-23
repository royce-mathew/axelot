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
      sx={[
        {
          position: "relative",
          display: "inline-flex",
          alignItems: "center",
          bgcolor: "rgba(255, 193, 7, 0.16)",
          borderRadius: "20px",
          p: 0.5,
          width: 68,
          height: 36,
          cursor: "pointer",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          "&:hover": {
            bgcolor: "rgba(255, 193, 7, 0.24)",
          },
        },
        (theme) =>
          theme.applyStyles("dark", {
            bgcolor: "rgba(144, 202, 249, 0.16)",
            "&:hover": {
              bgcolor: "rgba(144, 202, 249, 0.24)",
            },
          }),
      ]}
      role="button"
      aria-label="Switch theme mode"
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
        sx={[
          {
            position: "absolute",
            left: 8,
            fontSize: 16,
            color: "warning.main",
            transition: "all 0.3s",
            opacity: 1,
          },
          (theme) =>
            theme.applyStyles("dark", {
              color: "text.disabled",
              opacity: 0.3,
            }),
        ]}
      />
      <DarkMode
        sx={[
          {
            position: "absolute",
            right: 8,
            fontSize: 16,
            color: "text.disabled",
            transition: "all 0.3s",
            opacity: 0.3,
          },
          (theme) =>
            theme.applyStyles("dark", {
              color: "info.light",
              opacity: 1,
            }),
        ]}
      />

      {/* Sliding knob */}
      <Box
        sx={[
          {
            position: "absolute",
            width: 28,
            height: 28,
            borderRadius: "50%",
            bgcolor: "background.paper",
            boxShadow: theme.shadows[2],
            transform: "translateX(0)",
            transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          },
          (theme) =>
            theme.applyStyles("dark", {
              transform: "translateX(32px)",
            }),
        ]}
      >
        <LightMode
          sx={[
            { fontSize: 16, color: "warning.main", display: "block" },
            (theme) =>
              theme.applyStyles("dark", {
                display: "none",
              }),
          ]}
        />
        <DarkMode
          sx={[
            { fontSize: 16, color: "info.main", display: "none" },
            (theme) =>
              theme.applyStyles("dark", {
                display: "block",
              }),
          ]}
        />
      </Box>
    </Box>
  )
}

export default ThemeToggle
