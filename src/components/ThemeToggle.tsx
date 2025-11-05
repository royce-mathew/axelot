'use client';

import React from 'react';
import {
    ToggleButton,
    ToggleButtonGroup,
    Box,
} from '@mui/material';
import {
    LightMode,
    DarkMode,
    SettingsBrightness,
} from '@mui/icons-material';
import { useColorScheme } from '@mui/material/styles';
import { useMounted } from '@/hooks/use-mounted';

export type ThemeMode = 'light' | 'dark' | 'system';


const ThemeToggle: React.FC = () => {
    const { mode, setMode } = useColorScheme();
    const isMounted = useMounted();

    // Prevent SSR flickering by not rendering until mounted
    if (!isMounted) {
        return (
            <Box sx={{ border: 1, borderColor: 'divider', borderRadius: '50px' }}>
                <ToggleButtonGroup
                    size="small"
                    sx={{
                        '& .MuiToggleButton-root': {
                            border: 'none',
                            borderRadius: '50px',
                            aspectRatio: '1/1',
                            padding: '4px',
                            minWidth: '28px',
                            '& .MuiSvgIcon-root': {
                                fontSize: '1rem',
                            },
                        },
                    }}
                >
                    <ToggleButton value="system" disabled aria-label="Loading theme toggle">
                        <SettingsBrightness />
                    </ToggleButton>
                </ToggleButtonGroup>
            </Box>
        );
    }

    function handleThemeChange(
        event: React.MouseEvent<HTMLElement>,
        newMode: string | null
    ) {
        if (newMode && (newMode === 'light' || newMode === 'dark' || newMode === 'system')) {
            setMode(newMode as 'light' | 'dark' | 'system');
        }
    }

    return (
        <Box sx={{ border: 1, borderColor: 'divider', borderRadius: '50px' }}>
            <ToggleButtonGroup
                value={mode}
                exclusive
                onChange={handleThemeChange}
                aria-label="Toggle theme mode"
                size="small"
                sx={{
                    '& .MuiToggleButton-root': {
                        border: 'none',
                        borderRadius: '50px',
                        aspectRatio: '1/1',
                        padding: '4px',
                        minWidth: '28px',
                        '& .MuiSvgIcon-root': {
                            fontSize: '1rem',
                        },
                    },
                }}
            >
                <ToggleButton value="light" aria-label="Switch to light mode">
                    <LightMode />
                </ToggleButton>
                <ToggleButton value="system" aria-label="Switch to system preferred mode">
                    <SettingsBrightness />
                </ToggleButton>
                <ToggleButton value="dark" aria-label="Switch to dark mode">
                    <DarkMode />
                </ToggleButton>
            </ToggleButtonGroup>
        </Box>
    );
};

export default ThemeToggle;
