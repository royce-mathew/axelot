"use client"

import React from "react"
import type { GhostTextPosition } from "./types"

interface AIGhostOverlayProps {
  /**
   * The pending completion text to display
   */
  text: string

  /**
   * Position for the ghost text
   */
  position: GhostTextPosition | null

  /**
   * Whether dark mode is active
   */
  isDark?: boolean

  /**
   * Custom styles for the ghost text
   */
  style?: React.CSSProperties

  /**
   * Custom class name
   */
  className?: string
}

export function AIGhostOverlay({
  text,
  position,
  isDark = false,
  style = {},
  className = "",
}: AIGhostOverlayProps) {
  if (!text || !position) return null

  const defaultStyle: React.CSSProperties = {
    position: "absolute",
    top: position.top + "px",
    left: position.left + "px",
    pointerEvents: "none",
    color: isDark ? "#6b7280" : "#9ca3af", // Gray-500 : Gray-400
    fontFamily: "inherit",
    fontSize: "inherit",
    lineHeight: "inherit",
    whiteSpace: "pre",
    zIndex: 1,
    userSelect: "none",
    ...style,
  }

  console.log("👻 Rendering AIGhostOverlay at", position, "with text:", text)
  return (
    <div
      className={`ai-ghost-overlay ${className}`}
      style={defaultStyle}
      aria-hidden="true"
      data-testid="ai-ghost-overlay"
    >
      {text}
    </div>
  )
}
