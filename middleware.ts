// Completely minimal middleware that does nothing
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Simply pass through all requests without modification
  return NextResponse.next()
}

// Empty matcher to minimize impact
export const config = {
  matcher: [],
}
