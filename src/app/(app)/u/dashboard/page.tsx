"use client"

import React from "react"
import {
  EmailOutlined,
  PersonOutline,
  VerifiedUserOutlined,
} from "@mui/icons-material"
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Container,
  Paper,
  Stack,
  Typography,
} from "@mui/material"
// import { ProtectedRoute } from '@/components/ProtectedRoute';
// import { useAuth } from '@/hooks/use-auth';
import { useSession } from "next-auth/react"

export default function DashboardPage() {
  return <DashboardContent />
}

function DashboardContent() {
  const { data: session } = useSession()

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", py: 4 }}>
      <Container maxWidth="lg">
        <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
          Dashboard
        </Typography>

        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Welcome back! Here&apos;s your account information.
        </Typography>

        <Stack spacing={3}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
            <Card sx={{ flex: 1 }}>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Avatar
                    sx={{ bgcolor: "primary.main", width: 56, height: 56 }}
                  >
                    <PersonOutline />
                  </Avatar>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Display Name
                    </Typography>
                    <Typography variant="h6">
                      {session?.user?.name || "Not set"}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            <Card sx={{ flex: 1 }}>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Avatar
                    sx={{ bgcolor: "secondary.main", width: 56, height: 56 }}
                  >
                    <EmailOutlined />
                  </Avatar>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Email Address
                    </Typography>
                    <Typography variant="h6" sx={{ wordBreak: "break-all" }}>
                      {session?.user?.email}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            <Card sx={{ flex: 1 }}>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Avatar
                    sx={{
                      bgcolor: session?.user?.email
                        ? "success.main"
                        : "warning.main",
                      width: 56,
                      height: 56,
                    }}
                  >
                    <VerifiedUserOutlined />
                  </Avatar>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Email Status
                    </Typography>
                    <Typography variant="h6">
                      {session?.user?.email ? "Verified" : "Not Verified"}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Stack>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              User Details
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              component="pre"
              sx={{ mt: 2 }}
            >
              {JSON.stringify(
                {
                  uid: session?.user?.id,
                  email: session?.user?.email,
                  displayName: session?.user?.name,
                  photoURL: session?.user?.image,
                },
                null,
                2
              )}
            </Typography>
          </Paper>
        </Stack>
      </Container>
    </Box>
  )
}
