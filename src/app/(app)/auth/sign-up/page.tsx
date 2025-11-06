'use client';

import { useState, useTransition } from 'react';
import {
  Box,
  Container,
  TextField,
  Button,
  Typography,
  Paper,
  Link as MuiLink,
  Alert,
  Divider,
  Stack,
} from '@mui/material';
import Link from 'next/link';
import { Header } from '@/components/header';
import { signUpAction } from './actions';
import { signIn } from 'next-auth/react';
import { getAuth, sendSignInLinkToEmail } from 'firebase/auth';
import { firebaseApp } from '@/lib/firebase/client';

export default function SignUpPage() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      // First create the user account
      const result = await signUpAction(formData);

      if (result.success && result.email) {
        try {
          // Send verification email link using Firebase
          const auth = getAuth(firebaseApp);
          const actionCodeSettings = {
            url: `${window.location.origin}/auth/verify-email?email=${encodeURIComponent(result.email)}`,
            handleCodeInApp: true,
          };

          await sendSignInLinkToEmail(auth, result.email, actionCodeSettings);
          
          // Save email locally for verification completion
          window.localStorage.setItem('emailForSignIn', result.email);
          
          setSuccess('Account created! Check your email for a verification link.');
          setEmailSent(true);
        } catch (emailError) {
          console.error('Error sending verification email:', emailError);
          setError('Account created but failed to send verification email. Please try signing in.');
        }
      } else {
        setError(result.error || 'Sign up failed');
      }
    });
  };

  const handleOAuthSignIn = (provider: 'google' | 'github') => {
    signIn(provider, { callbackUrl: '/auth/username-setup' });
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Header />
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom fontWeight={700} textAlign="center">
            Create Account
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mb: 3 }}>
            Sign up to start writing and sharing your stories
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
              {emailSent && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Click the link in the email to verify your account and complete sign-up.
                </Typography>
              )}
            </Alert>
          )}

          {!emailSent && (
            <>
              <form onSubmit={handleSubmit}>
                <Stack spacing={2}>
                  <TextField
                    fullWidth
                    label="Name"
                    name="name"
                    type="text"
                    required
                    disabled={isPending}
                    autoComplete="name"
                  />
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    required
                    disabled={isPending}
                    autoComplete="email"
                  />
                  <TextField
                    fullWidth
                    label="Password"
                    name="password"
                    type="password"
                    required
                    disabled={isPending}
                    autoComplete="new-password"
                    helperText="Must be at least 8 characters"
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    fullWidth
                    disabled={isPending}
                    sx={{ mt: 2 }}
                  >
                    {isPending ? 'Creating Account...' : 'Sign Up'}
                  </Button>
                </Stack>
              </form>

              <Divider sx={{ my: 3 }}>OR</Divider>

              <Stack spacing={2}>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => handleOAuthSignIn('google')}
                  disabled={isPending}
                >
                  Continue with Google
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => handleOAuthSignIn('github')}
                  disabled={isPending}
                >
                  Continue with GitHub
                </Button>
              </Stack>
            </>
          )}

          <Typography variant="body2" textAlign="center" sx={{ mt: 3 }}>
            Already have an account?{' '}
            <MuiLink component={Link} href="/auth/sign-in" underline="hover">
              Sign in
            </MuiLink>
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
}
