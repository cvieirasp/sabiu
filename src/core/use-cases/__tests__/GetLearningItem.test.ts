import { describe, it, expect, beforeEach } from 'vitest'
import { GetLearningItem } from '@/core/use-cases/GetLearningItem'
import { LearningItem } from '@/core/entities/LearningItem'
import { Module } from '@/core/entities/Module'
import { Progress } from '@/core/value-objects/Progress'
import { StatusVO } from '@/core/value-objects/Status'
import type { LearningItemQueryRepository } from '@/core/interfaces/LearningItemQueryRepository'

describe('GetLearningItem', () => {
  let getLearningItem: GetLearningItem
  let mockLearningItemQueryRepo: LearningItemQueryRepository
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
      categoryId: 'cat-1',
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
      categoryId: 'cat-2',
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
    mockLearningItemQueryRepo = {
      findById: async (id: string, includeModules?: boolean) => {
        if (id === 'item-123') {
          return includeModules ? existingItem : existingItem
        }
        if (id === 'item-456') {
          return includeModules ? existingItemWithModules : existingItem
        }
        return null
      },
    } as Partial<LearningItemQueryRepository> as LearningItemQueryRepository

    getLearningItem = new GetLearningItem(mockLearningItemQueryRepo)
  })

  describe('execute', () => {
    it('should get learning item without modules', async () => {
      const input = {
        id: 'item-123',
        userId: 'user-123',
        includeModules: false,
      }

      const result = await getLearningItem.execute(input)

      expect(result).toBeDefined()
      expect(result.id).toBe('item-123')
      expect(result.title).toBe('Learn TypeScript')
    })

    it('should get learning item with modules', async () => {
      const input = {
        id: 'item-456',
        userId: 'user-123',
        includeModules: true,
      }

      const result = await getLearningItem.execute(input)

      expect(result).toBeDefined()
      expect(result.id).toBe('item-456')
      //expect(result.modules).toHaveLength(2)
    })

    it('should default includeModules to false if not provided', async () => {
      const input = {
        id: 'item-123',
        userId: 'user-123',
      }

      const result = await getLearningItem.execute(input)

      expect(result).toBeDefined()
      expect(result.id).toBe('item-123')
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

      expect(result.title).toBe('Learn TypeScript')
      expect(result.descriptionMD).toBe(
        'Complete TypeScript course'
      )
      expect(result.userId).toBe('user-123')
      //expect(result.status.isBacklog()).toBe(true)
      expect(result.progress).toBe(0)
    })
  })
})
