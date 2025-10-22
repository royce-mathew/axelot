// import { NextRequest, NextResponse } from "next/server"
// import { getToken } from "@auth/core/jwt"

// const secure = process.env.NODE_ENV === "production"

export { auth as proxy } from "@/auth"

// Don't invoke Middleware on certain paths
export const config = {
  matcher: [
    // Only invoke the middleware on the following paths
    "/u/:path*",
  ]
}
