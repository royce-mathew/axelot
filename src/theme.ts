"use client"
import { createTheme } from "@mui/material/styles"

const theme = createTheme({
  colorSchemes: {
    dark: {
      palette: {
        background: {
          default: "#1e1e1e", // Research-backed: Similar to VS Code dark, reduces eye strain
          paper: "#252526", // Subtle elevation for better content hierarchy
        },
        text: {
          primary: "#e0e0e0", // Not pure white - reduces glare and eye fatigue
          secondary: "#9e9e9e",
        },
      },
    },
    light: {
      palette: {
        background: {
          default: "#f5f5f5", // Sepia-tinted off-white - proven to reduce eye strain
          paper: "#ffffff", // Pure white for content contrast
        },
        text: {
          primary: "#1a1a1a", // Not pure black - improves long-form readability
          secondary: "#666666",
        },
      },
    },
  },
  cssVariables: {
    colorSchemeSelector: "class",
  },
  typography: {
    fontFamily: "var(--font-dm-sans), system-ui, -apple-system, sans-serif",
    h1: {
      fontFamily: "var(--font-outfit), system-ui, sans-serif",
      fontWeight: 700,
    },
    h2: {
      fontFamily: "var(--font-outfit), system-ui, sans-serif",
      fontWeight: 700,
    },
    h3: {
      fontFamily: "var(--font-outfit), system-ui, sans-serif",
      fontWeight: 600,
    },
    h4: {
      fontFamily: "var(--font-outfit), system-ui, sans-serif",
      fontWeight: 600,
    },
    h5: {
      fontFamily: "var(--font-dm-sans), system-ui, sans-serif",
      fontWeight: 500,
    },
    h6: {
      fontFamily: "var(--font-outfit), system-ui, sans-serif",
      fontWeight: 600,
    },
    body1: {
      fontFamily: "var(--font-dm-sans), system-ui, sans-serif",
      lineHeight: 1.7,
    },
    body2: {
      fontFamily: "var(--font-dm-sans), system-ui, sans-serif",
      lineHeight: 1.6,
    },
  },
})

export default theme
