import { describe, it, expect } from 'vitest'
import type { Module as PrismaModule } from '@prisma/client'
import { ModuleMapper } from '../ModuleMapper'
import { ModuleStatusVO } from '@/core/value-objects'

describe('ModuleMapper', () => {
  describe('toDomain', () => {
    it('should convert Prisma model to domain entity', () => {
      const prismaModel: PrismaModule = {
        id: 'mod-123',
        learningItemId: 'item-123',
        title: 'Introduction to TypeScript',
        status: 'Pendente',
        order: 1,
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-02'),
      }

      const entity = ModuleMapper.toDomain(prismaModel)

      expect(entity.id).toBe('mod-123')
      expect(entity.learningItemId).toBe('item-123')
      expect(entity.title).toBe('Introduction to TypeScript')
      expect(entity.status.isPendente()).toBe(true)
      expect(entity.order).toBe(1)
      expect(entity.createdAt).toEqual(new Date('2025-01-01'))
      expect(entity.updatedAt).toEqual(new Date('2025-01-02'))
    })

    it('should map all status values correctly', () => {
      const baseModel: PrismaModule = {
        id: 'mod-123',
        learningItemId: 'item-123',
        title: 'Test Module',
        status: 'Pendente',
        order: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const pendente = ModuleMapper.toDomain({
        ...baseModel,
        status: 'Pendente',
      })
      expect(pendente.status.isPendente()).toBe(true)

      const emAndamento = ModuleMapper.toDomain({
        ...baseModel,
        status: 'Em_Andamento',
      })
      expect(emAndamento.status.isEmAndamento()).toBe(true)

      const concluido = ModuleMapper.toDomain({
        ...baseModel,
        status: 'Concluido',
      })
      expect(concluido.status.isConcluido()).toBe(true)
    })

    it('should handle different order values', () => {
      const prismaModel: PrismaModule = {
        id: 'mod-123',
        learningItemId: 'item-123',
        title: 'Module 10',
        status: 'Pendente',
        order: 10,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const entity = ModuleMapper.toDomain(prismaModel)

      expect(entity.order).toBe(10)
    })
  })

  describe('toPrisma', () => {
    it('should convert domain entity to Prisma input', () => {
      const entity = {
        id: 'mod-123',
        learningItemId: 'item-123',
        title: 'Introduction to TypeScript',
        status: ModuleStatusVO.fromPendente(),
        order: 1,
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-02'),
        updateTitle: () => {},
        updateStatus: () => {},
        updateOrder: () => {},
        markAsPendente: () => {},
        markAsEmAndamento: () => {},
        markAsConcluido: () => {},
        isPendente: () => true,
        isEmAndamento: () => false,
        isConcluido: () => false,
        equals: () => false,
        toObject: () => ({}) as any,
      }

      const prismaInput = ModuleMapper.toPrisma(entity as any)

      expect(prismaInput.id).toBe('mod-123')
      expect(prismaInput.learningItemId).toBe('item-123')
      expect(prismaInput.title).toBe('Introduction to TypeScript')
      expect(prismaInput.status).toBe('Pendente')
      expect(prismaInput.order).toBe(1)
      expect(prismaInput).not.toHaveProperty('createdAt')
      expect(prismaInput).not.toHaveProperty('updatedAt')
    })

    it('should map all status values correctly to Prisma enums', () => {
      const baseEntity = {
        id: 'mod-123',
        learningItemId: 'item-123',
        title: 'Test Module',
        status: ModuleStatusVO.fromPendente(),
        order: 1,
        createdAt: new Date(),
      }

      const pendente = ModuleMapper.toPrisma({
        ...baseEntity,
        status: ModuleStatusVO.fromPendente(),
      } as any)
      expect(pendente.status).toBe('Pendente')

      const emAndamento = ModuleMapper.toPrisma({
        ...baseEntity,
        status: ModuleStatusVO.fromEmAndamento(),
      } as any)
      expect(emAndamento.status).toBe('Em_Andamento')

      const concluido = ModuleMapper.toPrisma({
        ...baseEntity,
        status: ModuleStatusVO.fromConcluido(),
      } as any)
      expect(concluido.status).toBe('Concluido')
    })
  })

  describe('batch operations', () => {
    it('should convert multiple Prisma models to domain entities', () => {
      const prismaModels: PrismaModule[] = [
        {
          id: 'mod-1',
          learningItemId: 'item-123',
          title: 'Module 1',
          status: 'Pendente',
          order: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'mod-2',
          learningItemId: 'item-123',
          title: 'Module 2',
          status: 'Em_Andamento',
          order: 2,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'mod-3',
          learningItemId: 'item-123',
          title: 'Module 3',
          status: 'Concluido',
          order: 3,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      const entities = ModuleMapper.toDomainMany(prismaModels)

      expect(entities).toHaveLength(3)
      expect(entities[0].title).toBe('Module 1')
      expect(entities[1].title).toBe('Module 2')
      expect(entities[2].title).toBe('Module 3')
      expect(entities[0].status.isPendente()).toBe(true)
      expect(entities[1].status.isEmAndamento()).toBe(true)
      expect(entities[2].status.isConcluido()).toBe(true)
    })
  })
})
