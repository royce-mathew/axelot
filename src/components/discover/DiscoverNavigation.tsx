"use client"

import { Box, Tabs, Tab } from "@mui/material"

export type DiscoverMode = "all" | "foryou" | "fresh"

interface DiscoverNavigationProps {
  value: DiscoverMode
  onChange: (mode: DiscoverMode) => void
}

export function DiscoverNavigation({
  value,
  onChange,
}: DiscoverNavigationProps) {
  const handleChange = (
    _event: React.SyntheticEvent,
    newValue: DiscoverMode
  ) => {
    onChange(newValue)
  }

  return (
    <Box
      sx={{
        position: "sticky",
        top: { xs: 56, sm: 64 },
        zIndex: 10,
        bgcolor: "background.default",
        borderBottom: 1,
        borderColor: "divider",
      }}
    >
      <Tabs
        value={value}
        onChange={handleChange}
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          "& .MuiTabs-indicator": {
            height: 3,
          },
        }}
      >
        <Tab label="All" value="all" />
        <Tab label="For You" value="foryou" />
        <Tab label="Fresh" value="fresh" />
      </Tabs>
    </Box>
  )
}
