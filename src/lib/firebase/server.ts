import { initFirestore } from "@auth/firebase-adapter"
import { cert, getApps, initializeApp } from "firebase-admin/app"
import { getAuth } from "firebase-admin/auth"

const firebaseAdminSettings = {
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY,
  }),
}

export const firebaseAdmin =
  getApps().length === 0 ? initializeApp(firebaseAdminSettings) : getApps()[0]
export const firebaseAdminFirestore = initFirestore(firebaseAdminSettings)
const adminAuth = getAuth(firebaseAdmin)
export { adminAuth }
