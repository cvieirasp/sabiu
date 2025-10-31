import { describe, it, expect, beforeEach } from 'vitest'
import { UpdateLearningItem } from '../UpdateLearningItem'
import { LearningItem, Module } from '../../entities'
import { StatusVO, Progress } from '../../value-objects'
import type {
  LearningItemRepository,
  ModuleRepository,
  CategoryRepository,
} from '../../interfaces'

describe('UpdateLearningItem', () => {
  let updateLearningItem: UpdateLearningItem
  let mockLearningItemRepo: LearningItemRepository
  let mockModuleRepo: ModuleRepository
  let mockCategoryRepo: CategoryRepository
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
      update: async (item: LearningItem) => item,
    } as Partial<LearningItemRepository> as LearningItemRepository

    mockModuleRepo = {
      findByLearningItemId: async () => [],
    } as Partial<ModuleRepository> as ModuleRepository

    mockCategoryRepo = {
      findById: async (id: string) => {
        if (id === 'valid-category-id') {
          return { id, name: 'Test Category' } as unknown as any
        }
        return null
      },
    } as Partial<CategoryRepository> as CategoryRepository

    updateLearningItem = new UpdateLearningItem(
      mockLearningItemRepo,
      mockModuleRepo,
      mockCategoryRepo
    )
  })

  describe('execute', () => {
    it('should update learning item title', async () => {
      const input = {
        id: 'item-123',
        userId: 'user-123',
        title: 'Learn Advanced TypeScript',
      }

      const result = await updateLearningItem.execute(input)

      expect(result.learningItem.title).toBe('Learn Advanced TypeScript')
    })

    it('should update learning item description', async () => {
      const input = {
        id: 'item-123',
        userId: 'user-123',
        descriptionMD: 'Updated description',
      }

      const result = await updateLearningItem.execute(input)

      expect(result.learningItem.descriptionMD).toBe('Updated description')
    })

    it('should update learning item status', async () => {
      const input = {
        id: 'item-123',
        userId: 'user-123',
        status: StatusVO.fromEmAndamento(),
      }

      const result = await updateLearningItem.execute(input)

      expect(result.learningItem.status.isEmAndamento()).toBe(true)
    })

    it('should update learning item due date', async () => {
      const dueDate = new Date('2025-12-31')
      const input = {
        id: 'item-123',
        userId: 'user-123',
        dueDate,
      }

      const result = await updateLearningItem.execute(input)

      expect(result.learningItem.dueDate).toEqual(dueDate)
    })

    it('should clear due date when set to null', async () => {
      const input = {
        id: 'item-123',
        userId: 'user-123',
        dueDate: null,
      }

      const result = await updateLearningItem.execute(input)

      expect(result.learningItem.dueDate).toBeNull()
    })

    it('should update learning item category', async () => {
      const input = {
        id: 'item-123',
        userId: 'user-123',
        categoryId: 'valid-category-id',
      }

      const result = await updateLearningItem.execute(input)

      expect(result.learningItem.categoryId).toBe('valid-category-id')
    })

    it('should clear category when set to null', async () => {
      const input = {
        id: 'item-123',
        userId: 'user-123',
        categoryId: null,
      }

      const result = await updateLearningItem.execute(input)

      expect(result.learningItem.categoryId).toBeNull()
    })

    it('should update multiple fields at once', async () => {
      const dueDate = new Date('2025-12-31')
      const input = {
        id: 'item-123',
        userId: 'user-123',
        title: 'Updated Title',
        descriptionMD: 'Updated Description',
        status: StatusVO.fromEmAndamento(),
        dueDate,
        categoryId: 'valid-category-id',
      }

      const result = await updateLearningItem.execute(input)

      expect(result.learningItem.title).toBe('Updated Title')
      expect(result.learningItem.descriptionMD).toBe('Updated Description')
      expect(result.learningItem.status.isEmAndamento()).toBe(true)
      expect(result.learningItem.dueDate).toEqual(dueDate)
      expect(result.learningItem.categoryId).toBe('valid-category-id')
    })

    it('should throw error if learning item does not exist', async () => {
      const input = {
        id: 'non-existent',
        userId: 'user-123',
        title: 'Updated Title',
      }

      await expect(updateLearningItem.execute(input)).rejects.toThrow(
        'Learning item with ID non-existent not found'
      )
    })

    it('should throw error if user does not own the learning item', async () => {
      const input = {
        id: 'item-123',
        userId: 'different-user',
        title: 'Updated Title',
      }

      await expect(updateLearningItem.execute(input)).rejects.toThrow(
        'User does not own this learning item'
      )
    })

    it('should throw error if category does not exist', async () => {
      const input = {
        id: 'item-123',
        userId: 'user-123',
        categoryId: 'invalid-category-id',
      }

      await expect(updateLearningItem.execute(input)).rejects.toThrow(
        'Category with ID invalid-category-id not found'
      )
    })

    it('should not update fields that are not provided', async () => {
      const originalTitle = existingItem.title
      const originalDescription = existingItem.descriptionMD

      const input = {
        id: 'item-123',
        userId: 'user-123',
        status: StatusVO.fromEmAndamento(),
      }

      const result = await updateLearningItem.execute(input)

      expect(result.learningItem.title).toBe(originalTitle)
      expect(result.learningItem.descriptionMD).toBe(originalDescription)
      expect(result.learningItem.status.isEmAndamento()).toBe(true)
    })

    it('should recalculate progress when modules exist', async () => {
      const modules = [
        Module.create({
          id: 'mod-1',
          learningItemId: 'item-123',
          title: 'Module 1',
          order: 1,
        }),
        Module.create({
          id: 'mod-2',
          learningItemId: 'item-123',
          title: 'Module 2',
          order: 2,
        }),
      ]

      modules[0].markAsConcluido()

      mockModuleRepo.findByLearningItemId = async () => modules

      const input = {
        id: 'item-123',
        userId: 'user-123',
        title: 'Updated with modules',
      }

      const result = await updateLearningItem.execute(input)

      expect(result.learningItem.progress.value).toBe(50) // 1 of 2 modules completed
    })
  })
})
