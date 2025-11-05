'use client';


import { Typography, Button, Container, Box, Stack, Card, CardContent, CardActions, Chip, Fab, Skeleton } from '@mui/material';
import { Header } from '@/components/header';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CodeIcon from '@mui/icons-material/Code';
import FolderIcon from '@mui/icons-material/Folder';
import StarIcon from '@mui/icons-material/Star';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import VisibilityIcon from '@mui/icons-material/Visibility';
import RefreshIcon from '@mui/icons-material/Refresh';
import PersonIcon from '@mui/icons-material/Person';
import { Add as AddIcon, Description as DescriptionIcon } from '@mui/icons-material';
import { signIn } from 'next-auth/react';
import { getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { allDocumentsRef } from '@/lib/converters/document';
import { Document } from '@/types/document';
import { timeAgo } from '@/lib/utils';
import { useStoriesCache } from '@/hooks/use-stories-cache';

const HeroSection = () => {
  const handleGetStarted = () => {
    signIn();
  };

  return (
    <Box
      sx={{
        minHeight: '85vh',
        display: 'flex',
        alignItems: 'center',
        background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.02) 100%)',
      }}
    >
      <Container maxWidth="md">
        <Stack spacing={4} alignItems="center" textAlign="center">
          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4.5rem' },
              fontWeight: 700,
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #ec4899 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Your work, beautifully centralized
          </Typography>

          <Typography
            variant="h5"
            sx={{
              fontSize: { xs: '1.1rem', sm: '1.3rem', md: '1.5rem' },
              fontWeight: 400,
              lineHeight: 1.6,
              color: 'text.secondary',
              maxWidth: '650px',
            }}
          >
            Store your documentation, showcase your skills, and build your developer
            portfolio—all in one place. Simple, elegant, and powerful.
          </Typography>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ pt: 2 }}>
            <Button
              variant="contained"
              size="large"
              endIcon={<ArrowForwardIcon />}
              onClick={handleGetStarted}
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: '12px',
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 600,
                boxShadow: '0 4px 14px 0 rgba(0,0,0,0.1)',
              }}
            >
              Get Started Free
            </Button>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
};

const FeatureCard = ({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) => {
  return (
    <Box sx={{ textAlign: 'center', px: 2 }}>
      <Box
        sx={{
          mb: 3,
          display: 'flex',
          justifyContent: 'center',
          '& svg': {
            fontSize: '2.5rem',
            color: 'primary.main',
          },
        }}
      >
        {icon}
      </Box>
      <Typography
        variant="h6"
        sx={{
          fontWeight: 700,
          mb: 1.5,
          fontSize: '1.25rem',
        }}
      >
        {title}
      </Typography>
      <Typography
        variant="body1"
        sx={{
          color: 'text.secondary',
          lineHeight: 1.7,
          fontSize: '1rem',
        }}
      >
        {description}
      </Typography>
    </Box>
  );
};

const FeaturesSection = () => {
  const features = [
    {
      icon: <FolderIcon />,
      title: 'Centralized Documentation',
      description:
        'Keep all your project documentation, notes, and technical writing in one organized space.',
    },
    {
      icon: <StarIcon />,
      title: 'Showcase Your Skills',
      description:
        'Build a beautiful portfolio that highlights your expertise, projects, and achievements.',
    },
    {
      icon: <CodeIcon />,
      title: 'Developer-First',
      description:
        'Built by developers, for developers. Markdown support, syntax highlighting, and more.',
    },
  ];

  return (
    <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: 'background.paper' }}>
      <Container maxWidth="lg">
        <Stack spacing={8}>
          <Box textAlign="center">
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                fontWeight: 700,
                mb: 2,
                letterSpacing: '-0.02em',
              }}
            >
              Everything you need
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: 'text.secondary',
                fontWeight: 400,
                maxWidth: '600px',
                mx: 'auto',
                lineHeight: 1.6,
              }}
            >
              A complete platform designed to help developers organize, share, and grow
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
              gap: 6,
            }}
          >
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
              />
            ))}
          </Box>
        </Stack>
      </Container>
    </Box>
  );
};

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 6,
        borderTop: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Container maxWidth="lg">
        <Typography
          variant="body2"
          align="center"
          sx={{
            color: 'text.secondary',
            fontSize: '0.875rem',
          }}
        >
          © 2025 Royce Mathew. Built with ❤️ for developers.
        </Typography>
      </Container>
    </Box>
  );
};

export default function Home() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  
  // Use caching hook to fetch stories with 5-minute cache
  const { data: storiesData, loading: loadingStories, refresh: refreshStories } = useStoriesCache(
    async () => {
      // Fetch recently published public stories
      const recentQuery = query(
        allDocumentsRef(),
        where('isPublic', '==', true),
        orderBy('created', 'desc'),
        limit(6)
      );

      // Fetch trending stories (pre-computed by cron job)
      // The cron job updates trendingScore field every hour
      const trendingQuery = query(
        allDocumentsRef(),
        where('isPublic', '==', true),
        orderBy('trendingScore', 'desc'),
        limit(6)
      );

      // Fetch both queries in parallel for better performance
      const [recentSnapshot, trendingSnapshot] = await Promise.all([
        getDocs(recentQuery),
        getDocs(trendingQuery)
      ]);

      const recentDocs = recentSnapshot.docs.map((doc) => doc.data());
      const trendingDocs = trendingSnapshot.docs.map((doc) => doc.data());
      
      // No need to fetch user data separately - using denormalized data!
      // No need to calculate trending - using pre-computed scores from cron job!
      return {
        recent: recentDocs,
        trending: trendingDocs,
      };
    },
    [isAuthenticated, user?.id],
    'homepage-stories'
  );

  // Extract stories from cached data
  const recentStories = storiesData?.recent ?? [];
  const trendingStories = storiesData?.trending ?? [];

  const handleCardClick = (doc: Document) => {
    // Use denormalized username if available, otherwise fall back to user ID
    const userIdentifier = doc.ownerUsername ? `@${doc.ownerUsername}` : doc.owner;
    router.push(`/u/${userIdentifier}/${doc.id}`);
  };

  const handleCreateNew = () => {
    router.push('/stories');
  };

  if (isLoading) {
    return (
      <Box sx={{ minHeight: '100vh' }}>
        <Header />
      </Box>
    );
  }

  // Show Hero section for non-authenticated users
  if (!isAuthenticated) {
    return (
      <Box sx={{ minHeight: '100vh' }}>
        <Header />
        <HeroSection />
        <FeaturesSection />
        <Footer />
      </Box>
    );
  }

  // Show recommended stories for authenticated users
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Header />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Welcome Section */}
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Welcome back, {user?.name?.split(' ')[0] || 'there'}! 👋
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Discover new stories and continue where you left off
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={refreshStories}
            disabled={loadingStories}
            sx={{ borderRadius: 2 }}
          >
            Refresh
          </Button>
        </Box>

        {loadingStories ? (
          <Stack spacing={4}>
            {[1, 2, 3].map((i) => (
              <Box key={i}>
                <Skeleton variant="text" width="30%" height={40} sx={{ mb: 2 }} />
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 3 }}>
                  {[1, 2, 3].map((j) => (
                    <Card key={j}>
                      <CardContent>
                        <Skeleton variant="text" width="80%" height={30} />
                        <Skeleton variant="text" width="60%" />
                        <Skeleton variant="text" width="40%" />
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              </Box>
            ))}
          </Stack>
        ) : (
          <Stack spacing={6}>
            {/* Trending Stories Section */}
            {trendingStories.length > 0 && (
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                  <TrendingUpIcon color="primary" />
                  <Typography variant="h5" fontWeight={600}>
                    Trending Stories
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
                    gap: 3,
                  }}
                >
                  {trendingStories.slice(0, 6).map((doc: Document) => (
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
                        <Typography variant="h6" fontWeight={600} gutterBottom noWrap>
                          {doc.title}
                        </Typography>
                        {doc.description && (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              mb: 2,
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                            }}
                          >
                            {doc.description}
                          </Typography>
                        )}
                        <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                          {doc.ownerName && (
                            <Chip 
                              icon={<PersonIcon />} 
                              label={doc.ownerName} 
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                const userIdentifier = doc.ownerUsername ? `@${doc.ownerUsername}` : doc.owner;
                                router.push(`/u/${userIdentifier}`);
                              }}
                              sx={{ cursor: 'pointer' }}
                            />
                          )}
                          <Chip 
                            icon={<VisibilityIcon />} 
                            label={`${(doc.viewCount || 0).toLocaleString()} views`} 
                            size="small" 
                            variant="outlined"
                          />
                          {doc.tags &&
                            doc.tags.slice(0, 2).map((tag: string, index: number) => (
                              <Chip key={index} label={tag} size="small" />
                            ))}
                        </Stack>
                      </CardContent>
                      <CardActions sx={{ px: 2, pb: 2 }}>
                        <Typography variant="caption" color="text.secondary">
                          Updated {timeAgo(doc.lastUpdated)}
                        </Typography>
                      </CardActions>
                    </Card>
                  ))}
                </Box>
              </Box>
            )}

            {/* Recently Published Section */}
            {recentStories.length > 0 && (
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                  <AccessTimeIcon color="primary" />
                  <Typography variant="h5" fontWeight={600}>
                    Recently Published
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
                    gap: 3,
                  }}
                >
                  {recentStories.slice(0, 6).map((doc: Document) => (
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
                        <Typography variant="h6" fontWeight={600} gutterBottom noWrap>
                          {doc.title}
                        </Typography>
                        {doc.description && (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              mb: 2,
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                            }}
                          >
                            {doc.description}
                          </Typography>
                        )}
                        <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                          {doc.ownerName && (
                            <Chip 
                              icon={<PersonIcon />} 
                              label={doc.ownerName} 
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                const userIdentifier = doc.ownerUsername ? `@${doc.ownerUsername}` : doc.owner;
                                router.push(`/u/${userIdentifier}`);
                              }}
                              sx={{ cursor: 'pointer' }}
                            />
                          )}
                          <Chip 
                            icon={<VisibilityIcon />} 
                            label={`${(doc.viewCount || 0).toLocaleString()} views`} 
                            size="small" 
                            variant="outlined"
                          />
                          {doc.tags &&
                            doc.tags.slice(0, 2).map((tag: string, index: number) => (
                              <Chip key={index} label={tag} size="small" />
                            ))}
                        </Stack>
                      </CardContent>
                      <CardActions sx={{ px: 2, pb: 2 }}>
                        <Typography variant="caption" color="text.secondary">
                          Published {timeAgo(doc.created)}
                        </Typography>
                      </CardActions>
                    </Card>
                  ))}
                </Box>
              </Box>
            )}

            {/* Empty State */}
            {recentStories.length === 0 && trendingStories.length === 0 && (
              <Card
                sx={{
                  textAlign: 'center',
                  py: 8,
                  bgcolor: 'background.paper',
                }}
              >
                <DescriptionIcon sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
                <Typography variant="h5" gutterBottom color="text.secondary">
                  No stories yet
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  Create your first story to get started
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleCreateNew}
                >
                  Create Story
                </Button>
              </Card>
            )}
          </Stack>
        )}
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
        onClick={handleCreateNew}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
}
