"use server"

import { ZodError } from "zod"
import { firebaseAdminFirestore } from "@/lib/firebase/server"
import { hashPassword } from "@/lib/password"
import { signUpSchema } from "@/lib/validations/auth"

export async function signUpAction(formData: FormData) {
  try {
    // Extract form data
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    // Validate with Zod
    const validatedData = await signUpSchema.parseAsync({
      name,
      email,
      password,
    })

    // Check if user already exists
    const usersRef = firebaseAdminFirestore.collection("users")
    const existingUser = await usersRef
      .where("email", "==", validatedData.email.toLowerCase())
      .limit(1)
      .get()

    if (!existingUser.empty) {
      return {
        success: false,
        error: "An account with this email already exists.",
      }
    }

    // Hash password
    const hashedPassword = await hashPassword(validatedData.password)

    // Create user in Firestore (without password, emailVerified set to false)
    const userRef = usersRef.doc()
    await userRef.set({
      email: validatedData.email.toLowerCase(),
      name: validatedData.name,
      emailVerified: false, // Mark as unverified initially
      image: null,
      username: null,
      bio: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    // Store password hash in separate credentials collection
    // This collection is server-only and never exposed to clients
    const credentialsRef = firebaseAdminFirestore
      .collection("credentials")
      .doc(userRef.id)
    await credentialsRef.set({
      userId: userRef.id,
      passwordHash: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    // Return email for client-side verification link sending
    return {
      success: true,
      email: validatedData.email.toLowerCase(),
      message: "Account created! Check your email for verification link.",
    }
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || "Validation failed",
      }
    }

    console.error("Sign up error:", error)
    return {
      success: false,
      error: "An error occurred during sign up. Please try again.",
    }
  }
}
