'use client';

import { useState, useEffect } from 'react';
import { Typography, Button, Container, Box, Stack } from '@mui/material';
import { useRouter } from 'next/navigation';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CodeIcon from '@mui/icons-material/Code';
import FolderIcon from '@mui/icons-material/Folder';
import StarIcon from '@mui/icons-material/Star';
import NumberFlow, { continuous } from '@number-flow/react';
import { Card } from '@mui/material';

const HeroSection = () => {
  const router = useRouter();
  const [animatedStories, setAnimatedStories] = useState(0);
  const [animatedUsers, setAnimatedUsers] = useState(0);

  useEffect(() => {
    // Animate numbers on mount
    const timer = setTimeout(() => {
      setAnimatedStories(1000);
      setAnimatedUsers(100);
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: '90vh',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        background: (theme) =>
          theme.palette.mode === 'dark'
            ? 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(120, 119, 198, 0.3), transparent), linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.05) 100%)'
            : 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(120, 119, 198, 0.15), transparent)',
      }}
    >
      {/* Animated background elements */}
      <Box
        sx={{
          position: 'absolute',
          top: '10%',
          left: '10%',
          width: 400,
          height: 400,
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)',
          borderRadius: '50%',
          animation: 'float 6s ease-in-out infinite',
          '@keyframes float': {
            '0%, 100%': { transform: 'translateY(0px)' },
            '50%': { transform: 'translateY(-20px)' },
          },
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '10%',
          right: '10%',
          width: 300,
          height: 300,
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 70%)',
          borderRadius: '50%',
          animation: 'float 8s ease-in-out infinite',
          animationDelay: '1s',
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Stack spacing={5} alignItems="center" textAlign="center">
          <Box>
            <Typography
              component="span"
              sx={{
                display: 'inline-block',
                px: 2,
                py: 0.5,
                mb: 3,
                borderRadius: '20px',
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                fontSize: '0.875rem',
                fontWeight: 600,
              }}
            >
              ✨ The future of developer documentation
            </Typography>
          </Box>

          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: '2.5rem', sm: '3.5rem', md: '5rem' },
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              maxWidth: 900,
              background: (theme) =>
                theme.palette.mode === 'dark'
                  ? 'linear-gradient(135deg, #ffffff 0%, #a0a0a0 100%)'
                  : 'linear-gradient(135deg, #1e40af 0%, #7c3aed 50%, #ec4899 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Write, Share, & Showcase Your Work
          </Typography>

          <Typography
            variant="h5"
            sx={{
              fontSize: { xs: '1.1rem', sm: '1.3rem', md: '1.5rem' },
              fontWeight: 400,
              lineHeight: 1.7,
              color: 'text.secondary',
              maxWidth: '700px',
            }}
          >
            The all-in-one platform for developers to document their journey,
            collaborate in real-time, and build a stunning portfolio.
          </Typography>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ pt: 2 }}>
            <Button
              variant="contained"
              size="large"
              endIcon={<ArrowForwardIcon />}
              onClick={() => router.push('/auth/sign-up')}
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: '12px',
                textTransform: 'none',
                fontSize: '1.1rem',
                fontWeight: 600,
                boxShadow: '0 8px 24px rgba(59, 130, 246, 0.3)',
                '&:hover': {
                  boxShadow: '0 12px 32px rgba(59, 130, 246, 0.4)',
                },
              }}
            >
              Start Writing Free
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => router.push('/search')}
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: '12px',
                textTransform: 'none',
                fontSize: '1.1rem',
                fontWeight: 600,
                borderWidth: 2,
                '&:hover': {
                  borderWidth: 2,
                },
              }}
            >
              Explore Stories
            </Button>
          </Stack>

          {/* Stats with NumberFlow animations */}
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={6}
            sx={{
              pt: 4,
              opacity: 0.8,
            }}
          >
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" fontWeight={700} sx={{ fontVariantNumeric: 'tabular-nums' }}>
                <NumberFlow 
                  value={animatedUsers} 
                  format={{ notation: 'compact' }} 
                  plugins={[continuous]}
                />+
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active Writers
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" fontWeight={700} sx={{ fontVariantNumeric: 'tabular-nums' }}>
                <NumberFlow 
                  value={animatedStories} 
                  format={{ notation: 'compact' }} 
                  plugins={[continuous]}
                />+
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Stories Published
              </Typography>
            </Box>
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
    <Card
      elevation={0}
      sx={{
        p: 3,
        height: '100%',
        borderRadius: 3,
        border: 1,
        borderColor: 'divider',
        transition: 'all 0.3s ease',
        '&:hover': {
          borderColor: 'primary.main',
          boxShadow: 3,
          transform: 'translateY(-4px)',
        },
      }}
    >
      <Box
        sx={{
          mb: 2,
          width: 56,
          height: 56,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 2,
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          '& svg': {
            fontSize: '2rem',
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
        }}
      >
        {description}
      </Typography>
    </Card>
  );
};

const FeaturesSection = () => {
  const features = [
    {
      icon: <CodeIcon />,
      title: 'Rich Editor',
      description:
        'Write with a powerful editor supporting Markdown, syntax highlighting, tables, and real-time collaboration.',
    },
    {
      icon: <FolderIcon />,
      title: 'Organized Workspace',
      description:
        'Keep all your documentation, notes, and projects organized in one beautiful, accessible space.',
    },
    {
      icon: <StarIcon />,
      title: 'Public Portfolios',
      description:
        'Showcase your best work to the world. Share your knowledge and build your developer brand.',
    },
  ];

  return (
    <Box sx={{ py: { xs: 10, md: 14 }, bgcolor: 'background.default' }}>
      <Container maxWidth="lg">
        <Stack spacing={8}>
          <Box textAlign="center" sx={{ maxWidth: 800, mx: 'auto' }}>
            <Typography
              component="span"
              sx={{
                display: 'inline-block',
                px: 2,
                py: 0.5,
                mb: 2,
                borderRadius: '20px',
                border: 1,
                borderColor: 'primary.main',
                color: 'primary.main',
                fontSize: '0.875rem',
                fontWeight: 600,
              }}
            >
              FEATURES
            </Typography>
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: '2rem', sm: '2.5rem', md: '3.5rem' },
                fontWeight: 800,
                mb: 2,
                letterSpacing: '-0.02em',
              }}
            >
              Everything you need to succeed
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: 'text.secondary',
                fontWeight: 400,
                lineHeight: 1.6,
              }}
            >
              Professional tools designed for developers who want to create, share, and grow
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
              gap: 4,
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
          © 2025 Royce Mathew & Sunny Patel. Built with ❤️ for developers.
        </Typography>
      </Container>
    </Box>
  );
};

export default function Home() {
  // Show Hero section to all users
  return (
    <Box sx={{ minHeight: '100vh' }}>
      <HeroSection />
      <FeaturesSection />
      <Footer />
    </Box>
  );
}
