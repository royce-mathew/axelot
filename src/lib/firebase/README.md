<!-- https://stackoverflow.com/a/78129064 -->

It's been a few months since this question was initially asked, but I'll share anyway a possible solution because I recently ran into the same issue. So, if anyone else is having trouble using the _Stripe Firebase Extension_ (now officially transferred to _Invertase_, aka `@invertase/firestore-stripe-payments`) along with _Next-Auth_, this might help you out.

Basically, the issue is with the _next-auth_ authentication process. Meaning that, while the package creates/updates user data in the `users` and `accounts` Firebase collections/docs when users sign in/up, it sadly _doesn't_ authenticate them also on the Firebase Authentication dashboard, i.e. this one (yours will probably be empty right now):

[![Firebase Authentication dashboard example][1]][1]

Hence, this is the main issue causing the `"There is no user record corresponding to the provided identifier"` error to pop up.

So, to fix that, we are going to simply authenticate the user also on the _Firebase Authentication_ dashboard. Now, here's how I organized my project files/code, yours might be different, but quite similar in the logics.

Simplified project file structure view:

```
/
├── app
|     ├── _components
|     |     ├── (auth)
|     |     |     └── NextAuthSessionProvider.jsx
|     |     └── // Other folders/files
|     ├── _lib
|     |     ├── firebase
|     |     |     ├── authentication.js
|     |     |     └── firestore-database.js
|     |     └── auth.js
|     ├── api
|     |     ├── auth
|     |     |     └── [...nextauth]
|     |     |                └── route.js
|     |     └── // Other API routes
|     └── // Other folders/files
└── // Other folders/files
```

`/app/_lib/firebase/authentication.js` (i.e. all operations regarding the `firebase-admin` package):

```javascript
import { initFirestore } from "@auth/firebase-adapter"
import { cert, getApps, initializeApp } from "firebase-admin/app"
import { getAuth } from "firebase-admin/auth"

const firebaseAdminSettings = {
  credential: cert({
    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY,
  }),
}

export const firebaseAdmin =
  getApps().length === 0 ? initializeApp(firebaseAdminSettings) : getApps()[0]
export const firebaseAdminFirestore = initFirestore(firebaseAdminSettings)
export { getAuth }
```

`/app/_lib/auth.js` (i.e. _next-auth_ config file):

```javascript
import { FirestoreAdapter } from "@auth/firebase-adapter"
// Here '@lib/firebase/authentication' refers to the '/app/_lib/firebase/authentication.js' file
import { firebaseAdminFirestore, getAuth } from "@lib/firebase/authentication"
import GoogleProvider from "next-auth/providers/google"

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
    }),
  ],
  adapter: FirestoreAdapter(firebaseAdminFirestore),
  session: {
    strategy: "jwt",
  },
  callbacks: {
    jwt: async ({ user, token }) => {
      if (user) {
        token.uid = user.id

        const auth = getAuth()
        try {
          await auth.getUser(token.uid)
        } catch (error) {
          if (error.code === "auth/user-not-found") {
            // If the user does not exist, create a new user
            await auth.createUser({
              uid: token.uid,
              email: token.email,
              displayName: token.name,
              photoURL: token.picture,
            })
          } else {
            throw error
          }
        }
      }
      return token
    },
    session: async ({ session, token }) => {
      if (token && token.uid) {
        if (session?.user) {
          session.user.id = token.uid

          const auth = getAuth()
          const firebaseToken = await auth.createCustomToken(token.uid)
          session.firebaseToken = firebaseToken
        }
      }
      return session
    },
  },
}
```

`/app/api/auth/[...nextauth]/route.js` (i.e. api endpoint for _next-auth_):

```javascript
// Here '@lib/auth' refers to the '/app/_lib/auth.js' file
import { authOptions } from "@lib/auth"
import NextAuth from "next-auth"

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
```

`/app/_components/(auth)/NextAuthSessionProvider.jsx` (i.e. _next-auth_ session provider wrapper + listener to sync with _Firebase Authentication_):

```javascript
"use client"

import { useEffect } from "react"
// Here '@lib/firebase/firestore-database' refers to the '/app/_lib/firebase/firestore-database.js' file
import { syncWithFirebaseAuth } from "@lib/firebase/firestore-database"
import { SessionProvider, useSession } from "next-auth/react"

const SyncWithFirebaseAuth = () => {
  const { data: session } = useSession()

  useEffect(() => {
    syncWithFirebaseAuth(session)
  }, [session])

  return null
}

const NextAuthSessionProvider = ({ children }) => {
  return (
    <SessionProvider>
      <SyncWithFirebaseAuth />
      {children}
    </SessionProvider>
  )
}

export default NextAuthSessionProvider
```

`/app/_lib/firebase/firestore-database.js` (i.e. all operations regarding the Firestore database):

```javascript
import { getApps, initializeApp } from "firebase/app"
import { getAuth, signInWithCustomToken } from "firebase/auth"
import {
  addDoc,
  collection,
  getFirestore,
  onSnapshot,
  query,
  where,
} from "firebase/firestore"
import { getFunctions, httpsCallable } from "firebase/functions"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

export const firebaseApp =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
export const auth = getAuth(firebaseApp)
export const firestore = getFirestore(firebaseApp)

export const syncWithFirebaseAuth = async (session) => {
  if (session && session.firebaseToken) {
    try {
      await signInWithCustomToken(auth, session.firebaseToken)
    } catch (error) {
      console.error("Error signing in with custom token:", error)
    }
  } else {
    auth.signOut()
  }
}

/**
 * STRIPE UTILITIES
 */

export const createStripeCheckoutURL = async (userId, origin, locale) => {
  const docRef = await addDoc(
    collection(firestore, `users/${userId}/checkout_sessions`),
    {
      price: "...",
      locale,
      success_url: origin,
      cancel_url: origin,
    }
  )

  return new Promise((resolve, reject) => {
    const unsubscribe = onSnapshot(docRef, (snap) => {
      const { error, url } = snap.data()

      if (error) {
        // Stop listening for changes
        unsubscribe()
        reject(new Error(`An error occurred: ${error.message}`))
      }
      if (url) {
        // Stop listening for changes
        unsubscribe()
        resolve(url)
      }
    })
  })
}

export const getStripeSubscriptionStatus = async (userId) => {
  const stripeSubscriptionsRef = collection(
    firestore,
    `users/${userId}/subscriptions`
  )
  const q = query(
    stripeSubscriptionsRef,
    where("status", "in", ["trialing", "active"])
  )

  return new Promise((resolve, reject) => {
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (snapshot.docs.length === 0) {
          resolve(false)
        } else {
          resolve(true)
        }
        unsubscribe()
      },
      reject
    )
  })
}

export const getStripePortalLink = async (userId, origin, locale) => {
  let portalLink
  try {
    const functions = getFunctions(
      firebaseApp,
      "[your Firebase location, e.g. europe-west3]"
    )
    const functionRef = httpsCallable(
      functions,
      "ext-firestore-stripe-payments-createPortalLink"
    )
    const { data } = await functionRef({
      returnUrl: origin,
      locale,
      customerId: userId,
    })

    portalLink = data?.url
  } catch (error) {
    console.error(error)
  }

  return new Promise((resolve, reject) => {
    if (portalLink) {
      resolve(portalLink)
    } else {
      reject(new Error("No Stripe portal link returned."))
    }
  })
}

// Other Firebase CRUD operations
```

---

I know it's a long answer, but I've tried to present you a working example. Now, here's a couple of observations:

- To authenticate the user also to the _Firebase Authentication dashboard_, I've used the Firebase `createCustomToken` and `signInWithCustomToken` utilities.
- I've also utilized the Firebase `createUser({ ... })` method just to make sure that each user inside the _Firebase Authentication dashboard_ had a **non-empty identifier** (in this case, it will be equals to the user's email). **_This is an additional step_**, but I've done it just to later have the user's email pre-filled in the Stripe checkout session form, like so:

  [![pre-filled email field on the stripe checkout page][2]][2]

  Thus, if you're not interested having this behavior, you can remove this part.

- At the time of writing - March 2024 - the `@invertase/firestore-stripe-payments` [SDK built-in methods](https://github.com/invertase/stripe-firebase-extensions/blob/next/firestore-stripe-web-sdk/README.md), e.g. `getStripePayments`, `createCheckoutSession`, etc., are still not working properly (probably due to the fact that the lib uses an old version of Firebase), and that's why - as in the original question - you might have noticed that in the `/app/_lib/firebase/firestore-database.js` file I've created, based on the docs, some utilities to interact with the lib. **Hence keep an eye out for future package updates that resolve this inconvenience**.
- As in the previous point, perhaps in the future, there will be some updates to the `next-auth` package too that will integrate all of this additional Firebase authentication logic. So, keep an eye out for that too!
- Since I've used the `NEXT_PUBLIC_` prefix on the _Firebase env variables_, keep also in mind to create adequate Firebase **_rules_** in order to protect the db.

---

Finally, just to provide you with the full context, this solution was tested - and worked fine - with these project package versions:

```
"@auth/firebase-adapter": "^1.4.0",
"@invertase/firestore-stripe-payments": "^0.0.7",
"firebase": "^10.8.0",
"firebase-admin": "^11.11.1",
"next": "^14.0.4"
"next-auth": "^4.24.6",
```

[1]: https://i.stack.imgur.com/oW4zI.png
[2]: https://i.stack.imgur.com/t7VcP.png
