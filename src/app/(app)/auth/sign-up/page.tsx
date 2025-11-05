'use client';

import React, { useState } from 'react';
import { 
  Box, 
  Container, 
  Paper, 
  Typography, 
  Button,
  TextField,
  Stack,
  CircularProgress,
  Alert,
  InputAdornment,
} from '@mui/material';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import GoogleIcon from '@mui/icons-material/Google';
import GitHubIcon from '@mui/icons-material/GitHub';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { 
  isValidUsername, 
  isUsernameAvailable, 
  generateUniqueUsername,
  isReservedUsername 
} from '@/lib/username-utils';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';

export default function SignUpPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [step, setStep] = useState<'auth' | 'profile'>('auth');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [usernameValid, setUsernameValid] = useState(false);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [loading, setLoading] = useState(false);

  // Validate username function
  const validateUsername = async (value: string) => {
    setUsername(value);
    setCheckingUsername(true);
    setUsernameError('');
    setUsernameValid(false);

    if (!value) {
      setCheckingUsername(false);
      return;
    }

    if (value.length < 3) {
      setUsernameError('Username must be at least 3 characters');
      setCheckingUsername(false);
      return;
    }

    if (value.length > 20) {
      setUsernameError('Username must be 20 characters or less');
      setCheckingUsername(false);
      return;
    }

    if (!isValidUsername(value)) {
      setUsernameError('Username can only contain letters, numbers, underscores, and hyphens');
      setCheckingUsername(false);
      return;
    }

    if (isReservedUsername(value)) {
      setUsernameError('This username is reserved');
      setCheckingUsername(false);
      return;
    }

    // Check availability
    const available = await isUsernameAvailable(value);
    if (!available) {
      setUsernameError('This username is already taken');
      setCheckingUsername(false);
      return;
    }

    setUsernameValid(true);
    setCheckingUsername(false);
  };

  // Check if user needs to complete profile
  React.useEffect(() => {
    const checkUserProfile = async () => {
      if (status === 'authenticated' && session?.user?.email) {
        try {
          const userId = (session.user as Record<string, unknown>).id as string;
          if (!userId) {
            console.error('No user ID found');
            return;
          }

          const userDoc = await getDoc(doc(db, 'users', userId));
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            if (userData.username) {
              // User already has a username, redirect
              router.push('/');
              return;
            }
          }
          
          // User needs to set up profile
          setStep('profile');
          
          // Generate suggested username
          const suggested = await generateUniqueUsername(session.user.name || 'user');
          setUsername(suggested);
          await validateUsername(suggested);
        } catch (error) {
          console.error('Error checking user profile:', error);
        }
      }
    };

    checkUserProfile();
  }, [session, status, router]);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    await signIn('google', { callbackUrl: '/auth/sign-up' });
  };

  const handleGitHubSignIn = async () => {
    setLoading(true);
    await signIn('github', { callbackUrl: '/auth/sign-up' });
  };

  const handleCompleteProfile = async () => {
    if (!usernameValid || !session?.user) {
      return;
    }

    setLoading(true);

    try {
      const userId = (session.user as Record<string, unknown>).id as string;
      
      // Update user document with username and bio
      await setDoc(
        doc(db, 'users', userId),
        {
          username: username.toLowerCase(),
          bio: bio || '',
          updatedAt: new Date(),
        },
        { merge: true }
      );

      // Redirect to homepage
      router.push('/');
    } catch (error) {
      console.error('Error updating profile:', error);
      setUsernameError('Failed to create profile. Please try again.');
      setLoading(false);
    }
  };

  if (step === 'auth') {
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
              borderRadius: 3,
            }}
          >
            <Typography 
              variant="h3" 
              component="h1" 
              gutterBottom 
              fontWeight="bold"
              sx={{ mb: 1 }}
            >
              Join Axelot
            </Typography>
            
            <Typography 
              variant="body1" 
              color="text.secondary"
              textAlign="center"
              sx={{ mb: 4 }}
            >
              Create your developer portfolio and share your stories
            </Typography>

            <Stack spacing={2} sx={{ width: '100%', maxWidth: 400 }}>
              <Button
                variant="contained"
                size="large"
                startIcon={loading ? <CircularProgress size={20} /> : <GoogleIcon />}
                onClick={handleGoogleSignIn}
                disabled={loading}
                sx={{
                  py: 1.5,
                  textTransform: 'none',
                  fontSize: '1rem',
                  backgroundColor: '#fff',
                  color: '#000',
                  border: '1px solid #ddd',
                  '&:hover': {
                    backgroundColor: '#f5f5f5',
                  },
                }}
              >
                Continue with Google
              </Button>

              <Button
                variant="contained"
                size="large"
                startIcon={loading ? <CircularProgress size={20} /> : <GitHubIcon />}
                onClick={handleGitHubSignIn}
                disabled={loading}
                sx={{
                  py: 1.5,
                  textTransform: 'none',
                  fontSize: '1rem',
                  backgroundColor: '#24292e',
                  color: '#fff',
                  '&:hover': {
                    backgroundColor: '#1a1e22',
                  },
                }}
              >
                Continue with GitHub
              </Button>
            </Stack>

            <Typography 
              variant="body2" 
              color="text.secondary"
              textAlign="center"
              sx={{ mt: 3 }}
            >
              Already have an account?{' '}
              <Button 
                size="small" 
                onClick={() => router.push('/auth/sign-in')}
                sx={{ textTransform: 'none' }}
              >
                Sign In
              </Button>
            </Typography>
          </Paper>
        </Container>
      </Box>
    );
  }

  // Profile setup step
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
            borderRadius: 3,
          }}
        >
          <Typography 
            variant="h4" 
            component="h1" 
            gutterBottom 
            fontWeight="bold"
            sx={{ mb: 1 }}
          >
            Complete Your Profile
          </Typography>
          
          <Typography 
            variant="body1" 
            color="text.secondary"
            textAlign="center"
            sx={{ mb: 4 }}
          >
            Choose a unique username for your profile URL
          </Typography>

          <Stack spacing={3} sx={{ width: '100%' }}>
            <TextField
              label="Username"
              value={username}
              onChange={(e) => validateUsername(e.target.value)}
              error={!!usernameError}
              helperText={
                usernameError || 
                (usernameValid ? 'Username is available!' : 'Your unique identifier')
              }
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">@</InputAdornment>
                ),
                endAdornment: checkingUsername ? (
                  <CircularProgress size={20} />
                ) : usernameValid ? (
                  <CheckCircleIcon color="success" />
                ) : usernameError ? (
                  <ErrorIcon color="error" />
                ) : null,
              }}
              fullWidth
            />

            {username && (
              <Alert severity="info" sx={{ alignItems: 'center' }}>
                Your profile will be at: <strong>axelot.io/u/@{username}</strong>
              </Alert>
            )}

            <TextField
              label="Bio (Optional)"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              multiline
              rows={3}
              placeholder="Tell us about yourself..."
              helperText={`${bio.length}/160 characters`}
              inputProps={{ maxLength: 160 }}
              fullWidth
            />

            <Button
              variant="contained"
              size="large"
              onClick={handleCompleteProfile}
              disabled={!usernameValid || loading}
              sx={{
                py: 1.5,
                textTransform: 'none',
                fontSize: '1rem',
              }}
            >
              {loading ? <CircularProgress size={24} /> : 'Complete Profile'}
            </Button>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}
