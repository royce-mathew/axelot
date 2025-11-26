import { getApps, initializeApp } from "firebase/app"
import {
  getAnalytics,
  isSupported,
  logEvent as firebaseLogEvent,
  type Analytics,
} from "firebase/analytics"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_ANALYTICS_ID,
}

const firebaseApp = getApps()[0] ?? initializeApp(firebaseConfig)

let analytics: Analytics | undefined
isSupported().then((supported) => {
  if (supported) {
    analytics = getAnalytics(firebaseApp)
  }
})

const logEvent = (eventName: string, eventParams?: Record<string, any>) => {
  if (analytics) {
    firebaseLogEvent(analytics, eventName, eventParams)
  }
}

const auth = getAuth(firebaseApp)
const db = getFirestore(firebaseApp)

export { firebaseApp, analytics, auth, db, logEvent }
