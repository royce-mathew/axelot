'use client';

import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box,
  Card,
  CardContent,
  CircularProgress,
} from '@mui/material';
import ThemeToggle from '@/components/ThemeToggle';
import { useAuth } from '@/hooks/use-auth';
import { signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const Header = () => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  const handleSignIn = () => {
    signIn();
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <AppBar 
      position="sticky" 
      elevation={0}
      className="bg-background-paper! border-b border-divider text-primary!"
    >
      <Toolbar className="max-w-6xl mx-auto w-full px-4 sm:px-6">
        <Typography 
          variant="h5" 
          component="div" 
          className="grow font-bold text-primary"
        >
          Axelot.io
        </Typography>
        
        <Box className="flex items-center gap-4">
          <ThemeToggle />
          {isLoading ? (
            <CircularProgress size={24} />
          ) : isAuthenticated ? (
            <>
              <Typography variant="body2" className="text-primary!">
                {user?.email}
              </Typography>
              <Button 
                color="inherit"
                className="text-primary!"
                onClick={handleSignOut}
              >
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Button 
                color="inherit"
                className="text-primary!"
                onClick={handleSignIn}
              >
                Sign In
              </Button>
              <Button 
                variant="contained" 
                className="rounded-lg! normal-case!"
                onClick={handleSignIn}
              >
                Get Started
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

const HeroSection = () => {
  return (
    <Box className="bg-linear-to-br from-indigo-400 to-purple-500 py-24">
      <Container maxWidth="lg">
        <Box className="text-center">
          <Typography 
            variant="h2" 
            component="h1" 
            className='font-bold'
          >
            Welcome to Axelot.io
          </Typography>
          <Typography 
            variant="h5" 
          >
            Skeleton Application with MUI, NextJs and TailwindCSS
          </Typography>
          <Button 
            variant="contained" 
            size="large"
            className='mt-8'
          >
            Get Started
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

const FeatureCard = ({ title, description }: { title: string; description: string }) => {
  return (
    <Card 
      elevation={0}
      className="p-6 h-full border border-divider hover:shadow-4 hover:-translate-y-0.5 transition-all duration-300 ease-in-out"
    >
      <CardContent className="p-0!">
        <Typography 
          variant="h6" 
          component="h3" 
          className="text-primary font-bold mb-4"
        >
          {title}
        </Typography>
        <Typography 
          variant="body2" 
          className="text-(--mui-palette-text-secondary) leading-relaxed"
        >
          {description}
        </Typography>
      </CardContent>
    </Card>
  );
};

const FeaturesSection = () => {
  const features = [
    {
      title: "Theme Switching",
      description: "Seamlessly switch between light and dark themes with a single click."
    },
    {
      title: "Material UI",
      description: "Built with Material UI components for a consistent and beautiful design."
    },
    {
      title: "CSS Variables",
      description: "SSR-friendly styling using Material UI CSS variables for seamless theme switching."
    },
    {
      title: "Next.js",
      description: "Modern React framework with great performance and developer experience."
    }
  ];

  return (
    <Container maxWidth="lg" className="py-16">
      <Box className="text-center mb-12">
        <Typography 
          variant="h3" 
          component="h2" 
          className="text-primary font-bold mb-4"
        >
          Features
        </Typography>
        <Typography 
          variant="body1" 
          className="text-secondary max-w-2xl mx-auto"
        >
          Everything you need to build modern, responsive applications
        </Typography>
      </Box>
      
      <Box className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature, index) => (
          <FeatureCard 
            key={index} 
            title={feature.title} 
            description={feature.description} 
          />
        ))}
      </Box>
    </Container>
  );
};

const Footer = () => {
  return (
    <Box 
      component="footer" 
      className="bg-background-paper border-t border-divider py-12 mt-16"
    >
      <Container maxWidth="lg">
        <Box className="text-center">
          <Typography 
            variant="body2" 
            className="text-secondary"
          >
            © 2025 Royce Mathew
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default function Home() {
  return (
    <Box className="min-h-screen bg-background-default">
      <Header />
      <HeroSection />
      <FeaturesSection />
      <Footer />
    </Box>
  );
}
