'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  InputBase,
  Paper,
  List,
  ListItem,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  Divider,
  alpha,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import DescriptionIcon from '@mui/icons-material/Description';
import PersonIcon from '@mui/icons-material/Person';
import { useRouter } from 'next/navigation';

// Mock data - replace with actual API calls
const searchResults = (query: string) => {
  if (!query.trim()) return { documents: [], users: [] };
  
  return {
    documents: [
      { id: '1', title: 'Project Proposal', subtitle: 'Last edited 2 hours ago' },
      { id: '2', title: 'Meeting Notes', subtitle: 'Last edited yesterday' },
    ],
    users: [
      { id: '1', name: 'John Doe', email: 'john@example.com', avatar: null },
      { id: '2', name: 'Jane Smith', email: 'jane@example.com', avatar: null },
    ],
  };
};

export const SearchBar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const results = searchResults(searchQuery);
  const hasResults = results.documents.length > 0 || results.users.length > 0;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      setShowResults(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setShowResults(e.target.value.trim().length > 0);
  };

  const handleResultClick = (type: 'document' | 'user', id: string) => {
    setShowResults(false);
    setSearchQuery('');
    // Navigate to the specific item
    if (type === 'document') {
      router.push(`/documents/${id}`);
    } else {
      router.push(`/users/${id}`);
    }
  };

  return (
    <Box sx={{ flex: 1, maxWidth: 512, mx: 2, position: 'relative' }} ref={searchRef}>
      <Paper
        component="form"
        onSubmit={handleSearch}
        sx={{
          display: 'flex',
          alignItems: 'center',
          height: '40px',
          borderRadius: '20px',
          backgroundColor: (theme) => alpha(theme.palette.background.paper, 0.15),
          backdropFilter: 'blur(8px)',
          border: '1px solid',
          borderColor: (theme) => alpha(theme.palette.divider, 0.1),
          '&:hover': {
            backgroundColor: (theme) => alpha(theme.palette.background.paper, 0.25),
          },
          '&:focus-within': {
            backgroundColor: (theme) => alpha(theme.palette.background.paper, 0.3),
            borderColor: (theme) => alpha(theme.palette.primary.main, 0.5),
          },
        }}
        elevation={0}
      >
        <SearchIcon sx={{ ml: 2, color: 'inherit', opacity: 0.7 }} fontSize="small" />
        <InputBase
          sx={{
            ml: 1,
            flex: 1,
            fontSize: '0.875rem',
            color: 'inherit',
          }}
          placeholder="Search.."
          value={searchQuery}
          onChange={handleInputChange}
          inputProps={{ 'aria-label': 'search' }}
        />
      </Paper>

      {/* Search Results Popup */}
      {showResults && hasResults && (
        <Paper
          sx={{
            position: 'absolute',
            top: '48px',
            left: 0,
            right: 0,
            maxHeight: '400px',
            overflowY: 'auto',
            zIndex: 1000,
          }}
          elevation={8}
        >
          {results.documents.length > 0 && (
            <>
              <Box sx={{ px: 2, py: 1, backgroundColor: 'action.hover' }}>
                <Typography variant="caption" fontWeight="bold" color="text.secondary">
                  DOCUMENTS
                </Typography>
              </Box>
              <List disablePadding>
                {results.documents.map((doc) => (
                  <ListItem key={doc.id} disablePadding>
                    <ListItemButton onClick={() => handleResultClick('document', doc.id)}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          <DescriptionIcon fontSize="small" />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={doc.title}
                        secondary={doc.subtitle}
                        primaryTypographyProps={{ variant: 'body2' }}
                        secondaryTypographyProps={{ variant: 'caption' }}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </>
          )}

          {results.users.length > 0 && (
            <>
              {results.documents.length > 0 && <Divider />}
              <Box sx={{ px: 2, py: 1, backgroundColor: 'action.hover' }}>
                <Typography variant="caption" fontWeight="bold" color="text.secondary">
                  USERS
                </Typography>
              </Box>
              <List disablePadding>
                {results.users.map((user) => (
                  <ListItem key={user.id} disablePadding>
                    <ListItemButton onClick={() => handleResultClick('user', user.id)}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'secondary.main' }}>
                          <PersonIcon fontSize="small" />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={user.name}
                        secondary={user.email}
                        primaryTypographyProps={{ variant: 'body2' }}
                        secondaryTypographyProps={{ variant: 'caption' }}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </>
          )}
        </Paper>
      )}
    </Box>
  );
};
