import { NextRequest, NextResponse } from "next/server"
import { FieldValue, Timestamp } from "firebase-admin/firestore"
import { adminAuth, firebaseAdminFirestore } from "@/lib/firebase/server"

// POST /api/document/view
export async function POST(req: NextRequest) {
  try {
    const { documentId } = await req.json()
    if (!documentId) {
      return NextResponse.json({ error: "Missing documentId" }, { status: 400 })
    }

    console.log("Tracking view for document:", documentId)

    // Get Authorization header and verify Firebase ID token
    const authHeader = req.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.error("Missing or invalid authorization header")
      return NextResponse.json(
        { error: "Missing or invalid authorization token" },
        { status: 401 }
      )
    }
    const idToken = authHeader.replace("Bearer ", "")
    let decodedToken
    try {
      decodedToken = await adminAuth.verifyIdToken(idToken)
      console.log("Token verified for user:", decodedToken.uid)
    } catch (error) {
      console.error("Token verification failed:", error)
      return NextResponse.json(
        { error: "Invalid Firebase ID token" },
        { status: 401 }
      )
    }

    // Only allow if user is a valid Firebase user
    if (!decodedToken?.uid) {
      console.error("No UID in decoded token")
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    console.log("Updating view count for document:", documentId)
    const docRef = firebaseAdminFirestore.collection("stories").doc(documentId)
    await docRef.update({
      viewCount: FieldValue.increment(1),
      lastViewed: Timestamp.now(),
    })
    console.log("View count updated successfully")
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in /api/document/view:", error)
    return NextResponse.json({ error: "Failed to track view" }, { status: 500 })
  }
}
