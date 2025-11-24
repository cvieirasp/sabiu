import type { PrismaClient } from "@prisma/client"
import { describe, it, expect, beforeEach, vi } from "vitest"
import { Category } from '@/core/entities/Category'
import { PrismaCategoryRepository } from '@/infra/repositories/PrismaCategoryRepository'
import { CategoryMapper } from "@/infra/mappers/CategoryMapper"

// Helper: cria um mock mínimo do PrismaClient só com o que usamos
function makePrismaMock() {
  return {
    category: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  } as unknown as PrismaClient
}

describe("PrismaCategoryRepository", () => {
  let prisma: PrismaClient
  let repository: PrismaCategoryRepository

  const prismaCategoryELearning = {
    id: 'cat-1',
    name: 'E-Learning',
    color: '#3B82F6',
  }

  const prismaCategoryYoutube = {
    id: 'cat-2',
    name: 'YouTube',
    color: '#FF5733',
  }

  const prismaCategoryBook = {
    id: 'cat-3',
    name: 'Book',
    color: '#10B981',
  }

  const entityCategoryELearning = {
    id: 'cat-1',
    name: 'E-Learning',
    color: '#3B82F6',
  } as Category

  const entityCategoryYoutube = {
    id: 'cat-2',
    name: 'YouTube',
    color: '#FF5733',
  } as Category

  const entityCategoryBook = {
    id: 'cat-3',
    name: 'Book',
    color: '#10B981',
  } as Category

  beforeEach(() => {
    prisma = makePrismaMock()
    repository = new PrismaCategoryRepository(prisma)
    vi.restoreAllMocks()
  })

  describe("findById", () => {
    it("should return null if Category is not found", async () => {
      prisma.category.findUnique = vi.fn().mockResolvedValue(null)

      const result = await repository.findById("cat-9")

      expect(prisma.category.findUnique).toHaveBeenCalledWith({
        where: { id: "cat-9" },
      })
      expect(result).toBeNull()
    })

    it("should return mapped Category if found", async () => {
      prisma.category.findUnique = vi.fn().mockResolvedValue(prismaCategoryELearning)

      const toDomainSpy = vi
        .spyOn(CategoryMapper, "toDomain")
        .mockReturnValue(entityCategoryELearning)

      const result = await repository.findById("cat-1")

      expect(prisma.category.findUnique).toHaveBeenCalledWith({
        where: { id: "cat-1" },
      })
      expect(toDomainSpy).toHaveBeenCalledWith(prismaCategoryELearning)
      expect(result).toEqual(entityCategoryELearning)
    })
  })

  describe("findByName", () => {
    it("should return null if Category is not found", async () => {
      prisma.category.findUnique = vi.fn().mockResolvedValue(null)

      const result = await repository.findById("cat-9")

      expect(prisma.category.findUnique).toHaveBeenCalledWith({
        where: { id: "cat-9" },
      })
      expect(result).toBeNull()
    })

    it("should return mapped Category if found", async () => {
      prisma.category.findUnique = vi.fn().mockResolvedValue(prismaCategoryELearning)

      const toDomainSpy = vi
        .spyOn(CategoryMapper, "toDomain")
        .mockReturnValue(entityCategoryELearning)

      const result = await repository.findByName("E-Learning")

      expect(prisma.category.findUnique).toHaveBeenCalledWith({
        where: { name: "E-Learning" },
      })
      expect(toDomainSpy).toHaveBeenCalledWith(prismaCategoryELearning)
      expect(result).toEqual(entityCategoryELearning)
    })
  })

  describe("findAll", () => {
    it("should return empty array if no categories found", async () => {
      prisma.category.findMany = vi.fn().mockResolvedValue([])

      const toDomainManySpy = vi.spyOn(CategoryMapper, "toDomainMany").mockReturnValue([])

      const result = await repository.findAll()

      expect(prisma.category.findMany).toHaveBeenCalledWith({
        orderBy: { name: "asc" },
      })
      expect(toDomainManySpy).toHaveBeenCalledWith([])
      expect(result).toEqual([])
    })

    it("should use defaults orderBy=name and order=asc", async () => {
      prisma.category.findMany = vi
        .fn()
        .mockResolvedValue([prismaCategoryELearning, prismaCategoryYoutube, prismaCategoryBook])

      const toDomainManySpy = vi
        .spyOn(CategoryMapper, "toDomainMany")
        .mockReturnValue([entityCategoryELearning, entityCategoryYoutube, entityCategoryBook])

      const result = await repository.findAll()

      expect(prisma.category.findMany).toHaveBeenCalledWith({
        orderBy: { name: "asc" },
      })
      expect(toDomainManySpy).toHaveBeenCalledWith([
        prismaCategoryELearning,
        prismaCategoryYoutube,
        prismaCategoryBook,
      ])
      expect(result).toEqual([entityCategoryELearning, entityCategoryYoutube, entityCategoryBook])
    })

    it("should respect sorting options", async () => {
      prisma.category.findMany = vi
        .fn()
        .mockResolvedValue([prismaCategoryYoutube, prismaCategoryELearning, prismaCategoryBook])

      vi.spyOn(CategoryMapper, "toDomainMany").mockReturnValue([
        entityCategoryELearning,
        entityCategoryYoutube,
        entityCategoryBook,
      ])

      const result = await repository.findAll({
        orderBy: "createdAt",
        order: "desc",
      })

      expect(prisma.category.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: "desc" },
      })
      expect(result).toEqual([entityCategoryELearning, entityCategoryYoutube, entityCategoryBook])
    })
  })

  describe("create", () => {
    it ("should create Category and return mapped one", async () => {
      const toPrismaSpy = vi
        .spyOn(CategoryMapper, "toPrisma")
        .mockReturnValue({
          id: entityCategoryELearning.id,
          name: entityCategoryELearning.name,
          color: entityCategoryELearning.color,
        } as Category)

      prisma.category.create = vi.fn().mockResolvedValue(prismaCategoryELearning)

      const toDomainSpy = vi
        .spyOn(CategoryMapper, "toDomain")
        .mockReturnValue(entityCategoryELearning)

      const result = await repository.create(entityCategoryELearning)

      expect(toPrismaSpy).toHaveBeenCalledWith(entityCategoryELearning)
      expect(prisma.category.create).toHaveBeenCalledWith({
        data: toPrismaSpy.mock.results[0].value,
      })
      expect(toDomainSpy).toHaveBeenCalledWith(prismaCategoryELearning)
      expect(result).toEqual(entityCategoryELearning)
    })
  })

  describe("update", () => {
    it("should update Category name and color", async () => {
      const updatedDomain: Category = {
        ...entityCategoryELearning,
        name: "MBA",
        color: "#FFA500",
      } as Category

      const toPrismaSpy = vi
        .spyOn(CategoryMapper, "toPrisma")
        .mockReturnValue({
          id: updatedDomain.id,
          name: updatedDomain.name,
          color: updatedDomain.color,
        } as Category)

      prisma.category.update = vi.fn().mockResolvedValue({
        ...entityCategoryELearning,
        name: "MBA",
        color: "#FFA500",
      })

      const toDomainSpy = vi
        .spyOn(CategoryMapper, "toDomain")
        .mockReturnValue(updatedDomain)

      const result = await repository.update(updatedDomain)

      expect(toPrismaSpy).toHaveBeenCalledWith(updatedDomain)
      expect(prisma.category.update).toHaveBeenCalledWith({
        where: { id: updatedDomain.id },
        data: {
          name: updatedDomain.name,
          color: updatedDomain.color,
        },
      })
      expect(toDomainSpy).toHaveBeenCalled()
      expect(result).toEqual(updatedDomain)
    })
  })

  describe("delete", () => {
    it("should delete the Category by id", async () => {
      prisma.category.delete = vi.fn().mockResolvedValue(prismaCategoryELearning)

      await repository.delete("cat-1")

      expect(prisma.category.delete).toHaveBeenCalledWith({
        where: { id: "cat-1" },
      })
    })
  })
})
