'use client';

import { use, useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CardActionArea,
  Stack,
  Avatar,
  Chip,
  Skeleton,
  Divider,
  Button,
} from '@mui/material';
import {
  Public as PublicIcon,
  Article as ArticleIcon,
  Add as AddIcon,
  Archive as ArchiveIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/header';
import { query, where, orderBy, getDoc, getDocs } from 'firebase/firestore';
import { allDocumentsRef } from '@/lib/converters/document';
import { userRef } from '@/lib/converters/user';
import { Document } from '@/types/document';
import { User } from '@/types/user';
import { timeAgo } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';

export default function UserProfilePage(props: { params: Promise<{ userId: string }> }) {
  const params = use(props.params);
  const { user: currentUser } = useAuth();
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userLoading, setUserLoading] = useState(true);

  const isOwnProfile = currentUser?.id === params.userId;

  // Fetch user profile
  useEffect(() => {
    if (!params.userId) return;

    const loadUser = async () => {
      try {
        const userSnap = await getDoc(userRef(params.userId));
        if (userSnap.exists()) {
          setUser(userSnap.data());
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setUserLoading(false);
      }
    };

    loadUser();
  }, [params.userId]);

  // Fetch user's public documents
  useEffect(() => {
    if (!params.userId) return;

    const loadDocuments = async () => {
      try {
        // Query just by owner, then filter in memory to avoid composite index
        const q = query(
          allDocumentsRef(),
          where('owner', '==', params.userId),
          where('isPublic', '==', true),
          orderBy('lastUpdated', 'desc')
        );

        console.log(q);

        const snapshot = await getDocs(q);
        console.log('All documents for user:', snapshot.docs.length);
        
        const allDocs = snapshot.docs.map((doc) => doc.data());
        console.log('Document visibility:', allDocs.map(d => ({ id: d.id, isPublic: d.isPublic })));
        
        // Filter for public stories only
        const docs = allDocs.filter((doc) => doc.isPublic === true);
        
        console.log('Filtered public documents:', docs.length, docs);
        setDocuments(docs);
      } catch (error) {
        console.error('Error fetching user documents:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDocuments();
  }, [params.userId]);

  const handleCardClick = (doc: Document) => {
    if (doc.id && doc.slug) {
      router.push(`/u/${params.userId}/${doc.id}-${doc.slug}`);
    } else if (doc.id) {
      router.push(`/u/${params.userId}/${doc.id}`);
    }
  };

  const getInitials = (name?: string, userId?: string) => {
    if (name) {
      return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
    }
    return (userId || 'U').substring(0, 2).toUpperCase();
  };

  const displayName = user?.name || params.userId;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Header />
      <Container maxWidth="md" sx={{ py: 6 }}>
        {/* User Profile Header */}
        <Stack spacing={3} sx={{ mb: 6 }}>
          {userLoading ? (
            <Stack direction="row" spacing={2} alignItems="center">
              <Skeleton variant="circular" width={80} height={80} />
              <Box sx={{ flex: 1 }}>
                <Skeleton variant="text" width={200} height={40} />
                <Skeleton variant="text" width={150} height={24} />
              </Box>
            </Stack>
          ) : (
            <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
              <Stack direction="row" spacing={2} alignItems="center" sx={{ flex: 1 }}>
                <Avatar
                  src={user?.image}
                  sx={{
                    width: 80,
                    height: 80,
                    fontSize: '2rem',
                    bgcolor: 'primary.main',
                  }}
                >
                  {!user?.image && getInitials(user?.name, params.userId)}
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight={700}>
                    {displayName}
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                    <ArticleIcon fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      {documents.length} {documents.length === 1 ? 'story' : 'stories'}
                    </Typography>
                  </Stack>
                </Box>
              </Stack>
              {isOwnProfile && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => router.push('/stories')}
                >
                  Create New Story
                </Button>
              )}
            </Stack>
          )}
          <Divider />
        </Stack>

        {/* Stories List */}
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
            <ArticleIcon
              sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }}
            />
            <Typography variant="h5" gutterBottom color="text.secondary">
              No published stories yet
            </Typography>
            <Typography variant="body1" color="text.secondary">
              This user hasn&apos;t published any public stories.
            </Typography>
          </Card>
        ) : (
          <Stack spacing={3}>
            {documents.map((doc) => (
              <Card
                key={doc.id}
                sx={{
                  transition: 'all 0.2s',
                  '&:hover': {
                    boxShadow: 4,
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                <CardActionArea onClick={() => handleCardClick(doc)}>
                  <CardContent>
                    <Typography variant="h5" fontWeight={600} gutterBottom>
                      {doc.title}
                    </Typography>
                    {doc.description && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          mb: 2,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                        }}
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
                        icon={<PublicIcon />}
                        label="Public"
                        size="small"
                        color="success"
                      />
                      {doc.isArchived && (
                        <Chip
                          icon={<ArchiveIcon />}
                          label="Archived"
                          size="small"
                          color="default"
                        />
                      )}
                      {doc.tags &&
                        doc.tags.slice(0, 3).map((tag, index) => (
                          <Chip key={index} label={tag} size="small" />
                        ))}
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ ml: 'auto' }}
                      >
                        {timeAgo(doc.lastUpdated)}
                      </Typography>
                    </Stack>
                  </CardContent>
                </CardActionArea>
              </Card>
            ))}
          </Stack>
        )}
      </Container>
    </Box>
  );
}
