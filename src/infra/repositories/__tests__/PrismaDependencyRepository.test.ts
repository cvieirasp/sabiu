import type { PrismaClient } from "@prisma/client"
import { describe, it, expect, beforeEach, vi } from "vitest"
import { Dependency } from '@/core/entities/Dependency'
import { PrismaDependencyRepository } from '@/infra/repositories/PrismaDependencyRepository'
import { DependencyMapper } from "@/infra/mappers/DependencyMapper"

function makePrismaMock() {
  return {
    dependency: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
  } as unknown as PrismaClient
}

describe("PrismaDependencyRepository", () => {
  let prisma: PrismaClient
  let repository: PrismaDependencyRepository

  const prismaDependency1 = {
    id: 'dep-1',
    sourceItemId: 'item-1',
    targetItemId: 'item-2',
    createdAt: new Date(),
  }
  const prismaDependency2 = {
    id: 'dep-2',
    sourceItemId: 'item-1',
    targetItemId: 'item-3',
    createdAt: new Date(),
  }
  const prismaDependency3 = {
    id: 'dep-3',
    sourceItemId: 'item-2',
    targetItemId: 'item-3',
    createdAt: new Date(),
  }

  const entityDependency1 = {
    id: 'dep-1',
    sourceItemId: 'item-1',
    targetItemId: 'item-2',
    createdAt: new Date(),
  } as Dependency
  const entityDependency2 = {
    id: 'dep-2',
    sourceItemId: 'item-1',
    targetItemId: 'item-3',
    createdAt: new Date(),
  } as Dependency
  const entityDependency3 = {
    id: 'dep-3',
    sourceItemId: 'item-2',
    targetItemId: 'item-3',
    createdAt: new Date(),
  } as Dependency
  const entityDependencyCircle = {
    id: 'dep-4',
    sourceItemId: 'item-2',
    targetItemId: 'item-1',
    createdAt: new Date(),
  } as Dependency

  beforeEach(() => {
    prisma = makePrismaMock()
    repository = new PrismaDependencyRepository(prisma)
    vi.restoreAllMocks()
  })

  describe("findById", () => {
    it("should return null when Dependency is not found", async () => {
      prisma.dependency.findUnique = vi.fn().mockResolvedValue(null)

      const result = await repository.findById("dep-9")

      expect(prisma.dependency.findUnique).toHaveBeenCalledWith({
        where: { id: "dep-9" },
      })
      expect(result).toBeNull()
    })

    it("should return a Dependency when found", async () => {
      prisma.dependency.findUnique = vi.fn().mockResolvedValue(prismaDependency1)
      
      const toDomainSpy = vi
        .spyOn(DependencyMapper, "toDomain")
        .mockReturnValue(entityDependency1)

      const result = await repository.findById("dep-1")

      expect(prisma.dependency.findUnique).toHaveBeenCalledWith({
        where: { id: "dep-1" },
      })
      expect(toDomainSpy).toHaveBeenCalledWith(prismaDependency1)
      expect(result).toEqual(entityDependency1)
    })
  })

  describe("findBySourceItemId", () => {
    it("should return an empty array when no Dependencies are found", async () => {
      prisma.dependency.findMany = vi.fn().mockResolvedValue([])

      const result = await repository.findBySourceItemId("item-9")

      expect(prisma.dependency.findMany).toHaveBeenCalledWith({
        where: { sourceItemId: "item-9" },
      })
      expect(result).toEqual([])
    })

    it("should return an array of Dependencies when found", async () => {
      prisma.dependency.findMany = vi
        .fn()
        .mockResolvedValue([prismaDependency1, prismaDependency2])

      const toDomainManySpy = vi
        .spyOn(DependencyMapper, "toDomainMany")
        .mockReturnValue([entityDependency1, entityDependency2])

      const result = await repository.findBySourceItemId("item-1")

      expect(prisma.dependency.findMany).toHaveBeenCalledWith({
        where: { sourceItemId: "item-1" },
      })
      expect(toDomainManySpy).toHaveBeenCalledWith([prismaDependency1, prismaDependency2])
      expect(result).toEqual([entityDependency1, entityDependency2])
    })
  })

  describe("findByTargetItemId", () => {
    it("should return an empty array when no Dependencies are found", async () => {
      prisma.dependency.findMany = vi.fn().mockResolvedValue([])

      const result = await repository.findByTargetItemId("item-9")

      expect(prisma.dependency.findMany).toHaveBeenCalledWith({
        where: { targetItemId: "item-9" },
      })
      expect(result).toEqual([])
    })

    it("should return an array of Dependencies when found", async () => {
      prisma.dependency.findMany = vi
        .fn()
        .mockResolvedValue([prismaDependency2, prismaDependency3])

      const toDomainManySpy = vi
        .spyOn(DependencyMapper, "toDomainMany")
        .mockReturnValue([entityDependency2, entityDependency3])

      const result = await repository.findByTargetItemId("item-3")

      expect(prisma.dependency.findMany).toHaveBeenCalledWith({
        where: { targetItemId: "item-3" },
      })
      expect(toDomainManySpy).toHaveBeenCalledWith([prismaDependency2, prismaDependency3])
      expect(result).toEqual([entityDependency2, entityDependency3])
    })
  })

  describe("create", () => {
    it("should create and return the Dependency", async () => {
      const toPrismaSpy = vi
        .spyOn(DependencyMapper, "toPrisma")
        .mockReturnValue(prismaDependency1)

      prisma.dependency.create = vi.fn().mockResolvedValue(prismaDependency1)

      const toDomainSpy = vi
        .spyOn(DependencyMapper, "toDomain")
        .mockReturnValue(entityDependency1)

      const result = await repository.create(entityDependency1)

      expect(toPrismaSpy).toHaveBeenCalledWith(entityDependency1)
      expect(prisma.dependency.create).toHaveBeenCalledWith({
        data: prismaDependency1,
      })
      expect(toDomainSpy).toHaveBeenCalledWith(prismaDependency1)
      expect(result).toEqual(entityDependency1)
    })
  })

  describe("delete", () => {
    it("should delete the Dependency by id", async () => {
      prisma.dependency.delete = vi.fn().mockResolvedValue({})

      await repository.delete("dep-1")

      expect(prisma.dependency.delete).toHaveBeenCalledWith({
        where: { id: "dep-1" },
      })
    })
  })

  describe("exists", () => {
    it("should return false when no matching Dependencies are found", async () => {
      prisma.dependency.findMany = vi.fn().mockResolvedValue([])
      const result = await repository.exists("item-1", "item-9")

      expect(prisma.dependency.findMany).toHaveBeenCalledWith({
        where: { sourceItemId: "item-1", targetItemId: "item-9" },
      })
      expect(result).toBe(false)
    })

    it("should return true when matching Dependencies are found", async () => {
      prisma.dependency.findMany = vi
        .fn()
        .mockResolvedValue([prismaDependency1])
      const result = await repository.exists("item-1", "item-2")

      expect(prisma.dependency.findMany).toHaveBeenCalledWith({
        where: { sourceItemId: "item-1", targetItemId: "item-2" },
      })
      expect(result).toBe(true)
    })
  })

  describe("wouldCreateCycle", () => {
    it("should return true for direct cycle", async () => {
      const spy = vi.spyOn(repository, "findBySourceItemId")
      const result = await repository.wouldCreateCycle("item-1", "item-1")

      expect(result).toBe(true)
      expect(spy).not.toHaveBeenCalled()
    })

    it("should return true when target can reach source through a chain", async () => {
      // Graph: item-2 -> item-3 -> item-1
      const graph: Record<string, Dependency[]> = {
        "item-2": [entityDependency3],
        "item-3": [entityDependencyCircle],
        "item-1": [],
      }

      repository.findBySourceItemId = vi.fn(async (sourceId: string) => graph[sourceId] ?? [])
      const result = await repository.wouldCreateCycle("item-1", "item-2")

      expect(result).toBe(true)
      expect(repository.findBySourceItemId).toHaveBeenCalledWith("item-2")
      expect(repository.findBySourceItemId).toHaveBeenCalledWith("item-3")
    })  
  })
})