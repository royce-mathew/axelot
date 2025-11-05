'use client';

import { useEffect } from 'react';
import { Typography, Button, Container, Box, Stack } from '@mui/material';
import { Header } from '@/components/header';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CodeIcon from '@mui/icons-material/Code';
import FolderIcon from '@mui/icons-material/Folder';
import StarIcon from '@mui/icons-material/Star';
import { signIn } from 'next-auth/react';

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
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/documents');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <Box sx={{ minHeight: '100vh' }}>
        <Header />
      </Box>
    );
  }

  if (isAuthenticated) {
    return null; // Will redirect
  }

  return (
    <Box sx={{ minHeight: '100vh' }}>
      <Header />
      <HeroSection />
      <FeaturesSection />
      <Footer />
    </Box>
  );
}
