import { NextRequest, NextResponse } from "next/server"
import { getToken } from "@auth/core/jwt"

const secure = process.env.NODE_ENV === "production"

export default async function middleware(req: NextRequest) {
  // Retrieve the user data from the JWT token
  const userData = await getToken({
    secureCookie: secure,
    req,
    secret: process.env.AUTH_SECRET ?? "",
    salt: secure ? "__Secure-authjs.session-token" : "authjs.session-token",
  })
  const isLoggedIn = !!userData

  if (!isLoggedIn) {
    // Redirect to login page if the user is not logged in
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

// Don't invoke Middleware on certain paths
export const config = {
  matcher: [
    // Only invoke the middleware on the following paths
    "/u/:path*",
  ],
}
