import { cert, getApps, initializeApp } from "firebase-admin/app"
import { getAuth } from "firebase-admin/auth"
import { getFirestore } from "firebase-admin/firestore"

const firebaseAdminSettings = {
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY,
  }),
}

export const firebaseAdmin = getApps()[0] ?? initializeApp(firebaseAdminSettings)
export const firebaseAdminFirestore = getFirestore(firebaseAdmin)
export const adminAuth = getAuth(firebaseAdmin)
