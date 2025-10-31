'use client'

import { type ReactNode } from 'react'
import { AuthProvider } from './auth-provider'
import { QueryProvider } from './query-provider'
import { ThemeProvider } from './theme-provider'

/**
 * Root Providers Component
 *
 * Combines all application providers in the correct order:
 * 1. AuthProvider (NextAuth session)
 * 2. QueryProvider (React Query)
 * 3. ThemeProvider (next-themes)
 *
 * Usage in layout.tsx:
 * ```tsx
 * import { Providers } from '@/components/providers'
 *
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         <Providers>{children}</Providers>
 *       </body>
 *     </html>
 *   )
 * }
 * ```
 */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <QueryProvider>
        <ThemeProvider>{children}</ThemeProvider>
      </QueryProvider>
    </AuthProvider>
  )
}

// Export individual providers for specific use cases
export { AuthProvider } from './auth-provider'
export { QueryProvider } from './query-provider'
export { ThemeProvider } from './theme-provider'
