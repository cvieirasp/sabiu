import { describe, it, expect, beforeEach } from 'vitest'
import { CalculateProgress } from '@/core/use-cases/CalculateProgress'
import { LearningItem } from '@/core/entities/LearningItem'
import { Progress } from '@/core/value-objects/Progress'
import { StatusVO } from '@/core/value-objects/Status'
import type { ModuleRepository } from '@/core/interfaces/ModuleRepository'
import type { LearningItemRepository } from '@/core/interfaces/LearningItemRepository'

describe('CalculateProgress', () => {
  let calculateProgress: CalculateProgress
  let mockLearningItemRepo: LearningItemRepository
  let mockModuleRepo: ModuleRepository
  let existingItem: LearningItem

  beforeEach(() => {
    // Create existing learning item
    existingItem = LearningItem.create({
      id: 'item-123',
      title: 'Learn TypeScript',
      descriptionMD: 'Complete TypeScript course',
      dueDate: null,
      status: StatusVO.fromEmAndamento(),
      progress: Progress.fromZero(),
      userId: 'user-123',
      categoryId: 'cat-1',
    })

    // Mock repositories
    mockLearningItemRepo = {
      findById: async (id: string) => {
        if (id === 'item-123') return existingItem
        return null
      },
      updateProgress: async () => 100,
    } as Partial<LearningItemRepository> as LearningItemRepository

    mockModuleRepo = {
      count: async () => 4,
      countCompleted: async () => 2,
    } as Partial<ModuleRepository> as ModuleRepository

    calculateProgress = new CalculateProgress(
      mockLearningItemRepo,
      mockModuleRepo
    )
  })

  describe('execute', () => {
    it('should calculate progress correctly', async () => {
      const input = {
        learningItemId: 'item-123',
        userId: 'user-123',
      }

      const result = await calculateProgress.execute(input)

      expect(result.progress).toBe(50) // 2 out of 4 modules completed
      expect(result.completedModules).toBe(2)
      expect(result.totalModules).toBe(4)
    })

    it('should calculate 0% progress when no modules are completed', async () => {
      //mockModuleRepo.countCompleted = async () => 0

      const input = {
        learningItemId: 'item-123',
        userId: 'user-123',
      }

      const result = await calculateProgress.execute(input)

      expect(result.progress).toBe(0)
      expect(result.completedModules).toBe(0)
      expect(result.totalModules).toBe(4)
    })

    it('should calculate 100% progress when all modules are completed', async () => {
      //mockModuleRepo.countCompleted = async () => 4

      const input = {
        learningItemId: 'item-123',
        userId: 'user-123',
      }

      const result = await calculateProgress.execute(input)

      expect(result.progress).toBe(100)
      expect(result.completedModules).toBe(4)
      expect(result.totalModules).toBe(4)
    })

    it('should handle learning items with no modules', async () => {
      //mockModuleRepo.count = async () => 0
      //mockModuleRepo.countCompleted = async () => 0

      const input = {
        learningItemId: 'item-123',
        userId: 'user-123',
      }

      const result = await calculateProgress.execute(input)

      expect(result.progress).toBe(0)
      expect(result.completedModules).toBe(0)
      expect(result.totalModules).toBe(0)
    })

    it('should throw error if learning item does not exist', async () => {
      const input = {
        learningItemId: 'non-existent',
        userId: 'user-123',
      }

      await expect(calculateProgress.execute(input)).rejects.toThrow(
        'Learning item with ID non-existent not found'
      )
    })

    it('should throw error if user does not own the learning item', async () => {
      const input = {
        learningItemId: 'item-123',
        userId: 'different-user',
      }

      await expect(calculateProgress.execute(input)).rejects.toThrow(
        'User does not own this learning item'
      )
    })

    it('should persist progress to repository', async () => {
      let updatedProgress: number | null = null

      mockLearningItemRepo.updateProgress = async (id, progress) => {
        updatedProgress = progress
        return progress
      }

      const input = {
        learningItemId: 'item-123',
        userId: 'user-123',
      }

      await calculateProgress.execute(input)

      expect(updatedProgress).toBe(50)
    })

    it('should calculate progress with 1 module completed out of 3', async () => {
      //mockModuleRepo.count = async () => 3
      //mockModuleRepo.countCompleted = async () => 1

      const input = {
        learningItemId: 'item-123',
        userId: 'user-123',
      }

      const result = await calculateProgress.execute(input)

      expect(result.progress).toBeCloseTo(33.33, 2)
      expect(result.completedModules).toBe(1)
      expect(result.totalModules).toBe(3)
    })

    it('should calculate progress with 7 modules completed out of 10', async () => {
      //mockModuleRepo.count = async () => 10
      //mockModuleRepo.countCompleted = async () => 7

      const input = {
        learningItemId: 'item-123',
        userId: 'user-123',
      }

      const result = await calculateProgress.execute(input)

      expect(result.progress).toBe(70)
      expect(result.completedModules).toBe(7)
      expect(result.totalModules).toBe(10)
    })
  })
})
