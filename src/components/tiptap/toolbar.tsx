'use client';

import { useEffect, useState } from 'react';
import { Editor } from '@tiptap/react';
import {
  Box,
  Button,
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
  Popover,
  Select,
  SelectChangeEvent,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from '@mui/material';
import { Sketch } from '@uiw/react-color';
import FormatAlignCenterIcon from '@mui/icons-material/FormatAlignCenter';
import FormatAlignJustifyIcon from '@mui/icons-material/FormatAlignJustify';
import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft';
import FormatAlignRightIcon from '@mui/icons-material/FormatAlignRight';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatColorFillIcon from '@mui/icons-material/FormatColorFill';
import FormatColorTextIcon from '@mui/icons-material/FormatColorText';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import FormatSizeIcon from '@mui/icons-material/FormatSize';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import FunctionsIcon from '@mui/icons-material/Functions';
import HorizontalRuleIcon from '@mui/icons-material/HorizontalRule';
import LinkIcon from '@mui/icons-material/Link';
import LineWeightIcon from '@mui/icons-material/LineWeight';
import PrintIcon from '@mui/icons-material/Print';
import RedoIcon from '@mui/icons-material/Redo';
import StrikethroughSIcon from '@mui/icons-material/StrikethroughS';
import TableChartIcon from '@mui/icons-material/TableChart';
import UndoIcon from '@mui/icons-material/Undo';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import CodeIcon from '@mui/icons-material/Code';
import NumbersIcon from '@mui/icons-material/Numbers';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import TableRowsIcon from '@mui/icons-material/TableRows';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { TablePicker } from './TablePicker';

interface ToolbarProps {
  editor: Editor;
  showCharacterCount?: boolean;
  onToggleCharacterCount?: (show: boolean) => void;
}

const FONT_FAMILIES = [
  { label: 'Default', value: '', fontFamily: 'inherit' },
  { label: 'DM Sans', value: 'var(--font-dm-sans), sans-serif', fontFamily: 'var(--font-dm-sans), sans-serif' },
  { label: 'Outfit', value: 'var(--font-outfit), sans-serif', fontFamily: 'var(--font-outfit), sans-serif' },
  { label: 'Arial', value: 'Arial, sans-serif', fontFamily: 'Arial, sans-serif' },
  { label: 'Times New Roman', value: '"Times New Roman", serif', fontFamily: '"Times New Roman", serif' },
  { label: 'Courier New', value: '"Courier New", monospace', fontFamily: '"Courier New", monospace' },
  { label: 'Georgia', value: 'Georgia, serif', fontFamily: 'Georgia, serif' },
  { label: 'Verdana', value: 'Verdana, sans-serif', fontFamily: 'Verdana, sans-serif' },
];

const FONT_SIZES = ['12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px', '36px', '48px'];

const LINE_HEIGHTS = [
  { label: 'Compact (1.0)', value: '100%' },
  { label: 'Normal (1.5)', value: '150%' },
  { label: 'Relaxed (1.75)', value: '175%' },
  { label: 'Loose (2.0)', value: '200%' },
  { label: 'Extra Loose (2.5)', value: '250%' },
];

const Toolbar2 = ({ editor, showCharacterCount = false, onToggleCharacterCount }: ToolbarProps) => {
  const [, setUpdateTrigger] = useState(0);
  const [colorAnchor, setColorAnchor] = useState<HTMLButtonElement | null>(null);
  const [highlightAnchor, setHighlightAnchor] = useState<HTMLButtonElement | null>(null);
  const [invisibleCharsEnabled, setInvisibleCharsEnabled] = useState(false);
  
  // Menu anchors
  const [fileMenuAnchor, setFileMenuAnchor] = useState<HTMLElement | null>(null);
  const [editMenuAnchor, setEditMenuAnchor] = useState<HTMLElement | null>(null);
  const [viewMenuAnchor, setViewMenuAnchor] = useState<HTMLElement | null>(null);
  const [insertMenuAnchor, setInsertMenuAnchor] = useState<HTMLElement | null>(null);
  const [formatMenuAnchor, setFormatMenuAnchor] = useState<HTMLElement | null>(null);
  const [tablePickerAnchor, setTablePickerAnchor] = useState<HTMLElement | null>(null);
  const [alignMenuAnchor, setAlignMenuAnchor] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!editor) return;

    const handleUpdate = () => {
      setUpdateTrigger((prev) => prev + 1);
    };

    editor.on('selectionUpdate', handleUpdate);
    editor.on('transaction', handleUpdate);

    return () => {
      editor.off('selectionUpdate', handleUpdate);
      editor.off('transaction', handleUpdate);
    };
  }, [editor]);

  const getActiveHeading = () => {
    if (editor.isActive('heading', { level: 1 })) return 'h1';
    if (editor.isActive('heading', { level: 2 })) return 'h2';
    if (editor.isActive('heading', { level: 3 })) return 'h3';
    if (editor.isActive('heading', { level: 4 })) return 'h4';
    return 'p';
  };

  const handleHeadingChange = (event: SelectChangeEvent<string>) => {
    const value = event.target.value;
    if (value === 'p') {
      editor.chain().focus().setParagraph().run();
    } else {
      const level = parseInt(value.replace('h', '')) as 1 | 2 | 3 | 4;
      editor.chain().focus().setHeading({ level }).run();
    }
  };

  const getFontFamily = () => {
    const fontFamily = editor.getAttributes('textStyle').fontFamily;
    return fontFamily || '';
  };

  const handleFontFamilyChange = (event: SelectChangeEvent<string>) => {
    const value = event.target.value;
    if (value) {
      editor.chain().focus().setFontFamily(value).run();
    } else {
      editor.chain().focus().unsetFontFamily().run();
    }
  };

  const getFontSize = () => {
    return editor.getAttributes('textStyle').fontSize || '';
  };

  const handleFontSizeChange = (event: SelectChangeEvent<string>) => {
    const value = event.target.value;
    if (value) {
      editor.chain().focus().setFontSize(value).run();
    } else {
      editor.chain().focus().unsetFontSize().run();
    }
  };

  const getLineHeight = () => {
    return editor.getAttributes('paragraph').lineHeight || '150%';
  };

  const handleLineHeightChange = (event: SelectChangeEvent<string>) => {
    const value = event.target.value;
    editor.chain().focus().setLineHeight(value).run();
  };

  const getCurrentAlignment = () => {
    if (editor.isActive({ textAlign: 'left' })) return 'left';
    if (editor.isActive({ textAlign: 'center' })) return 'center';
    if (editor.isActive({ textAlign: 'right' })) return 'right';
    if (editor.isActive({ textAlign: 'justify' })) return 'justify';
    return 'left'; // default
  };

  const getAlignmentIcon = () => {
    const align = getCurrentAlignment();
    switch (align) {
      case 'center':
        return <FormatAlignCenterIcon fontSize="small" />;
      case 'right':
        return <FormatAlignRightIcon fontSize="small" />;
      case 'justify':
        return <FormatAlignJustifyIcon fontSize="small" />;
      default:
        return <FormatAlignLeftIcon fontSize="small" />;
    }
  };

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

  const insertMath = () => {
    const latex = window.prompt('LaTeX formula:');
    if (latex) {
      editor.chain().focus().insertContent(`$${latex}$`).run();
    }
  };

  const handleColorClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setColorAnchor(event.currentTarget);
  };

  const handleHighlightClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setHighlightAnchor(event.currentTarget);
  };

  const handleColorChange = (color: { hex: string }) => {
    editor.chain().focus().setColor(color.hex).run();
  };

  const handleHighlightChange = (color: { hex: string }) => {
    editor.chain().focus().setHighlight({ color: color.hex }).run();
  };

  const toggleInvisibleChars = () => {
    editor.commands.toggleInvisibleCharacters();
    setInvisibleCharsEnabled(!invisibleCharsEnabled);
  };

  const getCharacterCount = () => {
    return editor.storage.characterCount?.characters() || 0;
  };

  const getWordCount = () => {
    return editor.storage.characterCount?.words() || 0;
  };

  return (
    <Box 
      sx={{ 
        border: 1,
        borderColor: 'divider',
        borderRadius: '8px 8px 0 0',
        overflow: 'hidden',
        bgcolor: 'background.paper',
      }}
    >
      {/* Menu Bar */}
      <Paper
        elevation={0}
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          bgcolor: 'background.paper',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Button
            onClick={(e) => setFileMenuAnchor(e.currentTarget)}
            sx={{ textTransform: 'none', color: 'text.primary', px: 2, py: 1 }}
          >
            File
          </Button>
          <Button
            onClick={(e) => setEditMenuAnchor(e.currentTarget)}
            sx={{ textTransform: 'none', color: 'text.primary', px: 2, py: 1 }}
          >
            Edit
          </Button>
          <Button
            onClick={(e) => setViewMenuAnchor(e.currentTarget)}
            sx={{ textTransform: 'none', color: 'text.primary', px: 2, py: 1 }}
          >
            View
          </Button>
          <Button
            onClick={(e) => setInsertMenuAnchor(e.currentTarget)}
            sx={{ textTransform: 'none', color: 'text.primary', px: 2, py: 1 }}
          >
            Insert
          </Button>
          <Button
            onClick={(e) => setFormatMenuAnchor(e.currentTarget)}
            sx={{ textTransform: 'none', color: 'text.primary', px: 2, py: 1 }}
          >
            Format
          </Button>
        </Box>
      </Paper>

      {/* File Menu */}
      <Menu
        anchorEl={fileMenuAnchor}
        open={Boolean(fileMenuAnchor)}
        onClose={() => setFileMenuAnchor(null)}
        slotProps={{
          paper: {
            sx: { zIndex: 1300 }
          }
        }}
      >
        <MenuItem onClick={() => { editor.commands.print(); setFileMenuAnchor(null); }}>
          <ListItemIcon>
            <PrintIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Print</ListItemText>
          <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
            Ctrl+P
          </Typography>
        </MenuItem>
      </Menu>

      {/* Edit Menu */}
      <Menu
        anchorEl={editMenuAnchor}
        open={Boolean(editMenuAnchor)}
        onClose={() => setEditMenuAnchor(null)}
        slotProps={{
          paper: {
            sx: { zIndex: 1300 }
          }
        }}
      >
        <MenuItem
          onClick={() => { editor.chain().focus().undo().run(); setEditMenuAnchor(null); }}
          disabled={!editor.can().undo()}
        >
          <ListItemIcon>
            <UndoIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Undo</ListItemText>
          <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
            Ctrl+Z
          </Typography>
        </MenuItem>
        <MenuItem
          onClick={() => { editor.chain().focus().redo().run(); setEditMenuAnchor(null); }}
          disabled={!editor.can().redo()}
        >
          <ListItemIcon>
            <RedoIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Redo</ListItemText>
          <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
            Ctrl+Y
          </Typography>
        </MenuItem>
      </Menu>

      {/* View Menu */}
      <Menu
        anchorEl={viewMenuAnchor}
        open={Boolean(viewMenuAnchor)}
        onClose={() => setViewMenuAnchor(null)}
        slotProps={{
          paper: {
            sx: { zIndex: 1300 }
          }
        }}
      >
        <MenuItem onClick={() => { toggleInvisibleChars(); setViewMenuAnchor(null); }}>
          <ListItemIcon>
            {invisibleCharsEnabled ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
          </ListItemIcon>
          <ListItemText>
            {invisibleCharsEnabled ? 'Hide' : 'Show'} Non-Printable Characters
          </ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { onToggleCharacterCount?.(!showCharacterCount); setViewMenuAnchor(null); }}>
          <ListItemIcon>
            {showCharacterCount ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
          </ListItemIcon>
          <ListItemText>
            {showCharacterCount ? 'Hide' : 'Show'} Character Count
          </ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem disabled>
          <ListItemIcon>
            <NumbersIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>
            Characters: {getCharacterCount()} | Words: {getWordCount()}
          </ListItemText>
        </MenuItem>
      </Menu>

      {/* Insert Menu */}
      <Menu
        anchorEl={insertMenuAnchor}
        open={Boolean(insertMenuAnchor)}
        onClose={() => setInsertMenuAnchor(null)}
        slotProps={{
          paper: {
            sx: { zIndex: 1300 }
          }
        }}
      >
        <MenuItem onClick={() => { setLink(); setInsertMenuAnchor(null); }}>
          <ListItemIcon>
            <LinkIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Link</ListItemText>
          <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
            Ctrl+K
          </Typography>
        </MenuItem>
        <MenuItem onClick={(e) => { setTablePickerAnchor(e.currentTarget); }}>
          <ListItemIcon>
            <TableChartIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Insert Table</ListItemText>
        </MenuItem>
        {/* Table manipulation options - only show when cursor is in a table */}
        {editor.can().addColumnAfter() && [
            <Divider key="divider-1" />,
            <MenuItem key="col-before" onClick={() => { editor.chain().focus().addColumnBefore().run(); setInsertMenuAnchor(null); }}>
              <ListItemIcon>
                <ViewColumnIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Column Before</ListItemText>
              <ListItemIcon sx={{ ml: 'auto', minWidth: 'auto' }}>
                <AddIcon fontSize="small" />
              </ListItemIcon>
            </MenuItem>,
            <MenuItem key="col-after" onClick={() => { editor.chain().focus().addColumnAfter().run(); setInsertMenuAnchor(null); }}>
              <ListItemIcon>
                <ViewColumnIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Column After</ListItemText>
              <ListItemIcon sx={{ ml: 'auto', minWidth: 'auto' }}>
                <AddIcon fontSize="small" />
              </ListItemIcon>
            </MenuItem>,
            <MenuItem key="row-before" onClick={() => { editor.chain().focus().addRowBefore().run(); setInsertMenuAnchor(null); }}>
              <ListItemIcon>
                <TableRowsIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Row Before</ListItemText>
              <ListItemIcon sx={{ ml: 'auto', minWidth: 'auto' }}>
                <AddIcon fontSize="small" />
              </ListItemIcon>
            </MenuItem>,
            <MenuItem key="row-after" onClick={() => { editor.chain().focus().addRowAfter().run(); setInsertMenuAnchor(null); }}>
              <ListItemIcon>
                <TableRowsIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Row After</ListItemText>
              <ListItemIcon sx={{ ml: 'auto', minWidth: 'auto' }}>
                <AddIcon fontSize="small" />
              </ListItemIcon>
            </MenuItem>,
            <Divider key="divider-2" />,
            <MenuItem key="del-col" onClick={() => { editor.chain().focus().deleteColumn().run(); setInsertMenuAnchor(null); }}>
              <ListItemIcon>
                <DeleteIcon fontSize="small" color="error" />
              </ListItemIcon>
              <ListItemText>Delete Column</ListItemText>
            </MenuItem>,
            <MenuItem key="del-row" onClick={() => { editor.chain().focus().deleteRow().run(); setInsertMenuAnchor(null); }}>
              <ListItemIcon>
                <DeleteIcon fontSize="small" color="error" />
              </ListItemIcon>
              <ListItemText>Delete Row</ListItemText>
            </MenuItem>,
            <MenuItem key="del-table" onClick={() => { editor.chain().focus().deleteTable().run(); setInsertMenuAnchor(null); }}>
              <ListItemIcon>
                <DeleteIcon fontSize="small" color="error" />
              </ListItemIcon>
              <ListItemText>Delete Table</ListItemText>
            </MenuItem>
        ]}
        {!editor.can().addColumnAfter() && <Divider />}
        <MenuItem onClick={() => { editor.chain().focus().setHorizontalRule().run(); setInsertMenuAnchor(null); }}>
          <ListItemIcon>
            <HorizontalRuleIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Horizontal Rule</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { insertMath(); setInsertMenuAnchor(null); }}>
          <ListItemIcon>
            <FunctionsIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Math Formula</ListItemText>
        </MenuItem>
      </Menu>

      {/* Format Menu */}
      <Menu
        anchorEl={formatMenuAnchor}
        open={Boolean(formatMenuAnchor)}
        onClose={() => setFormatMenuAnchor(null)}
        slotProps={{
          paper: {
            sx: { zIndex: 1300 }
          }
        }}
      >
        <MenuItem onClick={() => { editor.chain().focus().toggleBold().run(); setFormatMenuAnchor(null); }}>
          <ListItemIcon>
            <FormatBoldIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Bold</ListItemText>
          <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
            Ctrl+B
          </Typography>
        </MenuItem>
        <MenuItem onClick={() => { editor.chain().focus().toggleItalic().run(); setFormatMenuAnchor(null); }}>
          <ListItemIcon>
            <FormatItalicIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Italic</ListItemText>
          <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
            Ctrl+I
          </Typography>
        </MenuItem>
        <MenuItem onClick={() => { editor.chain().focus().toggleUnderline().run(); setFormatMenuAnchor(null); }}>
          <ListItemIcon>
            <FormatUnderlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Underline</ListItemText>
          <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
            Ctrl+U
          </Typography>
        </MenuItem>
        <MenuItem onClick={() => { editor.chain().focus().toggleStrike().run(); setFormatMenuAnchor(null); }}>
          <ListItemIcon>
            <StrikethroughSIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Strikethrough</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => { editor.chain().focus().setTextAlign('left').run(); setFormatMenuAnchor(null); }}>
          <ListItemIcon>
            <FormatAlignLeftIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Align Left</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { editor.chain().focus().setTextAlign('center').run(); setFormatMenuAnchor(null); }}>
          <ListItemIcon>
            <FormatAlignCenterIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Align Center</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { editor.chain().focus().setTextAlign('right').run(); setFormatMenuAnchor(null); }}>
          <ListItemIcon>
            <FormatAlignRightIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Align Right</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { editor.chain().focus().setTextAlign('justify').run(); setFormatMenuAnchor(null); }}>
          <ListItemIcon>
            <FormatAlignJustifyIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Justify</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => { editor.chain().focus().toggleBulletList().run(); setFormatMenuAnchor(null); }}>
          <ListItemIcon>
            <FormatListBulletedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Bullet List</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { editor.chain().focus().toggleOrderedList().run(); setFormatMenuAnchor(null); }}>
          <ListItemIcon>
            <FormatListNumberedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Numbered List</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => { editor.chain().focus().toggleBlockquote().run(); setFormatMenuAnchor(null); }}>
          <ListItemIcon>
            <FormatQuoteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Blockquote</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { editor.chain().focus().toggleCodeBlock().run(); setFormatMenuAnchor(null); }}>
          <ListItemIcon>
            <CodeIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Code Block</ListItemText>
        </MenuItem>
      </Menu>

      {/* Quick Access Formatting Toolbar */}
      <Paper
        elevation={0}
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          p: 1.5,
          display: 'flex',
          gap: 1,
          flexWrap: { xs: 'nowrap', md: 'wrap' },
          alignItems: 'center',
          bgcolor: 'background.paper',
          overflowX: { xs: 'auto', md: 'visible' },
          overflowY: 'visible',
          '&::-webkit-scrollbar': {
            height: '6px',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: 'rgba(0, 0, 0, 0.05)',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            borderRadius: '3px',
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
            },
          },
        }}
      >
        {/* Heading Selector */}
        <Tooltip title="Text Style" disableInteractive enterDelay={500} slotProps={{ popper: { sx: { zIndex: 1 } } }}>
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
        </Tooltip>

        <Divider orientation="vertical" flexItem />

        {/* Font Family */}
        <Tooltip title="Font Family" disableInteractive enterDelay={500} slotProps={{ popper: { sx: { zIndex: 1 } } }}>
          <Select
            value={getFontFamily()}
            onChange={handleFontFamilyChange}
            size="small"
            displayEmpty
            sx={{
              minWidth: 140,
              '& .MuiSelect-select': {
                py: 0.75,
                fontSize: '0.875rem',
              },
            }}
            renderValue={(value) => {
              const selected = FONT_FAMILIES.find(f => f.value === value);
              return (
                <span style={{ fontFamily: selected?.fontFamily || 'inherit' }}>
                  {selected?.label || 'Default'}
                </span>
              );
            }}
          >
            {FONT_FAMILIES.map((font) => (
              <MenuItem 
                key={font.value} 
                value={font.value}
                sx={{ fontFamily: font.fontFamily }}
              >
                {font.label}
              </MenuItem>
            ))}
          </Select>
        </Tooltip>

        {/* Font Size */}
        <Tooltip title="Font Size" disableInteractive enterDelay={500} slotProps={{ popper: { sx: { zIndex: 1 } } }}>
          <Select
            value={getFontSize()}
            onChange={handleFontSizeChange}
            size="small"
            displayEmpty
            sx={{
              minWidth: 80,
              '& .MuiSelect-select': {
                py: 0.75,
                fontSize: '0.875rem',
              },
            }}
            renderValue={(value) => {
              return <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <FormatSizeIcon fontSize="small" />
                <span>{value || '16px'}</span>
              </Box>;
            }}
          >
            <MenuItem value="">Default</MenuItem>
            {FONT_SIZES.map((size) => (
              <MenuItem key={size} value={size}>
                {size}
              </MenuItem>
            ))}
          </Select>
        </Tooltip>

        {/* Line Height */}
        <Tooltip title="Line Height" disableInteractive enterDelay={500} slotProps={{ popper: { sx: { zIndex: 1 } } }}>
          <Select
            value={getLineHeight()}
            onChange={handleLineHeightChange}
            size="small"
            sx={{
              minWidth: 120,
              '& .MuiSelect-select': {
                py: 0.75,
                fontSize: '0.875rem',
              },
            }}
            renderValue={(value) => {
              const selected = LINE_HEIGHTS.find(h => h.value === value);
              return <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <LineWeightIcon fontSize="small" />
                <span>{selected?.label.split(' ')[0] || value}</span>
              </Box>;
            }}
          >
            {LINE_HEIGHTS.map((height) => (
              <MenuItem key={height.value} value={height.value}>
                {height.label}
              </MenuItem>
            ))}
          </Select>
        </Tooltip>

        <Divider orientation="vertical" flexItem />

        {/* Text Formatting */}
        <ToggleButtonGroup size="small" sx={{ height: 32 }} aria-label="text formatting">
          <ToggleButton
            value="bold"
            selected={editor.isActive('bold')}
            onClick={() => editor.chain().focus().toggleBold().run()}
            aria-label="Bold"
          >
            <Tooltip title="Bold (Ctrl+B)" disableInteractive>
              <FormatBoldIcon fontSize="small" />
            </Tooltip>
          </ToggleButton>
          <ToggleButton
            value="italic"
            selected={editor.isActive('italic')}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            aria-label="Italic"
          >
            <Tooltip title="Italic (Ctrl+I)" disableInteractive>
              <FormatItalicIcon fontSize="small" />
            </Tooltip>
          </ToggleButton>
          <ToggleButton
            value="underline"
            selected={editor.isActive('underline')}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            aria-label="Underline"
          >
            <Tooltip title="Underline (Ctrl+U)" disableInteractive>
              <FormatUnderlinedIcon fontSize="small" />
            </Tooltip>
          </ToggleButton>
          <ToggleButton
            value="strike"
            selected={editor.isActive('strike')}
            onClick={() => editor.chain().focus().toggleStrike().run()}
            aria-label="Strikethrough"
          >
            <Tooltip title="Strikethrough" disableInteractive>
              <StrikethroughSIcon fontSize="small" />
            </Tooltip>
          </ToggleButton>
          <ToggleButton
            value="code"
            selected={editor.isActive('code')}
            onClick={() => editor.chain().focus().toggleCode().run()}
            aria-label="Code"
          >
            <Tooltip title="Code" disableInteractive>
              <CodeIcon fontSize="small" />
            </Tooltip>
          </ToggleButton>
        </ToggleButtonGroup>

        <Divider orientation="vertical" flexItem />

        {/* Text Color */}
        <Tooltip title="Text Color" disableInteractive>
          <IconButton size="small" onClick={handleColorClick} aria-label="text color">
            <FormatColorTextIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Popover
          open={Boolean(colorAnchor)}
          anchorEl={colorAnchor}
          onClose={() => setColorAnchor(null)}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          slotProps={{
            paper: {
              sx: { zIndex: 1300 }
            }
          }}
        >
          <Box sx={{ p: 2 }}>
            <Sketch
              color={editor.getAttributes('textStyle').color || '#000000'}
              onChange={handleColorChange}
              disableAlpha
            />
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                size="small"
                onClick={() => {
                  editor.chain().focus().unsetColor().run();
                  setColorAnchor(null);
                }}
              >
                Clear
              </Button>
              <Button
                size="small"
                variant="contained"
                onClick={() => setColorAnchor(null)}
                sx={{ ml: 1 }}
              >
                Done
              </Button>
            </Box>
          </Box>
        </Popover>

        {/* Highlight Color */}
        <Tooltip title="Highlight Color" disableInteractive>
          <IconButton size="small" onClick={handleHighlightClick} aria-label="highlight color">
            <FormatColorFillIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Popover
          open={Boolean(highlightAnchor)}
          anchorEl={highlightAnchor}
          onClose={() => setHighlightAnchor(null)}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          slotProps={{
            paper: {
              sx: { zIndex: 1300 }
            }
          }}
        >
          <Box sx={{ p: 2 }}>
            <Sketch
              color={editor.getAttributes('highlight').color || '#ffff00'}
              onChange={handleHighlightChange}
              disableAlpha
            />
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                size="small"
                onClick={() => {
                  editor.chain().focus().unsetHighlight().run();
                  setHighlightAnchor(null);
                }}
              >
                Clear
              </Button>
              <Button
                size="small"
                variant="contained"
                onClick={() => setHighlightAnchor(null)}
                sx={{ ml: 1 }}
              >
                Done
              </Button>
            </Box>
          </Box>
        </Popover>

        <Divider orientation="vertical" flexItem />

        {/* Text Alignment Dropdown */}
        <Tooltip title="Align" disableInteractive>
          <IconButton
            size="small"
            onClick={(e) => setAlignMenuAnchor(e.currentTarget)}
            sx={{
              border: 1,
              borderColor: 'divider',
              borderRadius: 1,
              '&:hover': { bgcolor: 'action.hover' },
            }}
          >
            {getAlignmentIcon()}
          </IconButton>
        </Tooltip>
        
        <Menu
          anchorEl={alignMenuAnchor}
          open={Boolean(alignMenuAnchor)}
          onClose={() => setAlignMenuAnchor(null)}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
        >
          <MenuItem 
            selected={editor.isActive({ textAlign: 'left' })}
            onClick={() => { 
              editor.chain().focus().setTextAlign('left').run(); 
              setAlignMenuAnchor(null); 
            }}
          >
            <ListItemIcon>
              <FormatAlignLeftIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Left</ListItemText>
          </MenuItem>
          <MenuItem 
            selected={editor.isActive({ textAlign: 'center' })}
            onClick={() => { 
              editor.chain().focus().setTextAlign('center').run(); 
              setAlignMenuAnchor(null); 
            }}
          >
            <ListItemIcon>
              <FormatAlignCenterIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Center</ListItemText>
          </MenuItem>
          <MenuItem 
            selected={editor.isActive({ textAlign: 'right' })}
            onClick={() => { 
              editor.chain().focus().setTextAlign('right').run(); 
              setAlignMenuAnchor(null); 
            }}
          >
            <ListItemIcon>
              <FormatAlignRightIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Right</ListItemText>
          </MenuItem>
          <MenuItem 
            selected={editor.isActive({ textAlign: 'justify' })}
            onClick={() => { 
              editor.chain().focus().setTextAlign('justify').run(); 
              setAlignMenuAnchor(null); 
            }}
          >
            <ListItemIcon>
              <FormatAlignJustifyIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Justify</ListItemText>
          </MenuItem>
        </Menu>
      </Paper>

      {/* Table Picker Popover */}
      <Popover
        open={Boolean(tablePickerAnchor)}
        anchorEl={tablePickerAnchor}
        onClose={() => setTablePickerAnchor(null)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        slotProps={{
          paper: {
            sx: { zIndex: 1400 }
          }
        }}
      >
        <TablePicker
          editor={editor}
          onInsert={() => {
            setTablePickerAnchor(null);
            setInsertMenuAnchor(null);
          }}
        />
      </Popover>
    </Box>
  );
};

export default Toolbar2;
