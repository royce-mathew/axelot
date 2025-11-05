'use client';

import { List, ListItem, ListItemButton, ListItemText, Paper, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import type { Editor } from '@tiptap/react';

export interface TocAnchor {
  id: string;
  level: number;
  textContent: string;
  isActive: boolean;
  isScrolledOver: boolean;
  pos: number;
}

interface TableOfContentsProps {
  editor: Editor | null;
}

export const TableOfContents = ({ editor }: TableOfContentsProps) => {
  const [anchors, setAnchors] = useState<TocAnchor[]>([]);

  useEffect(() => {
    if (!editor) return;

    // Function to extract headings manually
    const updateAnchors = () => {
      const headings: TocAnchor[] = [];
      
      editor.state.doc.descendants((node, pos) => {
        if (node.type.name === 'heading') {
          const id = `heading-${pos}`;
          headings.push({
            id,
            level: node.attrs.level,
            textContent: node.textContent,
            isActive: false,
            isScrolledOver: false,
            pos,
          });
        }
      });
      
      setAnchors(headings);
    };

    // Update on editor changes
    updateAnchors();
    editor.on('update', updateAnchors);
    editor.on('selectionUpdate', updateAnchors);

    return () => {
      editor.off('update', updateAnchors);
      editor.off('selectionUpdate', updateAnchors);
    };
  }, [editor]);

  const handleClick = (anchor: TocAnchor) => {
    if (!editor) return;
    
    // Scroll to the heading position
    editor.commands.focus();
    editor.commands.setTextSelection(anchor.pos);
    
    // Scroll the heading into view - centered
    const element = editor.view.domAtPos(anchor.pos).node as HTMLElement;
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  if (!editor || anchors.length === 0) {
    return null;
  }

  return (
    <Paper
      elevation={2}
      sx={{
        // Mobile: vertical list at top (not sticky)
        // Desktop: fixed on right side
        position: { xs: 'relative', md: 'fixed' },
        top: { xs: 0, md: 100 },
        right: { xs: 0, md: 24 },
        left: { xs: 0, md: 'auto' },
        width: { xs: '100%', md: 280 },
        maxHeight: { xs: 'calc(50vh)', md: 'calc(100vh - 120px)' },
        overflow: 'auto',
        p: { xs: 2, md: 2.5 },
        borderRadius: { xs: 2, md: 2 },
        bgcolor: 'background.paper',
        border: 1,
        borderColor: 'divider',
        zIndex: { xs: 1, md: 5 },
        display: anchors.length > 0 ? 'block' : 'none',
        boxShadow: { xs: 2, md: 2 },
        mb: { xs: 3, md: 0 },
        '&::-webkit-scrollbar': {
          width: '8px',
          height: '8px',
        },
        '&::-webkit-scrollbar-track': {
          backgroundColor: 'rgba(0, 0, 0, 0.05)',
          borderRadius: '4px',
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: 'rgba(0, 0, 0, 0.2)',
          borderRadius: '4px',
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
          },
        },
      }}
    >
      <Typography 
        variant="overline" 
        fontWeight="bold" 
        sx={{ 
          px: 1,
          mb: 1.5,
          display: 'block',
          color: 'text.secondary',
          letterSpacing: 1.2,
          fontSize: '0.75rem',
        }}
      >
        Table of Contents
      </Typography>
      <List 
        dense 
        disablePadding
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 0.5,
        }}
      >
        {anchors.map((anchor) => (
          <ListItem
            key={anchor.id}
            disablePadding
            sx={{
              pl: (anchor.level - 1) * 2,
            }}
          >
            <ListItemButton
              onClick={() => handleClick(anchor)}
              sx={{
                py: 1,
                px: 1.5,
                borderRadius: 1.5,
                minHeight: 36,
                transition: 'all 0.2s ease',
                borderLeft: '3px solid transparent',
                '&:hover': {
                  backgroundColor: 'action.hover',
                  borderLeftColor: 'primary.main',
                  transform: 'translateX(4px)',
                },
              }}
            >
              <ListItemText
                primary={anchor.textContent}
                primaryTypographyProps={{
                  variant: anchor.level === 1 ? 'body2' : 'body2',
                  fontWeight: anchor.level === 1 ? 600 : 400,
                  color: anchor.level === 1 ? 'text.primary' : 'text.secondary',
                  fontSize: anchor.level === 1 ? '0.875rem' : '0.8125rem',
                  sx: {
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    lineHeight: 1.4,
                  },
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};
