'use client';

import { List, ListItem, ListItemButton, ListItemText, Paper, Typography, Box } from '@mui/material';
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
      
      // Only update if the structure changed (different count or content)
      setAnchors(prev => {
        if (prev.length !== headings.length) return headings;
        
        const hasChanged = headings.some((h, i) => 
          h.textContent !== prev[i]?.textContent || 
          h.level !== prev[i]?.level ||
          h.pos !== prev[i]?.pos
        );
        
        return hasChanged ? headings : prev;
      });
    };

    // Update on editor content changes only (not selection)
    updateAnchors();
    editor.on('update', updateAnchors);

    return () => {
      editor.off('update', updateAnchors);
    };
  }, [editor]);

  const handleClick = (anchor: TocAnchor) => {
    if (!editor) return;
    
    // Focus editor and move cursor to heading content
    editor.commands.focus();
    editor.commands.setTextSelection(anchor.pos + 1);
    
    // Find and scroll to the heading element
    const { node } = editor.view.domAtPos(anchor.pos);
    const element = node.nodeType === Node.TEXT_NODE ? node.parentElement : node;
    const heading = (element as HTMLElement)?.closest('h1, h2, h3, h4, h5, h6');
    
    heading?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  if (!editor || anchors.length === 0) {
    return null;
  }

  return (
    <Paper
      elevation={0}
      sx={{
        // Sticky positioning that stays in place as users scroll
        position: 'sticky',
        top: { xs: 0, md: 100 },
        width: '100%',
        maxWidth: { xs: '100%', md: 260 },
        maxHeight: { xs: 'calc(50vh)', md: 'calc(100vh - 120px)' },
        overflow: 'auto',
        p: 0,
        borderRadius: 0,
        bgcolor: 'transparent',
        border: 0,
        zIndex: { xs: 1, md: 5 },
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
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 0,
          py: 1.5,
          borderBottom: 1,
          borderColor: 'divider',
          position: 'sticky',
          top: 0,
          bgcolor: 'background.default',
          zIndex: 1,
        }}
      >
        <Typography 
          variant="overline" 
          fontWeight="bold" 
          sx={{ 
            color: 'text.secondary',
            letterSpacing: 1.2,
            fontSize: '0.75rem',
          }}
        >
          Table of Contents
        </Typography>
      </Box>

      {/* Content area */}
      <Box sx={{ p: { xs: 2, md: 2.5 } }}>
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
                py: 0.75,
                px: 1,
                borderRadius: 1,
                minHeight: 32,
                transition: 'all 0.2s ease',
                borderLeft: '2px solid transparent',
                '&:hover': {
                  backgroundColor: 'action.hover',
                  borderLeftColor: 'primary.main',
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
      </Box>
    </Paper>
  );
};
