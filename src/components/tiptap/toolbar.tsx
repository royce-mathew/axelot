'use client';

import { Editor } from '@tiptap/react';
import {
  Box,
  Divider,
  IconButton,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Select,
  MenuItem,
  SelectChangeEvent,
  Paper,
} from '@mui/material';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import StrikethroughSIcon from '@mui/icons-material/StrikethroughS';
import CodeIcon from '@mui/icons-material/Code';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import LinkIcon from '@mui/icons-material/Link';
import HorizontalRuleIcon from '@mui/icons-material/HorizontalRule';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import FunctionsIcon from '@mui/icons-material/Functions';

interface ToolbarProps {
  editor: Editor;
}

const Toolbar2 = ({ editor }: ToolbarProps) => {
  const handleHeadingChange = (event: SelectChangeEvent<string>) => {
    const value = event.target.value;
    if (value === 'p') {
      editor.chain().focus().setParagraph().run();
    } else {
      const level = parseInt(value.replace('h', '')) as 1 | 2 | 3 | 4;
      editor.chain().focus().setHeading({ level }).run();
    }
  };

  const getActiveHeading = () => {
    if (editor.isActive('heading', { level: 1 })) return 'h1';
    if (editor.isActive('heading', { level: 2 })) return 'h2';
    if (editor.isActive('heading', { level: 3 })) return 'h3';
    if (editor.isActive('heading', { level: 4 })) return 'h4';
    return 'p';
  };

  const setLink = () => {
    const url = window.prompt('Enter URL:');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const insertMath = () => {
    editor.chain().focus().insertContent({ type: 'inlineMath', attrs: {} }).run();
  };

  return (
    <Paper
      elevation={0}
      sx={{
        borderBottom: 1,
        borderColor: 'divider',
        p: 1,
        display: 'flex',
        gap: 1,
        flexWrap: 'wrap',
        alignItems: 'center',
        bgcolor: 'background.default',
      }}
    >
      {/* Heading Selector */}
      <Select
        value={getActiveHeading()}
        onChange={handleHeadingChange}
        size="small"
        sx={{
          minWidth: 120,
          '& .MuiSelect-select': {
            py: 0.75,
            fontSize: '0.875rem',
          },
        }}
      >
        <MenuItem value="p">Paragraph</MenuItem>
        <MenuItem value="h1">Heading 1</MenuItem>
        <MenuItem value="h2">Heading 2</MenuItem>
        <MenuItem value="h3">Heading 3</MenuItem>
        <MenuItem value="h4">Heading 4</MenuItem>
      </Select>

      <Divider orientation="vertical" flexItem />

      {/* Text Formatting */}
      <ToggleButtonGroup size="small" sx={{ height: 32 }}>
        <ToggleButton
          value="bold"
          selected={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Tooltip title="Bold (Ctrl+B)">
            <FormatBoldIcon fontSize="small" />
          </Tooltip>
        </ToggleButton>
        <ToggleButton
          value="italic"
          selected={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Tooltip title="Italic (Ctrl+I)">
            <FormatItalicIcon fontSize="small" />
          </Tooltip>
        </ToggleButton>
        <ToggleButton
          value="underline"
          selected={editor.isActive('underline')}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <Tooltip title="Underline (Ctrl+U)">
            <FormatUnderlinedIcon fontSize="small" />
          </Tooltip>
        </ToggleButton>
        <ToggleButton
          value="strike"
          selected={editor.isActive('strike')}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <Tooltip title="Strikethrough">
            <StrikethroughSIcon fontSize="small" />
          </Tooltip>
        </ToggleButton>
        <ToggleButton
          value="code"
          selected={editor.isActive('code')}
          onClick={() => editor.chain().focus().toggleCode().run()}
        >
          <Tooltip title="Code">
            <CodeIcon fontSize="small" />
          </Tooltip>
        </ToggleButton>
      </ToggleButtonGroup>

      <Divider orientation="vertical" flexItem />

      {/* Block Formatting */}
      <Box sx={{ display: 'flex', gap: 0.5 }}>
        <Tooltip title="Blockquote">
          <IconButton
            size="small"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            color={editor.isActive('blockquote') ? 'primary' : 'default'}
          >
            <FormatQuoteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Code Block">
          <IconButton
            size="small"
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            color={editor.isActive('codeBlock') ? 'primary' : 'default'}
          >
            <CodeIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      <Divider orientation="vertical" flexItem />

      {/* Lists */}
      <Box sx={{ display: 'flex', gap: 0.5 }}>
        <Tooltip title="Bullet List">
          <IconButton
            size="small"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            color={editor.isActive('bulletList') ? 'primary' : 'default'}
          >
            <FormatListBulletedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Numbered List">
          <IconButton
            size="small"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            color={editor.isActive('orderedList') ? 'primary' : 'default'}
          >
            <FormatListNumberedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      <Divider orientation="vertical" flexItem />

      {/* Insert Elements */}
      <Box sx={{ display: 'flex', gap: 0.5 }}>
        <Tooltip title="Insert Link">
          <IconButton size="small" onClick={setLink}>
            <LinkIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Horizontal Rule">
          <IconButton
            size="small"
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
          >
            <HorizontalRuleIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Insert Math">
          <IconButton size="small" onClick={insertMath}>
            <FunctionsIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      <Divider orientation="vertical" flexItem />

      {/* Undo/Redo */}
      <Box sx={{ display: 'flex', gap: 0.5 }}>
        <Tooltip title="Undo">
          <IconButton
            size="small"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
          >
            <UndoIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Redo">
          <IconButton
            size="small"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
          >
            <RedoIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    </Paper>
  );
};

export default Toolbar2;
