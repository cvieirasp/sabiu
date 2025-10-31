'use client'

import { SessionProvider } from 'next-auth/react'
import { type ReactNode } from 'react'

/**
 * NextAuth Session Provider
 *
 * Makes authentication session available throughout the app
 * Use useSession() hook in client components to access user data
 *
 * Features:
 * - Automatic session refresh
 * - Session state available via useSession()
 * - Optimistic session updates
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>
}
