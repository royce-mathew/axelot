'use client';

import React, { Suspense, useState } from 'react';
import { 
  Box, 
  Container, 
  Paper, 
  Typography, 
  Button,
  Stack,
  Divider,
  CircularProgress,
  TextField,
  Alert,
} from '@mui/material';
import { signIn } from 'next-auth/react';
import { useSearchParams, useRouter } from 'next/navigation';
import GoogleIcon from '@mui/icons-material/Google';
import GitHubIcon from '@mui/icons-material/GitHub';

function SignInContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  const registered = searchParams.get('registered');
  const verified = searchParams.get('verified');
  const error = searchParams.get('error');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  const handleCredentialsSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginError('');

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setLoginError('Invalid email or password. If you just signed up, please verify your email first.');
      } else {
        router.push(callbackUrl);
      }
    } catch {
      setLoginError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

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

          {registered && (
            <Alert severity="success" sx={{ mb: 2, width: '100%' }}>
              Account created successfully! Please sign in.
            </Alert>
          )}

          {verified && (
            <Alert severity="success" sx={{ mb: 2, width: '100%' }}>
              Email verified! You can now sign in with your credentials.
            </Alert>
          )}

          {error === 'CredentialsSignin' && (
            <Alert severity="error" sx={{ mb: 2, width: '100%' }}>
              Invalid email or password
            </Alert>
          )}

          {loginError && (
            <Alert severity="error" sx={{ mb: 2, width: '100%' }}>
              {loginError}
            </Alert>
          )}

          <Box component="form" onSubmit={handleCredentialsSignIn} sx={{ width: '100%', maxWidth: 400 }}>
            <Stack spacing={2}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                autoComplete="email"
              />
              <TextField
                fullWidth
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                autoComplete="current-password"
              />
              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={isLoading}
                sx={{ py: 1.5 }}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </Stack>
          </Box>

          <Divider sx={{ my: 3, width: '100%' }}>OR</Divider>

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

          <Typography 
            variant="body2" 
            color="text.secondary"
            textAlign="center"
            sx={{ mb: 2 }}
          >
            Don&apos;t have an account?{' '}
            <Button 
              size="small" 
              onClick={() => router.push('/auth/sign-up')}
              sx={{ textTransform: 'none' }}
            >
              Sign Up
            </Button>
          </Typography>

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
