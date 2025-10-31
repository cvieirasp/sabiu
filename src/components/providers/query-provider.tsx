'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, type ReactNode } from 'react'

/**
 * React Query Provider with optimized defaults for the SABIU app
 *
 * Configuration:
 * - 5 minute stale time for most queries (data considered fresh)
 * - 10 minute cache time (data kept in cache)
 * - No automatic refetch on window focus in development
 * - Retry failed queries once
 */
export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Consider data fresh for 5 minutes
            staleTime: 1000 * 60 * 5,
            // Keep data in cache for 10 minutes
            gcTime: 1000 * 60 * 10,
            // Disable refetch on window focus in development
            refetchOnWindowFocus: process.env.NODE_ENV === 'production',
            // Retry failed queries once
            retry: 1,
            // Show error boundary for errors
            throwOnError: false,
          },
          mutations: {
            // Retry failed mutations once
            retry: 1,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}
