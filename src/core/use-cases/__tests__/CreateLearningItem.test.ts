import { describe, it, expect, beforeEach } from 'vitest'
import { CreateLearningItem } from '../CreateLearningItem'
import { LearningItem, Module } from '../../entities'
import { StatusVO } from '../../value-objects'
import type {
  LearningItemRepository,
  ModuleRepository,
  CategoryRepository,
} from '../../interfaces'

describe('CreateLearningItem', () => {
  let createLearningItem: CreateLearningItem
  let mockLearningItemRepo: LearningItemRepository
  let mockModuleRepo: ModuleRepository
  let mockCategoryRepo: CategoryRepository

  beforeEach(() => {
    // Mock repositories
    mockLearningItemRepo = {
      create: async (item: LearningItem) => item,
      updateProgress: async () => true,
    } as Partial<LearningItemRepository> as LearningItemRepository

    mockModuleRepo = {
      createMany: async (modules: Module[]) => modules,
    } as Partial<ModuleRepository> as ModuleRepository

    mockCategoryRepo = {
      findById: async (id: string) => {
        if (id === 'valid-category-id') {
          return { id, name: 'Test Category' } as unknown as any
        }
        return null
      },
    } as Partial<CategoryRepository> as CategoryRepository

    createLearningItem = new CreateLearningItem(
      mockLearningItemRepo,
      mockModuleRepo,
      mockCategoryRepo
    )
  })

  describe('execute', () => {
    it('should create a learning item without modules', async () => {
      const input = {
        title: 'Learn TypeScript',
        descriptionMD: 'Complete TypeScript course',
        userId: 'user-123',
      }

      const result = await createLearningItem.execute(input)

      expect(result.learningItem).toBeDefined()
      expect(result.learningItem.title).toBe('Learn TypeScript')
      expect(result.learningItem.descriptionMD).toBe('Complete TypeScript course')
      expect(result.learningItem.userId).toBe('user-123')
      expect(result.learningItem.progress.value).toBe(0)
      expect(result.modules).toHaveLength(0)
    })

    it('should create a learning item with modules', async () => {
      const input = {
        title: 'Learn React',
        descriptionMD: 'Complete React course',
        userId: 'user-123',
        modules: [
          { title: 'Introduction', order: 1 },
          { title: 'Components', order: 2 },
          { title: 'Hooks', order: 3 },
        ],
      }

      const result = await createLearningItem.execute(input)

      expect(result.learningItem).toBeDefined()
      expect(result.modules).toHaveLength(3)
      expect(result.modules[0].title).toBe('Introduction')
      expect(result.modules[1].title).toBe('Components')
      expect(result.modules[2].title).toBe('Hooks')
    })

    it('should create a learning item with custom status', async () => {
      const input = {
        title: 'Learn Node.js',
        descriptionMD: 'Complete Node.js course',
        userId: 'user-123',
        status: StatusVO.fromEmAndamento(),
      }

      const result = await createLearningItem.execute(input)

      expect(result.learningItem.status.isEmAndamento()).toBe(true)
    })

    it('should create a learning item with due date', async () => {
      const dueDate = new Date('2025-12-31')
      const input = {
        title: 'Learn GraphQL',
        descriptionMD: 'Complete GraphQL course',
        userId: 'user-123',
        dueDate,
      }

      const result = await createLearningItem.execute(input)

      expect(result.learningItem.dueDate).toEqual(dueDate)
    })

    it('should create a learning item with valid category', async () => {
      const input = {
        title: 'Learn PostgreSQL',
        descriptionMD: 'Complete PostgreSQL course',
        userId: 'user-123',
        categoryId: 'valid-category-id',
      }

      const result = await createLearningItem.execute(input)

      expect(result.learningItem.categoryId).toBe('valid-category-id')
    })

    it('should throw error if category does not exist', async () => {
      const input = {
        title: 'Learn MongoDB',
        descriptionMD: 'Complete MongoDB course',
        userId: 'user-123',
        categoryId: 'invalid-category-id',
      }

      await expect(createLearningItem.execute(input)).rejects.toThrow(
        'Category with ID invalid-category-id not found'
      )
    })

    it('should set default status to Backlog if not provided', async () => {
      const input = {
        title: 'Learn Docker',
        descriptionMD: 'Complete Docker course',
        userId: 'user-123',
      }

      const result = await createLearningItem.execute(input)

      expect(result.learningItem.status.isBacklog()).toBe(true)
    })

    it('should set initial progress to 0%', async () => {
      const input = {
        title: 'Learn Kubernetes',
        descriptionMD: 'Complete Kubernetes course',
        userId: 'user-123',
      }

      const result = await createLearningItem.execute(input)

      expect(result.learningItem.progress.value).toBe(0)
      expect(result.learningItem.progress.isZero()).toBe(true)
    })

    it('should throw error if title is empty', async () => {
      const input = {
        title: '',
        descriptionMD: 'Complete course',
        userId: 'user-123',
      }

      await expect(createLearningItem.execute(input)).rejects.toThrow()
    })

    it('should throw error if userId is empty', async () => {
      const input = {
        title: 'Learn AWS',
        descriptionMD: 'Complete AWS course',
        userId: '',
      }

      await expect(createLearningItem.execute(input)).rejects.toThrow()
    })
  })
})
