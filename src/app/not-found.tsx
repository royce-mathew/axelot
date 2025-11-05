"use client"

import Image from "next/image"
import { Box, Typography } from "@mui/material"

export default function NotFound() {
  return (
    <Box sx={{ 
      display: 'flex', 
      width: '100%', 
      height: '100vh',
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      gap: 2.5, 
      p: 2.5 
    }}>
      <Image
        title="Error 404"
        width={350}
        height={350}
        alt="Surprised Pikachu"
        style={{ borderRadius: '8px' }}
        src="/images/404.webp"
      />
      <Box sx={{ textAlign: 'center' }}>
        <Typography 
          variant="h1" 
          sx={{ 
            fontSize: { xs: '3rem', lg: '3.75rem' }, 
            fontWeight: 700,
            letterSpacing: '-0.02em'
          }}
        >
          404
        </Typography>
        <Typography variant="h3" sx={{ letterSpacing: '-0.01em' }}>
          Not Found
        </Typography>
      </Box>
    </Box>
  )
}
