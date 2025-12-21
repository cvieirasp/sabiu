import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { DashboardQueryRepository } from '@/core/interfaces/ReportQueryRepository'
import {
  GetDashboardRecentlyViewedItems,
  GetDashboardRecentlyViewedItemsInput,
} from '@/core/use-cases/GetDashboardRecentlyViewedItems'
import type { RecentlyViewedItemDTO } from '@/core/interfaces/ReportQueryRepository'

describe('GetDashboardRecentlyViewedItems', () => {
  let useCase: GetDashboardRecentlyViewedItems
  let mockDashboardQueryRepo: DashboardQueryRepository
  let mockData: RecentlyViewedItemDTO[]

  beforeEach(() => {
    const now = new Date()
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    mockData = [
      {
        id: 'li-1',
        title: 'React Course',
        categoryName: 'E-Learning',
        categoryType: 'E-Learning',
        progress: 50,
        viewedAt: now,
      },
      {
        id: 'li-2',
        title: 'Node.js Mastery',
        categoryName: 'E-Learning',
        categoryType: 'E-Learning',
        progress: 30,
        viewedAt: yesterday,
      },
    ]

    mockDashboardQueryRepo = {
      getRecentlyViewedItems: vi.fn().mockResolvedValue(mockData),
    } as Partial<DashboardQueryRepository> as DashboardQueryRepository

    useCase = new GetDashboardRecentlyViewedItems(mockDashboardQueryRepo)
  })

  describe('execute', () => {
    it('should return recently viewed items', async () => {
      const input: GetDashboardRecentlyViewedItemsInput = {
        userId: 'user-1',
        limit: 2,
      }

      const result = await useCase.execute(input)

      expect(result).toEqual(mockData)
      expect(result).toHaveLength(2)
    })

    it('should call repository with correct parameters', async () => {
      const input: GetDashboardRecentlyViewedItemsInput = {
        userId: 'user-123',
        limit: 5,
      }

      await useCase.execute(input)

      expect(mockDashboardQueryRepo.getRecentlyViewedItems).toHaveBeenCalledWith(
        'user-123',
        5
      )
    })

    it('should throw error if limit is zero', async () => {
      const input: GetDashboardRecentlyViewedItemsInput = {
        userId: 'user-1',
        limit: 0,
      }

      await expect(useCase.execute(input)).rejects.toThrow(
        'Limit must be a positive number'
      )
    })

    it('should throw error if limit is negative', async () => {
      const input: GetDashboardRecentlyViewedItemsInput = {
        userId: 'user-1',
        limit: -3,
      }

      await expect(useCase.execute(input)).rejects.toThrow(
        'Limit must be a positive number'
      )
    })

    it('should return empty array when no items found', async () => {
      mockDashboardQueryRepo.getRecentlyViewedItems = vi
        .fn()
        .mockResolvedValue([])

      const input: GetDashboardRecentlyViewedItemsInput = {
        userId: 'user-1',
        limit: 5,
      }

      const result = await useCase.execute(input)

      expect(result).toEqual([])
      expect(result).toHaveLength(0)
    })

    it('should return correct data structure', async () => {
      const input: GetDashboardRecentlyViewedItemsInput = {
        userId: 'user-1',
        limit: 2,
      }

      const result = await useCase.execute(input)

      result.forEach(item => {
        expect(item).toHaveProperty('id')
        expect(item).toHaveProperty('title')
        expect(item).toHaveProperty('categoryName')
        expect(item).toHaveProperty('categoryType')
        expect(item).toHaveProperty('progress')
        expect(item).toHaveProperty('viewedAt')
        expect(typeof item.progress).toBe('number')
        expect(item.viewedAt).toBeInstanceOf(Date)
      })
    })
  })
})
