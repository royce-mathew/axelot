'use client';

import { useEffect, useState } from 'react';
import { Extension } from '@tiptap/core';
import { EditorContent, JSONContent, useEditor, Editor } from '@tiptap/react';
import { Box, Paper } from '@mui/material';
import Toolbar2 from './toolbar';
import { BubbleMenu } from './BubbleMenu';
import { CharacterCountPopup } from './CharacterCountPopup';
import { extensions } from './utils/extensions';
import 'katex/dist/katex.min.css';

export interface TiptapProps {
  onChange?: (content: JSONContent) => void;
  onSaved?: (content: JSONContent) => void;
  onDeleted?: () => void;
  initialContent?: JSONContent | undefined;
  passedExtensions?: Extension[];
  editable?: boolean;
  onEditorReady?: (editor: Editor) => void;
}

const Tiptap2 = ({ passedExtensions, initialContent, editable = true, onEditorReady }: TiptapProps) => {
  const [showCharacterCount, setShowCharacterCount] = useState(false);
  
  const editor = useEditor({
    editorProps: {
      attributes: {
        class: 'tiptap-editor-content',
        style: 'outline: none; min-height: 500px; padding: 24px;',
      },
    },
    extensions: [
      ...extensions,
      ...(passedExtensions ?? []),
    ],
    content: initialContent,
    editable,
    immediatelyRender: false,
  });

  // Notify parent when editor is ready (using useEffect to avoid setState during render)
  useEffect(() => {
    if (editor && onEditorReady) {
      onEditorReady(editor);
    }
  }, [editor, onEditorReady]);

  if (!editor) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 400,
          color: 'text.secondary',
        }}
      >
        Loading editor...
      </Box>
    );
  }

  return (
    <>
      {/* Toolbar - Outside Paper so it can be sticky */}
      <Toolbar2 
        editor={editor} 
        showCharacterCount={showCharacterCount}
        onToggleCharacterCount={setShowCharacterCount}
      />
      
      {/* Bubble Menu */}
      <BubbleMenu editor={editor} />
      
      {/* Character Count Popup */}
      {showCharacterCount && <CharacterCountPopup editor={editor} />}
      
      {/* Editor Content */}
      <Paper
        elevation={0}
        sx={{
          border: 1,
          borderColor: 'divider',
          borderRadius: 2,
          overflow: 'hidden',
          borderTop: 0,
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
        }}
      >
        <Box
          sx={{
            '& .tiptap-editor-content': {
            fontFamily: 'var(--font-dm-sans)',
            fontSize: '1.125rem',
            lineHeight: 1.8,
            color: 'text.primary',
            '& h1': {
              fontSize: '2.5rem',
              fontWeight: 700,
              fontFamily: 'var(--font-outfit)',
              marginTop: 2,
              marginBottom: 1.5,
              lineHeight: 1.2,
            },
            '& h2': {
              fontSize: '2rem',
              fontWeight: 600,
              fontFamily: 'var(--font-outfit)',
              marginTop: 2,
              marginBottom: 1.5,
              lineHeight: 1.3,
            },
            '& h3': {
              fontSize: '1.5rem',
              fontWeight: 600,
              fontFamily: 'var(--font-outfit)',
              marginTop: 1.5,
              marginBottom: 1,
              lineHeight: 1.4,
            },
            '& h4': {
              fontSize: '1.25rem',
              fontWeight: 600,
              fontFamily: 'var(--font-outfit)',
              marginTop: 1.5,
              marginBottom: 1,
              lineHeight: 1.4,
            },
            '& p': {
              marginTop: 1,
              marginBottom: 1,
            },
            '& a': {
              color: 'primary.main',
              textDecoration: 'underline',
              '&:hover': {
                textDecoration: 'none',
              },
            },
            '& code': {
              backgroundColor: 'action.hover',
              padding: '2px 6px',
              borderRadius: '4px',
              fontSize: '0.9em',
              fontFamily: 'monospace',
            },
            '& pre': {
              backgroundColor: 'action.hover',
              padding: 2,
              borderRadius: 1,
              overflow: 'auto',
              marginTop: 1.5,
              marginBottom: 1.5,
              '& code': {
                backgroundColor: 'transparent',
                padding: 0,
              },
            },
            '& blockquote': {
              borderLeft: '4px solid',
              borderColor: 'primary.main',
              paddingLeft: 2,
              marginLeft: 0,
              marginTop: 1.5,
              marginBottom: 1.5,
              fontStyle: 'italic',
              color: 'text.secondary',
            },
            '& ul': {
              listStyleType: 'disc',
              paddingLeft: 3,
              marginTop: 1,
              marginBottom: 1,
            },
            '& ol': {
              listStyleType: 'decimal',
              paddingLeft: 3,
              marginTop: 1,
              marginBottom: 1,
            },
            '& li': {
              marginTop: 0.5,
              marginBottom: 0.5,
            },
            '& hr': {
              border: 'none',
              borderTop: '1px solid',
              borderColor: 'divider',
              marginTop: 3,
              marginBottom: 3,
            },
            '& .ProseMirror-focused': {
              outline: 'none',
            },
            '& p.is-editor-empty:first-child::before': {
              content: 'attr(data-placeholder)',
              float: 'left',
              color: 'text.disabled',
              pointerEvents: 'none',
              height: 0,
            },
          },
        }}
      >
        <EditorContent editor={editor} />
      </Box>
    </Paper>
    </>
  );
};

export default Tiptap2;
