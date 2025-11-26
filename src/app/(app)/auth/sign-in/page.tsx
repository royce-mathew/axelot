"use client"

import React, { Suspense, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import GitHubIcon from "@mui/icons-material/GitHub"
import GoogleIcon from "@mui/icons-material/Google"
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Divider,
  Link as MuiLink,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material"
import { signIn } from "next-auth/react"
import { useAuth } from "@/hooks/use-auth"
import { logEvent } from "@/lib/firebase/client"

function SignInContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const callbackUrl = searchParams.get("callbackUrl") || "/"
  const registered = searchParams.get("registered")
  const verified = searchParams.get("verified")
  const error = searchParams.get("error")

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [loginError, setLoginError] = useState("")

  // If already authenticated, avoid showing sign-in and redirect to stories
  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/stories")
    }
  }, [isAuthenticated, router])

  const handleCredentialsSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setLoginError("")

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setLoginError(
          "Invalid email or password. If you just signed up, please verify your email first."
        )
      } else {
        logEvent("login", { method: "credentials" })
        router.push(callbackUrl)
      }
    } catch {
      setLoginError("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    await signIn("google", { callbackUrl })
  }

  const handleGitHubSignIn = async () => {
    await signIn("github", { callbackUrl })
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            fontWeight={700}
            textAlign="center"
          >
            Welcome Back
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            textAlign="center"
            sx={{ mb: 3 }}
          >
            Sign in to continue to your account
          </Typography>

          {registered && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Account created successfully! Please sign in.
            </Alert>
          )}

          {verified && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Email verified! You can now sign in with your credentials.
            </Alert>
          )}

          {error === "CredentialsSignin" && (
            <Alert severity="error" sx={{ mb: 2 }}>
              Invalid email or password
            </Alert>
          )}

          {loginError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {loginError}
            </Alert>
          )}

          <Box component="form" onSubmit={handleCredentialsSignIn}>
            <Stack spacing={2.5}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                autoComplete="email"
                variant="outlined"
                InputLabelProps={{ shrink: true }}
                placeholder="Enter your email"
              />
              <TextField
                fullWidth
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                autoComplete="current-password"
                variant="outlined"
                InputLabelProps={{ shrink: true }}
                placeholder="Enter your password"
              />
              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={isLoading}
                sx={{ mt: 1 }}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </Stack>
          </Box>

          <Divider sx={{ my: 3 }}>OR</Divider>

          <Stack spacing={2}>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<GoogleIcon />}
              onClick={handleGoogleSignIn}
              disabled={isLoading}
            >
              Continue with Google
            </Button>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<GitHubIcon />}
              onClick={handleGitHubSignIn}
              disabled={isLoading}
            >
              Continue with GitHub
            </Button>
          </Stack>

          <Typography variant="body2" textAlign="center" sx={{ mt: 3 }}>
            Don&apos;t have an account?{" "}
            <MuiLink component={Link} href="/auth/sign-up" underline="hover">
              Sign up
            </MuiLink>
          </Typography>
        </Paper>
      </Container>
    </Box>
  )
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <Box
          sx={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "background.default",
          }}
        >
          <CircularProgress />
        </Box>
      }
    >
      <SignInContent />
    </Suspense>
  )
}
