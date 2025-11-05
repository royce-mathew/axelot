'use client';

import { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Stack,
  Skeleton,
  Fab,
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Public as PublicIcon,
  Lock as LockIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Header } from '@/components/header';
import {
  addDoc,
  onSnapshot,
  deleteDoc,
  updateDoc,
  Timestamp,
} from 'firebase/firestore';
import {
  documentRef,
  documentsByOwnerRef,
  allDocumentsRef,
} from '@/lib/converters/document';
import { Document } from '@/types/document';
import { createInitialDocument } from '@/lib/content-utils';
import { timeAgo } from '@/lib/utils';

export default function StoriesPage() {
  const { user, isAuthenticated, isLoading, session } = useAuth();
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/sign-in');
    }
  }, [isAuthenticated, isLoading, router]);

  // Fetch user's documents
  useEffect(() => {
    console.log(session);
    if (!user?.id) return;

    console.log("USER EXISTS", user.id)

    const unsubscribe = onSnapshot(
      documentsByOwnerRef(user.id),
      (snapshot) => {
        const docs = snapshot.docs.map((doc) => doc.data());
        setDocuments(docs);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching documents:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user?.id, session]);

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    doc: Document
  ) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedDoc(doc);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleRenameClick = () => {
    if (selectedDoc) {
      setNewTitle(selectedDoc.title);
      setRenameDialogOpen(true);
    }
    handleMenuClose();
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const handleCreateNew = async () => {
    if (!user?.id || !newTitle.trim()) return;

    try {
      const docData = createInitialDocument(newTitle.trim(), user.id);

      // Add missing fields required by security rules for creation
      const completeDocData: Omit<Document, 'id' | 'ref'> = {
        ...docData,
        owner: user.id,
        writeAccess: [],
        readAccess: [],
        isPublic: false,
        title: newTitle.trim(),
        created: Timestamp.now(),
        lastUpdated: Timestamp.now(),
        lastUpdatedBy: user.id,
        isArchived: false,
        // Denormalized author data
        ownerName: user.name || undefined,
        ownerUsername: user.username || undefined,
        ownerImage: user.image || undefined,
      };

      const newDoc = await addDoc(allDocumentsRef(), completeDocData);

      setCreateDialogOpen(false);
      setNewTitle('');
      // Navigate to the new story with username if available, otherwise user ID
      const userIdentifier = user.username ? `@${user.username}` : user.id;
      router.push(`/u/${userIdentifier}/${newDoc.id}`);
    } catch (error) {
      console.error('Error creating document:', error);
    }
  };

  const handleRename = async () => {
    if (!selectedDoc?.id || !newTitle.trim()) return;

    try {
      await updateDoc(documentRef(selectedDoc.id), {
        title: newTitle.trim(),
        lastUpdated: Timestamp.now(),
        lastUpdatedBy: user?.id || 'Unknown',
      });
      setRenameDialogOpen(false);
      setNewTitle('');
    } catch (error) {
      console.error('Error renaming document:', error);
    }
  };

  const handleDelete = async () => {
    if (!selectedDoc?.id) return;

    try {
      await deleteDoc(documentRef(selectedDoc.id));
      setDeleteDialogOpen(false);
      setSelectedDoc(null);
    } catch (error) {
      console.error('Error deleting document:', error);
    }
  };

  const handleCardClick = (doc: Document) => {
    if (doc.id && doc.owner) {
      const slug = doc.slug || 'untitled';
      const userIdentifier = user?.username ? `@${user.username}` : doc.owner;
      router.push(`/u/${userIdentifier}/${doc.id}-${slug}`);
    }
  };

  if (isLoading || !isAuthenticated) {
    return null;
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Header />
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 4 }}
        >
          <Typography variant="h3" component="h1" fontWeight={700}>
            My Stories
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
            size="large"
          >
            New Story
          </Button>
        </Stack>

        {loading ? (
          <Stack spacing={3}>
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent>
                  <Skeleton variant="text" width="60%" height={40} />
                  <Skeleton variant="text" width="80%" />
                  <Skeleton variant="text" width="40%" />
                </CardContent>
              </Card>
            ))}
          </Stack>
        ) : documents.length === 0 ? (
          <Card
            sx={{
              textAlign: 'center',
              py: 8,
              bgcolor: 'background.paper',
            }}
          >
            <DescriptionIcon
              sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }}
            />
            <Typography variant="h5" gutterBottom color="text.secondary">
              No stories yet
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Create your first story to get started
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setCreateDialogOpen(true)}
            >
              Create Story
            </Button>
          </Card>
        ) : (
          <Stack spacing={3}>
            {documents.map((doc) => (
              <Card
                key={doc.id}
                sx={{
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    boxShadow: 4,
                    transform: 'translateY(-2px)',
                  },
                }}
                onClick={() => handleCardClick(doc)}
              >
                <CardContent>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="flex-start"
                  >
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h5" fontWeight={600} gutterBottom>
                        {doc.title}
                      </Typography>
                      {doc.description && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 2 }}
                        >
                          {doc.description}
                        </Typography>
                      )}
                      <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                        flexWrap="wrap"
                      >
                        <Chip
                          icon={doc.isPublic ? <PublicIcon /> : <LockIcon />}
                          label={doc.isPublic ? 'Public' : 'Private'}
                          size="small"
                          color={doc.isPublic ? 'success' : 'default'}
                        />
                        {doc.isArchived && (
                          <Chip
                            label="Archived"
                            size="small"
                            color="default"
                          />
                        )}
                        {doc.tags &&
                          doc.tags.slice(0, 3).map((tag, index) => (
                            <Chip key={index} label={tag} size="small" />
                          ))}
                      </Stack>
                    </Box>
                    <IconButton
                      onClick={(e) => handleMenuOpen(e, doc)}
                      size="small"
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </Stack>
                </CardContent>
                <CardActions sx={{ px: 2, pb: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    Updated {timeAgo(doc.lastUpdated)}
                  </Typography>
                </CardActions>
              </Card>
            ))}
          </Stack>
        )}

        {/* Context Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleRenameClick}>
            <EditIcon fontSize="small" sx={{ mr: 1 }} />
            Rename
          </MenuItem>
          <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
            <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
            Delete
          </MenuItem>
        </Menu>

        {/* Create Dialog */}
        <Dialog
          open={createDialogOpen}
          onClose={() => setCreateDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Create New Story</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Story Title"
              fullWidth
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleCreateNew();
                }
              }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleCreateNew}
              variant="contained"
              disabled={!newTitle.trim()}
            >
              Create
            </Button>
          </DialogActions>
        </Dialog>

        {/* Rename Dialog */}
        <Dialog
          open={renameDialogOpen}
          onClose={() => setRenameDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Rename Story</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Story Title"
              fullWidth
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleRename();
                }
              }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setRenameDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleRename}
              variant="contained"
              disabled={!newTitle.trim()}
            >
              Rename
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          maxWidth="sm"
        >
          <DialogTitle>Delete Story?</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete &quot;
              {selectedDoc?.title}&quot;? This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleDelete} variant="contained" color="error">
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Container>

      {/* Floating Action Button for mobile */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          display: { xs: 'flex', sm: 'none' },
        }}
        onClick={() => setCreateDialogOpen(true)}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
}
