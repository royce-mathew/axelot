"use client"

import React, { useState, useEffect } from "react"
import Dialog from "@mui/material/Dialog"
import DialogTitle from "@mui/material/DialogTitle"
import DialogContent from "@mui/material/DialogContent"
import DialogActions from "@mui/material/DialogActions"
import Button from "@mui/material/Button"
import Chip from "@mui/material/Chip"
import CircularProgress from "@mui/material/CircularProgress"
import Typography from "@mui/material/Typography"
import Box from "@mui/material/Box"
import Stack from "@mui/material/Stack"
import CheckIcon from "@mui/icons-material/Check"
import CloseIcon from "@mui/icons-material/Close"
import RefreshIcon from "@mui/icons-material/Refresh"

interface TextTransformDialogProps {
  isOpen: boolean
  onClose: () => void
  onAccept: (transformedText: string) => void
  onReject: () => void
  originalText: string
  action: string
  model?: string
}

export function TextTransformDialog({
  isOpen,
  onClose,
  onAccept,
  onReject,
  originalText,
  action,
  model = "openrouter/auto",
}: TextTransformDialogProps) {
  const [streamedText, setStreamedText] = useState("")
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const actionLabels: Record<string, string> = {
    "make-longer": "Make Longer",
    "make-shorter": "Make Shorter",
    improve: "Improve",
    simplify: "Simplify",
    formalize: "Formalize",
    casualize: "Casualize",
  }

  const resetState = () => {
    setStreamedText("")
    setIsStreaming(false)
    setError(null)
  }

  const startStreaming = async () => {
    if (!isOpen || !originalText || !action) return

    resetState()
    setIsStreaming(true)

    try {
      const response = await fetch("/api/openrouter/text-transform", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: originalText,
          action,
          model,
          max_tokens: 200,
          temperature: 0.7,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to transform text")
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        throw new Error("No response body")
      }

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split("\n")

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6))

              if (data.type === "content" && data.content) {
                setStreamedText((prev) => prev + data.content)
              } else if (data.type === "done") {
                setIsStreaming(false)
              }
            } catch {
              // Skip malformed JSON
            }
          }
        }
      }
    } catch (error) {
      console.error("Streaming error:", error)
      setError("Failed to transform text. Please try again.")
      setIsStreaming(false)
    }
  }

  useEffect(() => {
    if (isOpen && originalText && action) {
      startStreaming()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, originalText, action])

  const handleAccept = () => {
    if (streamedText.trim()) {
      onAccept(streamedText.trim())
      onClose()
    }
  }

  const handleReject = () => {
    onReject()
    onClose()
  }

  const handleRetry = () => {
    startStreaming()
  }

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Stack direction="row" alignItems="center" spacing={1}>
          <span>AI Text Transformation</span>
          <Chip
            label={actionLabels[action] || action}
            size="small"
            color="default"
          />
        </Stack>
      </DialogTitle>
      <DialogContent
        dividers
        sx={{
          maxHeight: "80vh",
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        {/* Original Text */}
        <Box mb={2}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Original:
          </Typography>
          <Box
            sx={{
              p: 1.5,
              bgcolor: "grey.100",
              borderRadius: 1,
              fontSize: 14,
              maxHeight: 96,
              overflowY: "auto",
            }}
          >
            {originalText}
          </Box>
        </Box>

        {/* Transformed Text */}
        <Box flex={1} minHeight={0}>
          <Stack direction="row" alignItems="center" spacing={1} mb={1}>
            <Typography variant="subtitle2" color="text.secondary">
              {actionLabels[action] || "Transformed"}:
            </Typography>
            {isStreaming && <CircularProgress size={16} />}
          </Stack>
          <Box
            sx={{
              p: 1.5,
              bgcolor: "grey.50",
              borderRadius: 1,
              fontSize: 14,
              minHeight: 120,
              maxHeight: 240,
              overflowY: "auto",
              border: "2px dashed",
              borderColor: "grey.200",
            }}
          >
            {error ? (
              <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                color="error.main"
              >
                <CloseIcon fontSize="small" />
                <Typography color="error">{error}</Typography>
              </Stack>
            ) : streamedText || isStreaming ? (
              <Typography component="div" sx={{ whiteSpace: "pre-wrap" }}>
                {streamedText}
                {isStreaming && (
                  <span style={{ animation: "blink 1s infinite" }}>|</span>
                )}
              </Typography>
            ) : (
              <Typography color="text.secondary" fontStyle="italic">
                Generating transformation...
              </Typography>
            )}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ gap: 1 }}>
        {error && (
          <Button
            onClick={handleRetry}
            variant="outlined"
            disabled={isStreaming}
            startIcon={<RefreshIcon fontSize="small" />}
          >
            Retry
          </Button>
        )}
        <Button
          onClick={handleReject}
          variant="outlined"
          disabled={isStreaming}
          startIcon={<CloseIcon fontSize="small" />}
        >
          Reject
        </Button>
        <Button
          onClick={handleAccept}
          disabled={isStreaming || !streamedText.trim() || !!error}
          startIcon={<CheckIcon fontSize="small" />}
          variant="contained"
        >
          Accept Changes
        </Button>
      </DialogActions>
    </Dialog>
  )
}
