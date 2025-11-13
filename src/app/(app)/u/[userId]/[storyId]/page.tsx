'use client';

import { use, useEffect, useState, useRef, memo } from 'react';
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
  Select,
  SelectChangeEvent,
  CircularProgress,
  Tooltip,
  AvatarGroup,
} from '@mui/material';
import {
  Share as ShareIcon,
  Public as PublicIcon,
  Lock as LockIcon,
  CheckCircle as CheckCircleIcon,
  Circle as CircleIcon,
  MoreVert as MoreVertIcon,
  Archive as ArchiveIcon,
  Unarchive as UnarchiveIcon,
  Close as CloseIcon,
  PersonRemove as PersonRemoveIcon,
  ContentCopy as ContentCopyIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCaret from '@tiptap/extension-collaboration-caret';
import { updateDoc, getDoc, Timestamp, collection, query, where, getDocs, doc, Bytes } from 'firebase/firestore';
import * as Y from 'yjs';
import { Document } from '@/types/document';
import { documentRef } from '@/lib/converters/document';
import { stringToHslColor, timeAgo } from '@/lib/utils';
import { generateSlug } from '@/lib/content-utils';
import { syncAuthorNames } from '@/lib/update-author-data';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useDocumentView } from '@/hooks/use-document-view';
import { firebaseApp, db } from '@/lib/firebase/client';
import { FireProvider } from '@/lib/y-fire';
import { TableOfContents, TocAnchor } from '@/components/tiptap/TableOfContents';
import { Editor } from '@tiptap/react';
import { User } from '@/types/user';
import TableOfContentsExtension from '@tiptap/extension-table-of-contents';

const Tiptap = dynamic(() => import('@/components/tiptap/tiptap'), {
  ssr: false,
  loading: () => (
    <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
      <CircularProgress size={20} />
      <Typography variant="body2" color="text.secondary">
        Loading editor...
      </Typography>
    </Box>
  ),
});

const MemoizedToC = memo(TableOfContents);

interface AwarenessUser {
  name: string;
  color: string;
  clientId: number;
  userId: string;
  image?: string;
}

export default function StoryPage({ params }: { params: Promise<{ userId: string; storyId: string }> }) {
  const unwrappedParams = use(params);
  const { user } = useAuth();
  const router = useRouter();
  
  // Extract storyId from the title-slug format (everything before the first dash is the storyId)
  // URL format: /u/userId/storyId-slug-text-here
  const storyId = unwrappedParams.storyId.includes('-') 
    ? unwrappedParams.storyId.split('-')[0] 
    : unwrappedParams.storyId;
  
  const [access, setAccess] = useState<boolean | undefined>(undefined);
  const [saving, setSaving] = useState<boolean>(false);
  const [isPublic, setIsPublic] = useState<boolean>(false);
  const [title, setTitle] = useState<string>('');
  const [linkCopied, setLinkCopied] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [document, setDocument] = useState<Document | null>(null);
  const [previewMode, setPreviewMode] = useState<boolean>(false);
  
  // State for searching users to share with
  const [searchedUser, setSearchedUser] = useState<(User & { id: string }) | null>(null);
  const [searchingUser, setSearchingUser] = useState<boolean>(false);
  const [shareError, setShareError] = useState<string>('');
  const [shareDialogOpen, setShareDialogOpen] = useState<boolean>(false);
  const [sharingEmail, setSharingEmail] = useState<string>('');
  const [sharingRole, setSharingRole] = useState<'viewer' | 'editor'>('viewer');
  
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const yDocRef = useRef<Y.Doc | null>(null);
  const [provider, setProvider] = useState<FireProvider | null>(null);
  const [currentEditor, setCurrentEditor] = useState<Editor | null>(null);
  const [activeUsers, setActiveUsers] = useState<Array<AwarenessUser>>([]);
  const [tableOfContents, setTableOfContents] = useState<Array<TocAnchor>>([]);
  
  // Persistent cache for user data to avoid redundant Firestore reads
  const userCacheRef = useRef<Map<string, User>>(new Map());
  
  // Track last saved title to avoid unnecessary writes
  const lastSavedTitleRef = useRef<string>('');

  // Track document view 
  useDocumentView(storyId, user?.id);

  const menuOpen = Boolean(menuAnchorEl);

 
  // Initialize Y.js provider
  useEffect(() => {
    // Allow initialization for anonymous users viewing public documents
    if (!storyId) return;

    // Create a new Y.Doc for this story
    const yDoc = new Y.Doc();
    yDocRef.current = yDoc;

    const newProvider = new FireProvider({
      firebaseApp: firebaseApp,
      path: `stories/${storyId}`,
      ydoc: yDoc,
      docMapper: (bytes: Bytes) => ({
        content: bytes,
        lastUpdated: Timestamp.now(),
      }),
    });

    newProvider.onReady = () => {
      console.log('Editor ready for story:', storyId);
      setProvider(newProvider);
    };

    newProvider.onSaving = (status: boolean) => {
      setSaving(status);
    };

    newProvider.onDeleted = () => {
      setAccess(false);
    };

    return () => {
      console.log('Destroying provider for story:', storyId);
      newProvider.destroy();
      yDocRef.current = null;
    };
  }, [storyId]);

  // Fetch the document metadata
  useEffect(() => {
    if (!storyId) return;

    const loadDocument = async () => {
      try {
        const docSnap = await getDoc(documentRef(storyId));
        console.log("GETTING DOCUMENT DATA");

        if (!docSnap.exists()) {
          setAccess(false);
          setLoading(false);
          return;
        }

        const data = docSnap.data();

        // Check access - allow anonymous users to view public documents
        const userId = user?.id;
        const hasWritePermission = userId && (data.owner === userId || data.writeAccess?.includes(userId));
        const hasReadPermission = data.isPublic || (userId && (data.owner === userId || data.readAccess?.includes(userId))) || hasWritePermission;
        
        if (hasReadPermission) {
          setAccess(hasWritePermission ? true : false);  // true for write, false for read-only
          console.log(data);
          setDocument(data);
          setTitle(data.title || '');
          setIsPublic(data.isPublic || false);
          // Initialize lastSavedTitle to prevent unnecessary save on load
          lastSavedTitleRef.current = data.title || '';
        } else {
          setAccess(undefined);  // undefined means no access at all
        }
        
        // Only set loading to false after access check is complete
        setLoading(false);
      } catch (error) {
        console.error('Error loading document:', error);
        setAccess(false);
        setLoading(false);
      }
    };

    loadDocument();
  }, [storyId, user?.id]);

  // Auto-save title and update slug (only for write access users)
  useEffect(() => {
    // Only allow write access users to save title
    if (access !== true) return;
    if (!storyId || !user?.id || !document || !provider || !title) return;
    
    // Skip if title hasn't changed from last save
    if (title === lastSavedTitleRef.current) return;

    const timer = setTimeout(async () => {
      try {
        const newSlug = generateSlug(title);
        
        // Skip update if title hasn't changed
        if (title === lastSavedTitleRef.current) return;
        
        const updates: Partial<Document> = {
          title: title,
          slug: newSlug,
          lastUpdated: Timestamp.now(),
          lastUpdatedBy: user.id,
        };
        
        await updateDoc(documentRef(storyId), updates);
        
        // Update the last saved title reference
        lastSavedTitleRef.current = title;
        
        // Update URL if slug changed (format: /u/userId/storyId-slug)
        // Use Next.js router.replace for better SPA navigation (avoids full reload)
        const newUrl = `/u/${unwrappedParams.userId}/${storyId}-${newSlug}`;
        if (window.location.pathname !== newUrl) {
          router.replace(newUrl, { scroll: false });
        }
      } catch (error) {
        console.error('Error saving title:', error);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [title, storyId, user?.id, document, provider, unwrappedParams.userId, access, router]);

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
        lastUpdatedBy: user!.id,
      });
      setDocument({ ...document, isArchived: newArchiveStatus });
      setMenuAnchorEl(null);
    } catch (error) {
      console.error('Error toggling archive status:', error);
    }
  };

  // Search for user by email
  const handleSearchUser = async () => {
    if (!sharingEmail.trim()) return;
    
    setSearchingUser(true);
    setShareError('');
    setSearchedUser(null);

    try {
      // Support searching by email or @username
      const input = sharingEmail.trim().toLowerCase();
      const usersRef = collection(db, 'users');

      let querySnapshot;
      if (input.startsWith('@')) {
        // explicit username
        querySnapshot = await getDocs(query(usersRef, where('username', '==', input.slice(1))));
      } else if (input.includes('@') && input.includes('.')) {
        // looks like an email
        querySnapshot = await getDocs(query(usersRef, where('email', '==', input)));
      } else {
        // try username first, then email as fallback
        querySnapshot = await getDocs(query(usersRef, where('username', '==', input)));
        if (querySnapshot.empty) {
          querySnapshot = await getDocs(query(usersRef, where('email', '==', input)));
        }
      }

      if (querySnapshot.empty) {
        setShareError('User not found. Try an email or @username.');
        return;
      }

      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data() as User;
      
      // Check if user already has access
      if (document?.owner === userDoc.id) {
        setShareError('This user is the owner of the document.');
        return;
      }

      if (document?.readAccess?.includes(userDoc.id) || document?.writeAccess?.includes(userDoc.id)) {
        setShareError('This user already has access to this document.');
        return;
      }

      setSearchedUser({ ...userData, id: userDoc.id });
    } catch (error) {
      console.error('Error searching for user:', error);
      setShareError('An error occurred while searching for the user.');
    } finally {
      setSearchingUser(false);
    }
  };

  // Add user with selected role
  const handleAddUser = async () => {
    if (!searchedUser || !storyId || !document) return;

    try {
      const updateData: Partial<Document> = {};

      if (sharingRole === 'viewer') {
        updateData.readAccess = [...(document.readAccess || []), searchedUser.id];
      } else {
        updateData.writeAccess = [...(document.writeAccess || []), searchedUser.id];
      }

      await updateDoc(documentRef(storyId), updateData);
      
      // Sync author names after modifying write access
      if (sharingRole === 'editor') {
        await syncAuthorNames(storyId, document.owner, updateData.writeAccess || []);
      }
      
      // Update local document state
      setDocument({ ...document, ...updateData });
      
      // Reset form
      setSharingEmail('');
      setSearchedUser(null);
      setSharingRole('viewer');
      setShareError('');
    } catch (error) {
      console.error('Error adding user:', error);
      setShareError('An error occurred while adding the user.');
    }
  };

  // Remove user access
  const handleRemoveUser = async (userId: string) => {
    if (!storyId || !document) return;

    try {
      const updateData: Partial<Document> = {
        readAccess: document.readAccess?.filter(id => id !== userId) || [],
        writeAccess: document.writeAccess?.filter(id => id !== userId) || [],
      };

      await updateDoc(documentRef(storyId), updateData);
      
      // Sync author names after removing user from write access
      await syncAuthorNames(storyId, document.owner, updateData.writeAccess || []);
      
      setDocument({ ...document, ...updateData });
    } catch (error) {
      console.error('Error removing user:', error);
    }
  };

  // Change user role
  const handleChangeUserRole = async (userId: string, newRole: 'viewer' | 'editor') => {
    if (!storyId || !document) return;

    try {
      const updateData: Partial<Document> = {
        readAccess: document.readAccess?.filter(id => id !== userId) || [],
        writeAccess: document.writeAccess?.filter(id => id !== userId) || [],
      };

      // Add user to the appropriate access list
      if (newRole === 'viewer') {
        updateData.readAccess = [...(updateData.readAccess || []), userId];
      } else {
        updateData.writeAccess = [...(updateData.writeAccess || []), userId];
      }

      await updateDoc(documentRef(storyId), updateData);
      
      // Sync author names after changing roles (affects write access)
      await syncAuthorNames(storyId, document.owner, updateData.writeAccess || []);
      
      setDocument({ ...document, ...updateData });
    } catch (error) {
      console.error('Error changing user role:', error);
    }
  };

  // Copy public link to clipboard
  const handleCopyLink = async () => {
    const publicLink = `${window.location.origin}/u/${unwrappedParams.userId}/${storyId}-${document?.slug || 'untitled'}`;
    try {
      await navigator.clipboard.writeText(publicLink);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (error) {
      console.error('Error copying link:', error);
    }
  };

  // Get all users with access
  const [sharedUsers, setSharedUsers] = useState<Array<User & { id: string; role: 'viewer' | 'editor' }>>([]);

  // Fetch shared users when document changes (optimized with parallel fetching and cache)
  useEffect(() => {
    const fetchSharedUsers = async () => {
      if (!document) return;

      console.log('Fetching shared users for document:', document.id);
      
      const userIds = [
        ...(document.readAccess || []),
        ...(document.writeAccess || []),
      ];

      const uniqueUserIds = [...new Set(userIds)];
      
      // Use cache and fetch only uncached users
      const userCache = userCacheRef.current;
      const userIdsToFetch = uniqueUserIds.filter(id => !userCache.has(id));
      
      // Fetch uncached users in parallel
      if (userIdsToFetch.length > 0) {
        await Promise.all(
          userIdsToFetch.map(async (userId) => {
            try {
              const userDocRef = doc(db, 'users', userId);
              const userDoc = await getDoc(userDocRef);
              if (userDoc.exists()) {
                userCache.set(userId, userDoc.data() as User);
              }
            } catch (error) {
              console.error('Error fetching user:', error);
            }
          })
        );
      }
      
      // Build users array from cache
      const users: Array<User & { id: string; role: 'viewer' | 'editor' }> = [];
      for (const userId of uniqueUserIds) {
        const userData = userCache.get(userId);
        if (userData) {
          const role = document.writeAccess?.includes(userId) ? 'editor' : 'viewer';
          users.push({ ...userData, id: userId, role });
        }
      }

      setSharedUsers(users);
    };

    fetchSharedUsers();
  }, [document]);

  // Track active collaboration users (subscribe to provider awareness even before
  // the local editor instance exists so collaborators are visible on refresh)
  useEffect(() => {
    if (!provider) return;

    const updateActiveUsers = () => {
      const awareness = provider.awareness;
      if (!awareness || !user || !user.name || !user.id) return;

      // Set local user info in awareness state
      awareness.setLocalStateField('user', {
        name: user.name,
        userId: user.id,
        color: stringToHslColor(user.name),
        image: user.image || '',
      });

      const states = Array.from(awareness.getStates().entries());
      const users = states
        .filter(([_, state]) => state.user !== undefined)
        .map(([clientId, state]: [number, Record<string, AwarenessUser>]) => ({
          ...state.user as AwarenessUser,
          clientId,
        }));


      // Defer state update to avoid updating parent during child render
      // (awareness events can fire synchronously during Tiptap render)
      Promise.resolve().then(() => setActiveUsers(users));
    };

    // Subscribe to awareness changes and run once to populate immediately
    provider.awareness?.on('change', updateActiveUsers);
    updateActiveUsers();
    return () => {
      provider.awareness?.off('change', updateActiveUsers);
    };
  }, [provider, user]);

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

  // Show skeleton while provider is initializing (improved UX)
  // Wait until both the provider is ready and we've loaded document metadata
  // (which determines access) before rendering the editor. This prevents a
  // race where the provider is ready first and the editor mounts before we
  // know the user's access level, causing the editor to appear read-only and
  // the local cursor to be missing.
  if (!provider || loading) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <Container maxWidth="lg" sx={{ py: 6 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
            <CircularProgress size={24} />
            <Typography>Loading story...</Typography>
          </Box>
        </Container>
      </Box>
    );
  }

  // Show access denied for users without permission (after loading completes)
  if (access === undefined && !loading) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
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
      
      {/* Main Layout with Sidebar */}
      <Box 
        sx={{ 
          display: 'flex',
          gap: 3,
          maxWidth: '1400px',
          mx: 'auto',
          px: { xs: 2, sm: 3 }, // Reduced padding on mobile
          py: { xs: 2, sm: 4 }, // Reduced vertical padding on mobile
        }}
      >
        {/* Left Sidebar - Table of Contents */}
        <Box 
          sx={{ 
            width: 260,
            flexShrink: 0,
            display: { xs: 'none', md: 'block' },
          }}
        >
          <MemoizedToC editor={currentEditor} anchors={tableOfContents} />
        </Box>

        {/* Main Content Area */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {/* Title and Actions Bar - Visible for owners; adapts to preview mode */}
          {access === true && (
            <Paper elevation={0} sx={{ p: 3, mb: 3, border: 1, borderColor: 'divider' }}>
            <Stack spacing={2}>
            {previewMode ? (
              <Box>
                <Typography 
                  variant="h3" 
                  sx={{ 
                    fontSize: { xs: '1.75rem', sm: '2rem' },
                    fontWeight: 700,
                    mb: { xs: 1.5, sm: 2 },
                    lineHeight: 1.2,
                    wordBreak: 'break-word',
                  }}
                >
                  {title || 'Untitled Story'}
                </Typography>
                {document?.authorNames && document.authorNames.length > 0 && (
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ mb: 1.5, fontStyle: 'italic' }}
                  >
                    By {document.authorNames[0]} {document.authorNames.length > 1 && `, ${document.authorNames.slice(1).join(', ')}`}
                  </Typography>
                )}
              </Box>
            ) : (
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
            )}

            <Divider />

            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              flexWrap="wrap"
              gap={2}
            >
              {/* Left side: Status chips and timestamp */}
              <Stack 
                direction="row" 
                spacing={1.5} 
                alignItems="center"
                flexWrap="wrap"
                sx={{ flex: 1 }}
              >
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

                {/* Public/Private - Desktop only as switch */}
                {access === true && (
                  <FormControlLabel
                    control={
                      <Switch
                        checked={isPublic}
                        onChange={(e) => handleVisibilityChange(e.target.checked)}
                        color="success"
                        size="small"
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
                    sx={{ 
                      display: { xs: 'none', md: 'flex' },
                      m: 0,
                    }}
                  />
                )}

                {/* Timestamp */}
                {document && (
                  <Typography 
                    variant="caption" 
                    color="text.secondary"
                    sx={{ display: { xs: 'none', sm: 'inline' } }}
                  >
                    Updated {timeAgo(document.lastUpdated)}
                  </Typography>
                )}

                {/* Active Users - Show for all authenticated users */}
                {(access === true || access === false) && activeUsers.length > 0 && (
                  <Tooltip
                    title={
                      <Box>
                        <Typography variant="caption" fontWeight="bold" display="block" mb={0.5}>
                          Active now:
                        </Typography>
                        {activeUsers.map((activeUser) => (
                          <Typography key={activeUser.clientId} variant="caption" display="block">
                            • {activeUser.name || 'Anonymous'}
                          </Typography>
                        ))}
                      </Box>
                    }
                    arrow
                  >
                    <AvatarGroup max={4} sx={{ cursor: 'pointer' }}>
                      {activeUsers.map((activeUser) => (
                        <Avatar
                          key={activeUser.clientId}
                          src={activeUser.image}
                          sx={{
                            width: 28,
                            height: 28,
                            bgcolor: activeUser.color,
                            fontSize: '0.75rem',
                            fontWeight: 600,
                          }}
                        >
                          {activeUser.name?.[0]?.toUpperCase() || '?'}
                        </Avatar>
                      ))}
                    </AvatarGroup>
                  </Tooltip>
                )}
              </Stack>

              {/* Right side: Preview toggle + Menu button */}
              {access === true && (
                <Stack direction="row" spacing={1} alignItems="center">
                  <FormControlLabel
                    control={
                      <Switch
                        checked={previewMode}
                        onChange={(e) => setPreviewMode(e.target.checked)}
                        size="small"
                      />
                    }
                    label={<Typography variant="body2">Preview</Typography>}
                    sx={{ m: 0 }}
                  />
                  <IconButton onClick={handleMenuOpen} size="small">
                    <MoreVertIcon />
                  </IconButton>
                </Stack>
              )}
            </Stack>
          </Stack>
        </Paper>
          )}

        {/* Read-only Title Display - Show for read access or when owner toggles preview */}
        {(access !== true || previewMode) && document && (
          <Box 
            sx={{ 
              mb: { xs: 2, sm: 3 },
              px: { xs: 0.5, sm: 0 }, // Slight padding on mobile for better text alignment
            }}
          >
            {/* Title with fixed height to prevent layout shift */}
            <Typography 
                variant="h3" 
                sx={{ 
                  fontSize: { xs: '1.75rem', sm: '2rem' }, // Slightly smaller on mobile
                  fontWeight: 700,
                  mb: { xs: 1.5, sm: 2 },
                  lineHeight: 1.2,
                  wordBreak: 'break-word', // Prevent text overflow
                }}
              >
                {title || 'Untitled Story'}
              </Typography>
            
            {/* Authors Display - Show for read-only users with clickable owner link */}
            {document.authorNames && document.authorNames.length > 0 && (
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ 
                  mb: 1.5,
                  fontStyle: 'italic',
                }}
              >
                By{' '} {document.authorNames[0]} {document.authorNames.length > 1 && `, ${document.authorNames.slice(1).join(', ')}`}
              </Typography>
            )}
            
            <Stack 
              direction="row" 
              spacing={{ xs: 0.75, sm: 1 }} 
              alignItems="center" 
              flexWrap="wrap"
              gap={0.75} // Better spacing on wrap
            >
              <Chip
                icon={document.isPublic ? <PublicIcon /> : <LockIcon />}
                label={document.isPublic ? 'Public' : 'Private'}
                size="small"
                variant="outlined"
                sx={{
                  fontSize: { xs: '0.75rem', sm: '0.8125rem' },
                }}
              />
              
              {/* View Count */}
              <Chip
                icon={<VisibilityIcon />}
                label={`${(document.viewCount || 0).toLocaleString()} view${(document.viewCount || 0) !== 1 ? 's' : ''}`}
                size="small"
                variant="outlined"
                sx={{
                  fontSize: { xs: '0.75rem', sm: '0.8125rem' },
                }}
              />
              
              {document.isArchived && (
                <Chip
                  icon={<ArchiveIcon />}
                  label="Archived"
                  size="small"
                  variant="outlined"
                  sx={{
                    fontSize: { xs: '0.75rem', sm: '0.8125rem' },
                  }}
                />
              )}
              
              {/* Active Users for readonly users */}
              {activeUsers.length > 0 && (
                <Tooltip
                  title={
                    <Box>
                      <Typography variant="caption" fontWeight="bold" display="block" mb={0.5}>
                        Active now:
                      </Typography>
                      {activeUsers.map((activeUser) => (
                        <Typography key={activeUser.clientId} variant="caption" display="block">
                          • {activeUser.name || 'Anonymous'}
                        </Typography>
                      ))}
                    </Box>
                  }
                  arrow
                >
                  <AvatarGroup max={4} sx={{ cursor: 'pointer' }}>
                    {activeUsers.map((activeUser) => (
                      <Avatar
                        key={activeUser.clientId}
                        src={activeUser.image}
                        sx={{
                          width: { xs: 24, sm: 28 },
                          height: { xs: 24, sm: 28 },
                          bgcolor: activeUser.color,
                          fontSize: '0.7rem',
                          fontWeight: 600,
                        }}
                      >
                        {activeUser.name?.[0]?.toUpperCase() || '?'}
                      </Avatar>
                    ))}
                  </AvatarGroup>
                </Tooltip>
              )}
            </Stack>
          </Box>
        )}

  {/* Options Menu - Only for write access */}
        {access === true && (
        <Menu
          anchorEl={menuAnchorEl}
          open={menuOpen}
          onClose={handleMenuClose}
        >
          {/* Preview Toggle */}
          <MenuItem onClick={() => setPreviewMode(!previewMode)}>
            <ListItemIcon>
              <VisibilityIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>{previewMode ? 'Exit Preview' : 'Preview mode'}</ListItemText>
            <Switch
              checked={previewMode}
              onChange={(e) => setPreviewMode(e.target.checked)}
              size="small"
            />
          </MenuItem>
          <Divider />
          {/* Public/Private Toggle - Mobile only */}
          <MenuItem 
            sx={{ 
              display: { xs: 'flex', md: 'none' },
              '&:hover': { bgcolor: 'transparent' }
            }}
            disableRipple
          >
            <ListItemIcon>
              {isPublic ? <PublicIcon fontSize="small" /> : <LockIcon fontSize="small" />}
            </ListItemIcon>
            <ListItemText>
              {isPublic ? 'Public' : 'Private'}
            </ListItemText>
            <Switch
              checked={isPublic}
              onChange={(e) => handleVisibilityChange(e.target.checked)}
              color="success"
              size="small"
            />
          </MenuItem>
          
          {/* Divider - Mobile only */}
          <Divider sx={{ display: { xs: 'block', md: 'none' } }} />
          
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
        )}

        {/* Editor */}
        <Box
          sx={{
            minHeight: '60vh', // Prevent layout shift by reserving space
            '& .ProseMirror': {
              minHeight: '60vh',
            },
          }}
        >
          <Tiptap
            key={previewMode ? 'preview' : 'edit'}
            editable={access === true && !previewMode}
            onEditorReady={setCurrentEditor}
            readOnly={access !== true || previewMode}
            passedExtensions={[
              Collaboration.configure({
                document: provider.doc,
              }),
              CollaborationCaret.configure({
                provider: provider,
                user: {
                  name: user!.name,
                  image: user!.image,
                  color: stringToHslColor(user!.name!),
                  userId: user!.id,
                },
              }),
              TableOfContentsExtension.configure({
                onUpdate: (anchors) => {
                 setTimeout(() => {
                      setTableOfContents(anchors);
                    }, 50);
                },
              }),
            ]}
          />
        </Box>

        {/* Share Dialog */}
        <Dialog
          open={shareDialogOpen}
          onClose={() => {
            setShareDialogOpen(false);
            setSharingEmail('');
            setSearchedUser(null);
            setSharingRole('viewer');
            setShareError('');
          }}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography variant="h6">Share &quot;{title || 'Untitled'}&quot;</Typography>
              <IconButton 
                onClick={() => {
                  setShareDialogOpen(false);
                  setSharingEmail('');
                  setSearchedUser(null);
                  setSharingRole('viewer');
                  setShareError('');
                }} 
                size="small"
              >
                <CloseIcon />
              </IconButton>
            </Stack>
          </DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ pt: 1 }}>
              {/* Email Input with Role Selection */}
              <Box>
                <Stack direction="row" spacing={1} alignItems="stretch">
                  <TextField
                    fullWidth
                    size="small"
                    type="text"
                    placeholder="Enter email address or @username"
                    value={sharingEmail}
                    onChange={(e) => {
                      setSharingEmail(e.target.value);
                      setShareError('');
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !searchedUser) {
                        handleSearchUser();
                      }
                    }}
                    error={!!shareError}
                    helperText={shareError}
                    sx={{
                      '& .MuiInputBase-root': {
                        height: '100%',
                      }
                    }}
                  />
                  {!searchedUser && (
                    <Button
                      variant="outlined"
                      onClick={handleSearchUser}
                      disabled={!sharingEmail.trim() || searchingUser}
                      sx={{ 
                        minWidth: '80px',
                        height: '40px',
                      }}
                    >
                      {searchingUser ? <CircularProgress size={20} /> : 'Search'}
                    </Button>
                  )}
                </Stack>

                {/* User Preview with Role Selection */}
                {searchedUser && (
                  <Paper 
                    variant="outlined" 
                    sx={{ 
                      p: 2, 
                      mt: 2,
                      bgcolor: 'action.hover',
                    }}
                  >
                    <Stack spacing={2}>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar src={searchedUser.image} sx={{ width: 40, height: 40 }}>
                          {searchedUser.name[0]}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="subtitle2">{searchedUser.name}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {searchedUser.email}
                          </Typography>
                        </Box>
                      </Stack>

                      <Stack direction="row" spacing={1} alignItems="center">
                        <Select
                          size="small"
                          value={sharingRole}
                          onChange={(e: SelectChangeEvent<'viewer' | 'editor'>) => 
                            setSharingRole(e.target.value as 'viewer' | 'editor')
                          }
                          sx={{ flex: 1 }}
                        >
                          <MenuItem value="viewer">Viewer (Read only)</MenuItem>
                          <MenuItem value="editor">Editor (Can edit)</MenuItem>
                        </Select>
                        <Button
                          variant="contained"
                          onClick={handleAddUser}
                          sx={{ minWidth: '80px' }}
                        >
                          Add
                        </Button>
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSearchedUser(null);
                            setSharingEmail('');
                            setSharingRole('viewer');
                          }}
                        >
                          <CloseIcon />
                        </IconButton>
                      </Stack>
                    </Stack>
                  </Paper>
                )}
              </Box>

              <Divider />

              {/* Shared Users List */}
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  People with access
                </Typography>
                <List dense>
                  {/* Owner */}
                  <ListItem>
                    <Avatar src={user?.image || undefined} sx={{ mr: 2 }}>
                      {user?.name?.[0] || 'U'}
                    </Avatar>
                    <ListItemText
                      primary={user?.name || 'You'}
                      secondary="Owner"
                    />
                  </ListItem>

                  {/* Shared Users */}
                  {sharedUsers.map((sharedUser) => (
                    <ListItem 
                      key={sharedUser.id}
                      sx={{
                        flexDirection: { xs: 'column', sm: 'row' },
                        alignItems: { xs: 'flex-start', sm: 'center' },
                        gap: { xs: 1, sm: 0 },
                        py: { xs: 2, sm: 1 },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                        <Avatar src={sharedUser.image} sx={{ mr: 2 }}>
                          {sharedUser.name[0]}
                        </Avatar>
                        <ListItemText
                          primary={sharedUser.name}
                          secondary={
                            <Box>
                              <Typography variant="caption" color="text.secondary" display="block">
                                {sharedUser.email}
                              </Typography>
                              <Box sx={{ mt: 0.5, display: { xs: 'flex', sm: 'none' }, gap: 1, alignItems: 'center' }}>
                                <Select
                                  size="small"
                                  value={sharedUser.role}
                                  onChange={(e: SelectChangeEvent<'viewer' | 'editor'>) => 
                                    handleChangeUserRole(sharedUser.id, e.target.value as 'viewer' | 'editor')
                                  }
                                  sx={{ 
                                    height: '24px',
                                    fontSize: '0.75rem',
                                    '& .MuiSelect-select': {
                                      py: 0.5,
                                      pr: 3,
                                    }
                                  }}
                                >
                                  <MenuItem value="viewer" sx={{ fontSize: '0.75rem' }}>Viewer</MenuItem>
                                  <MenuItem value="editor" sx={{ fontSize: '0.75rem' }}>Editor</MenuItem>
                                </Select>
                                <Button
                                  size="small"
                                  color="error"
                                  variant="text"
                                  startIcon={<PersonRemoveIcon />}
                                  onClick={() => handleRemoveUser(sharedUser.id)}
                                  sx={{ minWidth: 'auto', fontSize: '0.75rem' }}
                                >
                                  Remove
                                </Button>
                              </Box>
                            </Box>
                          }
                          secondaryTypographyProps={{ component: 'div' }}
                          sx={{ pr: { xs: 0, sm: 6 } }}
                        />
                      </Box>
                      <Box sx={{ display: { xs: 'none', sm: 'flex' }, gap: 1, alignItems: 'center', position: 'absolute', right: 8 }}>
                        <Select
                          size="small"
                          value={sharedUser.role}
                          onChange={(e: SelectChangeEvent<'viewer' | 'editor'>) => 
                            handleChangeUserRole(sharedUser.id, e.target.value as 'viewer' | 'editor')
                          }
                          sx={{ 
                            height: '28px',
                            fontSize: '0.75rem',
                            minWidth: '90px',
                            '& .MuiSelect-select': {
                              py: 0.5,
                            }
                          }}
                        >
                          <MenuItem value="viewer" sx={{ fontSize: '0.75rem' }}>Viewer</MenuItem>
                          <MenuItem value="editor" sx={{ fontSize: '0.75rem' }}>Editor</MenuItem>
                        </Select>
                        <IconButton
                          edge="end"
                          size="small"
                          onClick={() => handleRemoveUser(sharedUser.id)}
                        >
                          <PersonRemoveIcon />
                        </IconButton>
                      </Box>
                    </ListItem>
                  ))}
                </List>
              </Box>

              {isPublic && (
                <Alert 
                  severity="info"
                  action={
                    <Button
                      size="small"
                      startIcon={linkCopied ? <CheckCircleIcon /> : <ContentCopyIcon />}
                      onClick={handleCopyLink}
                      color={linkCopied ? "success" : "primary"}
                    >
                      {linkCopied ? 'Copied!' : 'Copy'}
                    </Button>
                  }
                >
                  <Typography variant="body2" fontWeight="medium" gutterBottom>
                    Public Link
                  </Typography>
                  <Typography variant="caption" sx={{ wordBreak: 'break-all', display: 'block', pr: 1 }}>
                    {window.location.origin}/u/{unwrappedParams.userId}/{storyId}-{document?.slug || 'untitled'}
                  </Typography>
                </Alert>
              )}
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {
              setShareDialogOpen(false);
              setSharingEmail('');
              setSearchedUser(null);
              setSharingRole('viewer');
              setShareError('');
            }}>
              Done
            </Button>
          </DialogActions>
        </Dialog>
        </Box>
      </Box>
    </Box>
  );
}
