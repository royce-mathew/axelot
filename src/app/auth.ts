import { FirestoreAdapter } from "@auth/firebase-adapter"
import NextAuth from "next-auth"
import { OAuthConfig } from "next-auth/providers"
import GitHub, { GitHubProfile } from "next-auth/providers/github"
import Google, { GoogleProfile } from "next-auth/providers/google"
// Import the Firebase Admin SDK
import { adminAuth, firebaseAdminFirestore } from "@/lib/firebase/server"

const providers = [
  Google({
    clientId: process.env.AUTH_GOOGLE_ID!,
    clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    allowDangerousEmailAccountLinking: true,
  }),
  GitHub({
    clientId: process.env.AUTH_GITHUB_ID!,
    clientSecret: process.env.AUTH_GITHUB_SECRET!,
    allowDangerousEmailAccountLinking: true,
  }),
]

export const providerMap = providers.map(
  (provider: OAuthConfig<GoogleProfile> | OAuthConfig<GitHubProfile>) => {
    return { id: provider.id, name: provider.name }
  }
)

// Export the NextAuth configuration
export const { auth, handlers, signIn, signOut } = NextAuth({
  providers: providers,
  adapter: FirestoreAdapter(firebaseAdminFirestore),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/sign-in",
  },
  callbacks: {
    jwt: async ({ user, token }) => {
      if (user) {
        token.sub = user.id as string
      }
      return token 
    },
    session: async ({ session, token }) => {
      if (session?.user) {
        if (token.sub) {
          session.user.id = token.sub

          const firebaseToken = await adminAuth.createCustomToken(token.sub)
          session.sessionToken = firebaseToken
        }
      }
      return session
    },
  },
  debug: false,
  theme: {
    brandColor: "#0062ff",
    logo: "/favicon.ico",
    buttonText: "#0062ff",
    colorScheme: "light",
  },
})
