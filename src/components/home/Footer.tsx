"use client"

import GitHubIcon from "@mui/icons-material/GitHub"
import { Box, Container, Link, Stack, Typography } from "@mui/material"

export const Footer = () => {
  return (
    <Box
      component="footer"
      sx={[
        {
          py: 4,
          borderTop: "2px solid",
          borderColor: "divider",
          bgcolor: "rgba(0, 0, 0, 0.02)",
        },
        (theme) =>
          theme.applyStyles("dark", {
            bgcolor: "rgba(0, 0, 0, 0.2)",
          }),
      ]}
    >
      <Container maxWidth="lg" sx={{ position: "relative" }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          alignItems="center"
          justifyContent="center"
          spacing={{ xs: 2, sm: 0 }}
          sx={{ position: "relative" }}
        >
          <Box
            sx={{
              position: { xs: "static", sm: "absolute" },
              right: { sm: 8 },
              top: { sm: 8 },
            }}
          >
            <Link
              href="https://github.com/royce-mathew/axelot"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub repository"
              color="inherit"
              sx={{
                display: "inline-flex",
                alignItems: "center",
                opacity: 0.8,
                "&:hover": { opacity: 1 },
              }}
            >
              <GitHubIcon fontSize="small" />
            </Link>
          </Box>
          <Typography
            variant="body1"
            align="center"
            sx={{
              color: "text.secondary",
              fontSize: "0.95rem",
              fontWeight: 500,
              letterSpacing: "-0.01em",
            }}
          >
            Built with{" "}
            <Box
              component="span"
              sx={{
                color: "#ec4899",
                display: "inline-block",
                animation: "heartbeat 1.5s ease-in-out infinite",
                "@keyframes heartbeat": {
                  "0%, 100%": { transform: "scale(1)" },
                  "10%, 30%": { transform: "scale(1.1)" },
                  "20%, 40%": { transform: "scale(1)" },
                },
              }}
            >
              ❤️
            </Box>{" "}
            for developers.
          </Typography>
        </Stack>
      </Container>
    </Box>
  )
}
