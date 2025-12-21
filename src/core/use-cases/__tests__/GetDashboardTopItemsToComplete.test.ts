import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { DashboardQueryRepository } from '@/core/interfaces/ReportQueryRepository'
import {
  GetDashboardTopItemsToComplete,
  GetDashboardTopItemsToCompleteInput,
} from '@/core/use-cases/GetDashboardTopItemsToComplete'
import type { TopItemToCompleteDTO } from '@/core/interfaces/ReportQueryRepository'

describe('GetDashboardTopItemsToComplete', () => {
  let useCase: GetDashboardTopItemsToComplete
  let mockDashboardQueryRepo: DashboardQueryRepository
  let mockData: TopItemToCompleteDTO[]

  beforeEach(() => {
    mockData = [
      {
        id: 'li-1',
        title: 'React Advanced',
        categoryName: 'E-Learning',
        progress: 85,
      },
      {
        id: 'li-2',
        title: 'TypeScript Mastery',
        categoryName: 'E-Learning',
        progress: 75,
      },
      {
        id: 'li-3',
        title: 'AWS Certification',
        categoryName: 'Certification',
        progress: 60,
      },
    ]

    mockDashboardQueryRepo = {
      getTopItemsToComplete: vi.fn().mockResolvedValue(mockData),
    } as Partial<DashboardQueryRepository> as DashboardQueryRepository

    useCase = new GetDashboardTopItemsToComplete(mockDashboardQueryRepo)
  })

  describe('execute', () => {
    it('should return top items to complete', async () => {
      const input: GetDashboardTopItemsToCompleteInput = {
        userId: 'user-1',
        limit: 3,
      }

      const result = await useCase.execute(input)

      expect(result).toEqual(mockData)
      expect(result).toHaveLength(3)
    })

    it('should call repository with correct parameters', async () => {
      const input: GetDashboardTopItemsToCompleteInput = {
        userId: 'user-123',
        limit: 5,
      }

      await useCase.execute(input)

      expect(mockDashboardQueryRepo.getTopItemsToComplete).toHaveBeenCalledWith(
        'user-123',
        5
      )
    })

    it('should throw error if limit is zero', async () => {
      const input: GetDashboardTopItemsToCompleteInput = {
        userId: 'user-1',
        limit: 0,
      }

      await expect(useCase.execute(input)).rejects.toThrow(
        'Limit must be a positive number'
      )
    })

    it('should throw error if limit is negative', async () => {
      const input: GetDashboardTopItemsToCompleteInput = {
        userId: 'user-1',
        limit: -5,
      }

      await expect(useCase.execute(input)).rejects.toThrow(
        'Limit must be a positive number'
      )
    })

    it('should return empty array when no items found', async () => {
      mockDashboardQueryRepo.getTopItemsToComplete = vi
        .fn()
        .mockResolvedValue([])

      const input: GetDashboardTopItemsToCompleteInput = {
        userId: 'user-1',
        limit: 5,
      }

      const result = await useCase.execute(input)

      expect(result).toEqual([])
      expect(result).toHaveLength(0)
    })

    it('should return correct data structure', async () => {
      const input: GetDashboardTopItemsToCompleteInput = {
        userId: 'user-1',
        limit: 3,
      }

      const result = await useCase.execute(input)

      result.forEach(item => {
        expect(item).toHaveProperty('id')
        expect(item).toHaveProperty('title')
        expect(item).toHaveProperty('categoryName')
        expect(item).toHaveProperty('progress')
        expect(typeof item.progress).toBe('number')
      })
    })
  })
})
