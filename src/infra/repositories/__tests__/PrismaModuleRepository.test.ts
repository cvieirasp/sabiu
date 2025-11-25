import { ModuleStatus, type PrismaClient } from "@prisma/client"
import { describe, it, expect, beforeEach, vi } from "vitest"
import { Module } from '@/core/entities/Module'
import { PrismaModuleRepository } from '@/infra/repositories/PrismaModuleRepository'
import { ModuleMapper } from "@/infra/mappers/ModuleMapper"
import { ModuleStatusVO } from "@/core/value-objects/ModuleStatus"

function makePrismaMock() {
  return {
    module: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      createMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    $transaction: vi.fn().mockImplementation((actions) => {
      return Promise.all(actions)
    }),
  } as unknown as PrismaClient
}

describe("PrismaModuleRepository", () => {
  let prisma: PrismaClient
  let repository: PrismaModuleRepository

  const prismaModuleIntro = {
    id: 'mod-1',
    learningItemId: 'li-1',
    title: 'Introduction',
    status: ModuleStatus.Pendente,
    order: 1,
    createdAt: new Date('2025-01-01T00:00:00Z'),
    updatedAt: new Date('2025-01-01T00:00:00Z'),
  }
  const prismaModuleBasics = {
    id: 'mod-2',
    learningItemId: 'li-1',
    title: 'Basics',
    status: ModuleStatus.Pendente,
    order: 2,
    createdAt: new Date('2025-01-02T00:00:00Z'),
    updatedAt: new Date('2025-01-02T00:00:00Z'),
  }
  const prismaModuleAdvanced = {
    id: 'mod-3',
    learningItemId: 'li-1',
    title: 'Advanced Topics',
    status: ModuleStatus.Pendente,
    order: 3,
    createdAt: new Date('2025-01-03T00:00:00Z'),
    updatedAt: new Date('2025-01-03T00:00:00Z'),
  }

  const entityModuleIntro = {
    id: 'mod-1',
    learningItemId: 'li-1',
    title: 'Introduction',
    status: ModuleStatusVO.fromPendente(),
    order: 1,
    createdAt: new Date('2025-01-01T00:00:00Z'),
    updatedAt: new Date('2025-01-01T00:00:00Z'),
  } as Module
  const entityModuleBasics = {
    id: 'mod-2',
    learningItemId: 'li-1',
    title: 'Basics',
    status: ModuleStatusVO.fromPendente(),
    order: 2,
    createdAt: new Date('2025-01-02T00:00:00Z'),
    updatedAt: new Date('2025-01-02T00:00:00Z'),
  } as Module
  const entityModuleAdvanced = {
    id: 'mod-3',
    learningItemId: 'li-1',
    title: 'Advanced Topics',
    status: ModuleStatusVO.fromPendente(),
    order: 3,
    createdAt: new Date('2025-01-03T00:00:00Z'),
    updatedAt: new Date('2025-01-03T00:00:00Z'),
  } as Module

  beforeEach(() => {
    prisma = makePrismaMock()
    repository = new PrismaModuleRepository(prisma)
    vi.restoreAllMocks()
  })

  describe("findById", () => {
    it("should return null if Module is not found", async () => {
      prisma.module.findUnique = vi.fn().mockResolvedValue(null)

      const result = await repository.findById("non-existent-id")

      expect(result).toBeNull()
      expect(prisma.module.findUnique).toHaveBeenCalledWith({
        where: { id: "non-existent-id" },
      })
    })

    it("should return mapped Module if found", async () => {
      prisma.module.findUnique = vi.fn().mockResolvedValue(prismaModuleIntro)
      const toDomainSpy = vi
        .spyOn(ModuleMapper, "toDomain")
        .mockReturnValue(entityModuleIntro)

      const result = await repository.findById("mod-1")

      expect(prisma.module.findUnique).toHaveBeenCalledWith({
        where: { id: "mod-1" },
      })
      expect(toDomainSpy).toHaveBeenCalledWith(prismaModuleIntro)
      expect(result).toEqual(entityModuleIntro)
    })
  })

  describe("findByLearningItemId", () => {
    it ("should return empty array if no modules found", async () => {
      prisma.module.findMany = vi.fn().mockResolvedValue([])
      const toDomainManySpy = vi
        .spyOn(ModuleMapper, "toDomainMany")
        .mockReturnValue([])
      const result = await repository.findByLearningItemId("li-unknown")

      expect(prisma.module.findMany).toHaveBeenCalledWith({
        where: { learningItemId: "li-unknown" },
        orderBy: { order: "asc" },
      })
      expect(toDomainManySpy).toHaveBeenCalledWith([])
      expect(result).toEqual([])
    })

    it("should return ordered Modules for a learning item", async () => {
      prisma.module.findMany = vi
        .fn().mockResolvedValue([
          prismaModuleAdvanced,
          prismaModuleBasics,
          prismaModuleIntro,
        ])
      const toDomainManySpy = vi
        .spyOn(ModuleMapper, "toDomainMany")
        .mockReturnValue([
          entityModuleAdvanced,
          entityModuleBasics,
          entityModuleIntro,
        ])

      const result = await repository.findByLearningItemId("li-1", {
        orderBy: "title",
        order: "desc",
      })

      expect(prisma.module.findMany).toHaveBeenCalledWith({
        where: { learningItemId: "li-1" },
        orderBy: { title: "desc" },
      })
      expect(toDomainManySpy).toHaveBeenCalledWith([
        prismaModuleAdvanced,
        prismaModuleBasics,
        prismaModuleIntro,
      ])
      expect(result).toEqual([
        entityModuleAdvanced,
        entityModuleBasics,
        entityModuleIntro,
      ])
    })

    it("should use default ordering if none provided", async () => {
      prisma.module.findMany = vi
        .fn().mockResolvedValue([
          prismaModuleIntro,
          prismaModuleBasics,
          prismaModuleAdvanced,
        ])
      const toDomainManySpy = vi
        .spyOn(ModuleMapper, "toDomainMany")
        .mockReturnValue([
          entityModuleIntro,
          entityModuleBasics,
          entityModuleAdvanced,
        ])
      const result = await repository.findByLearningItemId("li-1")

      expect(prisma.module.findMany).toHaveBeenCalledWith({
        where: { learningItemId: "li-1" },
        orderBy: { order: "asc" },
      })
      expect(toDomainManySpy).toHaveBeenCalledWith([
        prismaModuleIntro,
        prismaModuleBasics,
        prismaModuleAdvanced,
      ])
      expect(result).toEqual([
        entityModuleIntro,
        entityModuleBasics,
        entityModuleAdvanced,
      ])
    })
  })

  describe("create", () => {
    it("should create and return the new Module", async () => {
      prisma.module.create = vi.fn().mockResolvedValue(prismaModuleIntro)
      const toPrismaSpy = vi
        .spyOn(ModuleMapper, "toPrisma")
        .mockReturnValue(prismaModuleIntro)
      const toDomainSpy = vi
        .spyOn(ModuleMapper, "toDomain")
        .mockReturnValue(entityModuleIntro)

      const result = await repository.create(entityModuleIntro)

      expect(toPrismaSpy).toHaveBeenCalledWith(entityModuleIntro)
      expect(prisma.module.create).toHaveBeenCalledWith({
        data: {...prismaModuleIntro},
      })
      expect(toDomainSpy).toHaveBeenCalledWith(prismaModuleIntro)
      expect(result).toEqual(entityModuleIntro)
    })
  })

  describe("createMany", () => {
    it("should create multiple Modules and return them", async () => {
      prisma.module.createMany = vi.fn().mockResolvedValue({})
      prisma.module.findMany = vi.fn().mockResolvedValue([
        prismaModuleIntro,
        prismaModuleBasics,
        prismaModuleAdvanced,
      ])
      const toPrismaManySpy = vi
        .spyOn(ModuleMapper, "toPrismaMany")
        .mockReturnValue([
          prismaModuleIntro,
          prismaModuleBasics,
          prismaModuleAdvanced,
        ])
      const toDomainManySpy = vi
        .spyOn(ModuleMapper, "toDomainMany")
        .mockReturnValue([
          entityModuleIntro,
          entityModuleBasics,
          entityModuleAdvanced,
        ])

      const result = await repository.createMany([
        entityModuleIntro,
        entityModuleBasics,
        entityModuleAdvanced,
      ])

      expect(toPrismaManySpy).toHaveBeenCalledWith([
        entityModuleIntro,
        entityModuleBasics,
        entityModuleAdvanced,
      ])
      expect(prisma.module.createMany).toHaveBeenCalledWith({
        data: [
          prismaModuleIntro,
          prismaModuleBasics,
          prismaModuleAdvanced,
        ],
      })
      expect(prisma.module.findMany).toHaveBeenCalledWith({
        where: {
          id: {
            in: ['mod-1', 'mod-2', 'mod-3'],
          },
        },
        orderBy: { order: 'asc' },
      })
      expect(toDomainManySpy).toHaveBeenCalledWith([
        prismaModuleIntro,
        prismaModuleBasics,
        prismaModuleAdvanced,
      ])
      expect(result).toEqual([
        entityModuleIntro,
        entityModuleBasics,
        entityModuleAdvanced,
      ])
    })
  })

  describe("update", () => {
    it("should update and return the Module", async () => {
      const updatedPrismaModule = {
        ...prismaModuleIntro,
        title: 'Intro Updated',
        status: ModuleStatus.Concluido,
      }
      const updatedEntityModule = {
        ...entityModuleIntro,
        title: 'Intro Updated',
        status: ModuleStatusVO.fromConcluido(),
      } as Module
      prisma.module.update = vi.fn().mockResolvedValue(updatedPrismaModule)
      const toPrismaSpy = vi
        .spyOn(ModuleMapper, "toPrisma")
        .mockReturnValue(updatedPrismaModule)
      const toDomainSpy = vi
        .spyOn(ModuleMapper, "toDomain")
        .mockReturnValue(updatedEntityModule)

      const result = await repository.update(updatedEntityModule)

      expect(toPrismaSpy).toHaveBeenCalledWith(updatedEntityModule)
      expect(prisma.module.update).toHaveBeenCalledWith({
        where: { id: updatedEntityModule.id },
        data: {
          title: updatedPrismaModule.title,
          status: updatedPrismaModule.status,
          order: updatedPrismaModule.order,
        },
      })
      expect(toDomainSpy).toHaveBeenCalledWith(updatedPrismaModule)
      expect(result).toEqual(updatedEntityModule)
    })
  })

  describe("delete", () => {
    it("should delete the Module by ID", async () => {
      prisma.module.delete = vi.fn().mockResolvedValue({})
      await repository.delete("mod-1")

      expect(prisma.module.delete).toHaveBeenCalledWith({
        where: { id: "mod-1" },
      })
    })
  })

  describe("reorder", () => {
    it("should reorder modules for a learning item", async () => {
      prisma.module.update = vi.fn().mockResolvedValue({})
      
      await repository.reorder("li-1", [
        { id: "mod-1", order: 3 },
        { id: "mod-2", order: 1 },
        { id: "mod-3", order: 2 },
      ])

      expect(prisma.module.update).toHaveBeenCalledTimes(3)
      expect(prisma.module.update).toHaveBeenNthCalledWith(1, {
        where: { id: "mod-1", learningItemId: "li-1" },
        data: { order: 3 },
      })
      expect(prisma.module.update).toHaveBeenNthCalledWith(2, {
        where: { id: "mod-2", learningItemId: "li-1" },
        data: { order: 1 },
      })
      expect(prisma.module.update).toHaveBeenNthCalledWith(3, {
        where: { id: "mod-3", learningItemId: "li-1" },
        data: { order: 2 },
      })
    })
  })
})
