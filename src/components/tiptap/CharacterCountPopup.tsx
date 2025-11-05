'use client';

import { Paper, Typography, Box } from '@mui/material';
import { Editor } from '@tiptap/react';
import { useEffect, useState } from 'react';

interface CharacterCountPopupProps {
  editor: Editor;
}

export const CharacterCountPopup = ({ editor }: CharacterCountPopupProps) => {
  const [counts, setCounts] = useState({ characters: 0, words: 0 });

  useEffect(() => {
    if (!editor) return;

    const updateCounts = () => {
      const characters = editor.storage.characterCount?.characters() || 0;
      const words = editor.storage.characterCount?.words() || 0;
      setCounts({ characters, words });
    };

    // Initial update
    updateCounts();

    // Update on content changes
    editor.on('update', updateCounts);
    editor.on('selectionUpdate', updateCounts);

    return () => {
      editor.off('update', updateCounts);
      editor.off('selectionUpdate', updateCounts);
    };
  }, [editor]);

  return (
    <Paper
      elevation={3}
      sx={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        px: 2,
        py: 1,
        bgcolor: 'background.paper',
        border: 1,
        borderColor: 'divider',
        borderRadius: 2,
        zIndex: 1000,
        display: 'flex',
        gap: 2,
        alignItems: 'center',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Typography variant="body2" color="text.secondary" fontWeight={500}>
          Characters:
        </Typography>
        <Typography variant="body2" color="text.primary" fontWeight={600}>
          {counts.characters.toLocaleString()}
        </Typography>
      </Box>
      <Box
        sx={{
          width: 1,
          height: 20,
          bgcolor: 'divider',
        }}
      />
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Typography variant="body2" color="text.secondary" fontWeight={500}>
          Words:
        </Typography>
        <Typography variant="body2" color="text.primary" fontWeight={600}>
          {counts.words.toLocaleString()}
        </Typography>
      </Box>
    </Paper>
  );
};
