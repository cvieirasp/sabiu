'use client'

import { useQuery } from '@tanstack/react-query'

interface ItemsByCategoryDTO {
  categoryId: string
  categoryName: string
  categoryColor: string
  count: number
}

interface ItemsByStatusDTO {
  status: string
  count: number
}

interface TopItemToCompleteDTO {
  id: string
  title: string
  categoryName: string
  progress: number
}

interface RecentlyViewedItemDTO {
  id: string
  title: string
  categoryName: string
  categoryType: string
  progress: number
  viewedAt: Date
}

interface ProgressByCategoryPerMonthDTO {
  month: string
  categoryId: string
  categoryName: string
  averageProgress: number
}

/**
 * Hook to fetch items grouped by category
 */
export function useItemsByCategory() {
  return useQuery<ItemsByCategoryDTO[]>({
    queryKey: ['dashboard', 'items-by-category'],
    queryFn: async () => {
      const response = await fetch('/api/reports/items-by-category')
      if (!response.ok) {
        throw new Error('Failed to fetch items by category')
      }
      const data = await response.json()
      return data.data
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

/**
 * Hook to fetch items grouped by status
 */
export function useItemsByStatus() {
  return useQuery<ItemsByStatusDTO[]>({
    queryKey: ['dashboard', 'items-by-status'],
    queryFn: async () => {
      const response = await fetch('/api/reports/items-by-status')
      if (!response.ok) {
        throw new Error('Failed to fetch items by status')
      }
      const data = await response.json()
      return data.data
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

/**
 * Hook to fetch top items to complete
 */
export function useTopItemsToComplete(limit: number = 5) {
  return useQuery<TopItemToCompleteDTO[]>({
    queryKey: ['dashboard', 'top-items-to-complete', limit],
    queryFn: async () => {
      const response = await fetch(
        `/api/reports/top-items-to-complete?limit=${limit}`
      )
      if (!response.ok) {
        throw new Error('Failed to fetch top items to complete')
      }
      const data = await response.json()
      return data.data
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

/**
 * Hook to fetch recently viewed items
 */
export function useRecentlyViewedItems(limit: number = 5) {
  return useQuery<RecentlyViewedItemDTO[]>({
    queryKey: ['dashboard', 'recently-viewed', limit],
    queryFn: async () => {
      const response = await fetch(
        `/api/reports/recently-viewed?limit=${limit}`
      )
      if (!response.ok) {
        throw new Error('Failed to fetch recently viewed items')
      }
      const data = await response.json()
      // Convert viewedAt string to Date
      return data.data.map((item: RecentlyViewedItemDTO) => ({
        ...item,
        viewedAt: new Date(item.viewedAt),
      }))
    },
    staleTime: 1000 * 60 * 2, // 2 minutes (more frequent for recent items)
  })
}

/**
 * Hook to fetch progress by category per month
 */
export function useProgressByCategory(months: number = 6) {
  return useQuery<ProgressByCategoryPerMonthDTO[]>({
    queryKey: ['dashboard', 'progress-by-category', months],
    queryFn: async () => {
      const response = await fetch(
        `/api/reports/progress-by-category?months=${months}`
      )
      if (!response.ok) {
        throw new Error('Failed to fetch progress by category')
      }
      const data = await response.json()
      return data.data
    },
    staleTime: 1000 * 60 * 10, // 10 minutes (historical data changes less frequently)
  })
}
