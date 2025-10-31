import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(_req) {
    // You can add custom logic here if needed
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: '/sign-in',
    },
  }
)

// Protect these routes
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/profile/:path*',
    '/api/items/:path*',
    '/api/categories/:path*',
    '/api/modules/:path*',
  ],
}
