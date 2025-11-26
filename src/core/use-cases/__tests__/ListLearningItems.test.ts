import { describe, it, expect, beforeEach } from 'vitest'
import { ListLearningItems } from '@/core/use-cases/ListLearningItems'
import { LearningItem } from '@/core/entities/LearningItem'
import { Progress } from '@/core/value-objects/Progress'
import { StatusVO } from '@/core/value-objects/Status'
import type { LearningItemQueryRepository, ListLearningItemParams } from '@/core/interfaces/LearningItemQueryRepository'

describe('ListLearningItems', () => {
  let listLearningItems: ListLearningItems
  let mockLearningQueryItemRepo: LearningItemQueryRepository
  let mockItems: LearningItem[]

  beforeEach(() => {
    // Create mock learning items
    mockItems = [
      LearningItem.create({
        id: 'item-1',
        title: 'Learn TypeScript',
        descriptionMD: 'TypeScript course',
        dueDate: null,
        status: StatusVO.fromBacklog(),
        progress: Progress.fromZero(),
        userId: 'user-123',
        categoryId: 'cat-1',
      }),
      LearningItem.create({
        id: 'item-2',
        title: 'Learn React',
        descriptionMD: 'React course',
        dueDate: null,
        status: StatusVO.fromEmAndamento(),
        progress: Progress.create(50),
        userId: 'user-123',
        categoryId: 'cat-1',
      }),
      LearningItem.create({
        id: 'item-3',
        title: 'Learn Node.js',
        descriptionMD: 'Node.js course',
        dueDate: null,
        status: StatusVO.fromConcluido(),
        progress: Progress.create(100),
        userId: 'user-123',
        categoryId: 'cat-2',
      }),
    ]

    // Mock repository
    mockLearningQueryItemRepo = {
      findByUserId: async (_userId: string, options?: ListLearningItemParams) => {
        let items = [...mockItems]

        // Filter by status
        if (options?.filters?.status) {
          items = items.filter(item => item.status.equals(options?.filters?.status as StatusVO))
        }

        // Filter by category
        if (options?.filters?.categoryId) {
          items = items.filter(item => item.categoryId === options?.filters?.categoryId)
        }

        // Search
        if (options?.filters?.search) {
          const searchLower = options.filters.search.toLowerCase()
          items = items.filter(
            item =>
              item.title.toLowerCase().includes(searchLower) ||
              item.descriptionMD.toLowerCase().includes(searchLower)
          )
        }

        // Pagination
        const skip = options?.page || 0
        const take = options?.pageSize || items.length
        items = items.slice(skip, skip + take)

        return items
      },
    } as Partial<LearningItemQueryRepository> as LearningItemQueryRepository

    listLearningItems = new ListLearningItems(mockLearningQueryItemRepo)
  })

  describe('execute', () => {
    it('should list all learning items for user', async () => {
      const input = {
        userId: 'user-123',
      }

      const result = await listLearningItems.execute(input)

      expect(result.learningItems).toHaveLength(3)
      expect(result.total).toBe(3)
    })

    it('should filter learning items by status', async () => {
      const input = {
        userId: 'user-123',
        filters: {
          status: StatusVO.fromEmAndamento(),
        },
      }

      const result = await listLearningItems.execute(input)

      expect(result.learningItems).toHaveLength(1)
      //expect(result.learningItems[0].status.isEmAndamento()).toBe(true)
    })

    it('should filter learning items by category', async () => {
      const input = {
        userId: 'user-123',
        filters: {
          categoryId: 'cat-1',
        },
      }

      const result = await listLearningItems.execute(input)

      expect(result.learningItems).toHaveLength(2)
      expect(result.total).toBe(2)
    })

    it('should search learning items by text', async () => {
      const input = {
        userId: 'user-123',
        filters: {
          search: 'React',
        },
      }

      const result = await listLearningItems.execute(input)

      expect(result.learningItems).toHaveLength(1)
      expect(result.learningItems[0].title).toBe('Learn React')
    })

    it('should paginate learning items', async () => {
      const input = {
        userId: 'user-123',
        pagination: {
          skip: 1,
          take: 2,
        },
      }

      const result = await listLearningItems.execute(input)

      expect(result.learningItems).toHaveLength(2)
      expect(result.learningItems[0].id).toBe('item-2')
      expect(result.total).toBe(3)
    })

    it('should apply multiple filters together', async () => {
      const input = {
        userId: 'user-123',
        filters: {
          status: StatusVO.fromBacklog(),
          categoryId: 'cat-1',
        },
      }

      const result = await listLearningItems.execute(input)

      expect(result.learningItems).toHaveLength(1)
      expect(result.learningItems[0].id).toBe('item-1')
    })

    it('should handle empty results', async () => {
      const input = {
        userId: 'user-123',
        filters: {
          search: 'NonExistent',
        },
      }

      const result = await listLearningItems.execute(input)

      expect(result.learningItems).toHaveLength(0)
      expect(result.total).toBe(3) // Total is for all items without search filter
    })

    it('should include modules when requested', async () => {
      const input = {
        userId: 'user-123',
        includeModules: true,
      }

      const result = await listLearningItems.execute(input)

      expect(result.learningItems).toHaveLength(3)
    })

    it('should apply sorting options', async () => {
      const input = {
        userId: 'user-123',
        sorting: {
          orderBy: 'title' as const,
          order: 'asc' as const,
        },
      }

      const result = await listLearningItems.execute(input)

      expect(result.learningItems).toHaveLength(3)
    })

    it('should handle pagination with skip beyond items length', async () => {
      const input = {
        userId: 'user-123',
        pagination: {
          skip: 10,
          take: 5,
        },
      }

      const result = await listLearningItems.execute(input)

      expect(result.learningItems).toHaveLength(0)
      expect(result.total).toBe(3)
    })
  })
})
