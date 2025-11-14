import React from "react"
import Card, { CardProps } from "@mui/material/Card"
import { SxProps, Theme } from "@mui/material/styles"

export interface HoverCardProps extends CardProps {
  sx?: SxProps<Theme>
  href?: string // allow passing href when component is Next Link
}

export default function HoverCard({ sx, children, ...rest }: HoverCardProps) {
  return (
    <Card
      elevation={0}
      sx={{
        textDecoration: "none",
        border: 1,
        borderColor: "divider",
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          boxShadow: 3,
          borderColor: "primary.main",
          transform: "translateY(-4px)",
        },
        ...sx,
      }}
      {...rest}
    >
      {children}
    </Card>
  )
}
