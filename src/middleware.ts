import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Temporarily disable middleware to avoid blocking app loading
// This allows the app to load while we fix the authentication issues

export async function middleware(request: NextRequest) {
  // Just pass through all requests for now
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$).*)',
  ],
}