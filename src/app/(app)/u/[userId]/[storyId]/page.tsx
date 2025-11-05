'use client';

import { use, useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import {
  Box,
  Container,
  TextField,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Stack,
  IconButton,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  Paper,
  List,
  ListItem,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
} from '@mui/material';
import {
  Share as ShareIcon,
  ArrowBack as ArrowBackIcon,
  Public as PublicIcon,
  Lock as LockIcon,
  CheckCircle as CheckCircleIcon,
  Circle as CircleIcon,
  Send as SendIcon,
  MoreVert as MoreVertIcon,
  Archive as ArchiveIcon,
  Unarchive as UnarchiveIcon,
} from '@mui/icons-material';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCaret from '@tiptap/extension-collaboration-caret';
import { updateDoc, getDoc, Timestamp } from 'firebase/firestore';
import * as Y from 'yjs';
import { Document } from '@/types/document';
import { documentRef } from '@/lib/converters/document';
import { timeAgo } from '@/lib/utils';
import { generateSlug } from '@/lib/content-utils';
import { Header } from '@/components/header';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { firebaseApp } from '@/lib/firebase/client';
import { yProvider } from '@/components/tiptap/providers/firebase-sync';
import { FireProvider } from '@/lib/y-fire';

const Tiptap = dynamic(() => import('@/components/tiptap/tiptap'), {
  ssr: false,
});

export default function StoryPage(props: { params: Promise<{ userId: string; storyId: string }> }) {
  const params = use(props.params);
  const { user } = useAuth();
  const router = useRouter();
  
  // Extract storyId from the title-slug format (everything before the first dash is the storyId)
  // URL format: /u/userId/storyId-slug-text-here
  const storyId = params.storyId.includes('-') 
    ? params.storyId.split('-')[0] 
    : params.storyId;
  
  const [access, setAccess] = useState<boolean | undefined>(undefined);
  const [saving, setSaving] = useState<boolean>(false);
  const [isPublic, setIsPublic] = useState<boolean>(false);
  const [title, setTitle] = useState<string>('');
  const [document, setDocument] = useState<Document | null>(null);
  const [shareDialogOpen, setShareDialogOpen] = useState<boolean>(false);
  const [sharingEmail, setSharingEmail] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const yDocRef = useRef<Y.Doc | null>(null);
  const [provider, setProvider] = useState<FireProvider | null>(null);
  const [userColor] = useState(
    () => '#' + Math.floor(Math.random() * 16777215).toString(16)
  );

  const menuOpen = Boolean(menuAnchorEl);

  // Initialize Y.js provider
  useEffect(() => {
    if (!storyId || !user?.id) return;

    // Create a new Y.Doc for this story
    const yDoc = new Y.Doc();
    yDocRef.current = yDoc;

    const newProvider = yProvider({
      firebaseApp: firebaseApp,
      path: `stories/${storyId}`,
      ydoc: yDoc,
    });

    newProvider.onReady = () => {
      console.log('Editor ready for story:', storyId);
      setProvider(newProvider);
    };

    newProvider.onSaving = (status: boolean) => {
      setSaving(status);
    };

    newProvider.onSetMetadata = (meta: Partial<Document>) => {
      console.log('Metadata updated:', meta);
      if (meta.title) setTitle(meta.title);
      if (meta.isArchived !== undefined || meta.isPublic !== undefined) {
        setDocument(meta as Document);
      }
    };

    newProvider.onDeleted = () => {
      setAccess(false);
    };

    return () => {
      console.log('Destroying provider for story:', storyId);
      newProvider.destroy();
      yDocRef.current = null;
    };
  }, [storyId, user?.id]);

  // Fetch the document metadata
  useEffect(() => {
    if (!storyId || !user?.id) return;

    const loadDocument = async () => {
      try {
        const docSnap = await getDoc(documentRef(storyId));

        if (!docSnap.exists()) {
          setAccess(false);
          setLoading(false);
          return;
        }

        const data = docSnap.data();

        // Check access
        const userId = user.id;
        const hasWritePermission = data.owner === userId || (userId && data.writeAccess?.includes(userId));
        const hasReadPermission = data.isPublic || data.owner === userId || (userId && data.readAccess?.includes(userId)) || hasWritePermission;
        
        if (hasReadPermission) {
          setAccess(hasWritePermission ? true : false);
          setDocument(data);
          setTitle(data.title || '');
          setIsPublic(data.isPublic || false);
        } else {
          setAccess(false);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error loading document:', error);
        setAccess(false);
        setLoading(false);
      }
    };

    loadDocument();
  }, [storyId, user?.id]);

  // Auto-save title and update slug
  useEffect(() => {
    if (!storyId || !user?.id || !document || !provider || !title) return;

    const timer = setTimeout(async () => {
      try {
        const newSlug = generateSlug(title);
        const updates: Partial<Document> = {
          title: title,
          slug: newSlug,
          lastUpdated: Timestamp.now(),
          lastUpdatedBy: user.id,
        };
        
        await updateDoc(documentRef(storyId), updates);
        
        // Update URL if slug changed (format: /u/userId/storyId-slug)
        const newUrl = `/u/${params.userId}/${storyId}-${newSlug}`;
        if (window.location.pathname !== newUrl) {
          window.history.replaceState(null, '', newUrl);
        }
      } catch (error) {
        console.error('Error saving title:', error);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [title, storyId, user?.id, document, provider, params.userId]);

  // Update document visibility
  const handleVisibilityChange = async (checked: boolean) => {
    if (!storyId) return;

    try {
      await updateDoc(documentRef(storyId), {
        isPublic: checked,
      });
      setIsPublic(checked);
    } catch (error) {
      console.error('Error updating visibility:', error);
    }
  };

  // Toggle archive status
  const handleArchiveToggle = async () => {
    if (!storyId || !document) return;

    try {
      const newArchiveStatus = !document.isArchived;
      await updateDoc(documentRef(storyId), {
        isArchived: newArchiveStatus,
        lastUpdated: Timestamp.now(),
        lastUpdatedBy: user?.id || '',
      });
      setDocument({ ...document, isArchived: newArchiveStatus });
      setMenuAnchorEl(null);
    } catch (error) {
      console.error('Error toggling archive status:', error);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const handleShareClick = () => {
    setMenuAnchorEl(null);
    setShareDialogOpen(true);
  };

  if (loading || !provider) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <Header />
        <Container maxWidth="lg" sx={{ py: 6 }}>
          <Typography>Loading story...</Typography>
        </Container>
      </Box>
    );
  }

  if (!user?.id) {
    router.push('/auth/sign-in');
    return null;
  }

  if (access === false) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <Header />
        <Container
          maxWidth="lg"
          sx={{
            py: 12,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Alert severity="error" sx={{ maxWidth: 500 }}>
            <Typography variant="h6" gutterBottom>
              Access Denied
            </Typography>
            <Typography>
              You do not have permission to view this story.
            </Typography>
            <Button
              variant="contained"
              onClick={() => router.push('/stories')}
              sx={{ mt: 2 }}
            >
              Back to My Stories
            </Button>
          </Alert>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Header />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Back Button */}
        <Box sx={{ mb: 2 }}>
          <IconButton onClick={() => router.push('/stories')} size="small">
            <ArrowBackIcon />
          </IconButton>
        </Box>

        {/* Title and Actions Bar */}
        <Paper elevation={0} sx={{ p: 3, mb: 3, border: 1, borderColor: 'divider' }}>
          <Stack spacing={2}>
            <TextField
              fullWidth
              variant="standard"
              placeholder="Untitled Story"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={access !== true}
              InputProps={{
                sx: {
                  fontSize: '2rem',
                  fontWeight: 700,
                  '&:before': { borderBottom: 'none' },
                  '&:hover:not(.Mui-disabled):before': { borderBottom: 'none' },
                },
              }}
            />

            <Divider />

            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              flexWrap="wrap"
              gap={2}
            >
              <Stack direction="row" spacing={2} alignItems="center">
                {/* Saving Status */}
                <Chip
                  icon={saving ? <CircleIcon /> : <CheckCircleIcon />}
                  label={saving ? 'Saving...' : 'Saved'}
                  color={saving ? 'default' : 'success'}
                  size="small"
                />

                {/* Archived Status */}
                {document?.isArchived && (
                  <Chip
                    icon={<ArchiveIcon />}
                    label="Archived"
                    color="default"
                    size="small"
                  />
                )}

                {/* Public/Private Toggle - Only show if user has write access */}
                {access === true && (
                  <FormControlLabel
                    control={
                      <Switch
                        checked={isPublic}
                        onChange={(e) => handleVisibilityChange(e.target.checked)}
                        color="success"
                      />
                    }
                    label={
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        {isPublic ? <PublicIcon fontSize="small" /> : <LockIcon fontSize="small" />}
                        <Typography variant="body2">
                          {isPublic ? 'Public' : 'Private'}
                        </Typography>
                      </Stack>
                    }
                  />
                )}
              </Stack>

              <Stack direction="row" spacing={1} alignItems="center">
                {document && (
                  <Typography variant="caption" color="text.secondary">
                    Updated {timeAgo(document.lastUpdated)}
                  </Typography>
                )}
                {access === true && (
                  <IconButton
                    onClick={handleMenuOpen}
                    size="small"
                  >
                    <MoreVertIcon />
                  </IconButton>
                )}
              </Stack>
            </Stack>
          </Stack>
        </Paper>

        {/* Options Menu */}
        <Menu
          anchorEl={menuAnchorEl}
          open={menuOpen}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleShareClick}>
            <ListItemIcon>
              <ShareIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Share</ListItemText>
          </MenuItem>
          <MenuItem onClick={handleArchiveToggle}>
            <ListItemIcon>
              {document?.isArchived ? (
                <UnarchiveIcon fontSize="small" />
              ) : (
                <ArchiveIcon fontSize="small" />
              )}
            </ListItemIcon>
            <ListItemText>
              {document?.isArchived ? 'Unarchive' : 'Archive'}
            </ListItemText>
          </MenuItem>
        </Menu>

        {/* Editor */}
        <Tiptap
          editable={access === true}
          passedExtensions={[
            Collaboration.configure({
              document: provider.doc,
            }),
            CollaborationCaret.configure({
              provider: provider,
              user: {
                name: user.name || 'Anonymous',
                color: userColor,
              },
            }),
          ]}
        />

        {/* Share Dialog */}
        <Dialog
          open={shareDialogOpen}
          onClose={() => setShareDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography variant="h6">Share Story</Typography>
              <IconButton onClick={() => setShareDialogOpen(false)} size="small">
                <ArrowBackIcon />
              </IconButton>
            </Stack>
          </DialogTitle>
          <DialogContent>
            <Stack spacing={3}>
              <Typography variant="body2" color="text.secondary">
                Share this story with others by entering their email address.
              </Typography>

              {/* Email Input */}
              <Stack direction="row" spacing={1}>
                <TextField
                  fullWidth
                  size="small"
                  type="email"
                  placeholder="Email address"
                  value={sharingEmail}
                  onChange={(e) => setSharingEmail(e.target.value)}
                />
                <IconButton
                  color="primary"
                  onClick={() => {
                    // TODO: Implement sharing logic
                    console.log('Share with:', sharingEmail);
                    setSharingEmail('');
                  }}
                  disabled={!sharingEmail.trim()}
                >
                  <SendIcon />
                </IconButton>
              </Stack>

              {/* Shared Users List */}
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  People with access
                </Typography>
                <List dense>
                  <ListItem>
                    <Avatar sx={{ mr: 2 }}>{user?.name?.[0] || 'U'}</Avatar>
                    <ListItemText
                      primary={user?.name || 'You'}
                      secondary="Owner"
                    />
                  </ListItem>
                </List>
              </Box>

              <Alert severity="info" sx={{ mt: 2 }}>
                Public link: {window.location.origin}/u/{params.userId}/{storyId}-{document?.slug || 'untitled'}
              </Alert>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShareDialogOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}
