'use client';

import React, { Suspense } from 'react';
import { 
  Box, 
  Container, 
  Paper, 
  Typography, 
  Button,
  Stack,
  Divider,
  CircularProgress,
} from '@mui/material';
import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import GoogleIcon from '@mui/icons-material/Google';
import GitHubIcon from '@mui/icons-material/GitHub';

function SignInContent() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  const handleGoogleSignIn = async () => {
    await signIn('google', { callbackUrl });
  };

  const handleGitHubSignIn = async () => {
    await signIn('github', { callbackUrl });
  };

  return (
    <Box 
      sx={{ 
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <Container maxWidth="sm">
        <Paper 
          elevation={3}
          sx={{
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            borderRadius: 2,
          }}
        >
          <Typography 
            variant="h4" 
            component="h1" 
            gutterBottom 
            fontWeight="bold"
            sx={{ mb: 3 }}
          >
            Welcome to Axelot.io
          </Typography>
          
          <Typography 
            variant="body1" 
            color="text.secondary"
            textAlign="center"
            sx={{ mb: 4 }}
          >
            Sign in to continue to your account
          </Typography>

          <Stack spacing={2} sx={{ width: '100%', maxWidth: 400 }}>
            <Button
              variant="outlined"
              size="large"
              startIcon={<GoogleIcon />}
              onClick={handleGoogleSignIn}
              sx={{
                py: 1.5,
                textTransform: 'none',
                fontSize: '1rem',
                borderColor: 'divider',
                color: 'text.primary',
                '&:hover': {
                  borderColor: 'primary.main',
                  backgroundColor: 'action.hover',
                },
              }}
            >
              Continue with Google
            </Button>

            <Button
              variant="outlined"
              size="large"
              startIcon={<GitHubIcon />}
              onClick={handleGitHubSignIn}
              sx={{
                py: 1.5,
                textTransform: 'none',
                fontSize: '1rem',
                borderColor: 'divider',
                color: 'text.primary',
                '&:hover': {
                  borderColor: 'primary.main',
                  backgroundColor: 'action.hover',
                },
              }}
            >
              Continue with GitHub
            </Button>
          </Stack>

          <Divider sx={{ my: 3, width: '100%' }} />

          <Typography variant="body2" color="text.secondary" textAlign="center">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          }}
        >
          <CircularProgress />
        </Box>
      }
    >
      <SignInContent />
    </Suspense>
  );
}
