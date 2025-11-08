import { describe, it, expect } from 'vitest'
import type {
  LearningItem as PrismaLearningItem,
  Module as PrismaModule,
} from '@prisma/client'
import { LearningItemMapper } from '../LearningItemMapper'
import { StatusVO, Progress } from '@/core/value-objects'

describe('LearningItemMapper', () => {
  describe('toDomain', () => {
    it('should convert Prisma model to domain entity', () => {
      const prismaModel: PrismaLearningItem = {
        id: 'item-123',
        title: 'Learn TypeScript',
        descriptionMD: 'Complete TypeScript course',
        dueDate: new Date('2026-12-31'),
        status: 'Backlog',
        progressCached: 0,
        userId: 'user-123',
        categoryId: 'cat-123',
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-02'),
      }

      const entity = LearningItemMapper.toDomain(prismaModel)

      expect(entity.id).toBe('item-123')
      expect(entity.title).toBe('Learn TypeScript')
      expect(entity.descriptionMD).toBe('Complete TypeScript course')
      expect(entity.dueDate).toEqual(new Date('2026-12-31'))
      expect(entity.status.isBacklog()).toBe(true)
      expect(entity.progress.value).toBe(0)
      expect(entity.userId).toBe('user-123')
      expect(entity.categoryId).toBe('cat-123')
    })

    it('should map all status values correctly', () => {
      const baseModel: PrismaLearningItem = {
        id: 'item-123',
        title: 'Test',
        descriptionMD: 'Test',
        dueDate: null,
        status: 'Backlog',
        progressCached: 0,
        userId: 'user-123',
        categoryId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const backlog = LearningItemMapper.toDomain({
        ...baseModel,
        status: 'Backlog',
      })
      expect(backlog.status.isBacklog()).toBe(true)

      const emAndamento = LearningItemMapper.toDomain({
        ...baseModel,
        status: 'Em_Andamento',
      })
      expect(emAndamento.status.isEmAndamento()).toBe(true)

      const pausado = LearningItemMapper.toDomain({
        ...baseModel,
        status: 'Pausado',
      })
      expect(pausado.status.isPausado()).toBe(true)

      const concluido = LearningItemMapper.toDomain({
        ...baseModel,
        status: 'Concluido',
      })
      expect(concluido.status.isConcluido()).toBe(true)
    })

    it('should handle null optional fields', () => {
      const prismaModel: PrismaLearningItem = {
        id: 'item-123',
        title: 'Test',
        descriptionMD: 'Test description',
        dueDate: null,
        status: 'Backlog',
        progressCached: 50,
        userId: 'user-123',
        categoryId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const entity = LearningItemMapper.toDomain(prismaModel)

      expect(entity.dueDate).toBeNull()
      expect(entity.categoryId).toBeNull()
      expect(entity.progress.value).toBe(50)
    })

    it('should convert and set modules when included', () => {
      const modules: PrismaModule[] = [
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
          status: 'Concluido',
          order: 2,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      const prismaModel: PrismaLearningItem & { modules: PrismaModule[] } = {
        id: 'item-123',
        title: 'Test',
        descriptionMD: 'Test',
        dueDate: null,
        status: 'Em_Andamento',
        progressCached: 50,
        userId: 'user-123',
        categoryId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        modules,
      }

      const entity = LearningItemMapper.toDomain(prismaModel)

      expect(entity.modules).toHaveLength(2)
      expect(entity.modules[0].title).toBe('Module 1')
      expect(entity.modules[1].title).toBe('Module 2')
      expect(entity.progress.value).toBe(50) // Progress calculated from modules
    })
  })

  describe('toPrisma', () => {
    it('should convert domain entity to Prisma input', () => {
      const entity = {
        id: 'item-123',
        title: 'Learn TypeScript',
        descriptionMD: 'Complete TypeScript course',
        dueDate: new Date('2026-12-31'),
        status: StatusVO.fromBacklog(),
        progress: Progress.create(25),
        userId: 'user-123',
        categoryId: 'cat-123',
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-02'),
        modules: [],
        setModules: () => {},
        addModule: () => {},
        removeModule: () => {},
        updateModule: () => {},
        recalculateProgress: () => {},
        updateTitle: () => {},
        updateDescription: () => {},
        updateDueDate: () => {},
        updateStatus: () => {},
        updateCategory: () => {},
        isOverdue: () => false,
        isDueSoon: () => false,
        equals: () => false,
        toObject: () => ({}) as any,
      }

      const prismaInput = LearningItemMapper.toPrisma(entity as any)

      expect(prismaInput.id).toBe('item-123')
      expect(prismaInput.title).toBe('Learn TypeScript')
      expect(prismaInput.descriptionMD).toBe('Complete TypeScript course')
      expect(prismaInput.dueDate).toEqual(new Date('2026-12-31'))
      expect(prismaInput.status).toBe('Backlog')
      expect(prismaInput.progressCached).toBe(25)
      expect(prismaInput.userId).toBe('user-123')
      expect(prismaInput.categoryId).toBe('cat-123')
      expect(prismaInput).not.toHaveProperty('createdAt')
      expect(prismaInput).not.toHaveProperty('updatedAt')
    })

    it('should map all status values correctly to Prisma enums', () => {
      const baseEntity = {
        id: 'item-123',
        title: 'Test',
        descriptionMD: 'Test',
        dueDate: null,
        status: StatusVO.fromBacklog(),
        progress: Progress.create(0),
        userId: 'user-123',
        categoryId: null,
        createdAt: new Date(),
        modules: [],
      }

      const backlog = LearningItemMapper.toPrisma({
        ...baseEntity,
        status: StatusVO.fromBacklog(),
      } as any)
      expect(backlog.status).toBe('Backlog')

      const emAndamento = LearningItemMapper.toPrisma({
        ...baseEntity,
        status: StatusVO.fromEmAndamento(),
      } as any)
      expect(emAndamento.status).toBe('Em_Andamento')

      const pausado = LearningItemMapper.toPrisma({
        ...baseEntity,
        status: StatusVO.fromPausado(),
      } as any)
      expect(pausado.status).toBe('Pausado')

      const concluido = LearningItemMapper.toPrisma({
        ...baseEntity,
        status: StatusVO.fromConcluido(),
      } as any)
      expect(concluido.status).toBe('Concluido')
    })
  })

  describe('batch operations', () => {
    it('should convert multiple Prisma models to domain entities', () => {
      const prismaModels: PrismaLearningItem[] = [
        {
          id: 'item-1',
          title: 'Item 1',
          descriptionMD: 'Description 1',
          dueDate: null,
          status: 'Backlog',
          progressCached: 0,
          userId: 'user-123',
          categoryId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'item-2',
          title: 'Item 2',
          descriptionMD: 'Description 2',
          dueDate: null,
          status: 'Em_Andamento',
          progressCached: 50,
          userId: 'user-123',
          categoryId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      const entities = LearningItemMapper.toDomainMany(prismaModels)

      expect(entities).toHaveLength(2)
      expect(entities[0].title).toBe('Item 1')
      expect(entities[1].title).toBe('Item 2')
      expect(entities[0].status.isBacklog()).toBe(true)
      expect(entities[1].status.isEmAndamento()).toBe(true)
    })
  })
})
