'use client';

import { useState, useEffect } from 'react';
import {
  Typography,
  Container,
  Box,
  Stack,
  CardContent,
  TextField,
  InputAdornment,
  Chip,
  Avatar,
} from '@mui/material';
import Link from 'next/link';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import SearchIcon from '@mui/icons-material/Search';
import ArticleIcon from '@mui/icons-material/Article';

import { Document } from '@/types/document';
import { db } from '@/lib/firebase/client';
import { timeAgo, getInitials } from '@/lib/utils';
import HoverCard from '@/components/HoverCard';

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [recentPublic, setRecentPublic] = useState<Document[]>([]);

  // Load recent public stories on mount
  useEffect(() => {
    const loadRecentPublic = async () => {
      try {
        const q = query(
          collection(db, 'stories'),
          where('isPublic', '==', true),
          orderBy('lastUpdated', 'desc'),
          limit(12)
        );
        const snapshot = await getDocs(q);
        const stories = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Document[];
        setRecentPublic(stories);
      } catch (error) {
        console.error('Error loading public stories:', error);
      }
    };

    loadRecentPublic();
  }, []);

  // Search functionality
  useEffect(() => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    const searchStories = async () => {
      setLoading(true);
      try {
        // Note: This is a simple search. For production, consider using
        // Algolia, Elasticsearch, or Firebase Extensions for better search
        const q = query(
          collection(db, 'stories'),
          where('isPublic', '==', true),
          orderBy('lastUpdated', 'desc'),
          limit(50)
        );
        
        const snapshot = await getDocs(q);
        const stories = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Document[];

        // Client-side filtering (not ideal for large datasets)
        const filtered = stories.filter((story) =>
          story.title.toLowerCase().includes(searchQuery.toLowerCase())
        );

        setResults(filtered);
      } catch (error) {
        console.error('Error searching stories:', error);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(searchStories, 500);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  const displayStories = searchQuery ? results : recentPublic;

  return (

    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Box sx={{ mb: 6, textAlign: 'center' }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              mb: 2,
              fontSize: { xs: '2rem', sm: '2.5rem' },
            }}
          >
            Discover Stories
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Explore public stories from our community
          </Typography>

          {/* Search Bar */}
          <TextField
            fullWidth
            placeholder="Search stories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{
              maxWidth: 600,
              mx: 'auto',
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
              },
            }}
          />
        </Box>

        {/* Results */}
        {loading ? (
          <Typography textAlign="center" color="text.secondary">
            Searching...
          </Typography>
        ) : displayStories.length === 0 ? (
          <Box
            sx={{
              py: 12,
              textAlign: 'center',
              color: 'text.secondary',
            }}
          >
            <ArticleIcon sx={{ fontSize: 80, mb: 2, opacity: 0.3 }} />
            <Typography variant="h5" gutterBottom>
              {searchQuery ? 'No stories found' : 'No public stories yet'}
            </Typography>
            <Typography variant="body1">
              {searchQuery
                ? 'Try a different search term'
                : 'Be the first to share a public story!'}
            </Typography>
          </Box>
        ) : (
          <>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              {searchQuery ? `Search Results (${results.length})` : 'Recent Public Stories'}
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  md: 'repeat(2, 1fr)',
                },
                gap: 3,
              }}
            >
              {displayStories.map((story) => {
                const storySlug = story.slug || 'untitled';
                return (
                  <HoverCard
                    key={story.id}
                    component={Link}
                    href={`/u/${story.owner}/${story.id}-${storySlug}`}
                    elevation={0}
                  >
                  <CardContent sx={{ p: 3 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        mb: 1.5,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                      }}
                    >
                      {story.title || 'Untitled Story'}
                    </Typography>

                    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
                      <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
                        {getInitials(story.authorNames?.[0] || story.lastUpdatedBy || 'A')}
                      </Avatar>
                      <Typography variant="caption" color="text.secondary">
                        {story.authorNames?.[0] || story.lastUpdatedBy || 'Anonymous'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        •
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {timeAgo(story.lastUpdated)}
                      </Typography>
                    </Stack>

                    <Chip
                      label="Public"
                      size="small"
                      color="success"
                      sx={{
                        height: 24,
                        fontSize: '0.75rem',
                      }}
                    />
                  </CardContent>
                </HoverCard>
              );
              })}
            </Box>
          </>
        )}
      </Container>
    </Box>
  );
}
