'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Stack,
  Avatar,
  CircularProgress,
  Alert,
  InputAdornment,
  Divider,
} from '@mui/material';
import { Header } from '@/components/header';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import SaveIcon from '@mui/icons-material/Save';
import {
  isValidUsername,
  isUsernameAvailable,
  isReservedUsername,
} from '@/lib/username-utils';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';

export default function SettingsPage() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [originalUsername, setOriginalUsername] = useState('');
  const [bio, setBio] = useState('');
  const [originalBio, setOriginalBio] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [usernameValid, setUsernameValid] = useState(false);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Load user data
  useEffect(() => {
    const loadUserData = async () => {
      if (!isAuthenticated || !user?.id) {
        if (!authLoading) {
          router.push('/auth/sign-in');
        }
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, 'users', user.id));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUsername(userData.username || '');
          setOriginalUsername(userData.username || '');
          setBio(userData.bio || '');
          setOriginalBio(userData.bio || '');
          setUsernameValid(!!userData.username);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error loading user data:', error);
        setLoading(false);
      }
    };

    loadUserData();
  }, [isAuthenticated, user, authLoading, router]);

  const validateUsername = async (value: string) => {
    setUsername(value);
    setCheckingUsername(true);
    setUsernameError('');
    setUsernameValid(false);
    setSuccessMessage('');

    if (!value) {
      setUsernameError('Username is required');
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

    // If it's the same as the original, it's valid
    if (value.toLowerCase() === originalUsername.toLowerCase()) {
      setUsernameValid(true);
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

  const handleSave = async () => {
    if (!usernameValid || !user?.id) {
      return;
    }

    setSaving(true);
    setSuccessMessage('');

    try {
      const newUsername = username.toLowerCase();
      
      // Update user profile
      await setDoc(
        doc(db, 'users', user.id),
        {
          username: newUsername,
          bio: bio || '',
          updatedAt: new Date(),
        },
        { merge: true }
      );

      setOriginalUsername(username);
      setSuccessMessage('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      setUsernameError('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <Box sx={{ minHeight: '100vh' }}>
        <Header />
        <Container maxWidth="md" sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Container>
      </Box>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const hasChanges = 
    username.toLowerCase() !== originalUsername.toLowerCase() || 
    bio !== originalBio;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Header />
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Profile Settings
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Manage your public profile information
        </Typography>

        <Paper sx={{ p: 4, borderRadius: 2 }}>
          <Stack spacing={4}>
            {/* Profile Picture */}
            <Box>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                Profile Picture
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar
                  src={user?.image || undefined}
                  alt={user?.name || 'User'}
                  sx={{ width: 80, height: 80 }}
                />
                <Typography variant="body2" color="text.secondary">
                  Your profile picture is managed through your connected account
                </Typography>
              </Box>
            </Box>

            <Divider />

            {/* Display Name */}
            <Box>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                Display Name
              </Typography>
              <TextField
                value={user?.name || ''}
                disabled
                fullWidth
                helperText="Your display name is managed through your connected account"
              />
            </Box>

            {/* Username */}
            <Box>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                Username
              </Typography>
              <TextField
                value={username}
                onChange={(e) => validateUsername(e.target.value)}
                error={!!usernameError}
                helperText={
                  usernameError ||
                  (usernameValid && username.toLowerCase() !== originalUsername.toLowerCase()
                    ? 'Username is available!'
                    : 'Your unique identifier for your profile URL')
                }
                InputProps={{
                  startAdornment: <InputAdornment position="start">@</InputAdornment>,
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
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Your profile: <strong>axelot.io/u/@{username}</strong>
                </Typography>
              )}
            </Box>

            {/* Bio */}
            <Box>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                Bio
              </Typography>
              <TextField
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                multiline
                rows={4}
                placeholder="Tell others about yourself..."
                helperText={`${bio.length}/160 characters`}
                inputProps={{ maxLength: 160 }}
                fullWidth
              />
            </Box>

            {successMessage && (
              <Alert severity="success" onClose={() => setSuccessMessage('')}>
                {successMessage}
              </Alert>
            )}

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                onClick={() => {
                  setUsername(originalUsername);
                  setBio(originalBio);
                  setUsernameError('');
                  setSuccessMessage('');
                }}
                disabled={!hasChanges || saving}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
                onClick={handleSave}
                disabled={!usernameValid || !hasChanges || saving}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </Box>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}
