"use client"

import { useState } from "react"
import { Box, Typography, Paper } from "@mui/material"
import { Editor } from "@tiptap/react"

interface TablePickerProps {
  editor: Editor
  onInsert: () => void
}

export const TablePicker = ({ editor, onInsert }: TablePickerProps) => {
  const [hoveredCell, setHoveredCell] = useState({ row: 0, col: 0 })
  const maxRows = 10
  const maxCols = 10

  const handleCellHover = (row: number, col: number) => {
    setHoveredCell({ row, col })
  }

  const handleCellClick = (rows: number, cols: number) => {
    editor
      .chain()
      .focus()
      .insertTable({ rows, cols, withHeaderRow: true })
      .run()
    onInsert()
  }

  const renderGrid = () => {
    const cells = []
    for (let row = 1; row <= maxRows; row++) {
      for (let col = 1; col <= maxCols; col++) {
        const isHovered = row <= hoveredCell.row && col <= hoveredCell.col
        cells.push(
          <Box
            key={`${row}-${col}`}
            onMouseEnter={() => handleCellHover(row, col)}
            onClick={() => handleCellClick(row, col)}
            sx={{
              width: 20,
              height: 20,
              border: "1px solid",
              borderColor: "divider",
              bgcolor: isHovered ? "primary.main" : "background.paper",
              cursor: "pointer",
              transition: "background-color 0.1s",
              "&:hover": {
                borderColor: "primary.main",
              },
            }}
          />
        )
      }
    }
    return cells
  }

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        display: "flex",
        flexDirection: "column",
        gap: 1.5,
      }}
    >
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: `repeat(${maxCols}, 20px)`,
          gap: "2px",
        }}
      >
        {renderGrid()}
      </Box>
      <Typography variant="caption" color="text.secondary" textAlign="center">
        {hoveredCell.row > 0 && hoveredCell.col > 0
          ? `${hoveredCell.row} × ${hoveredCell.col} table`
          : "Select table size"}
      </Typography>
    </Paper>
  )
}
