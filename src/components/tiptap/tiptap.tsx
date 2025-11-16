"use client"

import { useEffect, useState } from "react"
import { AnyExtension } from "@tiptap/core"
import { EditorContent, JSONContent, useEditor, Editor } from "@tiptap/react"
import { Box, Paper } from "@mui/material"
import Toolbar2 from "./toolbar"
import { BubbleMenu } from "./BubbleMenu"
import { CharacterCountPopup } from "./CharacterCountPopup"
import { extensions } from "./utils/extensions"
import Link from "@tiptap/extension-link"
import "katex/dist/katex.min.css"

export interface TiptapProps {
  onChange?: (content: JSONContent) => void
  onSaved?: (content: JSONContent) => void
  onDeleted?: () => void
  initialContent?: JSONContent | undefined
  passedExtensions?: AnyExtension[]
  editable?: boolean
  readOnly?: boolean
  onEditorReady?: (editor: Editor) => void
}

const Tiptap2 = ({
  passedExtensions,
  initialContent,
  editable = true,
  readOnly = false,
  onEditorReady,
}: TiptapProps) => {
  const [showCharacterCount, setShowCharacterCount] = useState(false)

  const editor = useEditor({
    editorProps: {
      attributes: {
        class: readOnly
          ? "tiptap-editor-content is-readonly"
          : "tiptap-editor-content",
        style: readOnly
          ? "outline: none; min-height: 300px; padding: 8px 4px;" // Minimal padding for readonly mobile
          : "outline: none; min-height: 500px; padding: 24px;",
      },
    },
    extensions: (() => {
      // Reconfigure Link based on readOnly/editable to enable openOnClick in previews
      const shouldOpenOnClick = readOnly || !editable
      const linkConfigured = Link.configure({
        openOnClick: shouldOpenOnClick,
        enableClickSelection: !shouldOpenOnClick,
        HTMLAttributes: {
          rel: "noopener noreferrer",
          target: null,
        },
      })

      // Remove existing Link from base extensions and add our configured one at the end
      const base = extensions.filter(
        (ext: AnyExtension) => ext?.name !== "link"
      )
      return [...base, linkConfigured, ...(passedExtensions ?? [])]
    })(),
    content: initialContent,
    editable,
    immediatelyRender: true,
  })

  // Notify parent when editor is ready (using useEffect to avoid setState during render)
  useEffect(() => {
    if (editor && onEditorReady) {
      onEditorReady(editor)
    }
  }, [editor, onEditorReady])

  if (!editor) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: 400,
          color: "text.secondary",
        }}
      >
        Loading editor...
      </Box>
    )
  }

  return (
    <>
      {/* Toolbar - Only show in edit mode */}
      {!readOnly && (
        <Toolbar2
          editor={editor}
          showCharacterCount={showCharacterCount}
          onToggleCharacterCount={setShowCharacterCount}
        />
      )}

      {/* Bubble Menu - Only show in edit mode */}
      {!readOnly && <BubbleMenu editor={editor} />}

      {/* Character Count Popup */}
      {showCharacterCount && <CharacterCountPopup editor={editor} />}

      {/* Editor Content */}
      <Paper
        elevation={0}
        sx={{
          border: readOnly ? 0 : 1,
          borderColor: "divider",
          borderRadius: readOnly ? 0 : 2,
          overflow: "hidden",
          borderTop: readOnly ? 0 : 0,
          borderTopLeftRadius: readOnly ? 0 : 0,
          borderTopRightRadius: readOnly ? 0 : 0,
          bgcolor: readOnly ? "transparent" : "background.paper",
        }}
      >
        <Box
          sx={{
            "& .tiptap-editor-content": {
              fontFamily: "var(--font-dm-sans)",
              fontSize: { xs: "1rem", sm: "1.125rem" }, // Slightly smaller on mobile
              lineHeight: { xs: 1.7, sm: 1.8 },
              color: "text.primary",
              padding: readOnly
                ? { xs: "0", sm: "8px" }
                : { xs: "16px", sm: "24px" },
              "& h1": {
                fontSize: { xs: "1.875rem", sm: "2.5rem" }, // Responsive heading sizes
                fontWeight: 700,
                fontFamily: "var(--font-outfit)",
                marginTop: { xs: 1.5, sm: 2 },
                marginBottom: { xs: 1, sm: 1.5 },
                lineHeight: 1.2,
              },
              "& h2": {
                fontSize: { xs: "1.5rem", sm: "2rem" },
                fontWeight: 600,
                fontFamily: "var(--font-outfit)",
                marginTop: { xs: 1.5, sm: 2 },
                marginBottom: { xs: 1, sm: 1.5 },
                lineHeight: 1.3,
              },
              "& h3": {
                fontSize: { xs: "1.25rem", sm: "1.5rem" },
                fontWeight: 600,
                fontFamily: "var(--font-outfit)",
                marginTop: { xs: 1.25, sm: 1.5 },
                marginBottom: { xs: 0.75, sm: 1 },
                lineHeight: 1.4,
              },
              "& h4": {
                fontSize: { xs: "1.125rem", sm: "1.25rem" },
                fontWeight: 600,
                fontFamily: "var(--font-outfit)",
                marginTop: { xs: 1.25, sm: 1.5 },
                marginBottom: { xs: 0.75, sm: 1 },
                lineHeight: 1.4,
              },
              "& p": {
                marginTop: { xs: 0.75, sm: 1 },
                marginBottom: { xs: 0.75, sm: 1 },
                wordBreak: "break-word", // Prevent text overflow on mobile
              },
              "& a": {
                color: "primary.main",
                textDecoration: "underline",
                wordBreak: "break-word", // Prevent long links from overflowing
                "&:hover": {
                  textDecoration: "none",
                },
              },
              "& code": {
                backgroundColor: "action.hover",
                padding: "2px 6px",
                borderRadius: "4px",
                fontSize: { xs: "0.875em", sm: "0.9em" },
                fontFamily: "monospace",
                wordBreak: "break-all", // Allow code to wrap on mobile
              },
              "& pre": {
                backgroundColor: "action.hover",
                padding: { xs: 1.5, sm: 2 },
                borderRadius: 1,
                overflow: "auto",
                marginTop: { xs: 1, sm: 1.5 },
                marginBottom: { xs: 1, sm: 1.5 },
                "& code": {
                  backgroundColor: "transparent",
                  padding: 0,
                  fontSize: { xs: "0.813rem", sm: "0.875rem" },
                },
              },
              "& blockquote": {
                borderLeft: "4px solid",
                borderColor: "primary.main",
                paddingLeft: { xs: 1.5, sm: 2 },
                marginLeft: 0,
                marginTop: { xs: 1, sm: 1.5 },
                marginBottom: { xs: 1, sm: 1.5 },
                fontStyle: "italic",
                color: "text.secondary",
              },
              "& ul": {
                listStyleType: "disc",
                paddingLeft: { xs: 2.5, sm: 3 },
                marginTop: { xs: 0.75, sm: 1 },
                marginBottom: { xs: 0.75, sm: 1 },
              },
              "& ol": {
                listStyleType: "decimal",
                paddingLeft: { xs: 2.5, sm: 3 },
                marginTop: { xs: 0.75, sm: 1 },
                marginBottom: { xs: 0.75, sm: 1 },
              },
              "& li": {
                marginTop: { xs: 0.375, sm: 0.5 },
                marginBottom: { xs: 0.375, sm: 0.5 },
              },
              "& hr": {
                border: "none",
                borderTop: "1px solid",
                borderColor: "divider",
                marginTop: { xs: 2, sm: 3 },
                marginBottom: { xs: 2, sm: 3 },
              },
              "& .ProseMirror-focused": {
                outline: "none",
              },
              "& p.is-editor-empty:first-child::before": {
                content: "attr(data-placeholder)",
                float: "left",
                color: "text.disabled",
                pointerEvents: "none",
                height: 0,
              },
              // Mobile-specific optimizations for readonly
              ...(readOnly && {
                maxWidth: "100%",
                overflowX: "hidden",
                "& img": {
                  maxWidth: "100%",
                  height: "auto",
                },
                "& table": {
                  display: "block",
                  overflowX: "auto",
                  width: "100%",
                },
              }),
            },
          }}
        >
          <EditorContent editor={editor} />
        </Box>
      </Paper>
    </>
  )
}

export default Tiptap2
