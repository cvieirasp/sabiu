import { describe, it, expect } from 'vitest'
import type { Tag as PrismaTag } from '@prisma/client'
import { TagMapper } from '@/infra/mappers/TagMapper'
import { Tag } from '@/core'

describe('TagMapper', () => {
  describe('toDomain', () => {
    it('should convert Prisma model to domain entity', () => {
      const prismaModel: PrismaTag = {
        id: 'tag-123',
        name: 'typescript',
      }

      const entity = TagMapper.toDomain(prismaModel)

      expect(entity.id).toBe('tag-123')
      expect(entity.name).toBe('typescript')
    })

    it('should handle tags with different naming conventions', () => {
      const prismaModel: PrismaTag = {
        id: 'tag-456',
        name: 'web-development',
      }

      const entity = TagMapper.toDomain(prismaModel)

      expect(entity.name).toBe('web-development')
    })

    it('should handle lowercase tag names', () => {
      const prismaModel: PrismaTag = {
        id: 'tag-789',
        name: 'machine-learning',
      }

      const entity = TagMapper.toDomain(prismaModel)

      expect(entity.name).toBe('machine-learning')
    })
  })

  describe('toPrisma', () => {
    it('should convert domain entity to Prisma input', () => {
      const entity = {
        id: 'tag-123',
        name: 'typescript',
      }

      const prismaInput = TagMapper.toPrisma(entity as Tag)

      expect(prismaInput.id).toBe('tag-123')
      expect(prismaInput.name).toBe('typescript')
    })

    it('should preserve normalized names', () => {
      const entity = {
        id: 'tag-456',
        name: 'web-development',
      }

      const prismaInput = TagMapper.toPrisma(entity as Tag)

      expect(prismaInput.name).toBe('web-development')
    })
  })

  describe('batch operations', () => {
    it('should convert multiple Prisma models to domain entities', () => {
      const prismaModels: PrismaTag[] = [
        { id: 'tag-1', name: 'typescript' },
        { id: 'tag-2', name: 'react' },
        { id: 'tag-3', name: 'nodejs' },
        { id: 'tag-4', name: 'graphql' },
      ]

      const entities = TagMapper.toDomainMany(prismaModels)

      expect(entities).toHaveLength(4)
      expect(entities[0].name).toBe('typescript')
      expect(entities[1].name).toBe('react')
      expect(entities[2].name).toBe('nodejs')
      expect(entities[3].name).toBe('graphql')
    })

    it('should convert multiple domain entities to Prisma inputs', () => {
      const entities = [
        { id: 'tag-1', name: 'typescript' },
        { id: 'tag-2', name: 'react' },
        { id: 'tag-3', name: 'nodejs' },
      ]

      const prismaInputs = TagMapper.toPrismaMany(entities as Tag[])

      expect(prismaInputs).toHaveLength(3)
      expect(prismaInputs[0].name).toBe('typescript')
      expect(prismaInputs[1].name).toBe('react')
      expect(prismaInputs[2].name).toBe('nodejs')
    })

    it('should handle empty arrays', () => {
      const entities = TagMapper.toDomainMany([])
      expect(entities).toHaveLength(0)

      const prismaInputs = TagMapper.toPrismaMany([])
      expect(prismaInputs).toHaveLength(0)
    })
  })
})
