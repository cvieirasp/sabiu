import { describe, it, expect } from 'vitest'
import type { Category as PrismaCategory } from '@prisma/client'
import { CategoryMapper } from '@/infra/mappers/CategoryMapper'
import { Category } from '@/core'

describe('CategoryMapper', () => {
  describe('toDomain', () => {
    it('should convert Prisma model to domain entity', () => {
      const prismaModel: PrismaCategory = {
        id: 'cat-123',
        name: 'E-Learning',
        color: '#3B82F6',
      }

      const entity = CategoryMapper.toDomain(prismaModel)

      expect(entity.id).toBe('cat-123')
      expect(entity.name).toBe('E-Learning')
      expect(entity.color).toBe('#3B82F6')
    })
  })

  describe('toPrisma', () => {
    it('should convert domain entity to Prisma input', () => {
      const entity = {
        id: 'cat-123',
        name: 'E-Learning',
        color: '#3B82F6',
      }

      const prismaInput = CategoryMapper.toPrisma(entity as Category)

      expect(prismaInput.id).toBe('cat-123')
      expect(prismaInput.name).toBe('E-Learning')
      expect(prismaInput.color).toBe('#3B82F6')
    })
  })

  describe('batch operations', () => {
    it('should convert multiple Prisma models to domain entities', () => {
      const prismaModels: PrismaCategory[] = [
        {
          id: 'cat-1',
          name: 'E-Learning',
          color: '#3B82F6',
        },
        {
          id: 'cat-2',
          name: 'YouTube',
          color: '#FF5733',
        },
        {
          id: 'cat-3',
          name: 'Book',
          color: '#10B981',
        },
      ]

      const entities = CategoryMapper.toDomainMany(prismaModels)

      expect(entities).toHaveLength(3)
      expect(entities[0].name).toBe('E-Learning')
      expect(entities[1].name).toBe('YouTube')
      expect(entities[2].name).toBe('Book')
      expect(entities[0].color).toBe('#3B82F6')
      expect(entities[1].color).toBe('#FF5733')
      expect(entities[2].color).toBe('#10B981')
    })

    it('should convert multiple domain entities to Prisma inputs', () => {
      const entities = [
        {
          id: 'cat-1',
          name: 'E-Learning',
          color: '#3B82F6',
        },
        {
          id: 'cat-2',
          name: 'YouTube',
          color: '#FF5733',
        },
        {
          id: 'cat-3',
          name: 'Book',
          color: '#10B981',
        },
      ]

      const prismaInputs = CategoryMapper.toPrismaMany(entities as Category[])

      expect(prismaInputs).toHaveLength(3)
      expect(prismaInputs[0].name).toBe('E-Learning')
      expect(prismaInputs[1].name).toBe('YouTube')
      expect(prismaInputs[2].name).toBe('Book')
      expect(prismaInputs[0].color).toBe('#3B82F6')
      expect(prismaInputs[1].color).toBe('#FF5733')
      expect(prismaInputs[2].color).toBe('#10B981')
    })
  })
})
