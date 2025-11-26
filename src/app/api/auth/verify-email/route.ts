import { NextRequest, NextResponse } from "next/server"
import { firebaseAdminFirestore } from "@/lib/firebase/server"
import { Timestamp } from "firebase-admin/firestore"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // Find user by email
    const usersRef = firebaseAdminFirestore.collection("users")
    const snapshot = await usersRef
      .where("email", "==", email.toLowerCase())
      .limit(1)
      .get()

    if (snapshot.empty) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Update emailVerified to true
    const userDoc = snapshot.docs[0]
    await userDoc.ref.update({
      emailVerified: true,
      lastUpdated: Timestamp.now(),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error verifying email:", error)
    return NextResponse.json(
      { error: "Failed to verify email" },
      { status: 500 }
    )
  }
}
