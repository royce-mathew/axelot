import { NextRequest, NextResponse } from "next/server"
import { getToken } from "@auth/core/jwt"

const secure = process.env.NODE_ENV === "production"

export async function proxy(req: NextRequest) {
  const userData = await getToken({
    secureCookie: secure,
    req,
    secret: process.env.AUTH_SECRET ?? "",
    salt: secure ? "__Secure-authjs.session-token" : "authjs.session-token",
  })
  const isLoggedIn = !!userData
  const pathname = req.nextUrl.pathname

  // redirect authenticated users away from auth pages (except verify-email)
  // users may need to verify email even while logged in via OAuth
  const isAuthPage = pathname.startsWith("/auth")
  const isVerifyEmailPage = pathname.startsWith("/auth/verify-email")
  if (isLoggedIn && isAuthPage && !isVerifyEmailPage) {
    return NextResponse.redirect(new URL("/stories", req.url))
  }

  // redirect unauthenticated users away from protected pages
  if (!isLoggedIn && pathname === "/stories") {
    let callbackUrl = pathname
    if (req.nextUrl.search) {
      callbackUrl += req.nextUrl.search
    }
    const encodedCallbackUrl = encodeURIComponent(callbackUrl)
    return NextResponse.redirect(
      new URL(`/api/auth/signin?callbackUrl=${encodedCallbackUrl}`, req.url)
    )
  }
}

export const config = {
  matcher: ["/stories", "/auth/:path*"],
}
