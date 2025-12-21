'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export type Status = 'Backlog' | 'Em_Andamento' | 'Pausado' | 'Concluido'

export interface LearningItemDTO {
  id: string
  title: string
  descriptionMD: string
  dueDate: string | null
  status: Status
  progress: number
  userId: string
  category: {
    id: string
    name: string
    color: string
  }
  createdAt: string
  updatedAt: string
}

interface ListLearningItemsParams {
  status?: Status
  categoryId?: string
  search?: string
  page?: number
  limit?: number
}

interface UpdateLearningItemStatusParams {
  id: string
  status: Status
}

/**
 * Hook to fetch learning items with optional filters
 */
export function useLearningItems(params?: ListLearningItemsParams) {
  const queryParams = new URLSearchParams()

  if (params?.status) queryParams.append('status', params.status)
  if (params?.categoryId) queryParams.append('categoryId', params.categoryId)
  if (params?.search) queryParams.append('search', params.search)
  if (params?.page) queryParams.append('page', params.page.toString())
  if (params?.limit) queryParams.append('limit', params.limit.toString())

  const queryString = queryParams.toString()
  const url = `/api/items${queryString ? `?${queryString}` : ''}`

  return useQuery<LearningItemDTO[]>({
    queryKey: ['learning-items', params],
    queryFn: async () => {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error('Failed to fetch learning items')
      }
      const data = await response.json()
      return data.data
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  })
}

/**
 * Hook to update learning item status
 */
export function useUpdateLearningItemStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, status }: UpdateLearningItemStatusParams) => {
      const response = await fetch(`/api/items/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      })

      if (!response.ok) {
        throw new Error('Failed to update learning item status')
      }

      const data = await response.json()
      return data.data
    },
    onSuccess: () => {
      // Invalidate all learning-items queries to refetch
      queryClient.invalidateQueries({ queryKey: ['learning-items'] })
    },
  })
}
