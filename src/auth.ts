import { FirestoreAdapter } from "@auth/firebase-adapter"
import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import { ZodError } from "zod"
// Import the Firebase Admin SDK
import { firebaseAdminFirestore } from "@/lib/firebase/server"
import { signInSchema } from "@/lib/validations/auth"
import { verifyPassword } from "@/lib/password"

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
  Credentials({
    credentials: {
      email: { label: "Email", type: "email", placeholder: "john@example.com" },
      password: { label: "Password", type: "password" },
    },
    authorize: async (credentials) => {
      try {
        // Validate credentials with Zod
        const { email, password } = await signInSchema.parseAsync(credentials);

        // Get user from Firestore
        const usersRef = firebaseAdminFirestore.collection('users');
        const snapshot = await usersRef.where('email', '==', email.toLowerCase()).limit(1).get();

        if (snapshot.empty) {
          throw new Error("Invalid credentials.");
        }

        const userDoc = snapshot.docs[0];
        const userData = userDoc.data();

        // Check if email is verified for credentials users
        if (userData.emailVerified === false) {
          // User hasn't verified their email yet
          return null;
        }

        // Get password hash from separate credentials collection
        const credentialsRef = firebaseAdminFirestore.collection('credentials').doc(userDoc.id);
        const credentialsDoc = await credentialsRef.get();

        if (!credentialsDoc.exists) {
          // User doesn't have credentials (OAuth-only user)
          // Return null instead of throwing to avoid exposing that the email exists
          return null;
        }

        const credentialsData = credentialsDoc.data();
        
        // Verify password
        const isValidPassword = await verifyPassword(password, credentialsData!.passwordHash);

        if (!isValidPassword) {
          return null;
        }

        // Return user object
        return {
          id: userDoc.id,
          email: userData.email,
          name: userData.name,
          image: userData.image,
          emailVerified: userData.emailVerified,
          username: userData.username,
        };
      } catch (error) {
        if (error instanceof ZodError) {
          // Return null to indicate invalid credentials
          return null;
        }
        console.error("Authorization error:", error);
        return null;
      }
    },
  }),
]

export const providerMap = providers
  .filter((provider) => provider.type === 'oauth' || provider.type === 'oidc')
  .map((provider) => {
    return { id: provider.id, name: provider.name }
  })

// Export the NextAuth configuration
export const { auth, handlers, signIn, signOut } = NextAuth({
  providers: providers,
  adapter: FirestoreAdapter(firebaseAdminFirestore),
  session: {
    strategy: "jwt", // Use JWT for sessions to support Credentials provider
  },
  pages: {
    signIn: "/auth/sign-in",
  },
  callbacks: {
    async jwt({ token, user }) {
      // Add user data to JWT token on sign-in
      if (user) {
        token.id = user.id;
        token.username = user.username;
      }
      return token;
    },
    async session({ session, token }) {
      // Add token data to session
      if (session.user) {
        session.user.id = token.id as string;
        if (token.username) {
          session.user.username = token.username as string;
        }
      }
      return session;
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
