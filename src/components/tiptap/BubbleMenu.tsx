'use client';

import { Editor } from '@tiptap/core';
import { Box, IconButton, Divider, Popover } from '@mui/material';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import StrikethroughSIcon from '@mui/icons-material/StrikethroughS';
import FormatColorTextIcon from '@mui/icons-material/FormatColorText';
import FormatColorFillIcon from '@mui/icons-material/FormatColorFill';
import CodeIcon from '@mui/icons-material/Code';
import LinkIcon from '@mui/icons-material/Link';
import { useEffect, useState, useRef } from 'react';
import { Sketch } from '@uiw/react-color';
import { useFloating, offset, flip, shift, autoUpdate } from '@floating-ui/react';

interface BubbleMenuProps {
  editor: Editor | null;
}

export const BubbleMenu = ({ editor }: BubbleMenuProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [textColorAnchor, setTextColorAnchor] = useState<HTMLElement | null>(null);
  const [highlightColorAnchor, setHighlightColorAnchor] = useState<HTMLElement | null>(null);

  // Create a virtual element for the selection
  const virtualElement = useRef({
    getBoundingClientRect: () => ({
      width: 0,
      height: 0,
      x: 0,
      y: 0,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    }),
  });

  const { refs, floatingStyles } = useFloating({
    placement: 'top',
    middleware: [
      offset(8),
      flip({
        fallbackPlacements: ['bottom', 'top'],
      }),
      shift({ padding: 8 }),
    ],
    whileElementsMounted: autoUpdate,
  });

  useEffect(() => {
    if (!editor) return;

    const updateMenu = () => {
      const { state } = editor;
      const { selection } = state;
      const { empty, from, to } = selection;

      // Hide menu if no text is selected
      if (empty || from === to) {
        setIsVisible(false);
        return;
      }

      // Get the DOM coordinates of the selection
      const { view } = editor;
      const start = view.coordsAtPos(from);
      const end = view.coordsAtPos(to);

      // Update virtual element position
      virtualElement.current.getBoundingClientRect = () => ({
        width: end.left - start.left,
        height: end.bottom - start.top,
        x: start.left,
        y: start.top,
        top: start.top,
        left: start.left,
        right: end.left,
        bottom: end.bottom,
      });

      // Set the reference element for Floating UI
      refs.setReference(virtualElement.current as unknown as Element);
      setIsVisible(true);
    };

    // Update on selection change
    editor.on('selectionUpdate', updateMenu);
    editor.on('update', updateMenu);
    editor.on('focus', updateMenu);

    // Update on scroll
    const handleScroll = () => {
      if (isVisible) {
        updateMenu();
      }
    };

    // Add scroll listener to window and editor container
    window.addEventListener('scroll', handleScroll, true);
    const editorElement = editor.view.dom.closest('.tiptap-editor-content')?.parentElement;
    editorElement?.addEventListener('scroll', handleScroll, true);

    return () => {
      editor.off('selectionUpdate', updateMenu);
      editor.off('update', updateMenu);
      editor.off('focus', updateMenu);
      window.removeEventListener('scroll', handleScroll, true);
      editorElement?.removeEventListener('scroll', handleScroll, true);
    };
  }, [editor, isVisible, refs]);

  if (!editor || !isVisible) return null;

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    if (url === null) {
      return;
    }

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  return (
    <>
      <Box
        ref={(node: HTMLDivElement | null) => {
          menuRef.current = node;
          refs.setFloating(node);
        }}
        sx={{
          ...floatingStyles,
          zIndex: 1400,
          display: isVisible ? 'flex' : 'none',
          gap: 0.5,
          p: 0.5,
          bgcolor: 'background.paper',
          border: 1,
          borderColor: 'divider',
          borderRadius: 1,
          boxShadow: 3,
        }}
      >
        {/* Bold */}
        <IconButton
          size="small"
          onClick={() => editor.chain().focus().toggleBold().run()}
          sx={{
            bgcolor: editor.isActive('bold') ? 'action.selected' : 'transparent',
            '&:hover': { bgcolor: editor.isActive('bold') ? 'action.selected' : 'action.hover' },
          }}
        >
          <FormatBoldIcon fontSize="small" />
        </IconButton>

        {/* Italic */}
        <IconButton
          size="small"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          sx={{
            bgcolor: editor.isActive('italic') ? 'action.selected' : 'transparent',
            '&:hover': { bgcolor: editor.isActive('italic') ? 'action.selected' : 'action.hover' },
          }}
        >
          <FormatItalicIcon fontSize="small" />
        </IconButton>

        {/* Underline */}
        <IconButton
          size="small"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          sx={{
            bgcolor: editor.isActive('underline') ? 'action.selected' : 'transparent',
            '&:hover': { bgcolor: editor.isActive('underline') ? 'action.selected' : 'action.hover' },
          }}
        >
          <FormatUnderlinedIcon fontSize="small" />
        </IconButton>

        {/* Strikethrough */}
        <IconButton
          size="small"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          sx={{
            bgcolor: editor.isActive('strike') ? 'action.selected' : 'transparent',
            '&:hover': { bgcolor: editor.isActive('strike') ? 'action.selected' : 'action.hover' },
          }}
        >
          <StrikethroughSIcon fontSize="small" />
        </IconButton>

        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

        {/* Code */}
        <IconButton
          size="small"
          onClick={() => editor.chain().focus().toggleCode().run()}
          sx={{
            bgcolor: editor.isActive('code') ? 'action.selected' : 'transparent',
            '&:hover': { bgcolor: editor.isActive('code') ? 'action.selected' : 'action.hover' },
          }}
        >
          <CodeIcon fontSize="small" />
        </IconButton>

        {/* Link */}
        <IconButton
          size="small"
          onClick={setLink}
          sx={{
            bgcolor: editor.isActive('link') ? 'action.selected' : 'transparent',
            '&:hover': { bgcolor: editor.isActive('link') ? 'action.selected' : 'action.hover' },
          }}
        >
          <LinkIcon fontSize="small" />
        </IconButton>

        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

        {/* Text Color */}
        <IconButton
          size="small"
          onClick={(e) => setTextColorAnchor(e.currentTarget)}
          sx={{
            '&:hover': { bgcolor: 'action.hover' },
          }}
        >
          <FormatColorTextIcon fontSize="small" />
        </IconButton>

        {/* Highlight */}
        <IconButton
          size="small"
          onClick={(e) => setHighlightColorAnchor(e.currentTarget)}
          sx={{
            bgcolor: editor.isActive('highlight') ? 'action.selected' : 'transparent',
            '&:hover': { bgcolor: editor.isActive('highlight') ? 'action.selected' : 'action.hover' },
          }}
        >
          <FormatColorFillIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Text Color Popover */}
      <Popover
        open={Boolean(textColorAnchor)}
        anchorEl={textColorAnchor}
        onClose={() => setTextColorAnchor(null)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
      >
        <Box sx={{ p: 2 }}>
          <Sketch
            color={editor.getAttributes('textStyle').color || '#000000'}
            onChange={(color) => {
              editor.chain().focus().setColor(color.hex).run();
            }}
          />
        </Box>
      </Popover>

      {/* Highlight Color Popover */}
      <Popover
        open={Boolean(highlightColorAnchor)}
        anchorEl={highlightColorAnchor}
        onClose={() => setHighlightColorAnchor(null)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
      >
        <Box sx={{ p: 2 }}>
          <Sketch
            color={editor.getAttributes('highlight').color || '#ffff00'}
            onChange={(color) => {
              editor.chain().focus().setHighlight({ color: color.hex }).run();
            }}
          />
        </Box>
      </Popover>
    </>
  );
};
