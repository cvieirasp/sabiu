import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { DashboardQueryRepository } from '@/core/interfaces/ReportQueryRepository'
import {
  GetDashboardProgressByCategory,
  GetDashboardProgressByCategoryInput,
} from '@/core/use-cases/GetDashboardProgressByCategory'
import type { ProgressByCategoryPerMonthDTO } from '@/core/interfaces/ReportQueryRepository'

describe('GetDashboardProgressByCategory', () => {
  let useCase: GetDashboardProgressByCategory
  let mockDashboardQueryRepo: DashboardQueryRepository
  let mockData: ProgressByCategoryPerMonthDTO[]

  beforeEach(() => {
    mockData = [
      {
        month: '2025-01',
        categoryId: 'cat-1',
        categoryName: 'E-Learning',
        averageProgress: 45.5,
      },
      {
        month: '2025-01',
        categoryId: 'cat-2',
        categoryName: 'Certification',
        averageProgress: 30.25,
      },
      {
        month: '2025-02',
        categoryId: 'cat-1',
        categoryName: 'E-Learning',
        averageProgress: 55.75,
      },
    ]

    mockDashboardQueryRepo = {
      getProgressByCategoryPerMonth: vi.fn().mockResolvedValue(mockData),
    } as Partial<DashboardQueryRepository> as DashboardQueryRepository

    useCase = new GetDashboardProgressByCategory(mockDashboardQueryRepo)
  })

  describe('execute', () => {
    it('should return progress by category per month', async () => {
      const input: GetDashboardProgressByCategoryInput = {
        userId: 'user-1',
        months: 6,
      }

      const result = await useCase.execute(input)

      expect(result).toEqual(mockData)
      expect(result).toHaveLength(3)
    })

    it('should call repository with correct parameters', async () => {
      const input: GetDashboardProgressByCategoryInput = {
        userId: 'user-123',
        months: 12,
      }

      await useCase.execute(input)

      expect(
        mockDashboardQueryRepo.getProgressByCategoryPerMonth
      ).toHaveBeenCalledWith('user-123', 12)
    })

    it('should throw error if months is zero', async () => {
      const input: GetDashboardProgressByCategoryInput = {
        userId: 'user-1',
        months: 0,
      }

      await expect(useCase.execute(input)).rejects.toThrow(
        'Months must be a positive number'
      )
    })

    it('should throw error if months is negative', async () => {
      const input: GetDashboardProgressByCategoryInput = {
        userId: 'user-1',
        months: -6,
      }

      await expect(useCase.execute(input)).rejects.toThrow(
        'Months must be a positive number'
      )
    })

    it('should throw error if months exceeds maximum', async () => {
      const input: GetDashboardProgressByCategoryInput = {
        userId: 'user-1',
        months: 25, // Exceeds MAX_MONTHS (24)
      }

      await expect(useCase.execute(input)).rejects.toThrow(
        'Months cannot exceed 24'
      )
    })

    it('should return empty array when no data found', async () => {
      mockDashboardQueryRepo.getProgressByCategoryPerMonth = vi
        .fn()
        .mockResolvedValue([])

      const input: GetDashboardProgressByCategoryInput = {
        userId: 'user-1',
        months: 6,
      }

      const result = await useCase.execute(input)

      expect(result).toEqual([])
      expect(result).toHaveLength(0)
    })

    it('should return correct data structure', async () => {
      const input: GetDashboardProgressByCategoryInput = {
        userId: 'user-1',
        months: 6,
      }

      const result = await useCase.execute(input)

      result.forEach(item => {
        expect(item).toHaveProperty('month')
        expect(item).toHaveProperty('categoryId')
        expect(item).toHaveProperty('categoryName')
        expect(item).toHaveProperty('averageProgress')
        expect(typeof item.month).toBe('string')
        expect(typeof item.averageProgress).toBe('number')
      })
    })

    it('should accept valid months within limit', async () => {
      const input: GetDashboardProgressByCategoryInput = {
        userId: 'user-1',
        months: 24, // Exactly at MAX_MONTHS
      }

      const result = await useCase.execute(input)

      expect(result).toBeDefined()
      expect(
        mockDashboardQueryRepo.getProgressByCategoryPerMonth
      ).toHaveBeenCalledWith('user-1', 24)
    })
  })
})
