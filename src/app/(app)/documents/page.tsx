'use client';

import { useState, useEffect } from 'react';
import {
  Typography,
  Container,
  Box,
  Stack,
  Card,
  CardActionArea,
  CardContent,
  Avatar,
  Chip,
  Divider,
  Tabs,
  Tab,
} from '@mui/material';
import { Header } from '@/components/header';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import DescriptionIcon from '@mui/icons-material/Description';

// Mock data - replace with actual API calls
const mockDocuments = [
  {
    id: '1',
    title: 'Getting Started with Next.js 15',
    excerpt: 'A comprehensive guide to building modern web applications with the latest version of Next.js...',
    author: {
      name: 'John Doe',
      avatar: null,
    },
    createdAt: '2025-01-15',
    updatedAt: '2025-01-20',
    tags: ['Next.js', 'React', 'Web Development'],
    readTime: '5 min read',
  },
  {
    id: '2',
    title: 'Understanding TypeScript Generics',
    excerpt: 'Deep dive into TypeScript generics and how they can make your code more reusable and type-safe...',
    author: {
      name: 'Jane Smith',
      avatar: null,
    },
    createdAt: '2025-01-10',
    updatedAt: '2025-01-18',
    tags: ['TypeScript', 'Programming'],
    readTime: '8 min read',
  },
  {
    id: '3',
    title: 'Building Scalable APIs with Node.js',
    excerpt: 'Best practices for designing and implementing scalable REST APIs using Node.js and Express...',
    author: {
      name: 'John Doe',
      avatar: null,
    },
    createdAt: '2025-01-05',
    updatedAt: '2025-01-15',
    tags: ['Node.js', 'API', 'Backend'],
    readTime: '12 min read',
  },
];

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`documents-tabpanel-${index}`}
      aria-labelledby={`documents-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const DocumentCard = ({ document }: { document: typeof mockDocuments[0] }) => {
  const router = useRouter();

  return (
    <Card
      elevation={0}
      sx={{
        mb: 3,
        border: 1,
        borderColor: 'divider',
        '&:hover': {
          boxShadow: 2,
          borderColor: 'primary.main',
        },
        transition: 'all 0.2s ease-in-out',
      }}
    >
      <CardActionArea
        onClick={() => router.push(`/documents/${document.id}`)}
        sx={{ p: 3 }}
      >
        <CardContent sx={{ p: 0 }}>
          <Stack spacing={2}>
            {/* Author info */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: 'primary.main',
                  fontSize: '0.875rem',
                }}
              >
                {document.author.name.charAt(0)}
              </Avatar>
              <Box>
                <Typography variant="body2" fontWeight={500}>
                  {document.author.name}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(document.updatedAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    •
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {document.readTime}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Title and excerpt */}
            <Box>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  mb: 1,
                  fontSize: { xs: '1.25rem', sm: '1.5rem' },
                }}
              >
                {document.title}
              </Typography>
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  lineHeight: 1.6,
                }}
              >
                {document.excerpt}
              </Typography>
            </Box>

            {/* Tags */}
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {document.tags.map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  size="small"
                  sx={{
                    height: 24,
                    fontSize: '0.75rem',
                    bgcolor: 'action.hover',
                    '&:hover': {
                      bgcolor: 'action.selected',
                    },
                  }}
                />
              ))}
            </Box>
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default function DocumentsPage() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  const [tabValue, setTabValue] = useState(0);

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, isLoading, router]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (isLoading) {
    return (
      <Box sx={{ minHeight: '100vh' }}>
        <Header />
        <Container maxWidth="md" sx={{ py: 8 }}>
          <Typography variant="h5">Loading...</Typography>
        </Container>
      </Box>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect via useEffect
  }

  const myDocuments = mockDocuments.filter(
    (doc) => doc.author.name === user?.name
  );
  const allDocuments = mockDocuments;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Header />

      <Container maxWidth="md" sx={{ py: 6 }}>
        {/* Page header */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              mb: 1,
              fontSize: { xs: '2rem', sm: '2.5rem' },
            }}
          >
            Your Stories
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Read, write, and share your ideas with the community
          </Typography>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="document tabs"
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 500,
              },
            }}
          >
            <Tab
              label={`All Documents (${allDocuments.length})`}
              id="documents-tab-0"
              aria-controls="documents-tabpanel-0"
            />
            <Tab
              label={`My Documents (${myDocuments.length})`}
              id="documents-tab-1"
              aria-controls="documents-tabpanel-1"
            />
          </Tabs>
        </Box>

        {/* Tab panels */}
        <TabPanel value={tabValue} index={0}>
          <Stack spacing={0}>
            {allDocuments.length > 0 ? (
              allDocuments.map((doc) => (
                <DocumentCard key={doc.id} document={doc} />
              ))
            ) : (
              <Box
                sx={{
                  py: 8,
                  textAlign: 'center',
                  color: 'text.secondary',
                }}
              >
                <DescriptionIcon sx={{ fontSize: 64, mb: 2, opacity: 0.3 }} />
                <Typography variant="h6" gutterBottom>
                  No documents yet
                </Typography>
                <Typography variant="body2">
                  Start writing your first document
                </Typography>
              </Box>
            )}
          </Stack>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Stack spacing={0}>
            {myDocuments.length > 0 ? (
              myDocuments.map((doc) => (
                <DocumentCard key={doc.id} document={doc} />
              ))
            ) : (
              <Box
                sx={{
                  py: 8,
                  textAlign: 'center',
                  color: 'text.secondary',
                }}
              >
                <DescriptionIcon sx={{ fontSize: 64, mb: 2, opacity: 0.3 }} />
                <Typography variant="h6" gutterBottom>
                  You haven&apos;t created any documents yet
                </Typography>
                <Typography variant="body2">
                  Click the &quot;New Document&quot; button to start writing
                </Typography>
              </Box>
            )}
          </Stack>
        </TabPanel>
      </Container>
    </Box>
  );
}
