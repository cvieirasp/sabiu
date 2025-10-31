import { describe, it, expect, beforeEach } from 'vitest'
import { DeleteLearningItem } from '../DeleteLearningItem'
import { LearningItem } from '../../entities'
import { StatusVO, Progress } from '../../value-objects'
import type {
  LearningItemRepository,
  DependencyRepository,
} from '../../interfaces'

describe('DeleteLearningItem', () => {
  let deleteLearningItem: DeleteLearningItem
  let mockLearningItemRepo: LearningItemRepository
  let mockDependencyRepo: DependencyRepository
  let existingItem: LearningItem

  beforeEach(() => {
    // Create existing learning item
    existingItem = LearningItem.create({
      id: 'item-123',
      title: 'Learn TypeScript',
      descriptionMD: 'Complete TypeScript course',
      dueDate: null,
      status: StatusVO.fromBacklog(),
      progress: Progress.fromZero(),
      userId: 'user-123',
      categoryId: null,
    })

    // Mock repositories
    mockLearningItemRepo = {
      findById: async (id: string) => {
        if (id === 'item-123') return existingItem
        return null
      },
      delete: async () => true,
    } as Partial<LearningItemRepository> as LearningItemRepository

    mockDependencyRepo = {
      deleteByItemId: async () => 5, // Simulates deleting 5 dependencies
    } as Partial<DependencyRepository> as DependencyRepository

    deleteLearningItem = new DeleteLearningItem(
      mockLearningItemRepo,
      mockDependencyRepo
    )
  })

  describe('execute', () => {
    it('should delete learning item successfully', async () => {
      const input = {
        id: 'item-123',
        userId: 'user-123',
      }

      const result = await deleteLearningItem.execute(input)

      expect(result.success).toBe(true)
    })

    it('should throw error if learning item does not exist', async () => {
      const input = {
        id: 'non-existent',
        userId: 'user-123',
      }

      await expect(deleteLearningItem.execute(input)).rejects.toThrow(
        'Learning item with ID non-existent not found'
      )
    })

    it('should throw error if user does not own the learning item', async () => {
      const input = {
        id: 'item-123',
        userId: 'different-user',
      }

      await expect(deleteLearningItem.execute(input)).rejects.toThrow(
        'User does not own this learning item'
      )
    })

    it('should delete dependencies before deleting learning item', async () => {
      let dependenciesDeleted = false
      let itemDeleted = false

      mockDependencyRepo.deleteByItemId = async () => {
        dependenciesDeleted = true
        expect(itemDeleted).toBe(false) // Dependencies should be deleted first
        return 3
      }

      mockLearningItemRepo.delete = async () => {
        itemDeleted = true
        expect(dependenciesDeleted).toBe(true) // Dependencies should already be deleted
        return true
      }

      const input = {
        id: 'item-123',
        userId: 'user-123',
      }

      await deleteLearningItem.execute(input)

      expect(dependenciesDeleted).toBe(true)
      expect(itemDeleted).toBe(true)
    })

    it('should return success false if deletion fails', async () => {
      mockLearningItemRepo.delete = async () => false

      const input = {
        id: 'item-123',
        userId: 'user-123',
      }

      const result = await deleteLearningItem.execute(input)

      expect(result.success).toBe(false)
    })

    it('should handle items with no dependencies', async () => {
      mockDependencyRepo.deleteByItemId = async () => 0

      const input = {
        id: 'item-123',
        userId: 'user-123',
      }

      const result = await deleteLearningItem.execute(input)

      expect(result.success).toBe(true)
    })
  })
})
