import { describe, it, expect } from 'vitest'
import type { Category as PrismaCategory } from '@prisma/client'
import { CategoryMapper } from '../CategoryMapper'

describe('CategoryMapper', () => {
  describe('toDomain', () => {
    it('should convert Prisma model to domain entity', () => {
      const prismaModel: PrismaCategory = {
        id: 'cat-123',
        name: 'Programming',
        color: '#3B82F6',
      }

      const entity = CategoryMapper.toDomain(prismaModel)

      expect(entity.id).toBe('cat-123')
      expect(entity.name).toBe('Programming')
      expect(entity.color).toBe('#3B82F6')
    })

    it('should handle different color formats', () => {
      const prismaModel: PrismaCategory = {
        id: 'cat-456',
        name: 'Design',
        color: '#FF5733',
      }

      const entity = CategoryMapper.toDomain(prismaModel)

      expect(entity.color).toBe('#FF5733')
    })

    it('should preserve category names with spaces and special characters', () => {
      const prismaModel: PrismaCategory = {
        id: 'cat-789',
        name: 'Web Development & Design',
        color: '#10B981',
      }

      const entity = CategoryMapper.toDomain(prismaModel)

      expect(entity.name).toBe('Web Development & Design')
    })
  })

  describe('toPrisma', () => {
    it('should convert domain entity to Prisma input', () => {
      const entity = {
        id: 'cat-123',
        name: 'Programming',
        color: '#3B82F6',
        updateName: () => {},
        updateColor: () => {},
        equals: () => false,
        toObject: () => ({}) as any,
      }

      const prismaInput = CategoryMapper.toPrisma(entity as any)

      expect(prismaInput.id).toBe('cat-123')
      expect(prismaInput.name).toBe('Programming')
      expect(prismaInput.color).toBe('#3B82F6')
    })

    it('should preserve all fields including timestamps', () => {
      const entity = {
        id: 'cat-456',
        name: 'Design',
        color: '#FF5733',
      }

      const prismaInput = CategoryMapper.toPrisma(entity as any)

      // Category doesn't have createdAt/updatedAt, so all fields are preserved
      expect(prismaInput).toEqual({
        id: 'cat-456',
        name: 'Design',
        color: '#FF5733',
      })
    })
  })

  describe('batch operations', () => {
    it('should convert multiple Prisma models to domain entities', () => {
      const prismaModels: PrismaCategory[] = [
        {
          id: 'cat-1',
          name: 'Programming',
          color: '#3B82F6',
        },
        {
          id: 'cat-2',
          name: 'Design',
          color: '#FF5733',
        },
        {
          id: 'cat-3',
          name: 'Business',
          color: '#10B981',
        },
      ]

      const entities = CategoryMapper.toDomainMany(prismaModels)

      expect(entities).toHaveLength(3)
      expect(entities[0].name).toBe('Programming')
      expect(entities[1].name).toBe('Design')
      expect(entities[2].name).toBe('Business')
      expect(entities[0].color).toBe('#3B82F6')
      expect(entities[1].color).toBe('#FF5733')
      expect(entities[2].color).toBe('#10B981')
    })

    it('should convert multiple domain entities to Prisma inputs', () => {
      const entities = [
        {
          id: 'cat-1',
          name: 'Programming',
          color: '#3B82F6',
        },
        {
          id: 'cat-2',
          name: 'Design',
          color: '#FF5733',
        },
      ]

      const prismaInputs = CategoryMapper.toPrismaMany(entities as any)

      expect(prismaInputs).toHaveLength(2)
      expect(prismaInputs[0].name).toBe('Programming')
      expect(prismaInputs[1].name).toBe('Design')
    })
  })
})
