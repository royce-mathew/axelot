import { Box, CircularProgress, Container, Typography } from "@mui/material"

export default function Loading() {
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 4 }}>
          <CircularProgress size={24} />
          <Typography>Loading story...</Typography>
        </Box>
      </Container>
    </Box>
  )
}
