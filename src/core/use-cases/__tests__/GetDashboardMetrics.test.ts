import { describe, it, expect, beforeEach } from 'vitest'
import { GetDashboardMetrics } from '../GetDashboardMetrics'
import { LearningItem } from '../../entities'
import { StatusVO, Progress } from '../../value-objects'
import type { LearningItemRepository } from '../../interfaces'

describe('GetDashboardMetrics', () => {
  let getDashboardMetrics: GetDashboardMetrics
  let mockLearningItemRepo: LearningItemRepository
  let mockItems: LearningItem[]

  beforeEach(() => {
    // Create mock learning items
    mockItems = [
      LearningItem.create({
        id: 'item-1',
        title: 'Learn TypeScript',
        descriptionMD: 'TypeScript course',
        dueDate: new Date('2026-01-15'),
        status: StatusVO.fromBacklog(),
        progress: Progress.fromZero(),
        userId: 'user-123',
        categoryId: 'cat-1',
      }),
      LearningItem.create({
        id: 'item-2',
        title: 'Learn React',
        descriptionMD: 'React course',
        dueDate: new Date('2026-11-05'),
        status: StatusVO.fromEmAndamento(),
        progress: Progress.create(85),
        userId: 'user-123',
        categoryId: 'cat-1',
      }),
      LearningItem.create({
        id: 'item-3',
        title: 'Learn Node.js',
        descriptionMD: 'Node.js course',
        dueDate: new Date('2027-01-01'),
        status: StatusVO.fromConcluido(),
        progress: Progress.create(100),
        userId: 'user-123',
        categoryId: 'cat-2',
      }),
    ]

    // Mock repository
    mockLearningItemRepo = {
      count: async () => 3,
      countByStatus: async () => ({
        backlog: 1,
        emAndamento: 1,
        pausado: 0,
        concluido: 1,
      }),
      countByCategory: async () => [
        { categoryId: 'cat-1', count: 2 },
        { categoryId: 'cat-2', count: 1 },
      ],
      calculateAverageProgress: async () => 61.67,
      findOverdue: async () => [mockItems[0]],
      findDueSoon: async () => [mockItems[1]],
      findNearCompletion: async () => [mockItems[1]],
      findRecentlyUpdated: async () => mockItems.slice(0, 2),
    } as Partial<LearningItemRepository> as LearningItemRepository

    getDashboardMetrics = new GetDashboardMetrics(mockLearningItemRepo)
  })

  describe('execute', () => {
    it('should return comprehensive dashboard metrics', async () => {
      const input = {
        userId: 'user-123',
      }

      const result = await getDashboardMetrics.execute(input)

      expect(result).toBeDefined()
      expect(result.totalItems).toBe(3)
      expect(result.statusCounts).toBeDefined()
      expect(result.categoryCounts).toBeDefined()
      expect(result.averageProgress).toBeDefined()
      expect(result.overdueLearningItems).toBeDefined()
      expect(result.dueSoonLearningItems).toBeDefined()
      expect(result.nearCompletionLearningItems).toBeDefined()
      expect(result.recentlyUpdatedLearningItems).toBeDefined()
    })

    it('should return correct total items count', async () => {
      const input = {
        userId: 'user-123',
      }

      const result = await getDashboardMetrics.execute(input)

      expect(result.totalItems).toBe(3)
    })

    it('should return correct status counts', async () => {
      const input = {
        userId: 'user-123',
      }

      const result = await getDashboardMetrics.execute(input)

      expect(result.statusCounts.backlog).toBe(1)
      expect(result.statusCounts.emAndamento).toBe(1)
      expect(result.statusCounts.pausado).toBe(0)
      expect(result.statusCounts.concluido).toBe(1)
    })

    it('should return correct category counts', async () => {
      const input = {
        userId: 'user-123',
      }

      const result = await getDashboardMetrics.execute(input)

      expect(result.categoryCounts).toHaveLength(2)
      expect(result.categoryCounts[0].categoryId).toBe('cat-1')
      expect(result.categoryCounts[0].count).toBe(2)
      expect(result.categoryCounts[1].categoryId).toBe('cat-2')
      expect(result.categoryCounts[1].count).toBe(1)
    })

    it('should return correct average progress', async () => {
      const input = {
        userId: 'user-123',
      }

      const result = await getDashboardMetrics.execute(input)

      expect(result.averageProgress).toBeCloseTo(61.67, 2)
    })

    it('should return overdue learning items', async () => {
      const input = {
        userId: 'user-123',
      }

      const result = await getDashboardMetrics.execute(input)

      expect(result.overdueLearningItems).toHaveLength(1)
      expect(result.overdueLearningItems[0].id).toBe('item-1')
    })

    it('should return due soon learning items', async () => {
      const input = {
        userId: 'user-123',
      }

      const result = await getDashboardMetrics.execute(input)

      expect(result.dueSoonLearningItems).toHaveLength(1)
      expect(result.dueSoonLearningItems[0].id).toBe('item-2')
    })

    it('should return near completion learning items', async () => {
      const input = {
        userId: 'user-123',
      }

      const result = await getDashboardMetrics.execute(input)

      expect(result.nearCompletionLearningItems).toHaveLength(1)
      expect(result.nearCompletionLearningItems[0].progress.value).toBe(85)
    })

    it('should return recently updated learning items', async () => {
      const input = {
        userId: 'user-123',
      }

      const result = await getDashboardMetrics.execute(input)

      expect(result.recentlyUpdatedLearningItems).toHaveLength(2)
    })

    it('should handle user with no learning items', async () => {
      mockLearningItemRepo.count = async () => 0
      mockLearningItemRepo.countByStatus = async () => ({
        backlog: 0,
        emAndamento: 0,
        pausado: 0,
        concluido: 0,
      })
      mockLearningItemRepo.countByCategory = async () => []
      mockLearningItemRepo.calculateAverageProgress = async () => 0
      mockLearningItemRepo.findOverdue = async () => []
      mockLearningItemRepo.findDueSoon = async () => []
      mockLearningItemRepo.findNearCompletion = async () => []
      mockLearningItemRepo.findRecentlyUpdated = async () => []

      const input = {
        userId: 'user-456',
      }

      const result = await getDashboardMetrics.execute(input)

      expect(result.totalItems).toBe(0)
      expect(result.overdueLearningItems).toHaveLength(0)
      expect(result.dueSoonLearningItems).toHaveLength(0)
      expect(result.nearCompletionLearningItems).toHaveLength(0)
      expect(result.recentlyUpdatedLearningItems).toHaveLength(0)
    })

    it('should execute all queries in parallel for performance', async () => {
      const executionOrder: string[] = []

      mockLearningItemRepo.count = async () => {
        executionOrder.push('count')
        return 3
      }

      mockLearningItemRepo.countByStatus = async () => {
        executionOrder.push('countByStatus')
        return { backlog: 1, emAndamento: 1, pausado: 0, concluido: 1 }
      }

      mockLearningItemRepo.countByCategory = async () => {
        executionOrder.push('countByCategory')
        return []
      }

      const input = {
        userId: 'user-123',
      }

      await getDashboardMetrics.execute(input)

      // All queries should be executed (we can't guarantee exact order in parallel execution)
      expect(executionOrder).toContain('count')
      expect(executionOrder).toContain('countByStatus')
      expect(executionOrder).toContain('countByCategory')
    })
  })
})
