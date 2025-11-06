'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Button,
} from '@mui/material';
import { getAuth, isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth';
import { firebaseApp } from '@/lib/firebase/client';
import { signIn } from 'next-auth/react';
import { Header } from '@/components/header';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      const auth = getAuth(firebaseApp);
      const url = window.location.href;

      // Check if this is a valid sign-in link
      if (!isSignInWithEmailLink(auth, url)) {
        setStatus('error');
        setErrorMessage('Invalid verification link.');
        return;
      }

      try {
        // Get email from localStorage or URL parameter
        let email = window.localStorage.getItem('emailForSignIn');
        
        if (!email) {
          // Try to get from URL parameter
          email = searchParams.get('email');
        }

        if (!email) {
          // Ask user to provide email if not found
          email = window.prompt('Please provide your email for confirmation');
        }

        if (!email) {
          setStatus('error');
          setErrorMessage('Email is required for verification.');
          return;
        }

        // Complete the sign-in with email link
        await signInWithEmailLink(auth, email, url);
        
        // Clear email from storage
        window.localStorage.removeItem('emailForSignIn');

        // Update user's emailVerified status in Firestore via server action
        await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),
        });

        setStatus('success');

        // Sign in with NextAuth after a short delay
        setTimeout(async () => {
          await signIn('credentials', {
            email,
            password: 'temp', // This will fail but we just need to redirect to sign-in
            redirect: false,
          });
          router.push('/auth/sign-in?verified=true');
        }, 2000);
      } catch (error) {
        console.error('Error verifying email:', error);
        setStatus('error');
        setErrorMessage('Failed to verify email. Please try again or contact support.');
      }
    };

    verifyEmail();
  }, [searchParams, router]);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Header />
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          {status === 'verifying' && (
            <>
              <CircularProgress size={60} sx={{ mb: 3 }} />
              <Typography variant="h5" gutterBottom>
                Verifying your email...
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Please wait while we confirm your email address.
              </Typography>
            </>
          )}

          {status === 'success' && (
            <>
              <Typography variant="h4" gutterBottom color="success.main">
                ✓ Email Verified!
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Your email has been successfully verified. You can now sign in to your account.
              </Typography>
              <Alert severity="success" sx={{ mb: 2 }}>
                Redirecting to sign in...
              </Alert>
              <Button
                variant="contained"
                onClick={() => router.push('/auth/sign-in?verified=true')}
              >
                Go to Sign In
              </Button>
            </>
          )}

          {status === 'error' && (
            <>
              <Typography variant="h5" gutterBottom color="error">
                Verification Failed
              </Typography>
              <Alert severity="error" sx={{ mb: 3 }}>
                {errorMessage}
              </Alert>
              <Button
                variant="outlined"
                onClick={() => router.push('/auth/sign-up')}
              >
                Back to Sign Up
              </Button>
            </>
          )}
        </Paper>
      </Container>
    </Box>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
          <Header />
          <Container maxWidth="sm" sx={{ py: 8 }}>
            <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
              <CircularProgress size={60} sx={{ mb: 3 }} />
              <Typography variant="h5" gutterBottom>
                Loading...
              </Typography>
            </Paper>
          </Container>
        </Box>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
