'use client';
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    colorSchemes: {
        dark: true,
        light: true,
    },
    cssVariables: {
        colorSchemeSelector: 'class',
    },
    typography: {
        fontFamily: 'var(--font-dm-sans), system-ui, -apple-system, sans-serif',
        h1: {
            fontFamily: 'var(--font-outfit), system-ui, sans-serif',
            fontWeight: 700,
        },
        h2: {
            fontFamily: 'var(--font-outfit), system-ui, sans-serif',
            fontWeight: 700,
        },
        h3: {
            fontFamily: 'var(--font-outfit), system-ui, sans-serif',
            fontWeight: 600,
        },
        h4: {
            fontFamily: 'var(--font-outfit), system-ui, sans-serif',
            fontWeight: 600,
        },
        h5: {
            fontFamily: 'var(--font-dm-sans), system-ui, sans-serif',
            fontWeight: 500,
        },
        h6: {
            fontFamily: 'var(--font-outfit), system-ui, sans-serif',
            fontWeight: 600,
        },
        body1: {
            fontFamily: 'var(--font-dm-sans), system-ui, sans-serif',
            lineHeight: 1.7,
        },
        body2: {
            fontFamily: 'var(--font-dm-sans), system-ui, sans-serif',
            lineHeight: 1.6,
        },
    },
   
});

export default theme;
