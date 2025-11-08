import { NextRequest, NextResponse } from "next/server"
import { getToken } from "@auth/core/jwt"

const secure = process.env.NODE_ENV === "production"

export { auth } from "@/auth"

export async function proxy(req: NextRequest) {
  // Retrieve the user data from the JWT token
  const userData = await getToken({
    secureCookie: secure,
    req,
    secret: process.env.AUTH_SECRET ?? "",
    salt: secure ? "__Secure-authjs.session-token" : "authjs.session-token",
  })
  const isLoggedIn = !!userData

  // Redirect to login page if the user is not logged in
  if (!isLoggedIn) {
    const { nextUrl } = req
    let callbackUrl = nextUrl.pathname
    if (nextUrl.search) {
      callbackUrl += nextUrl.search
    }

    // Encode the callback URL to ensure proper redirection
    const encodedCallbackUrl = encodeURIComponent(callbackUrl)
    return NextResponse.redirect(
      new URL(`/api/auth/signin?callbackUrl=${encodedCallbackUrl}`, req.url)
    )
  }
}

export const config = {
  // Only invoke Middleware on these paths
  matcher: [
    "/stories",
  ],
}
