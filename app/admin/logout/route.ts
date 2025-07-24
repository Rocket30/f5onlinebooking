import { NextResponse } from "next/server"

export async function GET() {
  // Return a response that clears any authentication
  return new NextResponse("Logged out successfully. Please close this window.", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Admin Access Required"',
      "Content-Type": "text/plain",
    },
  })
}
