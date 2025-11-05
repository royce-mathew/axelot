'use client';

import { AppBar, Toolbar, Box, useTheme, IconButton } from '@mui/material';
import Image from 'next/image';
import Link from 'next/link';
import { DesktopNav } from './DesktopNav';
import { MobileNav } from './MobileNav';
import { SearchBar } from './SearchBar';

export const Header = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  
  return (
    <AppBar 
      position="sticky" 
      elevation={0}
      sx={{
        boxShadow: 3,
        bgcolor: 'rgba(var(--mui-palette-background-paperChannel) / 0.9)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <Toolbar sx={{ 
        maxWidth: 1200, 
        mx: 'auto', 
        width: '100%', 
        px: { xs: 2, sm: 3 }, 
        justifyContent: 'space-between',
        minHeight: { xs: 56, sm: 64 }
      }}>
       <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%', maxWidth: 448 }}>
            <IconButton
              component={Link}
              href="/"
              sx={{
                width: 50,
                height: 50,
                p: 0.5,
                borderRadius: 1,
                '&:hover': {
                  bgcolor: 'action.hover',
                },
              }}
            >
              <Image
                src="/axolotl.svg"
                alt="Axelot Logo"
                width={50}
                height={50}
                priority
                style={{
                  filter: isDark ? 'brightness(0.9)' : 'brightness(0.25)',
                  maxWidth: '100%',
                  height: 'auto',
                }}
              />
            </IconButton>
          <SearchBar />
        </Box>
        
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <DesktopNav />
          <MobileNav />
        </Box>
      </Toolbar>
    </AppBar>
  );
};
