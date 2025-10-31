'use client'

import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { type ReactNode } from 'react'

/**
 * Theme Provider for light/dark mode support
 *
 * Features:
 * - Persists theme preference in localStorage
 * - Supports system preference detection
 * - Prevents flash of unstyled content
 * - Default theme: system preference
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  )
}
