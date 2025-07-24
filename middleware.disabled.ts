// This file is disabled by renaming it to .disabled.ts
// The original middleware code is preserved here for reference

import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Define admin credentials
const ADMIN_USERNAME = "admin"
const ADMIN_PASSWORD = "f5carpet2023"

export function middleware(request: NextRequest) {
  // Only apply to admin routes
  if (request.nextUrl.pathname.startsWith("/admin")) {
    // Check if the user is authenticated
    const authHeader = request.headers.get("authorization")

    if (!authHeader || !authHeader.startsWith("Basic ")) {
      // If no auth header or not Basic auth, request authentication
      return new NextResponse(null, {
        status: 401,
        headers: {
          "WWW-Authenticate": 'Basic realm="Admin Access Required"',
        },
      })
    }

    // Decode the base64 credentials
    try {
      const credentials = atob(authHeader.split(" ")[1])
      const [username, password] = credentials.split(":")

      // Check if credentials match
      if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
        // If credentials don't match, request authentication again
        return new NextResponse(null, {
          status: 401,
          headers: {
            "WWW-Authenticate": 'Basic realm="Admin Access Required"',
          },
        })
      }

      // If credentials match, allow the request to proceed
      return NextResponse.next()
    } catch (error) {
      // If there's an error decoding credentials, request authentication
      return new NextResponse(null, {
        status: 401,
        headers: {
          "WWW-Authenticate": 'Basic realm="Admin Access Required"',
        },
      })
    }
  }

  // For non-admin routes, allow the request to proceed
  return NextResponse.next()
}

export const config = {
  matcher: ["/booking/:path*", "/admin/:path*"],
}
