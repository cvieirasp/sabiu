import { describe, it, expect, beforeEach } from 'vitest'
import { GetLearningItem } from '../GetLearningItem'
import { LearningItem, Module } from '../../entities'
import { StatusVO, Progress } from '../../value-objects'
import type { LearningItemRepository } from '../../interfaces'

describe('GetLearningItem', () => {
  let getLearningItem: GetLearningItem
  let mockLearningItemRepo: LearningItemRepository
  let existingItem: LearningItem
  let existingItemWithModules: LearningItem

  beforeEach(() => {
    // Create existing learning item without modules
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

    // Create existing learning item with modules
    existingItemWithModules = LearningItem.create({
      id: 'item-456',
      title: 'Learn React',
      descriptionMD: 'Complete React course',
      dueDate: null,
      status: StatusVO.fromEmAndamento(),
      progress: Progress.create(50),
      userId: 'user-123',
      categoryId: null,
    })

    const modules = [
      Module.create({
        id: 'mod-1',
        learningItemId: 'item-456',
        title: 'Introduction',
        order: 1,
      }),
      Module.create({
        id: 'mod-2',
        learningItemId: 'item-456',
        title: 'Advanced',
        order: 2,
      }),
    ]

    existingItemWithModules.setModules(modules)

    // Mock repository
    mockLearningItemRepo = {
      findById: async (id: string, includeModules?: boolean) => {
        if (id === 'item-123') {
          return includeModules ? existingItem : existingItem
        }
        if (id === 'item-456') {
          return includeModules ? existingItemWithModules : existingItem
        }
        return null
      },
    } as Partial<LearningItemRepository> as LearningItemRepository

    getLearningItem = new GetLearningItem(mockLearningItemRepo)
  })

  describe('execute', () => {
    it('should get learning item without modules', async () => {
      const input = {
        id: 'item-123',
        userId: 'user-123',
        includeModules: false,
      }

      const result = await getLearningItem.execute(input)

      expect(result.learningItem).toBeDefined()
      expect(result.learningItem.id).toBe('item-123')
      expect(result.learningItem.title).toBe('Learn TypeScript')
    })

    it('should get learning item with modules', async () => {
      const input = {
        id: 'item-456',
        userId: 'user-123',
        includeModules: true,
      }

      const result = await getLearningItem.execute(input)

      expect(result.learningItem).toBeDefined()
      expect(result.learningItem.id).toBe('item-456')
      expect(result.learningItem.modules).toHaveLength(2)
    })

    it('should default includeModules to false if not provided', async () => {
      const input = {
        id: 'item-123',
        userId: 'user-123',
      }

      const result = await getLearningItem.execute(input)

      expect(result.learningItem).toBeDefined()
      expect(result.learningItem.id).toBe('item-123')
    })

    it('should throw error if learning item does not exist', async () => {
      const input = {
        id: 'non-existent',
        userId: 'user-123',
      }

      await expect(getLearningItem.execute(input)).rejects.toThrow(
        'Learning item with ID non-existent not found'
      )
    })

    it('should throw error if user does not own the learning item', async () => {
      const input = {
        id: 'item-123',
        userId: 'different-user',
      }

      await expect(getLearningItem.execute(input)).rejects.toThrow(
        'User does not own this learning item'
      )
    })

    it('should return learning item with all properties', async () => {
      const input = {
        id: 'item-123',
        userId: 'user-123',
      }

      const result = await getLearningItem.execute(input)

      expect(result.learningItem.title).toBe('Learn TypeScript')
      expect(result.learningItem.descriptionMD).toBe(
        'Complete TypeScript course'
      )
      expect(result.learningItem.userId).toBe('user-123')
      expect(result.learningItem.status.isBacklog()).toBe(true)
      expect(result.learningItem.progress.value).toBe(0)
    })
  })
})
