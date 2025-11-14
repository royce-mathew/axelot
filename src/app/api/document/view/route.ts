import { NextRequest, NextResponse } from "next/server"
import { Timestamp } from "firebase-admin/firestore"
import { increment } from "firebase/firestore"
import { adminAuth, firebaseAdminFirestore } from "@/lib/firebase/server"

// POST /api/document/view
export async function POST(req: NextRequest) {
  try {
    const { documentId } = await req.json()
    if (!documentId) {
      return NextResponse.json({ error: "Missing documentId" }, { status: 400 })
    }

    // console.log('Tracking view for document:', documentId);

    // Get Authorization header and verify Firebase ID token
    const authHeader = req.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Missing or invalid authorization token" },
        { status: 401 }
      )
    }
    const idToken = authHeader.replace("Bearer ", "")
    let decodedToken
    try {
      decodedToken = await adminAuth.verifyIdToken(idToken)
    } catch {
      return NextResponse.json(
        { error: "Invalid Firebase ID token" },
        { status: 401 }
      )
    }

    // Only allow if user is a valid Firebase user
    if (!decodedToken?.uid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const docRef = firebaseAdminFirestore.collection("stories").doc(documentId)
    await docRef.update({
      viewCount: increment(1),
      lastViewed: Timestamp.now(),
    })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Failed to track view" }, { status: 500 })
  }
}
