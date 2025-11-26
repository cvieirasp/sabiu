import { describe, it, expect, beforeEach } from 'vitest'
import { LinkDependency } from '@/core/use-cases/LinkDependency'
import { Dependency } from '@/core/entities/Dependency'
import { LearningItem } from '@/core/entities/LearningItem'
import { Progress } from '@/core/value-objects/Progress'
import { StatusVO } from '@/core/value-objects/Status'
import type { DependencyRepository } from '@/core/interfaces/DependencyRepository'
import type { LearningItemRepository } from '@/core/interfaces/LearningItemRepository'

describe('LinkDependency', () => {
  let linkDependency: LinkDependency
  let mockDependencyRepo: DependencyRepository
  let mockLearningItemRepo: LearningItemRepository
  let sourceItem: LearningItem
  let targetItem: LearningItem

  beforeEach(() => {
    // Create learning items
    sourceItem = LearningItem.create({
      id: 'item-source',
      title: 'Learn React',
      descriptionMD: 'React course',
      dueDate: null,
      status: StatusVO.fromBacklog(),
      progress: Progress.fromZero(),
      userId: 'user-123',
      categoryId: 'cat-1',
    })

    targetItem = LearningItem.create({
      id: 'item-target',
      title: 'Learn JavaScript',
      descriptionMD: 'JavaScript course',
      dueDate: null,
      status: StatusVO.fromBacklog(),
      progress: Progress.fromZero(),
      userId: 'user-123',
      categoryId: 'cat-1',
    })

    // Mock repositories
    mockLearningItemRepo = {
      findById: async (id: string) => {
        if (id === 'item-source') return sourceItem
        if (id === 'item-target') return targetItem
        return null
      },
    } as Partial<LearningItemRepository> as LearningItemRepository

    mockDependencyRepo = {
      findBySourceAndTarget: async () => null,
      wouldCreateCycle: async () => false,
      create: async (dependency: Dependency) => dependency,
    } as Partial<DependencyRepository> as DependencyRepository

    linkDependency = new LinkDependency(
      mockDependencyRepo,
      mockLearningItemRepo
    )
  })

  describe('execute', () => {
    it('should create dependency between two learning items', async () => {
      const input = {
        sourceItemId: 'item-source',
        targetItemId: 'item-target',
        userId: 'user-123',
      }

      const result = await linkDependency.execute(input)

      expect(result.dependency).toBeDefined()
      expect(result.dependency.sourceItemId).toBe('item-source')
      expect(result.dependency.targetItemId).toBe('item-target')
    })

    it('should throw error if trying to create self-dependency', async () => {
      const input = {
        sourceItemId: 'item-source',
        targetItemId: 'item-source',
        userId: 'user-123',
      }

      await expect(linkDependency.execute(input)).rejects.toThrow(
        'Cannot create dependency to self'
      )
    })

    it('should throw error if source learning item does not exist', async () => {
      const input = {
        sourceItemId: 'non-existent',
        targetItemId: 'item-target',
        userId: 'user-123',
      }

      await expect(linkDependency.execute(input)).rejects.toThrow(
        'Source learning item with ID non-existent not found'
      )
    })

    it('should throw error if target learning item does not exist', async () => {
      const input = {
        sourceItemId: 'item-source',
        targetItemId: 'non-existent',
        userId: 'user-123',
      }

      await expect(linkDependency.execute(input)).rejects.toThrow(
        'Target learning item with ID non-existent not found'
      )
    })

    it('should throw error if user does not own source learning item', async () => {
      const differentUserItem = LearningItem.create({
        id: 'item-different',
        title: 'Learn Vue',
        descriptionMD: 'Vue course',
        dueDate: null,
        status: StatusVO.fromBacklog(),
        progress: Progress.fromZero(),
        userId: 'different-user',
        categoryId: 'cat-1',
      })

      mockLearningItemRepo.findById = async (id: string) => {
        if (id === 'item-different') return differentUserItem
        if (id === 'item-target') return targetItem
        return null
      }

      const input = {
        sourceItemId: 'item-different',
        targetItemId: 'item-target',
        userId: 'user-123',
      }

      await expect(linkDependency.execute(input)).rejects.toThrow(
        'User does not own the source learning item'
      )
    })

    it('should throw error if user does not own target learning item', async () => {
      const differentUserItem = LearningItem.create({
        id: 'item-different',
        title: 'Learn Vue',
        descriptionMD: 'Vue course',
        dueDate: null,
        status: StatusVO.fromBacklog(),
        progress: Progress.fromZero(),
        userId: 'different-user',
        categoryId: 'cat-1',
      })

      mockLearningItemRepo.findById = async (id: string) => {
        if (id === 'item-source') return sourceItem
        if (id === 'item-different') return differentUserItem
        return null
      }

      const input = {
        sourceItemId: 'item-source',
        targetItemId: 'item-different',
        userId: 'user-123',
      }

      await expect(linkDependency.execute(input)).rejects.toThrow(
        'User does not own the target learning item'
      )
    })

    it('should throw error if dependency already exists', async () => {
      /*const existingDependency = Dependency.create({
        id: 'dep-1',
        sourceItemId: 'item-source',
        targetItemId: 'item-target',
      })

      mockDependencyRepo.findBySourceAndTarget = async () => existingDependency
      */

      const input = {
        sourceItemId: 'item-source',
        targetItemId: 'item-target',
        userId: 'user-123',
      }

      await expect(linkDependency.execute(input)).rejects.toThrow(
        'Dependency already exists between these learning items'
      )
    })

    it('should throw error if creating dependency would create circular reference', async () => {
      mockDependencyRepo.wouldCreateCycle = async () => true

      const input = {
        sourceItemId: 'item-source',
        targetItemId: 'item-target',
        userId: 'user-123',
      }

      await expect(linkDependency.execute(input)).rejects.toThrow(
        'Cannot create dependency: would create circular dependency'
      )
    })

    it('should validate all conditions before creating dependency', async () => {
      let dependencyCreated = false

      mockDependencyRepo.create = async (dependency: Dependency) => {
        dependencyCreated = true
        return dependency
      }

      const input = {
        sourceItemId: 'item-source',
        targetItemId: 'item-target',
        userId: 'user-123',
      }

      await linkDependency.execute(input)

      expect(dependencyCreated).toBe(true)
    })

    it('should generate unique ID for dependency', async () => {
      const input = {
        sourceItemId: 'item-source',
        targetItemId: 'item-target',
        userId: 'user-123',
      }

      const result = await linkDependency.execute(input)

      expect(result.dependency.id).toBeDefined()
      expect(result.dependency.id).toMatch(/^temp_/)
    })
  })
})
