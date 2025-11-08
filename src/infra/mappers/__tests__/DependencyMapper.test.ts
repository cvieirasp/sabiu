import { describe, it, expect } from 'vitest'
import type { Dependency as PrismaDependency } from '@prisma/client'
import { DependencyMapper } from '../DependencyMapper'

describe('DependencyMapper', () => {
  describe('toDomain', () => {
    it('should convert Prisma model to domain entity', () => {
      const prismaModel: PrismaDependency = {
        id: 'dep-123',
        sourceItemId: 'item-source',
        targetItemId: 'item-target',
        createdAt: new Date('2025-01-01'),
      }

      const entity = DependencyMapper.toDomain(prismaModel)

      expect(entity.id).toBe('dep-123')
      expect(entity.sourceItemId).toBe('item-source')
      expect(entity.targetItemId).toBe('item-target')
      expect(entity.createdAt).toEqual(new Date('2025-01-01'))
    })

    it('should handle different item IDs', () => {
      const prismaModel: PrismaDependency = {
        id: 'dep-456',
        sourceItemId: 'react-basics',
        targetItemId: 'javascript-fundamentals',
        createdAt: new Date('2025-02-15'),
      }

      const entity = DependencyMapper.toDomain(prismaModel)

      expect(entity.sourceItemId).toBe('react-basics')
      expect(entity.targetItemId).toBe('javascript-fundamentals')
    })
  })

  describe('toPrisma', () => {
    it('should convert domain entity to Prisma input', () => {
      const entity = {
        id: 'dep-123',
        sourceItemId: 'item-source',
        targetItemId: 'item-target',
        createdAt: new Date('2025-01-01'),
        isSelfDependency: () => false,
        wouldCreateCircularDependency: () => false,
        equals: () => false,
        isSameRelationship: () => false,
        toObject: () => ({}) as any,
      }

      const prismaInput = DependencyMapper.toPrisma(entity as any)

      expect(prismaInput.id).toBe('dep-123')
      expect(prismaInput.sourceItemId).toBe('item-source')
      expect(prismaInput.targetItemId).toBe('item-target')
      expect(prismaInput).not.toHaveProperty('createdAt')
    })
  })

  describe('batch operations', () => {
    it('should convert multiple Prisma models to domain entities', () => {
      const prismaModels: PrismaDependency[] = [
        {
          id: 'dep-1',
          sourceItemId: 'item-1',
          targetItemId: 'item-2',
          createdAt: new Date('2025-01-01'),
        },
        {
          id: 'dep-2',
          sourceItemId: 'item-2',
          targetItemId: 'item-3',
          createdAt: new Date('2025-01-02'),
        },
        {
          id: 'dep-3',
          sourceItemId: 'item-1',
          targetItemId: 'item-3',
          createdAt: new Date('2025-01-03'),
        },
      ]

      const entities = DependencyMapper.toDomainMany(prismaModels)

      expect(entities).toHaveLength(3)
      expect(entities[0].sourceItemId).toBe('item-1')
      expect(entities[0].targetItemId).toBe('item-2')
      expect(entities[1].sourceItemId).toBe('item-2')
      expect(entities[1].targetItemId).toBe('item-3')
      expect(entities[2].sourceItemId).toBe('item-1')
      expect(entities[2].targetItemId).toBe('item-3')
    })

    it('should convert multiple domain entities to Prisma inputs', () => {
      const entities = [
        {
          id: 'dep-1',
          sourceItemId: 'item-1',
          targetItemId: 'item-2',
          createdAt: new Date(),
        },
        {
          id: 'dep-2',
          sourceItemId: 'item-2',
          targetItemId: 'item-3',
          createdAt: new Date(),
        },
      ]

      const prismaInputs = DependencyMapper.toPrismaMany(entities as any)

      expect(prismaInputs).toHaveLength(2)
      expect(prismaInputs[0].id).toBe('dep-1')
      expect(prismaInputs[1].id).toBe('dep-2')
      expect(prismaInputs[0]).not.toHaveProperty('createdAt')
      expect(prismaInputs[1]).not.toHaveProperty('createdAt')
    })
  })
})
