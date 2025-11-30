import { Box } from "@mui/material"
import { Container } from "@mui/material"
import { Paper } from "@mui/material"
import { Skeleton } from "@mui/material"
import { Stack } from "@mui/material"
import { Divider } from "@mui/material"

export default function Loading() {
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Skeleton
            variant="text"
            height={60}
            width="60%"
            sx={{ mx: "auto", mb: 1 }}
          />
          <Skeleton
            variant="text"
            height={20}
            width="80%"
            sx={{ mx: "auto", mb: 4 }}
          />

          <Stack spacing={3}>
            <Skeleton variant="rectangular" height={56} />
            <Skeleton variant="rectangular" height={56} />
            <Skeleton variant="rectangular" height={56} />
            <Skeleton variant="rectangular" height={48} sx={{ mt: 1 }} />
          </Stack>

          <Divider sx={{ my: 3 }}>
            <Skeleton variant="text" width={30} />
          </Divider>

          <Stack spacing={2}>
            <Skeleton variant="rectangular" height={40} />
            <Skeleton variant="rectangular" height={40} />
          </Stack>
        </Paper>
      </Container>
    </Box>
  )
}
