import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { DashboardQueryRepository } from '@/core/interfaces/ReportQueryRepository'
import {
  GetDashboardItemsByCategory,
  GetDashboardItemsByCategoryInput,
} from '@/core/use-cases/GetDashboardItemsByCategory'
import type { ItemsByCategoryDTO } from '@/core/interfaces/ReportQueryRepository'

describe('GetDashboardItemsByCategory', () => {
  let useCase: GetDashboardItemsByCategory
  let mockDashboardQueryRepo: DashboardQueryRepository
  let mockData: ItemsByCategoryDTO[]

  beforeEach(() => {
    mockData = [
      {
        categoryId: 'cat-1',
        categoryName: 'E-Learning',
        categoryColor: '#3B82F6',
        count: 5,
      },
      {
        categoryId: 'cat-2',
        categoryName: 'Certification',
        categoryColor: '#10B981',
        count: 3,
      },
    ]

    mockDashboardQueryRepo = {
      getItemsByCategory: vi.fn().mockResolvedValue(mockData),
    } as Partial<DashboardQueryRepository> as DashboardQueryRepository

    useCase = new GetDashboardItemsByCategory(mockDashboardQueryRepo)
  })

  describe('execute', () => {
    it('should return items grouped by category', async () => {
      const input: GetDashboardItemsByCategoryInput = {
        userId: 'user-1',
      }

      const result = await useCase.execute(input)

      expect(result).toEqual(mockData)
      expect(result).toHaveLength(2)
    })

    it('should call repository with correct userId', async () => {
      const input: GetDashboardItemsByCategoryInput = {
        userId: 'user-123',
      }

      await useCase.execute(input)

      expect(mockDashboardQueryRepo.getItemsByCategory).toHaveBeenCalledWith(
        'user-123'
      )
    })

    it('should return empty array when no items found', async () => {
      mockDashboardQueryRepo.getItemsByCategory = vi
        .fn()
        .mockResolvedValue([])

      const input: GetDashboardItemsByCategoryInput = {
        userId: 'user-1',
      }

      const result = await useCase.execute(input)

      expect(result).toEqual([])
      expect(result).toHaveLength(0)
    })

    it('should return correct data structure', async () => {
      const input: GetDashboardItemsByCategoryInput = {
        userId: 'user-1',
      }

      const result = await useCase.execute(input)

      result.forEach(item => {
        expect(item).toHaveProperty('categoryId')
        expect(item).toHaveProperty('categoryName')
        expect(item).toHaveProperty('categoryColor')
        expect(item).toHaveProperty('count')
        expect(typeof item.count).toBe('number')
      })
    })
  })
})
