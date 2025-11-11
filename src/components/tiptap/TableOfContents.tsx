'use client';

import { List, ListItem, ListItemButton, ListItemText, Paper, Typography, Box } from '@mui/material';
import type { Editor } from '@tiptap/react';
import { TextSelection } from '@tiptap/pm/state';

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
  anchors: TocAnchor[];
}

export const TableOfContents = ({ editor, anchors }: TableOfContentsProps) => {
 
  const handleClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>, id: string): void => {
    e.preventDefault();

    if (!editor) return;
    const element = editor.view.dom.querySelector(`[data-toc-id="${id}"`) as HTMLElement | null;
    if (!element) return;
    const pos: number = editor.view.posAtDOM(element, 0);

    // set focus
    const tr = editor.view.state.tr;

    tr.setSelection(new TextSelection(tr.doc.resolve(pos)));

    editor.view.dispatch(tr);

    editor.view.focus();

    if (history.pushState) {
      history.pushState(null, '', `#${id}`);
    }

    window.scrollTo({
      top: element.getBoundingClientRect().top + window.scrollY / 2, // Offset for fixed headers
      behavior: 'smooth',
    });
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
        {anchors.map(anchor => (
          <ListItem
            key={anchor.id}
            disablePadding
            sx={{
              pl: (anchor.level - 1) * 2,
            }}
          >
            <ListItemButton
              onClick={e => handleClick(e, anchor.id)}
              sx={{
              py: 0.75,
              px: 1,
              transition: 'all 0.2s ease',
              bgcolor: anchor.isActive
                ? 'action.selected'
                : 'transparent',
             
              }}
              data-toc-id={anchor.id}
            >
            <ListItemText
              primary={anchor.textContent}
              slotProps={{
                primary: {
                  variant: 'body2',
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
